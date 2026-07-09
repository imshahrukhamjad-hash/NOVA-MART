const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 } // 1 se 5 stars
}, {
  timestamps: true
});

module.exports = mongoose.model("Review", reviewSchema);
