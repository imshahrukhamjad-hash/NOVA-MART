const express = require("express");
const Review = require("../models/Review");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const router = express.Router();

// Submit review (user)
router.post("/", auth, async (req, res) => {
  const { message, rating } = req.body;
  if (!message || !rating) return res.status(400).json({ error: "Message and rating required" });

  const review = await Review.create({ userId: req.user._id, message, rating });
  res.json(review);
});

// Get all reviews (admin)
router.get("/", auth, admin, async (req, res) => {
  const reviews = await Review.find().populate("userId", "name email image");
  res.json(reviews);
});

// Delete review (admin)
router.delete("/:id", auth, admin, async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
