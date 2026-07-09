import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FiTrash2 } from "react-icons/fi";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    axios.get("/reviews").then(res => setReviews(res.data));
  }, []);

  const remove = async (id) => {
    await axios.delete(`/reviews/${id}`);
    setReviews(prev => prev.filter(r => r._id !== id));
    toast.success("Review deleted");
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Customer Reviews
      </h2>

      <div className="space-y-4">
        {reviews.map(r => {
          const user = r.userId || {};
          const name = user.name || "User";

          // ✅ SAFE IMAGE RESOLUTION
          const image =
            user.image && user.image.trim() !== ""
              ? user.image.startsWith("http")
                ? user.image
                : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/uploads/${user.image}`
              : null;

          return (
            <div
              key={r._id}
              className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-lg flex justify-between gap-4"
            >
              {/* LEFT */}
              <div className="flex gap-4 items-start">
                {/* AVATAR */}
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* CONTENT */}
                <div>
                  <h4 className="font-medium text-white">
                    {name}
                  </h4>
                  <p className="text-sm text-neutral-400">
                    {user.email}
                  </p>

                  <p className="text-neutral-400 text-sm mt-1">
                    {r.message}
                  </p>

                  <div className="mt-2 text-amber-400 text-sm">
                    {"★".repeat(r.rating)}
                    <span className="text-neutral-600">
                      {"☆".repeat(5 - r.rating)}
                    </span>
                  </div>
                </div>
              </div>

              {/* DELETE */}
              <button
                onClick={() => remove(r._id)}
                className="text-red-400 hover:text-red-500 transition"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
