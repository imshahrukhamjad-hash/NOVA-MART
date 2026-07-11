import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiChevronDown, FiSearch, FiSettings, FiShoppingCart, FiTrash2, FiMoon, FiSun } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const [hideNav, setHideNav] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const cartRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const getCartCount = () => {
    try {
      const raw = localStorage.getItem('pos_cart');
      if (!raw) return 0;
      const arr = JSON.parse(raw);
      return arr.reduce((s,i)=>s+(i.quantity||0),0);
    } catch (e) { return 0; }
  };

  const getCartItems = () => {
    try {
      const raw = localStorage.getItem('pos_cart');
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) { return []; }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/auth/me");
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
    const interval = setInterval(fetchUser, 2000);
    return () => clearInterval(interval);
  }, []);

  // Initialize cart count/items and listen for cart changes
  useEffect(() => {
    setCartCount(getCartCount());
    setCartItems(getCartItems());
    const handler = (e) => {
      const c = e?.detail?.count;
      const cart = e?.detail?.cart;
      if (Array.isArray(cart)) {
        setCartItems(cart);
        setCartCount(cart.reduce((s,i)=>s+(i.quantity||0),0));
      } else if (typeof c === 'number') {
        setCartCount(c);
        setCartItems(getCartItems());
      } else {
        setCartCount(getCartCount());
        setCartItems(getCartItems());
      }
    };
    window.addEventListener('cart-changed', handler);
    return () => window.removeEventListener('cart-changed', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => setHideNav(!!e.detail?.open);
    window.addEventListener('inventory-modal', handler);
    return () => window.removeEventListener('inventory-modal', handler);
  }, []);

  // close cart dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!cartRef.current) return;
      if (!cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // close profile dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);



  const logout = async () => {
    localStorage.removeItem("token");
    await axios.post("/auth/logout");
    navigate('/');
  };

  return (
    <AnimatePresence>
      {!hideNav && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.25 }}
          className={`h-14 px-4 flex items-center justify-between
          ${theme === 'dark' 
            ? 'bg-neutral-900 border-neutral-800 text-white' 
            : 'bg-gray-50 border-gray-200 text-gray-900 shadow-md'
          } backdrop-blur rounded-l-lg
          sticky top-0 z-50 transition-colors duration-300`}
        >
          {/* Navbar Title */}
          <h1 className="text-xs sm:text-base font-semibold tracking-wide truncate max-w-[100px] sm:max-w-none">
            Welcome{user?.name ? ', ' : ''}{user?.name}
          </h1>

          {/* Search + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart button */}
            <div className="relative">
              <div className="relative" ref={cartRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setCartOpen(v => !v)}
                className={`relative p-2 rounded-md hover:transition ${theme === 'dark' ? 'text-white hover:bg-neutral-800' : 'text-gray-900 hover:bg-gray-200'}`}
                aria-label="Toggle cart dropdown"
              >
                <FiShoppingCart size={18} />
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className="absolute -top-2 -right-2 bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full"
                  >{cartCount}</motion.span>
                )}
              </motion.button>

              {/* Cart dropdown */}
              {cartOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className={`absolute right-0 mt-2 w-80 rounded-md shadow-xl overflow-hidden z-50 ${theme === 'dark' ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-gray-200 shadow-2xl'}`}
                >
                  <div className="p-3">
                    <h4 className={`text-sm font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cart</h4>
                    {cartItems.length === 0 ? (
                      <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Your cart is empty.</div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {cartItems.map(item => (
                          <div key={item._id} className="flex items-center gap-3">
                            <img src={item.image ? (item.image.startsWith('http')||item.image.startsWith('/')?item.image:`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${item.image}`) : 'https://via.placeholder.com/40'} alt={item.name} className="w-10 h-10 object-cover rounded" />
                            <div className="flex-1 text-sm">
                              <div className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>{item.name}</div>
                              <div className={`text-xs ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Qty: {item.quantity} • Rs {item.price}</div>
                            </div>
                            <button onClick={() => {
                              // remove item from cart
                              try {
                                const raw = localStorage.getItem('pos_cart');
                                const arr = raw ? JSON.parse(raw) : [];
                                const newArr = arr.filter(a => a._id !== item._id);
                                localStorage.setItem('pos_cart', JSON.stringify(newArr));
                                const count = newArr.reduce((s,i)=>s+(i.quantity||0),0);
                                window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count, cart: newArr } }));
                                setCartItems(newArr);
                              } catch (e) {}
                            }} className={`p-1 ${theme === 'dark' ? 'text-neutral-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                              <FiTrash2 />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`border-t p-3 flex items-center justify-between ${theme === 'dark' ? 'border-neutral-700' : 'border-gray-200'}`}>
                    <div className={`text-sm ${theme === 'dark' ? 'text-neutral-400' : 'text-gray-500'}`}>Subtotal</div>
                    <div className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Rs {cartItems.reduce((s,i)=>s+(i.price*i.quantity||0),0)}</div>
                  </div>

                  <div className="p-3 flex gap-2">
                    <button onClick={() => { setCartOpen(false); navigate('/dashboard/billing#cart'); }} className={`flex-1 px-3 py-2 rounded ${theme === 'dark' ? 'bg-neutral-700 hover:bg-neutral-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>View cart</button>
                    <button onClick={() => { localStorage.setItem('pos_cart', JSON.stringify([])); window.dispatchEvent(new CustomEvent('cart-changed', { detail: { count: 0, cart: [] } })); setCartItems([]); setCartOpen(false); }} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded">Clear</button>
                  </div>
                </motion.div>
              )}
            </div>
            </div>

            {/* Theme Toggle Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={toggleTheme}
              className={`p-2 rounded-md transition ${theme === 'dark' ? 'text-yellow-400 hover:bg-neutral-800' : 'text-blue-600 hover:bg-gray-200'}`}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </motion.button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-3 px-2 py-1 rounded-md transition ${theme === 'dark' ? 'text-white hover:bg-neutral-800' : 'text-gray-900 hover:bg-gray-200'}`}
              >
                <img
                  src={
                    user?.image
                      ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${user.image}`
                      : "https://via.placeholder.com/40"
                  }
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="font-medium text-sm">{user?.name || "Guest"}</span>
                <FiChevronDown size={14} />
              </motion.button>

              <AnimatePresence>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className={`absolute right-0 mt-2 w-40 rounded-md shadow-xl overflow-hidden ${theme === 'dark' ? 'bg-neutral-800 border border-neutral-700' : 'bg-white border border-gray-200 shadow-2xl'}`}
                  >
                    <button 
                      onClick={() => {
                        navigate('/dashboard/profile');
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 transition flex items-center gap-2 ${theme === 'dark' ? 'hover:bg-neutral-700 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                    >
                      <FiSettings size={14} />
                      Settings
                    </button>
                    <button 
                      onClick={() => {
                        navigate('/dashboard/help');
                        setOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 transition ${theme === 'dark' ? 'hover:bg-neutral-700 text-white' : 'hover:bg-gray-100 text-gray-900'}`}
                    >
                      Help
                    </button>
                    <button
                      onClick={logout}
                      className={`w-full text-left px-4 py-2 transition ${theme === 'dark' ? 'text-red-400 hover:bg-neutral-700' : 'text-red-600 hover:bg-gray-100'}`}
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
