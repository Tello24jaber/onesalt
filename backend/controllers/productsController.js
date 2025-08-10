const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials for products controller');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, sortBy = 'created_at', order = 'desc' } = req.query;

    let query = supabase
      .from('products')
      .select('*')
      .eq('is_active', true); // Only get active products

    // Apply filters if provided
    if (category) {
      query = query.eq('category', category);
    }
    
    if (minPrice) {
      query = query.gte('price', parseFloat(minPrice));
    }
    
    if (maxPrice) {
      query = query.lte('price', parseFloat(maxPrice));
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch products',
        error: error.message
      });
    }

    // Transform data to match frontend expectations
    const products = (data || []).map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug || product.name.toLowerCase().replace(/\s+/g, '-'),
      description: product.description,
      price: product.price,
      images: product.images || [product.image_url].filter(Boolean),
      colors: product.colors || ['Black', 'White', 'Baby Blue'],
      sizes: product.sizes || ['S', 'M', 'L', 'XL'],
      category: product.category,
      stock: product.stock || 100,
      is_featured: product.is_featured || false,
      created_at: product.created_at
    }));

    res.json({
      success: true,
      data: products,
      count: products.length
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      console.error('Error fetching product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message
      });
    }

    // Transform data
    const product = {
      id: data.id,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      price: data.price,
      images: data.images || [data.image_url].filter(Boolean),
      colors: data.colors || ['Black', 'White', 'Baby Blue'],
      sizes: data.sizes || ['S', 'M', 'L', 'XL'],
      category: data.category,
      stock: data.stock || 100,
      is_featured: data.is_featured || false,
      created_at: data.created_at
    };

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get product by slug
const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: 'Product slug is required'
      });
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      console.error('Error fetching product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch product',
        error: error.message
      });
    }

    // Transform data
    const product = {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price,
      images: data.images || [data.image_url].filter(Boolean),
      colors: data.colors || ['Black', 'White', 'Baby Blue'],
      sizes: data.sizes || ['S', 'M', 'L', 'XL'],
      category: data.category,
      stock: data.stock || 100,
      is_featured: data.is_featured || false,
      created_at: data.created_at
    };

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new product (admin only)
const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      image_url,
      images,
      colors,
      sizes,
      category,
      stock,
      is_featured 
    } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    const productData = {
      id: uuidv4(),
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      description: description || '',
      price: parseFloat(price),
      image_url: image_url || '',
      images: images || [image_url].filter(Boolean),
      colors: colors || ['Black', 'White', 'Baby Blue'],
      sizes: sizes || ['S', 'M', 'L', 'XL'],
      category: category || 'general',
      stock: stock || 100,
      is_featured: is_featured || false,
      is_active: true,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create product',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;

    // Update slug if name changed
    if (updates.name) {
      updates.slug = updates.name.toLowerCase().replace(/\s+/g, '-');
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      console.error('Error updating product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update product',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Soft delete - just mark as inactive
    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }
      
      console.error('Error deleting product:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete product',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct
};