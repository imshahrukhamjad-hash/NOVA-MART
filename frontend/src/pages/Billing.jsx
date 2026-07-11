import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiPlus, FiMinus, FiPrinter, FiRefreshCw, FiInfo, FiEye, FiCopy, FiCheckCircle, FiDownload } from "react-icons/fi"; // icons will use smaller defaults in CSS

import { useTheme } from "../context/ThemeContext";
import ProductCard from "../components/ProductCard";
import ConfirmationModal from "../components/ConfirmationModal";
import ProductSearch from "../components/billing/ProductSearch";
import CartList from "../components/billing/CartList";
import InvoicePreview from "../components/billing/InvoicePreview";
import { loadStripe } from '@stripe/stripe-js';
import { generateInvoiceHTML } from "../utils/generateInvoiceHTML";

const TestCardInfo = ({ theme }) => (
  <div className={`rounded-lg p-4 mt-3 border ${
    theme === 'dark'
      ? 'bg-blue-900/30 border-blue-700'
      : 'bg-blue-100 border-blue-300'
  }`}>
    <div className="flex items-start gap-2">
      <FiInfo className={`mt-1 shrink-0 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} size={16} />
      <div className={`text-sm ${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
        <p className="font-semibold mb-2">🧪 Stripe Sandbox Test Cards:</p>
        <div className={`space-y-1 text-xs font-mono p-2 rounded ${
          theme === 'dark'
            ? 'bg-blue-950/50'
            : 'bg-blue-50'
        }`}>
          <p>✓ Success: 4242 4242 4242 4242</p>
          <p>✗ Decline: 4000 0000 0000 0002</p>
          <p>✓ 3D Secure: 4000 0025 0000 3155</p>
          <p className="mt-2">• Exp: Any future date (MM/YY)</p>
          <p>• CVC: Any 3 digits</p>
        </div>
      </div>
    </div>
  </div>
);

export default function Billing() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("billing");
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [taxPercent, setTaxPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [itemDiscounts, setItemDiscounts] = useState({});
  const [lastRemoved, setLastRemoved] = useState(null);
  const [recentCustomers, setRecentCustomers] = useState([]);

  // Debounce search input for smoother UX
  useEffect(() => {
    const t = setTimeout(() => setSearchTerm(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);
  const [orders, setOrders] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [jazzCashNumber, setJazzCashNumber] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPayload, setConfirmPayload] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [stripeSuccessInfo, setStripeSuccessInfo] = useState({ show: false, invoiceNumber: '', order: null });
  const [jazzSuccessInfo, setJazzSuccessInfo] = useState({ show: false, invoiceNumber: '', order: null });

  // Stripe popup/polling helpers
  const [stripeWaiting, setStripeWaiting] = useState(false);
  const [stripeSessionId, setStripeSessionId] = useState(null);
  const stripePopupRef = useRef(null);
  const stripePollTimerRef = useRef(null);
  const stripeAutoCloseTimerRef = useRef(null);
  const stripeCountdownIntervalRef = useRef(null);
  const [stripeCountdown, setStripeCountdown] = useState(0);
  // Auto-close delay (ms) for the success modal before redirecting — set to a slightly longer, professional pause
  const STRIPE_AUTOCLOSE_DELAY = 15000;
  const navigate = useNavigate();

  // Debounced customer search
  useEffect(() => {
    if (!customerQuery || customerQuery.trim().length < 2) { setCustomerSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await axios.get('/customers', { params: { q: customerQuery } });
        setCustomerSuggestions(res.data || []);
      } catch (e) {
        setCustomerSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [customerQuery]);

  // Detect successful Stripe return and confirm session status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    if (sessionId) {
      (async () => {
        try {
          const res = await axios.get(`/orders/checkout-session/${sessionId}`);
          const { session, order } = res.data || {};
          const paid = (session && (session.payment_status === 'paid' || session.payment_intent && session.payment_intent.status === 'succeeded')) || (order && order.paymentStatus === 'completed');
          const invoice = (order && order.invoiceNumber) || localStorage.getItem('stripe_pending_invoice') || '';
          if (paid) {
            setStripeSuccessInfo({ show: true, invoiceNumber: invoice, order });
            toast.success(`Payment processed for ${invoice || ''}`);
            // Start auto-close / redirect, same behavior as popup flow
            clearStripeAutoClose();
            startStripeAutoClose(order);
          } else {
            toast.success('Payment processed. Order will be saved shortly.');
          }
          try { localStorage.removeItem('stripe_pending_invoice'); } catch (e) {}
          fetchOrders();
        } catch (err) {
          console.error('Failed to confirm Stripe session', err);
          toast.error('Failed to confirm Stripe payment');
        } finally {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      })();
    }
  }, []);

  const pickCustomerSuggestion = (c) => {
    setSelectedCustomerId(c._id);
    setCustomerName(c.name || '');
    setCustomerPhone(c.phone || '');
    setCustomerSuggestions([]);
    setCustomerQuery('');
    toast.success('Customer selected');
  };

  const buildOrderPayload = (override = {}) => {
    const items = cart.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      discount: itemDiscounts[item._id] || 0,
      unitPrice: Math.max(0, item.price - (itemDiscounts[item._id] || 0)),
    }));

    const base = {
      invoiceNumber,
      customerId: selectedCustomerId || undefined,
      customerName,
      customerPhone,
      items,
      subtotal,
      taxPercent,
      taxAmount,
      discount,
      total,
    };

    return { ...base, ...override };
  };


  // High-value confirmation removed: normal flow for all transactions


  // Read URL query param so admin can open Billing with the history tab active
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'history') setActiveTab('history');

    const orderId = params.get('orderId');
    if (orderId) {
      axios.get(`/orders/${orderId}`).then(res => setSelectedOrder(res.data)).catch(() => {});
    }
  }, [location.search]);

  // If the URL contains #cart, scroll the Cart region into view so the user lands directly on the cart
  useEffect(() => {
    if (location.hash === '#cart') {
      // small delay to allow DOM to render
      setTimeout(() => {
        try {
          const el = document.querySelector('[aria-label="Cart"]');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            const input = el.querySelector('input[aria-label="Customer name"]');
            if (input) input.focus();
          }
        } catch (e) {}
      }, 150);
    }
  }, [location.hash]);

  // Fetch current user's role so we can show history-only view for admins
  const [role, setRole] = useState("");
  useEffect(() => {
    axios.get('/auth/me')
      .then(res => setRole(res.data.role))
      .catch(() => setRole('user'));
  }, []);

  // Ensure admins always see the history-only view
  useEffect(() => {
    if (role === 'admin') {
      setActiveTab('history');
    }
  }, [role]);

  // Cleanup on unmount: ensure stripe polling and auto-close timers are cleared
  useEffect(() => {
    return () => {
      try { cancelStripeWaiting(true); } catch (e) {}
      try { clearStripeAutoClose(); } catch (e) {}
    };
  }, []);

  const generateInvoiceNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const inv = `INV-${year}${month}${day}-${random}`;
    setInvoiceNumber(inv);
    try { localStorage.setItem('pos_invoiceNumber', inv); } catch (e) {}
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products");
      setProducts(res.data.filter(p => p.active && p.quantity > 0));
    } catch (err) {
      toast.error("Failed to load products");
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/orders");
      setOrders(res.data);
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchProducts();

    // load persisted state (cart, recent customers, and billing form fields)
    try {
      const saved = localStorage.getItem('pos_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        setCart(parsed);
        // notify other components (Navbar) about restored cart
        const count = parsed.reduce((s,i)=>s+(i.quantity||0),0);
        window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: parsed } }));
      }

      const rc = localStorage.getItem('pos_recent_customers');
      if (rc) setRecentCustomers(JSON.parse(rc));

      const cn = localStorage.getItem('pos_customerName');
      if (cn) setCustomerName(cn);

      const cp = localStorage.getItem('pos_customerPhone');
      if (cp) setCustomerPhone(cp);

      const tp = localStorage.getItem('pos_taxPercent');
      if (tp) setTaxPercent(Number(tp) || 0);

      const ds = localStorage.getItem('pos_discount');
      if (ds) setDiscount(Number(ds) || 0);

      const iid = localStorage.getItem('pos_item_discounts');
      if (iid) {
        try { setItemDiscounts(JSON.parse(iid)); } catch(e) {}
      }

      const scid = localStorage.getItem('pos_selectedCustomerId');
      if (scid) setSelectedCustomerId(scid);

      const pm = localStorage.getItem('pos_paymentMethod');
      if (pm) setPaymentMethod(pm);

      const jn = localStorage.getItem('pos_jazzCashNumber');
      if (jn) setJazzCashNumber(jn);

      const savedInvoice = localStorage.getItem('pos_invoiceNumber');
      if (savedInvoice) {
        setInvoiceNumber(savedInvoice);
      } else {
        generateInvoiceNumber();
      }
    } catch (e) { 
      // fallback: ensure invoice exists
      generateInvoiceNumber();
    }
  }, []);

  // persist cart and recent customers
  useEffect(() => {
    try { localStorage.setItem('pos_cart', JSON.stringify(cart)); } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try { localStorage.setItem('pos_recent_customers', JSON.stringify(recentCustomers)); } catch (e) {}
  }, [recentCustomers]);

  // Persist billing form fields so a page refresh doesn't lose data
  useEffect(() => {
    try { localStorage.setItem('pos_customerName', customerName || ''); } catch (e) {}
  }, [customerName]);

  useEffect(() => {
    try { localStorage.setItem('pos_customerPhone', customerPhone || ''); } catch (e) {}
  }, [customerPhone]);

  useEffect(() => {
    try { localStorage.setItem('pos_taxPercent', String(taxPercent || 0)); } catch (e) {}
  }, [taxPercent]);

  useEffect(() => {
    try { localStorage.setItem('pos_discount', String(discount || 0)); } catch (e) {}
  }, [discount]);

  useEffect(() => {
    try { localStorage.setItem('pos_item_discounts', JSON.stringify(itemDiscounts || {})); } catch (e) {}
  }, [itemDiscounts]);

  useEffect(() => {
    try { if (selectedCustomerId) localStorage.setItem('pos_selectedCustomerId', selectedCustomerId); else localStorage.removeItem('pos_selectedCustomerId'); } catch (e) {}
  }, [selectedCustomerId]);

  // Persist payment method and jazzCash number too
  useEffect(() => {
    try { localStorage.setItem('pos_paymentMethod', paymentMethod); } catch (e) {}
  }, [paymentMethod]);

  useEffect(() => {
    try { localStorage.setItem('pos_jazzCashNumber', jazzCashNumber || ''); } catch (e) {}
  }, [jazzCashNumber]);

  // Ensure other parts of the app (Navbar) get updates when cart changes
  useEffect(() => {
    try {
      const count = cart.reduce((s,i)=>s+(i.quantity||0),0);
      localStorage.setItem('pos_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart } }));
    } catch (e) {}
  }, [cart]);

  // Persist invoice number whenever it changes (in case generated or restored)
  useEffect(() => {
    try { if (invoiceNumber) localStorage.setItem('pos_invoiceNumber', invoiceNumber); } catch (e) {}
  }, [invoiceNumber]);

  // Beforeunload safety: ensure latest billing draft is saved if the user reloads quickly
  useEffect(() => {
    const handler = () => {
      try {
        localStorage.setItem('pos_cart', JSON.stringify(cart));
        localStorage.setItem('pos_customerName', customerName || '');
        localStorage.setItem('pos_customerPhone', customerPhone || '');
        localStorage.setItem('pos_taxPercent', String(taxPercent || 0));
        localStorage.setItem('pos_discount', String(discount || 0));
        localStorage.setItem('pos_item_discounts', JSON.stringify(itemDiscounts || {}));
        if (selectedCustomerId) localStorage.setItem('pos_selectedCustomerId', selectedCustomerId); else localStorage.removeItem('pos_selectedCustomerId');
        localStorage.setItem('pos_paymentMethod', paymentMethod);
        localStorage.setItem('pos_jazzCashNumber', jazzCashNumber || '');
        if (invoiceNumber) localStorage.setItem('pos_invoiceNumber', invoiceNumber);
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [cart, customerName, customerPhone, taxPercent, discount, itemDiscounts, selectedCustomerId, paymentMethod, jazzCashNumber, invoiceNumber]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchOrders();
    }
  }, [activeTab]);

  // Sync cart if another component updates it (e.g., Navbar dropdown)
  useEffect(() => {
    const handler = (e) => {
      const cart = e?.detail?.cart;
      if (Array.isArray(cart)) {
        setCart(cart);
      } else {
        try {
          const raw = localStorage.getItem('pos_cart');
          if (raw) setCart(JSON.parse(raw));
        } catch(e) {}
      }
    };
    window.addEventListener('cart-changed', handler);
    return () => window.removeEventListener('cart-changed', handler);
  }, []);

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'priceAsc') return a.price - b.price;
      if (sortBy === 'priceDesc') return b.price - a.price;
      return 0;
    });

  const addToCart = (product) => {
    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      if (existing.quantity < product.quantity) {
        const newCart = cart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCart(newCart);
        // persist to localStorage for global access
        try { localStorage.setItem('pos_cart', JSON.stringify(newCart)); } catch(e) {}
        const count = newCart.reduce((s,i)=>s+(i.quantity||0),0);
        window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: newCart } }));
      } else {
        toast.error("Not enough stock");
      }
    } else {
      const newCart = [...cart, { ...product, quantity: 1 }];
      setCart(newCart);
      try { localStorage.setItem('pos_cart', JSON.stringify(newCart)); } catch(e) {}
      const count = newCart.reduce((s,i)=>s+(i.quantity||0),0);
      window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: newCart } }));
    }
  };

  const removeFromCart = (id) => {
    const idx = cart.findIndex(item => item._id === id);
    if (idx === -1) return;
    const removed = cart[idx];
    setLastRemoved({ item: removed, index: idx });
    const newCart = cart.filter(i => i._id !== id);
    setCart(newCart);
    try { localStorage.setItem('pos_cart', JSON.stringify(newCart)); } catch(e) {}
    const count = newCart.reduce((s,i)=>s+(i.quantity||0),0);
    window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: newCart } }));

    toast((t) => (
      <div className="flex items-center gap-3">
        <div>Removed <strong>{removed.name}</strong></div>
        <button onClick={() => {
          setCart(prev => {
            const copy = [...prev];
            copy.splice(idx, 0, removed);
            // dispatch updated count after undo
            const count = copy.reduce((s,i)=>s+(i.quantity||0),0);
            try { localStorage.setItem('pos_cart', JSON.stringify(copy)); } catch(e) {}
            window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: copy } }));
            return copy;
          });
          toast.dismiss(t.id);
        }} className="ml-3 px-2 py-1 btn btn-ghost rounded">Undo</button>
      </div>
    ), { duration: 5000 });
  };

  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    const product = products.find(p => p._id === id);
    if (qty > product.quantity) {
      toast.error("Not enough stock");
      return;
    }
    const newCart = cart.map(item => item._id === id ? { ...item, quantity: qty } : item);
    setCart(newCart);
    try { localStorage.setItem('pos_cart', JSON.stringify(newCart)); } catch(e) {}
    const count = newCart.reduce((s,i)=>s+(i.quantity||0),0);
    window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: newCart } }));
  };

  const setItemDiscount = (id, value) => {
    setItemDiscounts(prev => ({ ...prev, [id]: Number(value) || 0 }));
  };

  const saveRecentCustomer = async () => {
    if (!customerName?.trim()) { toast.error('Enter customer name'); return; }
    try {
      const res = await axios.post('/customers', { name: customerName.trim(), phone: customerPhone.trim() });
      const c = res.data;
      const list = [c, ...recentCustomers];
      const uniq = list.filter((v, i, a) => i === a.findIndex(e => (e.name === v.name && e.phone === v.phone)));
      setRecentCustomers(uniq.slice(0, 8));
      toast.success('Saved customer');
    } catch (err) {
      console.error('Failed to save customer', err);
      toast.error('Failed to save customer');
    }
  };

  const pickRecentCustomer = (idx) => {
    const c = recentCustomers[idx];
    if (!c) return;
    setCustomerName(c.name);
    setCustomerPhone(c.phone || '');
    toast.success('Loaded customer');
  };

  const clearCart = () => {
    setCart([]);
    try { localStorage.setItem('pos_cart', JSON.stringify([])); } catch(e) {}
    window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count: 0, cart: [] } }));
    setCustomerName("");
    setCustomerPhone("");
    setTaxPercent(0);
    setDiscount(0);
    setItemDiscounts({});
    setSelectedCustomerId(null);
    setPaymentMethod("cash");
    setJazzCashNumber("");

    // remove persisted billing fields
    try {
      localStorage.removeItem('pos_customerName');
      localStorage.removeItem('pos_customerPhone');
      localStorage.removeItem('pos_taxPercent');
      localStorage.removeItem('pos_discount');
      localStorage.removeItem('pos_item_discounts');
      localStorage.removeItem('pos_selectedCustomerId');
      localStorage.removeItem('pos_paymentMethod');
      localStorage.removeItem('pos_jazzCashNumber');
    } catch (e) {}

    generateInvoiceNumber();
  };

  const subtotal = cart.reduce((sum, item) => {
    const disc = itemDiscounts[item._id] || 0;
    const unit = Math.max(0, item.price - disc);
    return sum + unit * item.quantity;
  }, 0);
  const taxAmount = (subtotal * taxPercent) / 100;
  const discountAmount = discount;
  const total = subtotal + taxAmount - discountAmount;

  // Helper to format currency consistently
  const formatCurrency = (n) => `RS ${Number(n).toLocaleString()}`;

  // Preview order data used for preview/printing
  const previewOrder = {
    invoiceNumber,
    customerName,
    customerPhone,
    items: cart.map(item => ({ productId: item._id, name: item.name, price: item.price, discount: itemDiscounts[item._id] || 0, unitPrice: Math.max(0, item.price - (itemDiscounts[item._id] || 0)), quantity: item.quantity })),
    subtotal,
    taxPercent,
    taxAmount,
    discount,
    total,
    paymentMethod,
    jazzCashNumber,
  };

  // Friendly label for confirmation messages
  const paymentMethodLabel = paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'stripe' ? 'Stripe' : 'JazzCash';

  const copyInvoiceNumber = async () => {
    try {
      await navigator.clipboard.writeText(invoiceNumber);
      toast.success("Invoice number copied");
    } catch {
      toast.error("Failed to copy invoice number");
    }
  };

  // Cancel stripe waiting/polling. If `silent` passed, suppress user toast (used on unmount/navigation).
  const cancelStripeWaiting = (silent = false) => {
    try {
      if (stripePollTimerRef.current) {
        clearInterval(stripePollTimerRef.current);
        stripePollTimerRef.current = null;
      }
      if (stripePopupRef.current && !stripePopupRef.current.closed) {
        stripePopupRef.current.close();
        stripePopupRef.current = null;
      }
      if (stripeAutoCloseTimerRef.current) {
        clearTimeout(stripeAutoCloseTimerRef.current);
        stripeAutoCloseTimerRef.current = null;
      }
      if (stripeCountdownIntervalRef.current) {
        clearInterval(stripeCountdownIntervalRef.current);
        stripeCountdownIntervalRef.current = null;
      }
    } catch (e) {}
    setStripeWaiting(false);
    setIsProcessingPayment(false);
    setStripeSessionId(null);
    setStripeCountdown(0);
    if (!silent) toast.error('Stripe payment cancelled');
  };

  const startStripeAutoClose = (order) => {
    try {
      // clear any previous timers
      if (stripeAutoCloseTimerRef.current) {
        clearTimeout(stripeAutoCloseTimerRef.current);
        stripeAutoCloseTimerRef.current = null;
      }
      if (stripeCountdownIntervalRef.current) {
        clearInterval(stripeCountdownIntervalRef.current);
        stripeCountdownIntervalRef.current = null;
      }

      // initialize countdown (seconds)
      const seconds = Math.round(STRIPE_AUTOCLOSE_DELAY / 1000);
      setStripeCountdown(seconds);
      stripeCountdownIntervalRef.current = setInterval(() => {
        setStripeCountdown(prev => {
          if (prev <= 1) {
            try { clearInterval(stripeCountdownIntervalRef.current); } catch (e) {}
            stripeCountdownIntervalRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // set auto-close timeout
      stripeAutoCloseTimerRef.current = setTimeout(() => {
        setStripeSuccessInfo({ show: false, invoiceNumber: '', order: null });
        try {
          const oid = order && order._id;
          if (oid) navigate(`/dashboard/billing?orderId=${oid}`);
          else navigate('/dashboard/billing');
        } catch (e) {
          try { window.location.href = '/dashboard/billing'; } catch (ee) {}
        }
        // cleanup countdown interval
        try { if (stripeCountdownIntervalRef.current) { clearInterval(stripeCountdownIntervalRef.current); stripeCountdownIntervalRef.current = null; } } catch (e) {}
        setStripeCountdown(0);
        stripeAutoCloseTimerRef.current = null;
      }, STRIPE_AUTOCLOSE_DELAY);
    } catch (e) {}
  };

  const clearStripeAutoClose = () => {
    try {
      if (stripeAutoCloseTimerRef.current) {
        clearTimeout(stripeAutoCloseTimerRef.current);
        stripeAutoCloseTimerRef.current = null;
      }
      if (stripeCountdownIntervalRef.current) {
        clearInterval(stripeCountdownIntervalRef.current);
        stripeCountdownIntervalRef.current = null;
      }
      setStripeCountdown(0);
    } catch (e) {}
  }; 

  // Utility helpers for JazzCash modal
  const copyToClipboard = async (text, label = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch (e) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const maskMobile = (num) => {
    if (!num) return 'N/A';
    return String(num).replace(/^(\d{4})(\d+)(\d{2})$/, (m, a, b, c) => `${a}${b.replace(/\d/g, '*')}${c}`);
  };

  const formatDateTime = (iso) => {
    try { return new Date(iso || Date.now()).toLocaleString(); } catch (e) { return '' }
  };

  const generateJazzReceiptText = () => {
    const o = jazzSuccessInfo.order || {};
    return `JazzCash Payment Receipt\nInvoice: ${jazzSuccessInfo.invoiceNumber || ''}\nTxnRef: ${jazzSuccessInfo.txnRef || ''}\nAmount: RS ${Math.round(o.total || total)}\nMobile: ${o.jazzCashNumber || jazzCashNumber}\nDate: ${formatDateTime(o.createdAt || Date.now())}\n`;
  };

  const printJazzReceipt = () => {
    if (jazzSuccessInfo.order) {
      printOrderBill(jazzSuccessInfo.order);
      setJazzSuccessInfo({ show: false, invoiceNumber: '', order: null, txnRef: '' });
    }
  };

  const copyJazzTransaction = () => {
    if (jazzSuccessInfo.txnRef) copyToClipboard(jazzSuccessInfo.txnRef, 'Transaction Reference');
  };

  // Initiate payment flow by asking for confirmation first
  const initiatePayment = () => {
    if (cart.length === 0) {
      toast.error("Add items to cart");
      return;
    }

    if (!customerName?.trim() && paymentMethod !== 'cash') {
      toast.error("Enter customer name");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid total amount");
      return;
    }

    if (paymentMethod === 'jazzcash') {
      if (!/^[0-9]{11}$/.test(jazzCashNumber)) {
        toast.error("Please enter a valid 11-digit JazzCash number");
        return;
      }
    }

    const orderData = buildOrderPayload({ paymentMethod: paymentMethod === 'cash' ? 'Cash' : paymentMethod === 'stripe' ? 'Stripe' : 'JazzCash', jazzCashNumber: paymentMethod === 'jazzcash' ? jazzCashNumber : undefined });

    setConfirmPayload({ method: paymentMethod, amount: total, orderData });
    setShowConfirm(true);
  };

  const quickPay = (method) => {
    setPaymentMethod(method);
    const orderData = buildOrderPayload({ paymentMethod: method === 'cash' ? 'Cash' : method === 'stripe' ? 'Stripe' : 'JazzCash' });
    setConfirmPayload({ method, amount: total, orderData });
    setShowConfirm(true);
  };

  const performPayment = async () => {
    if (!confirmPayload) return;

    // Avoid double submissions
    if (isProcessingPayment) return;

    try {
      setIsProcessingPayment(true);

      setShowConfirm(false);

      if (confirmPayload.method === 'jazzcash') {
        await processJazzCashPayment();
      } else if (confirmPayload.method === 'stripe') {
        await processStripePayment();
      } else {
        // Cash flow: save order and print
        const res = await axios.post('/orders', { ...confirmPayload.orderData });
        if (res) {
          toast.success('Order saved successfully');
          // Print a simple bill
          printOrderBill({ ...confirmPayload.orderData, createdAt: Date.now() });
          clearCart();
        } else {
          toast.error('Failed to save order');
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const processJazzCashPayment = async () => {
    // Strict validation: 11 numeric digits
    if (!jazzCashNumber || !/^[0-9]{11}$/.test(jazzCashNumber)) {
      toast.error("Please enter a valid 11-digit JazzCash number (digits only)");
      return;
    }

    if (total <= 0) {
      toast.error("Invalid total amount");
      return;
    }

    try {
      // JazzCash Sandbox API integration (simulated)
      const txnRef = `JC${Date.now()}`;
      const paymentData = {
        pp_MerchantID: "MC5767", // JazzCash Sandbox Merchant ID
        pp_Password: "test123", // JazzCash Sandbox Password
        pp_ReturnURL: `${window.location.origin}/payment/callback`,
        pp_Version: "1.1",
        pp_TxnType: "MWALLET",
        pp_TxnRefNo: txnRef,
        pp_Amount: Math.round(total * 100), // Amount in paisas
        pp_TxnCurrency: "PKR",
        pp_TxnDateTime: new Date().toISOString().replace(/[:-]/g, '').split('.')[0] + '000+0500',
        pp_BillReference: invoiceNumber,
        pp_Description: `Payment for Invoice ${invoiceNumber}`,
        pp_Language: "EN",
        pp_MobileNumber: jazzCashNumber,
        pp_CNIC: "", // Optional for sandbox
        pp_TxnExpiryDateTime: new Date(Date.now() + 15 * 60 * 1000).toISOString().replace(/[:-]/g, '').split('.')[0] + '000+0500', // 15 minutes expiry
      };

      // Create secure hash (simplified for sandbox)
      const hashString = `${paymentData.pp_MerchantID}&${paymentData.pp_Password}&${paymentData.pp_TxnRefNo}&${paymentData.pp_Amount}&${paymentData.pp_TxnCurrency}&${paymentData.pp_TxnDateTime}&${paymentData.pp_BillReference}&${paymentData.pp_Description}&${paymentData.pp_TxnType}&${paymentData.pp_Language}&${paymentData.pp_MerchantID}&${paymentData.pp_Password}`;
      const hash = btoa(hashString); // Simple base64 encoding for demo
      paymentData.pp_SecureHash = hash;

      // For sandbox, we'll simulate the payment process
      toast.success("JazzCash payment initiated! (Sandbox Mode)");

      // Simulate payment processing delay and save order afterwards
      await new Promise((resolve) => setTimeout(resolve, 1500));

      try {
        const orderData = {
          invoiceNumber,
          customerName,
          customerPhone,
          items: cart.map(item => ({
            productId: item._id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          subtotal,
          taxPercent,
          taxAmount,
          discount,
          total,
          paymentMethod: "JazzCash",
          jazzCashNumber,
          jazzTxnRef: txnRef,
          paymentStatus: "completed",
        };

        const res = await axios.post("/orders", orderData);
        const savedOrder = res.data;
        toast.success("Payment successful! Order saved.");
        // Show modal with saved order info and transaction details
        try {
          setJazzSuccessInfo({ show: true, invoiceNumber: savedOrder.invoiceNumber || invoiceNumber, order: savedOrder, txnRef });
        } catch (e) { /* ignore */ }
        // Refresh order history and clear the cart
        try { fetchOrders(); } catch (e) {}
        clearCart();
      } catch (err) {
        console.error('Failed to save JazzCash order:', err);
        const msg = err?.response?.data?.message || err?.message || "Failed to save JazzCash order";
        toast.error(msg);
        setIsProcessingPayment(false);
        return;
      }
    } catch (err) {
      console.error('JazzCash payment error:', err);
      toast.error('JazzCash payment failed. Please try again.');
      setIsProcessingPayment(false);
      return;
    }
  };

    const processStripePayment = async () => {
      try {
        toast.loading("Preparing Stripe Checkout...", { id: "stripe-payment" });

        const orderData = buildOrderPayload({ paymentMethod: 'Stripe' });

        // Create a Checkout Session on the server
        const res = await axios.post('/orders/create-checkout-session', orderData);

        const sessionId = res.data?.sessionId;
        const invoice = res.data?.invoiceNumber;
        const url = res.data?.url;

        if (invoice) {
          try { localStorage.setItem('stripe_pending_invoice', invoice); } catch (e) {}
          toast.success(`Invoice ${invoice} created — opening Stripe Checkout...`, { id: 'stripe-payment' });
        }

        if (!sessionId && !url) {
          toast.error("Failed to create Stripe session", { id: "stripe-payment" });
          setIsProcessingPayment(false);
          return;
        }

        setIsProcessingPayment(true);
        setStripeWaiting(true);
        setStripeSessionId(sessionId || null);

        // Open Stripe Checkout in a popup when possible (better UX)
        if (url) {
          try {
            stripePopupRef.current = window.open(url, 'stripeCheckout', 'width=900,height=700');
          } catch (e) {
            // If popup blocked, fallback to navigating current window
            window.location.href = url;
          }
        } else {
          // fallback to original behavior (redirect current window)
          const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
          if (!publishableKey) {
            toast.error("Stripe publishable key not configured (VITE_STRIPE_PUBLISHABLE_KEY)");
            setIsProcessingPayment(false);
            setStripeWaiting(false);
            return;
          }
          const stripe = await loadStripe(publishableKey);
          const { error } = await stripe.redirectToCheckout({ sessionId });
          if (error) {
            toast.error(`Stripe redirect failed: ${error.message}`, { id: "stripe-payment" });
            setIsProcessingPayment(false);
            setStripeWaiting(false);
            return;
          }
        }

        // Poll the checkout session for completion
        const sid = sessionId;
        stripePollTimerRef.current = setInterval(async () => {
          try {
            if (!sid) return;
            const r = await axios.get(`/orders/checkout-session/${sid}`);
            const { session, order } = r.data || {};
            const paid = (session && (session.payment_status === 'paid' || (session.payment_intent && session.payment_intent.status === 'succeeded'))) || (order && order.paymentStatus === 'completed');
            if (paid) {
              clearInterval(stripePollTimerRef.current);
              stripePollTimerRef.current = null;
              setStripeWaiting(false);
              setStripeSuccessInfo({ show: true, invoiceNumber: invoice || (order && order.invoiceNumber) || localStorage.getItem('stripe_pending_invoice') || '', order });
              toast.success(`Payment processed for ${invoice || ''}`);
              try { localStorage.removeItem('stripe_pending_invoice'); } catch(e) {}
              try { if (stripePopupRef.current && !stripePopupRef.current.closed) { stripePopupRef.current.close(); stripePopupRef.current = null; } } catch(e) {}
              try { fetchOrders(); } catch(e) {}
              clearCart();
              setIsProcessingPayment(false);

              // Auto-close the success modal and navigate/refresh after 3s
              clearStripeAutoClose();
              startStripeAutoClose(order);
            }
          } catch (e) {
            // ignore transient polling errors
          }
        }, 2000);

      } catch (err) {
        console.error('Stripe checkout error:', err);
        const errorMsg = err.response?.data?.message || err.message || "Unknown error";
        toast.error(`Stripe checkout failed: ${errorMsg}`, { id: "stripe-payment" });
        setIsProcessingPayment(false);
        setStripeWaiting(false);
      }
    };


  // generateInvoiceHTML moved to ../utils/generateInvoiceHTML.js

  const printOrderBill = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generateInvoiceHTML(order));
    printWindow.document.close();
    printWindow.print();
  };

  const printBill = () => {
    if (!customerName) {
      toast.error("Enter customer name");
      return;
    }
    if (cart.length === 0) {
      toast.error("Add items to cart");
      return;
    }

    if (paymentMethod === "jazzcash") {
      processJazzCashPayment();
      return;
    }

    if (paymentMethod === "stripe") {
      processStripePayment();
      return;
    }

    // For cash payments, proceed with normal flow
    const orderData = {
      invoiceNumber,
      customerName,
      customerPhone,
      items: cart.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      subtotal,
      taxPercent,
      taxAmount,
      discount,
      total,
      paymentMethod: "Cash",
      paymentStatus: "completed",
    };

    axios.post("/orders", orderData)
      .then(() => {
        toast.success("Order saved successfully");
        const printWindow = window.open('', '_blank');
        printWindow.document.write(generateInvoiceHTML(orderData));
        printWindow.document.close();
        printWindow.print();
        clearCart();
      })
      .catch(err => {
        toast.error("Failed to save order");
      });
  };

  return (
    <div className={`max-w-7xl mx-auto px-3 py-3 md:px-6 md:py-6 min-h-screen pb-32 ${
      theme === 'dark' ? 'bg-neutral-900' : 'bg-gray-50'
    }`}>


      {(role === 'admin' && activeTab === 'history') ? (
        // Admin requested Billing History — show only the history section (no billing form)
        <div className={`rounded-2xl p-5 border ${
          theme === 'dark'
            ? 'bg-neutral-800 border-neutral-700'
            : 'bg-white border-gray-200 shadow-lg'
        }`}>
          <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Billing History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className={theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'}>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Invoice Number</th>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Customer</th>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Phone</th>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Payment Method</th>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Date</th>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Total</th>
                  <th className={`p-3 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className={`border-b transition ${
                    theme === 'dark'
                      ? 'border-neutral-600 hover:bg-neutral-700'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}>
                    <td className={`p-3 truncate max-w-40 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.invoiceNumber}</td>
                    <td className={`p-3 truncate max-w-40 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{order.customerName}</td>
                    <td className={`p-3 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{order.customerPhone || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        order.paymentMethod === 'JazzCash' ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {order.paymentMethod || 'Cash'}
                      </span>
                    </td>
                    <td className={`p-3 ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-amber-400 font-bold">Rs {Math.round(order.total)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition text-sm"
                      >
                        View Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bill Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`rounded-2xl p-4 sm:p-6 w-full mx-4 sm:mx-auto max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-custom border ${
                theme === 'dark'
                  ? 'bg-neutral-800 border-neutral-700'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Bill Details</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => printOrderBill(selectedOrder)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-lg shadow-sm transform hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <FiPrinter size={16} />
                      Print Bill
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className={`px-3 py-2 ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="text-center mb-4">
                  <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>NOVA MART</h1>
                  <p className={theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}>Professional Billing System</p>
                </div>
                <div className={`mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <p><strong>Invoice Number:</strong> {selectedOrder.invoiceNumber}</p>
                  <p><strong>Customer:</strong> {selectedOrder.customerName}</p>
                  {selectedOrder.customerPhone && <p><strong>Phone:</strong> {selectedOrder.customerPhone}</p>}
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Cash'}</p>
                  {selectedOrder.jazzCashNumber && <p><strong>JazzCash Number:</strong> {selectedOrder.jazzCashNumber}</p>}
                  <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <table className="w-full text-left border-collapse mb-4">
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'}>
                      <th className={`p-2 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Item</th>
                      <th className={`p-2 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Qty</th>
                      <th className={`p-2 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Price</th>
                      <th className={`p-2 font-medium ${theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'}`}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index} className={`border-b ${theme === 'dark' ? 'border-neutral-600 text-white' : 'border-gray-200 text-gray-900'}`}>
                        <td className="p-2">{item.name}</td>
                        <td className="p-2">{item.quantity}</td>
                        <td className="p-2">RS {item.price}</td>
                        <td className="p-2">RS {Math.round(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className={`p-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Subtotal</td>
                      <td className={`p-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RS {Math.round(selectedOrder.subtotal)}</td>
                    </tr>
                    {selectedOrder.taxPercent > 0 && (
                      <tr>
                        <td colSpan="3" className={`p-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Tax ({selectedOrder.taxPercent}%)</td>
                        <td className={`p-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>RS {Math.round(selectedOrder.taxAmount)}</td>
                      </tr>
                    )}
                    {selectedOrder.discount > 0 && (
                      <tr>
                        <td colSpan="3" className={`p-2 text-right ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Discount</td>
                        <td className={`p-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>-RS {Math.round(selectedOrder.discount)}</td>
                      </tr>
                    )}
                    <tr className={theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'}>
                      <td colSpan="3" className={`p-2 text-right font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Total</td>
                      <td className="p-2 text-amber-400 font-bold">RS {Math.round(selectedOrder.total)}</td>
                    </tr>
                  </tfoot>
                </table>
                <div className={`text-center text-sm font-bold ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'}`}>
                  Co-Powered by NOVA MART | Contact US AT 0305-6616939 | Created by SHAHRUKH AMJAD | ALL RIGHTS RESERVED TO SHAHRUKH AMJAD
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="billing-grid grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="billing-main lg:col-span-7">
              {/* Left: Products */}
              <ProductSearch
                filteredProducts={filteredProducts}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                sortBy={sortBy}
                setSortBy={setSortBy}
                fetchProducts={fetchProducts}
                onAdd={addToCart}
              />
            </div>

            {/* Middle: Cart */}
            <div className={`rounded-2xl p-3 md:p-5 flex flex-col lg:col-span-3 ${
              theme === 'dark'
                ? 'bg-neutral-800 border border-neutral-700'
                : 'bg-white border border-gray-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <h3 className={`text-lg font-semibold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Cart</h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input value={customerQuery} onChange={(e)=>setCustomerQuery(e.target.value)} className={`w-full sm:w-48 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 border ${
                    theme === 'dark'
                      ? 'bg-neutral-700 border-neutral-600 text-white placeholder-neutral-400'
                      : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`} placeholder="Search customer..." aria-label="Search customers" />
                  <button onClick={saveRecentCustomer} className={`px-3 py-2 rounded-lg font-medium transition shrink-0 ${
                    theme === 'dark'
                      ? 'bg-neutral-700 hover:bg-neutral-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}>Save</button>
                </div>
              </div>

              {customerSuggestions.length > 0 && (
                <div className={`mb-3 p-2 rounded border ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700'
                    : 'bg-gray-50 border-gray-200'
                }`}>
                  {customerSuggestions.map(c => (
                    <div key={c._id} className={`py-1 px-2 rounded cursor-pointer transition ${
                      theme === 'dark'
                        ? 'hover:bg-neutral-800 text-white'
                        : 'hover:bg-gray-200 text-gray-900'
                    }`} onClick={() => pickCustomerSuggestion(c)}>{c.name} {c.phone ? `• ${c.phone}` : ''}</div>
                  ))}
                </div>
              )}

              <div className="flex-1 overflow-y-auto mb-4 scrollbar-custom">
                <CartList
                  cart={cart}
                  products={products}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  clearCart={clearCart}
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  taxPercent={taxPercent}
                  setTaxPercent={setTaxPercent}
                  discount={discount}
                  setDiscount={setDiscount}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  jazzCashNumber={jazzCashNumber}
                  setJazzCashNumber={setJazzCashNumber}
                  setShowPreview={setShowPreview}
                  itemDiscounts={itemDiscounts}
                  setItemDiscount={setItemDiscount}
                  recentCustomers={recentCustomers}
                  onSaveCustomer={saveRecentCustomer}
                  onPickRecent={pickRecentCustomer}
                  onRequestClear={() => { setConfirmPayload({ action: 'clearCart' }); setShowConfirm(true); }}
                  invoiceNumber={invoiceNumber}
                  subtotal={subtotal}
                  taxAmount={taxAmount}
                  total={total}
                  copyInvoiceNumber={copyInvoiceNumber}
                  initiatePayment={initiatePayment}
                  quickPay={quickPay}
                  printBill={printBill}
                />
              </div>
            </div>


          </div>

          {/* Non-admin Billing History (if requested) */}
          {activeTab === 'history' && (
            <div className={`rounded-2xl p-5 border ${
              theme === 'dark'
                ? 'bg-neutral-800 border-neutral-700'
                : 'bg-white border-gray-200 shadow-lg'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Billing History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse compact-table compact-table">
                  <thead>
                    <tr className={theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-200'}>
                      <th className={`p-3 font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>Invoice</th>
                      <th className={`p-3 font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>Customer</th>
                      <th className={`p-3 font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>Method</th>
                      <th className={`p-3 font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>Date</th>
                      <th className={`p-3 font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>Total</th>
                      <th className={`p-3 font-medium ${
                        theme === 'dark' ? 'text-neutral-300' : 'text-gray-700'
                      }`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id} className={`border-b transition ${
                        theme === 'dark'
                          ? 'border-neutral-600 hover:bg-neutral-700'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <td className={`p-3 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{order.invoiceNumber}</td>
                        <td className={`p-3 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{order.customerName}</td>
                        <td className={`p-3 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>{order.paymentMethod || 'Cash'}</td>
                        <td className={`p-3 ${
                          theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                        }`}>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 text-amber-400 font-bold">Rs {Math.round(order.total)}</td>
                        <td className="p-3">
                          <button
                            onClick={() => printOrderBill(order)}
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm"
                          >
                            Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Invoice Preview Modal (minimal) */}
      {showPreview && (
        <InvoicePreview
          previewOrder={previewOrder}
          onClose={() => setShowPreview(false)}
          onPrint={(order) => printOrderBill(order)}
          onConfirm={initiatePayment}
          isProcessingPayment={isProcessingPayment}
          paymentMethod={paymentMethod}
        />
      )}

      {/* Stripe waiting modal shown while polling for payment completion (Stripe-like UI) */}
      {stripeWaiting && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#635BFF] flex items-center justify-center text-white shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 12h16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 6h10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                </svg>
              </div>

              <div className="flex-1">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Complete payment</h3>
                  <button onClick={() => cancelStripeWaiting()} className="ml-auto text-gray-400 hover:text-gray-700">✕</button>
                </div>
                <p className="text-sm text-gray-600 mt-2">A Stripe Checkout window opened. Complete the payment there — this dialog will update automatically when the payment completes.</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 rounded-full border-2 border-t-[#635BFF] border-gray-200 animate-spin" aria-hidden></div>
                    <span>Waiting for payment...</span>
                  </div>
                  <button onClick={() => cancelStripeWaiting()} className="ml-2 px-3 py-1 bg-gray-100 text-gray-900 rounded">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stripe success modal shown after returning from Stripe (Stripe-like UI) */}
      {stripeSuccessInfo.show && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-[#635BFF] to-[#6F73FF] flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#635BFF] flex-shrink-0">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Payment successful</h3>
                <p className="text-sm text-white/90">Your payment was processed</p>
              </div>
              <button onClick={() => { clearStripeAutoClose(); setStripeSuccessInfo({ show: false, invoiceNumber: '', order: null }); }} className="ml-auto text-white/90 hover:text-white p-2">✕</button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="text-sm text-gray-600">Invoice</div>
              <div className="mt-1 font-semibold text-gray-900">{stripeSuccessInfo.invoiceNumber || 'N/A'}</div>

              <div className="mt-3 text-2xl font-bold text-amber-500">RS {Math.round((stripeSuccessInfo.order?.total ?? 0))}</div>

              {stripeSuccessInfo.order && (
                <div className="mt-6 border-t pt-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3">Order Details</div>
                  
                  <div className="mb-4 pb-4 border-b">
                    <div className="text-xs text-gray-600">Customer Name</div>
                    <div className="text-gray-900 font-medium">{stripeSuccessInfo.order.customerName || 'N/A'}</div>
                  </div>

                  <div className="text-sm font-semibold text-gray-900 mb-2">Products</div>
                  <div className="space-y-2">
                    {stripeSuccessInfo.order.items && stripeSuccessInfo.order.items.map((item, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-600 mt-1">Qty: {item.quantity}</div>
                          </div>
                          <div className="text-sm font-semibold text-amber-600">RS {item.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <p className="mt-6 text-sm text-gray-500" aria-live="polite">Closing in <strong className="text-gray-900">{stripeCountdown > 0 ? `${stripeCountdown}s` : `${Math.round(STRIPE_AUTOCLOSE_DELAY / 1000)}s`}</strong></p>

              <div className="mt-6 flex gap-3">
                <button onClick={() => {
                    if (stripeSuccessInfo.order) printOrderBill(stripeSuccessInfo.order);
                  }} className="w-full px-3 py-2 bg-white border rounded-md text-gray-700 font-medium hover:bg-gray-50 transition">Print</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* JazzCash success modal shown after simulated payment */}
      {jazzSuccessInfo.show && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-xl w-full border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="bg-gradient-to-r from-[#C8102E] to-[#FF7A00] p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">JC</div>
              <div>
                <h3 className="text-lg font-semibold text-white">Payment Successful</h3>
                <p className="text-sm text-white/90">JazzCash transaction completed</p>
              </div>
              <button className="ml-auto text-white/90 hover:text-white p-2" onClick={() => setJazzSuccessInfo({ show: false, invoiceNumber: '', order: null, txnRef: '' })}>✕</button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-green-700 animate-pulse">
                  <FiCheckCircle className="w-10 h-10" />
                </div>
              </div>

              <div className="text-center mb-4">
                <div className="text-xs text-neutral-500 mb-1">Invoice</div>
                <div className="font-semibold text-neutral-900 dark:text-white mb-2">{jazzSuccessInfo.invoiceNumber || 'N/A'}</div>
                <div className="text-2xl font-bold text-amber-500 mb-2">RS {Math.round((jazzSuccessInfo.order?.total ?? total) || 0)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded p-3 text-sm">
                  <div className="text-neutral-500">Mobile</div>
                  <div className="font-mono text-neutral-900 dark:text-white">{maskMobile(jazzSuccessInfo.order?.jazzCashNumber || jazzCashNumber)}</div>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-800 rounded p-3 text-sm">
                  <div className="text-neutral-500">Txn Ref</div>
                  <div className="flex items-center gap-2 font-mono text-neutral-900 dark:text-white">
                    <span>{jazzSuccessInfo.txnRef || '—'}</span>
                    <button onClick={copyJazzTransaction} title="Copy transaction reference" className="text-neutral-500 hover:text-neutral-800 p-1 rounded"><FiCopy /></button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <button onClick={printJazzReceipt} className="btn btn-primary flex items-center gap-2"><FiPrinter /> Print Receipt</button>
                <button onClick={() => copyToClipboard(generateJazzReceiptText(), 'Receipt')} className="btn btn-ghost flex items-center gap-2"><FiDownload /> Copy / Download</button>
                <button onClick={() => setJazzSuccessInfo({ show: false, invoiceNumber: '', order: null, txnRef: '' })} className="btn btn-outline">Close</button>
              </div>
            </div>

            <div className="p-3 border-t text-xs text-neutral-400">Transaction completed with JazzCash. For support, please contact JazzCash or your payment provider.</div>
          </div>
        </div>
      )}
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirm}
        title={confirmPayload?.action === 'clearCart' ? 'Clear cart?' : `Confirm payment of ${formatCurrency(total)}`}
        message={confirmPayload?.action === 'clearCart' ? 'This will remove all items and reset the form. Are you sure?' : `You are about to charge ${formatCurrency(total)} via ${paymentMethodLabel}. Invoice: ${invoiceNumber}`}
        onConfirm={() => {
          if (confirmPayload?.action === 'clearCart') {
            clearCart();
            setShowConfirm(false);
            toast.success('Cart cleared');
          } else {
            performPayment();
          }
        }}
        onCancel={() => setShowConfirm(false)}
        loading={isProcessingPayment}
      />    </div>
  );
}