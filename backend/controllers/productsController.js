const supabase = require('../config/supabaseClient');
const { sanitizeString } = require('../middleware/validation');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch products'
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (err) {
    console.error('Unexpected error in getAllProducts:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Get product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const sanitizedSlug = sanitizeString(slug);

    if (!sanitizedSlug) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid or missing slug parameter'
      });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', sanitizedSlug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Not Found',
          message: 'Product not found'
        });
      }
      
      console.error('Error fetching product by slug:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch product'
      });
    }

    res.json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Unexpected error in getProductBySlug:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductBySlug
};