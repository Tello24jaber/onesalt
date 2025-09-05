const express = require('express');
const router = express.Router();
const productsController = require('../controllers/productsController');
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});
router.get('/', productsController.getAllProducts);
router.get('/slug/:slug', productsController.getProductBySlug); // must be before :id
router.get('/:id', productsController.getProductById);

router.post('/', productsController.createProduct);
router.put('/:id', productsController.updateProduct);
router.delete('/:id', productsController.deleteProduct);

module.exports = router;