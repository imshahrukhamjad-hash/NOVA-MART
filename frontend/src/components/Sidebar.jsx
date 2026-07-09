import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FiHome,
  FiUser,
  FiClipboard,
  FiList,
  FiLogOut,
  FiLayers,
  FiCreditCard,
  FiCalendar
} from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";
import WhatsAppButton from "./WhatsAppButton";
import MailButton from "./MailButton";
import MailboxButton from "./MailboxButton";
import LiveChatButton from "./LiveChatButton";

export default function Sidebar({ onOpenMailModal, onOpenMailboxModal }) {
  const { theme } = useTheme();
  const [role, setRole] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/auth/me").then(res => setRole(res.data.role));
  }, []);

  const logout = async () => {
    await axios.post("/auth/logout");
    navigate('/');
  };

  const menu = [
    { name: "Dashboard", path: "/dashboard/overview", icon: <FiHome />, roles: ["user", "admin"] },
    { name: "Inventory", path: "/dashboard/inventory", icon: <FiLayers />, roles: ["user", "admin"] },
    { name: "Billing", path: "/dashboard/billing", icon: <FiCreditCard />, roles: ["user"] },
    // Admin sees a Billing History link that opens the Billing page with the history tab active
    { name: "Billing History", path: "/dashboard/billing?tab=history", icon: <FiCreditCard />, roles: ["admin"] },
    { name: "Customers", path: "/dashboard/customers", icon: <FiUser />, roles: ["user", "admin"] },
    { name: "Calendar", path: "/dashboard/calendar", icon: <FiCalendar />, roles: ["user", "admin"] },
    { name: "Reviews", path: "/dashboard/review", icon: <FiClipboard />, roles: ["user"] },
    { name: "User List", path: "/dashboard/users", icon: <FiList />, roles: ["admin"] },
    { name: "All Reviews", path: "/dashboard/all-reviews", icon: <FiClipboard />, roles: ["admin"] },
  ];

  return (
    <div className={`w-56 h-screen border-r rounded-r-lg flex flex-col sidebar-compact ${
      theme === 'dark'
        ? 'bg-neutral-950 border-neutral-800'
        : 'bg-gray-50 border-gray-200 shadow-lg'
    }`}>

      {/* BRAND */}
      <div className={`p-4 border-b ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
        <div className="flex items-center gap-4">
<div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow">
            <FiLayers size={18} />
          </div>

          <div className="flex flex-col">
            <h2 className={`text-lg font-semibold tracking-wide leading-tight ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              NOVA MART
            </h2>

            {/* ROLE BADGE */}
            <span
              className={`mt-1 inline-flex w-fit items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide
              ${
                role === "admin"
                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {role === "admin" ? "ADMIN" : "USER"}
            </span>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-4 py-6 flex flex-col gap-2">
        {menu.map((item, i) => {
          if (!item.roles.includes(role)) return null;
          // Special handling for Dashboard - consider both /dashboard and /dashboard/overview as active
          const isDashboardActive = item.name === "Dashboard" && 
            (location.pathname === "/dashboard" || location.pathname === "/dashboard/overview");
          // Special handling for Billing History with query params
          const isBillingHistoryActive = item.name === "Billing History" && 
            location.pathname === "/dashboard/billing" && 
            location.search.includes("tab=history");
          const active = isDashboardActive || isBillingHistoryActive || location.pathname === item.path;

          return (
            <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm
                ${
                  active
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-lg"
                    : theme === 'dark'
                    ? "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 hover:shadow-sm"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="font-medium text-xs ml-1">{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* SUPPORT SECTION - USERS ONLY */}
      {role === "user" && (
        <div className={`border-t ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
            <h3 className={`text-xs font-semibold tracking-widest uppercase ${
              theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
            }`}>
              Help & Support
            </h3>
          </div>
          
          <div className="px-3 py-3 flex flex-col gap-2">
            {/* WhatsApp Support */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <WhatsAppButton />
            </motion.div>

            {/* Email Support */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <MailButton onClick={onOpenMailModal} />
            </motion.div>

            {/* Live Chat Support */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <LiveChatButton />
            </motion.div>
          </div>
        </div>
      )}

      {/* MAILBOX SECTION - ADMINS ONLY */}
      {role === "admin" && (
        <div className={`border-t ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
            <h3 className={`text-xs font-semibold tracking-widest uppercase ${
              theme === 'dark' ? 'text-neutral-500' : 'text-gray-500'
            }`}>
              Messages
            </h3>
          </div>
          
          <div className="px-3 py-3 flex flex-col gap-2">
            {/* Mailbox */}
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <MailboxButton onClick={onOpenMailboxModal} />
            </motion.div>
          </div>
        </div>
      )}

      {/* LOGOUT */}
      <div className={`p-4 border-t ${theme === 'dark' ? 'border-neutral-800' : 'border-gray-200'}`}>
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg
          text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm"
        >
          <FiLogOut size={16} />
          <span className="font-medium text-xs">Logout</span>
        </motion.button>
      </div>

    </div>
  );
}
