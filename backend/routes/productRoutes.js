const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const auth = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");
const multer = require("multer");
const os = require("os");
const upload = multer({ dest: process.env.NODE_ENV === "production" ? os.tmpdir() : "uploads/" });

// Public: list active products
router.get("/", productController.listProducts);

// Purchase (authenticated users)
router.post("/:id/purchase", auth, productController.purchaseProduct);

// Admin-only CRUD
router.get("/all", auth, admin, productController.listAll);
router.post("/", auth, admin, upload.single('image'), productController.createProduct);
router.put("/:id", auth, admin, upload.single('image'), productController.updateProduct);
router.delete("/:id", auth, admin, productController.deleteProduct);

module.exports = router;