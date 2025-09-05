
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials for upload controller');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 8 // Maximum 8 files at once
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `products/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image',
        error: error.message
      });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        url: urlData.publicUrl,
        path: filePath,
        filename: fileName
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Upload multiple images
const uploadMultipleImages = async (req, res) => {
  try {
    console.log('=== UPLOAD REQUEST RECEIVED ===');
    console.log('Request method:', req.method);
    console.log('Request path:', req.path);
    console.log('Files received:', req.files ? req.files.length : 'No files');
    console.log('Request headers:', req.headers);

    if (!req.files || req.files.length === 0) {
      console.log('ERROR: No files in request');
      return res.status(400).json({
        success: false,
        message: 'No image files provided'
      });
    }

    const uploadPromises = req.files.map(async (file) => {
      const fileExtension = file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw new Error(`Failed to upload ${file.originalname}: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return {
        url: urlData.publicUrl,
        path: filePath,
        filename: fileName,
        originalName: file.originalname
      };
    });

    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: `${results.length} images uploaded successfully`,
      data: results
    });

  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload some images',
      error: error.message
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { path } = req.params;

    if (!path) {
      return res.status(400).json({
        success: false,
        message: 'Image path is required'
      });
    }

    const { error } = await supabase.storage
      .from('product-images')
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  uploadImage,
  uploadMultipleImages,
  deleteImage
};