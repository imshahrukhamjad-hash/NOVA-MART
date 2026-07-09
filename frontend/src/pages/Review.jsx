import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function Review() {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);

  const submit = async () => {
    if (!message || rating === 0)
      return toast.error("Message & rating required");

    try {
      await axios.post("/reviews", { message, rating });
      toast.success("Review submitted successfully");
      setMessage("");
      setRating(0);
    } catch {
      toast.error("Failed to submit review");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className={`rounded-2xl shadow-xl p-8 border ${
        theme === 'dark'
          ? 'bg-neutral-900 border-neutral-800'
          : 'bg-white border-gray-200'
      }`}>
        {/* HEADER */}
        <div className="mb-6">
          <h2 className={`text-2xl font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Share Your Experience
          </h2>
          <p className={`text-sm mt-1 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-600'
          }`}>
            Your feedback helps us improve our service
          </p>
        </div>

        {/* TEXTAREA */}
        <div className="mb-6">
          <label className={`block text-sm mb-2 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'
          }`}>
            Your Review
          </label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your honest feedback here..."
            className={`w-full rounded-xl p-4 border
                       focus:outline-none focus:ring-2 focus:ring-amber-500
                       transition resize-none ${
              theme === 'dark'
                ? 'bg-neutral-950 border-neutral-800 text-white placeholder-neutral-600'
                : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* RATING */}
        <div className="mb-8">
          <label className={`block text-sm mb-3 ${
            theme === 'dark' ? 'text-neutral-400' : 'text-gray-700'
          }`}>
            Rating
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setRating(num)}
                style={{ fontSize: 32 }}
                className={`text-[32px] sm:text-[36px] md:text-[40px] leading-none p-1 transition transform hover:scale-105 ${
                  rating >= num
                    ? "text-amber-400"
                    : theme === 'dark'
                    ? "text-neutral-600 hover:text-neutral-400"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                aria-label={`Rate ${num} star${num > 1 ? 's' : ''}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end">
          <button
            onClick={submit}
            className="px-8 py-3 rounded-xl font-medium
                       bg-amber-600 hover:bg-amber-500
                       text-white shadow-lg transition"
          >
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
