const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/ordersController');
const { validateOrderData } = require('../middleware/validation');

// POST /orders - Create a new order
router.post('/', validateOrderData, createOrder);

module.exports = router;