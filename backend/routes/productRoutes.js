const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  getRealTimePrice,
} = require("../controllers/productController");

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/", asyncHandler(getProducts));
router.get("/:id", asyncHandler(getProductById));
router.get("/:id/real-time-price", asyncHandler(getRealTimePrice));

module.exports = router;
