const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, trim: true, unique: true, sparse: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, default: 0, min: 0 },
    image: { type: String },
    description: { type: String },
    active: { type: Boolean, default: true },
    stockStatus: { type: String, enum: ["in-stock", "out-of-stock"], default: "in-stock" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);