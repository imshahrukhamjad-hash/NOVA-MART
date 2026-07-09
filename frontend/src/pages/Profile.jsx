import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiPhone, FiLock } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

export default function Profile() {
  const { theme } = useTheme();
  const [user, setUser] = useState(null);
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    axios.get("/auth/me").then(res => {
      setUser(res.data);
      setForm({
        name: res.data.name || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
      if (res.data.image) {
        setPreview(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${res.data.image}`);
        setImageLoaded(true);
      }
    });
  }, []);

  const handleImageSelect = e => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setImageLoaded(true);
  };

  const uploadImage = async () => {
    if (!image) return toast.error("Select an image first");
    const fd = new FormData();
    fd.append("image", image);
    try {
      const res = await axios.put("/auth/upload-image", fd);
      setUser(p => ({ ...p, image: res.data.image }));
      setPreview(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${res.data.image}`);
      setImageLoaded(true);
      setImage(null);
      toast.success("Profile photo updated");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.response?.data?.message || "Upload failed");
    }
  };

  const removeImage = async () => {
    try {
      await axios.delete("/auth/delete-image");
      setUser(p => ({ ...p, image: "" }));
      setPreview(null);
      setImageLoaded(false);
      toast.success("Profile photo removed");
    } catch {
      toast.error("Failed");
    }
  };

  const updateProfile = async () => {
    try {
      await axios.put("/auth/update", form);
      toast.success("Profile updated successfully");
    } catch {
      toast.error("Update failed");
    }
  };

  const changePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("All password fields are required");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 2) {
      toast.error("New password must be at least 2 characters");
      return;
    }

    try {
      await axios.put("/auth/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className={`text-3xl font-semibold ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          Profile Settings
        </h1>
        <p className={`text-sm mt-1 ${
          theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
        }`}>
          Manage your personal information and profile photo
        </p>
      </motion.div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${
          theme === 'dark'
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-white border-purple-200'
        } border rounded-2xl shadow-xl`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0">

          {/* LEFT PANEL */}
          <div className={`md:col-span-4 border-b md:border-b-0 md:border-r p-8 flex flex-col items-center ${
            theme === 'dark'
              ? 'border-neutral-800 bg-neutral-950/50'
              : 'border-purple-200 bg-gray-50'
          }`}>
            <div className="relative w-40 h-40">
              {!imageLoaded && (
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className={`absolute inset-0 rounded-full ${
                    theme === 'dark' ? 'bg-neutral-700' : 'bg-gray-300'
                  }`}
                />
              )}
              <img
                src={preview || "https://via.placeholder.com/160"}
                alt="Profile"
                className={`w-40 h-40 rounded-full object-cover border-2 shadow-lg ${
                  theme === 'dark' ? 'border-neutral-700' : 'border-purple-300'
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            </div>

            <label
              htmlFor="upload"
              className={`mt-6 w-full text-center py-3 rounded-lg text-sm cursor-pointer transition hover:shadow-md ${
                theme === 'dark'
                  ? 'bg-neutral-800 hover:bg-neutral-700 border border-neutral-700'
                  : 'bg-gray-200 hover:bg-gray-300 border border-purple-300'
              }`}
            >
              Upload new photo
            </label>
            <input
              id="upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />

            {image && (
              <button
                onClick={uploadImage}
                className="mt-3 w-full py-3 rounded-lg
                           bg-amber-600 hover:bg-amber-500
                           text-white text-sm transition shadow-md hover:shadow-lg"
              >
                Save photo
              </button>
            )}

            {preview && (
              <button
                onClick={removeImage}
                className="mt-2 text-xs text-red-400 hover:text-red-300 hover:underline transition"
              >
                Remove photo
              </button>
            )}
          </div>

          {/* RIGHT PANEL */}
          <div className="md:col-span-8 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* NAME */}
              <div>
                <label className={`text-xs uppercase flex items-center ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  <FiUser className="mr-2" size={14} />
                  Full name
                </label>
                <input
                  value={form.name}
                  onChange={e =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className={`mt-2 w-full rounded-lg px-4 py-3 transition focus:outline-none focus:ring-1 ${
                    theme === 'dark'
                      ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-600 focus:ring-amber-600'
                      : 'bg-gray-100 border border-purple-200 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className={`text-xs uppercase flex items-center ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  <FiMail className="mr-2" size={14} />
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={e =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className={`mt-2 w-full rounded-lg px-4 py-3 transition focus:outline-none focus:ring-1 ${
                    theme === 'dark'
                      ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-500 focus:ring-amber-500'
                      : 'bg-gray-100 border border-purple-200 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
              </div>

              {/* PHONE */}
              <div>
                <label className={`text-xs uppercase flex items-center ${
                  theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  <FiPhone className="mr-2" size={14} />
                  Phone
                </label>
                <input
                  value={form.phone}
                  onChange={e =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  className={`mt-2 w-full rounded-lg px-4 py-3 transition focus:outline-none focus:ring-1 ${
                    theme === 'dark'
                      ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-500 focus:ring-amber-500'
                      : 'bg-gray-100 border border-purple-200 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500'
                  }`}
                />
              </div>
            </div>

            {/* PROFILE SAVE ACTION */}
            <div className="flex justify-end mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={updateProfile}
                className="px-6 py-2 rounded-lg
                           bg-amber-600 hover:bg-amber-500
                           text-white text-sm font-medium transition shadow-md hover:shadow-lg"
              >
                Save changes
              </motion.button>
            </div>

            {/* PASSWORD CHANGE SECTION */}
            <div className={`mt-8 pt-8 border-t ${
              theme === 'dark' ? 'border-neutral-700' : 'border-purple-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* CURRENT PASSWORD */}
                <div>
                  <label className={`text-xs uppercase flex items-center ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                  }`}>
                    <FiLock className="mr-2" size={14} />
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                    className={`mt-2 w-full rounded-lg px-4 py-3 transition focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-500 focus:ring-amber-500'
                        : 'bg-gray-100 border border-purple-200 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    placeholder="Enter current password"
                  />
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label className={`text-xs uppercase flex items-center ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                  }`}>
                    <FiLock className="mr-2" size={14} />
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                    className={`mt-2 w-full rounded-lg px-4 py-3 transition focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-500 focus:ring-amber-500'
                        : 'bg-gray-100 border border-purple-200 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    placeholder="Enter new password"
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className={`text-xs uppercase flex items-center ${
                    theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
                  }`}>
                    <FiLock className="mr-2" size={14} />
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={e =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                    className={`mt-2 w-full rounded-lg px-4 py-3 transition focus:outline-none focus:ring-1 ${
                      theme === 'dark'
                        ? 'bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:border-amber-500 focus:ring-amber-500'
                        : 'bg-gray-100 border border-purple-200 text-gray-900 placeholder-gray-500 focus:border-amber-500 focus:ring-amber-500'
                    }`}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {/* PASSWORD CHANGE ACTION */}
              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={changePassword}
                  className="px-6 py-2 rounded-lg
                             bg-red-600 hover:bg-red-500
                             text-white text-sm font-medium transition shadow-md hover:shadow-lg"
                >
                  Change Password
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
