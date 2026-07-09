const express = require("express");
const router = express.Router();
const { getAllOrders, createOrder, getOrderById, createCheckoutSession, getCheckoutSession } = require("../controllers/orderController");
const protect = require("../middleware/authMiddleware");

router.get("/", protect, getAllOrders);
router.post("/", protect, createOrder);
router.post("/create-checkout-session", createCheckoutSession);
// Public endpoint used by the client after Stripe redirects back
router.get("/checkout-session/:id", getCheckoutSession);
router.get("/:id", protect, getOrderById);

module.exports = router;