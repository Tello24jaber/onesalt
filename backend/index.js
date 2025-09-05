const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import routes
const productsRoutes = require('./routes/products');
const ordersRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');

// CORS configuration - FIXED: Single, comprehensive setup
app.use(cors({
  origin: [
    'http://localhost:3000',   // backup
    'http://localhost:3001',   // shop website
    'http://localhost:5173'    // admin dashboard
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Other middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// API Routes
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/upload', uploadRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'OneSalt API is running',
    timestamp: new Date().toISOString(),
    cors: 'Configured for ports 3000, 3001, 5173'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'OneSalt API Server',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      products: '/api/products',
      upload: '/api/upload/images'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 OneSalt Backend Server is running on http://localhost:${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 CORS enabled for: 3000, 3001, 5173`);
});

module.exports = app;