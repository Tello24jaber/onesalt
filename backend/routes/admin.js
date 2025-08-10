
const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// Apply admin auth to all admin routes
router.use(adminAuth);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Products
router.get('/products', adminController.getProducts);
router.get('/products/:id', adminController.getProduct);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Orders
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrder);
router.put('/orders/:id', adminController.updateOrder);
router.put('/orders/:id/status', adminController.updateOrderStatus);
router.get('/orders/:id/receipt', adminController.getOrderReceipt);

// Order Items
router.post('/orders/:orderId/items', adminController.addOrderItem);
router.put('/orders/:orderId/items/:itemId', adminController.updateOrderItem);
router.delete('/orders/:orderId/items/:itemId', adminController.deleteOrderItem);

// Export
router.get('/export/orders.csv', adminController.exportOrdersCSV);

module.exports = router;