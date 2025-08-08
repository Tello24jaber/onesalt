const express = require('express');
const router = express.Router();
const { getAllProducts, getProductBySlug } = require('../controllers/productsController');

// GET /products - Get all products
router.get('/', getAllProducts);

// GET /products/:slug - Get product by slug
router.get('/:slug', getProductBySlug);

module.exports = router;