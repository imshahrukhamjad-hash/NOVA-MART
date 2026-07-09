const Order = require("../models/Order");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);


// Get all orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { invoiceNumber, customerId, customerName, customerPhone, items, subtotal, taxPercent, taxAmount, discount, total, paymentMethod, jazzCashNumber, paymentStatus } = req.body;

    // Normalize customerName (default to 'Walk-in' when missing)
    const sanitizedCustomerName = (customerName && String(customerName).trim()) || 'Walk-in';

    // If customerId provided, link it. Otherwise try to find or create by phone (if available)
    let assignedCustomerId = customerId;
    try {
      if (!assignedCustomerId && customerPhone) {
        const Customer = require('../models/Customer');
        const existing = await Customer.findOne({ phone: customerPhone });
        if (existing) {
          assignedCustomerId = existing._id;
          existing.lastVisit = new Date();
          await existing.save();
        } else {
          // create lightweight customer record
          const c = new Customer({ name: sanitizedCustomerName || 'Walk-in', phone: customerPhone, lastVisit: new Date() });
          await c.save();
          assignedCustomerId = c._id;
        }
      }
    } catch (e) {
      // If customer model isn't available for some reason, proceed without a customerId
      console.warn('Failed to sync customer for order:', e.message || e);
    }

    // Try saving order and handle duplicate invoiceNumber collisions (rare but possible)
    let order = null;
    const maxAttempts = 5;
    let attempts = 0;
    let usedInvoice = invoiceNumber;

    while (attempts < maxAttempts) {
      try {
        if (!usedInvoice) usedInvoice = generateInvoice();

        order = new Order({
          invoiceNumber: usedInvoice,
          customerId: assignedCustomerId,
          customerName: sanitizedCustomerName,
          customerPhone,
          items,
          subtotal,
          taxPercent,
          taxAmount,
          discount,
          total,
          paymentMethod: paymentMethod || "Cash",
          jazzCashNumber: jazzCashNumber || undefined,
          jazzTxnRef: req.body.jazzTxnRef || undefined,
          paymentStatus: paymentStatus || "completed",
        });

        await order.save();
        break; // saved successfully
      } catch (err) {
        // If duplicate invoiceNumber, try again with a new generated invoice
        if (err && (err.code === 11000 || err.code === 11001) && err.message && err.message.includes('invoiceNumber')) {
          attempts += 1;
          usedInvoice = null; // generate new one next loop
          continue;
        }
        // Other errors — rethrow so outer catch handles it
        throw err;
      }
    }

    if (!order || !order._id) {
      return res.status(500).json({ message: 'Failed to create order after several attempts' });
    }

    // Update customer's lastVisit if linked
    try {
      if (assignedCustomerId) {
        const Customer = require('../models/Customer');
        await Customer.findByIdAndUpdate(assignedCustomerId, { lastVisit: new Date() });
      }
    } catch (e) { /* ignore */ }

    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create a Stripe Checkout session
// Helper to generate invoice numbers
function generateInvoice() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000; // 4-digit random
  return `INV-${year}${month}${day}-${rand}`;
}

exports.createCheckoutSession = async (req, res) => {
  try {
    const { invoiceNumber: clientInvoice, customerName, customerPhone, items, subtotal, taxPercent, taxAmount, discount, total } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: "No items in order" });

    // Normalize customer name (avoid Mongoose validation errors)
    const sanitizedCustomerName = (customerName && String(customerName).trim()) || 'Walk-in';

    // Persist a pending order record, retrying if invoiceNumber collides
    let pendingOrder = null;
    const maxAttempts = 5;
    let attempts = 0;
    let usedInvoice = clientInvoice;

    while (attempts < maxAttempts) {
      try {
        if (!usedInvoice) usedInvoice = generateInvoice();

        pendingOrder = new Order({
          invoiceNumber: usedInvoice,
          customerName: sanitizedCustomerName,
          customerPhone,
          items,
          subtotal,
          taxPercent,
          taxAmount,
          discount,
          total,
          paymentMethod: 'Stripe',
          paymentStatus: 'pending',
        });

        await pendingOrder.save();
        break; // saved successfully
      } catch (err) {
        // Duplicate invoice number, try again with new invoice
        if (err && (err.code === 11000 || err.code === 11001) && err.message && err.message.includes('invoiceNumber')) {
          attempts += 1;
          usedInvoice = null; // generate a new one next loop
          continue;
        }
        // Other errors — rethrow
        throw err;
      }
    }

    if (!pendingOrder || !pendingOrder._id) {
      return res.status(500).json({ message: 'Failed to create pending order after several attempts' });
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: process.env.STRIPE_CURRENCY || 'usd',
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/billing`,
      metadata: {
        orderId: pendingOrder._id.toString()
      }
    });

    // Return the session id (for Stripe.js redirect), invoice number, and URL as fallback
    res.json({ sessionId: session.id, url: session.url, orderId: pendingOrder._id, invoiceNumber: pendingOrder.invoiceNumber });
  } catch (err) {
    console.error('createCheckoutSession error:', err.message || err);
    res.status(500).json({ message: err.message || 'Stripe checkout session creation failed' });
  }
};

// Retrieve a checkout session status and related order (used after redirect from Stripe)
exports.getCheckoutSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['payment_intent'] });
    let order = null;
    try {
      const orderId = session.metadata && session.metadata.orderId;
      if (orderId) order = await Order.findById(orderId);
    } catch (e) { /* ignore */ }

    res.json({ session, order });
  } catch (err) {
    console.error('getCheckoutSession error:', err.message || err);
    res.status(500).json({ message: err.message || 'Failed to retrieve checkout session' });
  }
};

// Stripe webhook to handle completed payments
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      // Prefer orderId metadata (safer / smaller) — update the pending order
      const orderId = session.metadata && session.metadata.orderId;
      if (orderId) {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = 'completed';
          order.paymentMethod = 'Stripe';
          await order.save();
          console.log('Order updated from Stripe webhook:', order._id);
        } else {
          console.warn('Order not found for id from Stripe metadata:', orderId);
        }
      } else if (session.metadata && session.metadata.order) {
        // Fallback: create new order from full metadata (older code path)
        const orderData = JSON.parse(session.metadata.order || '{}');
        const order = new Order({
          invoiceNumber: orderData.invoiceNumber || `INV-${Date.now()}`,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          items: orderData.items,
          subtotal: orderData.subtotal,
          taxPercent: orderData.taxPercent,
          taxAmount: orderData.taxAmount,
          discount: orderData.discount,
          total: orderData.total,
          paymentMethod: 'Stripe',
          paymentStatus: 'completed',
        });
        await order.save();
        console.log('Order saved from Stripe webhook (fallback):', order._id);
      } else {
        console.warn('Stripe session completed but no order metadata present');
      }
    } catch (err) {
      console.error('Failed to process webhook session:', err);
    }
  }

  res.json({ received: true });
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};