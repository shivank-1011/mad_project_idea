const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getRealTimePrice,
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.get("/:id/real-time-price", getRealTimePrice);

module.exports = router;
