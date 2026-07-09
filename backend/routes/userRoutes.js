const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const router = express.Router();

router.get("/", auth, admin, async (req, res) => {
  res.json(await User.find());
});

router.delete("/:id", auth, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json("User deleted");
});

module.exports = router;
