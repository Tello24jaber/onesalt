const express = require('express');
const router = express.Router();
const { getAllOrders } = require('../controllers/ordersController');
const { adminAuth } = require('../middleware/auth');

// GET /admin/orders - Get all orders (requires admin authentication)
router.get('/orders', adminAuth, getAllOrders);

module.exports = router;