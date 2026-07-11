import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import Profile from "./Profile";
import Review from "./Review";
import UserList from "./UserList";
import AdminReviews from "./AdminReviews";
import DashboardPage from "./DashboardPage";
import Inventory from "./Inventory";
import Billing from "./Billing";
import Customers from "./Customers";
import CustomerDetails from "./CustomerDetails";
import Help from "./Help";
import Calendar from "./Calendar";
import MailModal from "../components/MailModal";
import MailboxModal from "../components/MailboxModal";
import Particles from "react-tsparticles";
import { useState, useEffect } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { FiMenu } from "react-icons/fi";

export default function Dashboard() {
  const location = useLocation();
  const { theme } = useTheme();
  const [showMailModal, setShowMailModal] = useState(false);
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [role, setRole] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get("/auth/me");
        setRole(res.data.role);
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    };
    fetchRole();
  }, []);

  // Close sidebar on route change (mobile UX)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Control Tawk.to widget visibility based on role
    const controlTawkWidget = () => {
      if (role === "user") {
        if (!window.Tawk_API) {
          window.Tawk_API = window.Tawk_API || {};
          window.Tawk_LoadStart = new Date();
          const s1 = document.createElement("script");
          s1.async = true;
          s1.src = 'https://embed.tawk.to/6952864e7b201a197f1075a1/1jdl5p9df';
          s1.charset = 'UTF-8';
          s1.setAttribute('crossorigin', '*');
          document.head.appendChild(s1);
          s1.onload = () => {
            if (window.Tawk_API && typeof window.Tawk_API.showWidget === 'function') {
              window.Tawk_API.showWidget();
            }
          };
        } else {
          if (typeof window.Tawk_API.showWidget === 'function') {
            window.Tawk_API.showWidget();
          }
        }
      } else {
        if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
          window.Tawk_API.hideWidget();
        }
      }
    };

    controlTawkWidget();

    if (!window.Tawk_API) {
      const checkTawk = setInterval(() => {
        if (window.Tawk_API) {
          controlTawkWidget();
          clearInterval(checkTawk);
        }
      }, 1000);
      setTimeout(() => clearInterval(checkTawk), 10000);
    }
  }, [role]);

  return (
    <div className={`flex h-screen overflow-auto md:overflow-hidden ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>

      {/* Mobile backdrop overlay — clicking it closes sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onOpenMailModal={() => setShowMailModal(true)}
        onOpenMailboxModal={() => setShowMailboxModal(true)}
      />

      {/* Main content area */}
      <div className="flex-1 relative overflow-hidden min-w-0">
        {/* Particles Background */}
        <Particles
          className="absolute inset-0"
          options={{
            fpsLimit: 60,
            particles: {
              number: { value: 50 },
              color: { value: "#3b82f6" },
              move: { enable: true, speed: 0.5, random: true },
              size: { value: { min: 1, max: 3 } },
              opacity: { value: { min: 0.1, max: 0.3 } },
              links: {
                enable: true,
                distance: 150,
                color: "#2563eb",
                opacity: 0.1,
                width: 1,
              },
            },
            interactivity: {
              events: {
                onHover: { enable: true, mode: "repulse" },
                onClick: { enable: false },
              },
              modes: { repulse: { distance: 100 } },
            },
          }}
        />

        {/* Top bar: hamburger (mobile) + Navbar */}
        <div className="relative z-20 flex items-center">
          {/* Hamburger button — visible on mobile only */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
            className={`md:hidden flex-shrink-0 p-3 m-1 rounded-lg transition ${
              theme === 'dark'
                ? 'text-white hover:bg-neutral-800'
                : 'text-gray-900 hover:bg-gray-200'
            }`}
          >
            <FiMenu size={22} />
          </button>

          {/* Navbar stretches to fill remaining space */}
          <div className="flex-1 min-w-0">
            <Navbar />
          </div>
        </div>

        {/* Page content */}
        <div className="relative z-10 p-3 md:p-6 overflow-auto h-auto md:h-[calc(100vh-56px)]">
          <Routes location={location}>
            <Route index element={<DashboardPage />} />
            <Route path="overview" element={<DashboardPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="review" element={<Review />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="billing" element={<Billing />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetails />} />
            <Route path="users" element={<UserList />} />
            <Route path="all-reviews" element={<AdminReviews />} />
            <Route path="help" element={<Help />} />
            <Route path="calendar" element={<Calendar />} />
          </Routes>
        </div>
      </div>

      {/* Modals */}
      <MailModal isOpen={showMailModal} onClose={() => setShowMailModal(false)} />
      <MailboxModal isOpen={showMailboxModal} onClose={() => setShowMailboxModal(false)} />

    </div>
  );
}
