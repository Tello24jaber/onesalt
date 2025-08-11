
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

router.get('/notifications', adminAuth, async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const notificationsFile = path.join(__dirname, '../../data/notifications.json');
    
    const data = await fs.readFile(notificationsFile, 'utf8');
    const notifications = JSON.parse(data);
    
    res.json(notifications);
  } catch (error) {
    res.json([]);
  }
});

router.post('/notifications/:id/read', adminAuth, async (req, res) => {
  try {
    const fs = require('fs').promises;
    const path = require('path');
    const notificationsFile = path.join(__dirname, '../../data/notifications.json');
    
    const data = await fs.readFile(notificationsFile, 'utf8');
    const notifications = JSON.parse(data);
    
    const notification = notifications.find(n => n.id === req.params.id);
    if (notification) {
      notification.read = true;
      await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2));
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;