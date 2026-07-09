const Customer = require('../models/Customer');
const Order = require('../models/Order');

// Get all customers (with optional search)
exports.getAllCustomers = async (req, res) => {
  try {
    const q = req.query.q;
    const filter = {};
    if (q) {
      const reg = new RegExp(q, 'i');
      filter.$or = [{ name: reg }, { phone: reg }, { email: reg }];
    }
    const customers = await Customer.find(filter).sort({ updatedAt: -1 });
    res.json(customers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a customer
exports.createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address, notes } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Name required' });
    const existing = phone ? await Customer.findOne({ phone }) : null;
    if (existing) {
      // update existing record with new details
      existing.name = name;
      existing.email = email || existing.email;
      existing.address = address || existing.address;
      existing.notes = notes || existing.notes;
      existing.lastVisit = new Date();
      await existing.save();
      return res.status(200).json(existing);
    }

    const c = new Customer({ name, phone, email, address, notes, lastVisit: new Date() });
    await c.save();
    res.status(201).json(c);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get a single customer along with their orders
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    const orders = await Order.find({ $or: [{ customerId: customer._id }, { customerPhone: customer.phone }] }).sort({ createdAt: -1 });
    res.json({ customer, orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update
exports.updateCustomer = async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer not found' });
    const { name, phone, email, address, notes } = req.body;
    c.name = name || c.name;
    c.phone = phone || c.phone;
    c.email = email || c.email;
    c.address = address || c.address;
    c.notes = notes || c.notes;
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Delete
exports.deleteCustomer = async (req, res) => {
  try {
    const c = await Customer.findById(req.params.id);
    if (!c) return res.status(404).json({ message: 'Customer not found' });
    await c.remove();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
