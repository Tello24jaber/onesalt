
const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

// Single image upload
router.post('/image', uploadController.upload.single('image'), uploadController.uploadImage);

// Multiple images upload
router.post('/images', uploadController.upload.array('images', 8), uploadController.uploadMultipleImages);

// Delete image
router.delete('/image/:path(*)', uploadController.deleteImage);

module.exports = router;