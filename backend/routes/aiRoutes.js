const express = require("express");
const router = express.Router();
const { getRecommendation } = require("../controllers/aiController");

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/recommendation", asyncHandler(getRecommendation));

module.exports = router;
