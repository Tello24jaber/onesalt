const express = require('express');
const router = express.Router();
const ordersController = require('../controllers/ordersController');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Rate limiting for order creation
const createOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 orders per windowMs
  message: 'Too many orders created from this IP, please try again after 15 minutes'
});

// Validation middleware
const validateOrder = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone is required')
    .matches(/^07[0-9]{8}$/).withMessage('Invalid Jordanian phone number format'),
  
  body('address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 10, max: 200 }).withMessage('Address must be between 10 and 200 characters'),
  
  body('city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Notes must not exceed 500 characters'),
  
  body('total_price')
    .notEmpty().withMessage('Total price is required')
    .isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
  
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  
  body('items.*.product_id')
    .notEmpty().withMessage('Product ID is required')
    .isUUID().withMessage('Invalid product ID format'),
  
  body('items.*.product_name')
    .trim()
    .notEmpty().withMessage('Product name is required'),
  
  body('items.*.color')
    .trim()
    .notEmpty().withMessage('Color is required'),
  
  body('items.*.size')
    .trim()
    .notEmpty().withMessage('Size is required'),
  
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('items.*.unit_price')
    .isFloat({ min: 0 }).withMessage('Unit price must be a positive number'),
  
  body('items.*.subtotal')
    .isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),
  
  // Middleware to check validation results
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  }
];

// Routes
// Create new order (public with rate limiting)
router.post('/', createOrderLimiter, validateOrder, ordersController.createOrder);

// Get all orders (admin only - add auth middleware in production)
router.get('/', ordersController.getAllOrders);

// Get single order by ID
router.get('/:id', ordersController.getOrderById);

// Update order status (admin only - add auth middleware in production)
router.patch('/:id/status', 
  body('status')
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status value'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  },
  ordersController.updateOrderStatus
);

module.exports = router;