const express = require('express');
const router = express.Router();
const { getRecommendation } = require('../controllers/aiController');

router.post('/recommendation', getRecommendation);

module.exports = router;

