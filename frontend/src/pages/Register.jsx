import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function Register() {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Hide Tawk.to widget on register page
    const hideTawkWidget = () => {
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === 'function') {
        window.Tawk_API.hideWidget();
      }
      // Also hide directly
      const tawkContainer = document.getElementById('tawk-widget-container') || document.querySelector('#tawk-widget-container');
      if (tawkContainer) {
        tawkContainer.style.display = 'none';
      }
    };

    hideTawkWidget();

    // Also check after Tawk loads
    if (!window.Tawk_API) {
      const checkTawk = setInterval(() => {
        if (window.Tawk_API) {
          hideTawkWidget();
          clearInterval(checkTawk);
        }
      }, 1000);
      setTimeout(() => clearInterval(checkTawk), 10000);
    }
  }, []);

  const register = async () => {
    if (!name || !email || !password) {
      setError(true);
      setTimeout(() => setError(false), 600);
      return;
    }

    try {
      await axios.post("/auth/register", { name, email, password });
      toast.success("Account created");
      navigate("/");
    } catch {
      toast.error("Registration failed");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      register();
    }
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${
      theme === 'dark' 
        ? 'bg-neutral-900 text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {/* LEFT PANEL */}
      <div className={`w-full md:w-1/2 flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-gradient-to-tr from-neutral-800 via-neutral-900 to-neutral-800'
          : 'bg-gradient-to-tr from-blue-100 via-white to-blue-50'
      }`}>
        <div className="text-center px-10">
          <h1 className="text-5xl font-semibold mb-4 tracking-tight">
            POS System
          </h1>
          <p className={`text-base ${theme === 'dark' ? 'opacity-70' : 'text-gray-600'}`}>
            Enterprise point of sale management
          </p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="relative w-full md:w-1/2 flex items-center justify-center p-6">
        {/* PARTICLES */}
        <Particles
          className="absolute inset-0"
          options={{
            fpsLimit: 60,
            particles: {
              number: { value: 22 },
              color: { value: theme === 'dark' ? "#525252" : "#d1d5db" },
              move: { enable: true, speed: 0.2 },
              size: { value: 1 },
              opacity: { value: 0.15 },
              links: { enable: false },
            },
          }}
        />

        {/* CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative w-full max-w-md rounded-xl p-8 shadow-lg border ${
            theme === 'dark'
              ? 'bg-neutral-800/90 border-neutral-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <h2 className="text-2xl font-semibold text-center mb-1">
            Create account
          </h2>
          <p className={`text-center text-sm mb-6 ${
            theme === 'dark' ? 'opacity-60' : 'text-gray-600'
          }`}>
            Register for POS access
          </p>

          {/* INPUTS */}
          <div className="space-y-4">
            <motion.input
              animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`w-full p-3 rounded-md border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />

            <motion.input
              animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
              transition={{ duration: 0.4 }}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              className={`w-full p-3 rounded-md border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                theme === 'dark'
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-gray-50 border-gray-300 text-gray-900'
              }`}
            />

            <div className="relative">
              <motion.input
                animate={error ? { x: [0, -8, 8, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className={`w-full p-3 pr-12 rounded-md border focus:ring-2 focus:ring-amber-500 focus:outline-none ${
                  theme === 'dark'
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-gray-50 border-gray-300 text-gray-900'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 transform -translate-y-1/2 transition-colors ${
                  theme === 'dark'
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {/* BUTTON */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={register}
            className="w-full mt-6 py-3 rounded-md font-medium bg-amber-500 hover:bg-amber-600 text-black transition shadow"
          >
            Register
          </motion.button>

          <p className={`text-center mt-4 text-sm ${
            theme === 'dark' ? 'opacity-60' : 'text-gray-600'
          }`}>
            Already have an account?{" "}
            <Link to="/" className="text-amber-500 hover:underline">
              Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
