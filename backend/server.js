if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}
const express = require("express");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const path = require("path");

connectDB();

const app = express();

// CORS setup
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
  })
);

// Stripe webhook (requires raw body)
const { stripeWebhook } = require("./controllers/orderController");
app.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Middleware
app.use(express.json()); // MUST
app.use(cookieParser());

// Serve uploads folder statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/reviews", require("./routes/reviewRoutes"));
app.use("/help", require("./routes/helpRoutes"));
// Inventory / Products
app.use("/products", require("./routes/productRoutes"));
app.use("/orders", require("./routes/orderRoutes"));
app.use("/customers", require("./routes/customerRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
