const express = require("express");
const router = express.Router();
const { getRecommendation } = require("../controllers/aiController");


const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/recommendation", asyncHandler(getRecommendation));

module.exports = router;
