const supabase = require('../config/supabaseClient');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const orderData = {
      ...req.body,
      status: 'pending'
    };

    // First, verify that the product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', orderData.product_id)
      .single();

    if (productError || !product) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid product_id. Product does not exist.'
      });
    }

    // Insert the order
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to create order'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data
    });
  } catch (err) {
    console.error('Unexpected error in createOrder:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 100, offset = 0 } = req.query;

    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to fetch orders'
      });
    }

    res.json({
      success: true,
      data: data || [],
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: count
      }
    });
  } catch (err) {
    console.error('Unexpected error in getAllOrders:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred'
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders
};