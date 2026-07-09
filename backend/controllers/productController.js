const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  const { name, sku, price, quantity, description, stockStatus } = req.body;
  if (!name || price == null) return res.status(400).json({ error: "Name and price required" });

  const image = req.file ? req.file.filename : null;
  const product = await Product.create({ name, sku, price, quantity, image, description, stockStatus });
  res.json(product);
};

exports.updateProduct = async (req, res) => {
  const id = req.params.id;
  const update = req.body;
  if (req.file) update.image = req.file.filename;
  const product = await Product.findByIdAndUpdate(id, update, { new: true });
  if (!product) return res.status(404).json({ error: "Not found" });
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

// Public listing (active products only)
exports.listProducts = async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: -1 });
  res.json(products);
};

// Admin listing (all products)
exports.listAll = async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
};

// Purchase endpoint: reduce quantity
exports.purchaseProduct = async (req, res) => {
  const id = req.params.id;
  const qty = parseInt(req.body.quantity || "1", 10);
  if (qty <= 0) return res.status(400).json({ error: "Invalid quantity" });

  const product = await Product.findById(id);
  if (!product || !product.active) return res.status(404).json({ error: "Product not available" });
  if (product.quantity < qty) return res.status(400).json({ error: "Not enough stock" });

  product.quantity -= qty;
  await product.save();

  res.json({ message: "Purchase successful", product });
};