const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config(); // Load environment variables

// Check if environment variables are present
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables!');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file');
  console.error('Current env vars:', {
    SUPABASE_URL: process.env.SUPABASE_URL ? 'Set' : 'Not set',
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'Set' : 'Not set'
  });
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Create new order with items
const createOrder = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      address, 
      city, 
      notes, 
      total_price,
      items 
    } = req.body;

    // Validation
    if (!name || !phone || !address || !city) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: name, phone, address, and city are required' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Order must contain at least one item' 
      });
    }

    // Validate phone number (Jordanian format)
    const phoneRegex = /^07[0-9]{8}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid phone number. Must be a valid Jordanian number (07XXXXXXXX)' 
      });
    }

    // Validate each item
    let calculatedTotal = 0;
    for (const item of items) {
      if (!item.product_id || !item.product_name || !item.color || !item.size) {
        return res.status(400).json({ 
          success: false,
          message: 'Each item must have product_id, product_name, color, and size' 
        });
      }

      const quantity = parseInt(item.quantity);
      const unitPrice = parseFloat(item.unit_price);
      const subtotal = parseFloat(item.subtotal);

      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid quantity for ${item.product_name}` 
        });
      }

      if (isNaN(unitPrice) || unitPrice < 0) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid unit price for ${item.product_name}` 
        });
      }

      // Verify subtotal calculation
      const expectedSubtotal = quantity * unitPrice;
      if (Math.abs(subtotal - expectedSubtotal) > 0.01) {
        return res.status(400).json({ 
          success: false,
          message: `Invalid subtotal for ${item.product_name}. Expected ${expectedSubtotal}, got ${subtotal}` 
        });
      }

      calculatedTotal += expectedSubtotal;
    }

    // Verify total price (allow small difference for rounding)
    const providedTotal = parseFloat(total_price);
    if (Math.abs(providedTotal - calculatedTotal) > 0.01) {
      return res.status(400).json({ 
        success: false,
        message: `Total price mismatch. Expected ${calculatedTotal}, got ${providedTotal}` 
      });
    }

    // Generate order ID
    const orderId = uuidv4();

    // Start transaction - Insert order first
    const orderData = {
      id: orderId,
      customer_name: name.trim(),
      phone: cleanPhone,
      address: address.trim(),
      city: city.trim(),
      notes: notes?.trim() || null,
      total_price: calculatedTotal,
      shipping_fee: 0, // Free shipping
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // Insert order
    const { data: orderResult, error: orderError } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to create order',
        error: orderError.message 
      });
    }

    // Prepare order items
    const orderItems = items.map(item => ({
      id: uuidv4(),
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name.trim(),
      color: item.color.trim(),
      size: item.size.trim(),
      quantity: parseInt(item.quantity),
      unit_price: parseFloat(item.unit_price),
      subtotal: parseFloat(item.unit_price) * parseInt(item.quantity),
      created_at: new Date().toISOString()
    }));

    // Insert order items
    const { data: itemsResult, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();

    if (itemsError) {
      console.error('Error creating order items:', itemsError);
      
      // Rollback - delete the order if items insertion failed
      await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      return res.status(500).json({ 
        success: false,
        message: 'Failed to create order items',
        error: itemsError.message 
      });
    }

    // Success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: orderId,
        customer_name: orderData.customer_name,
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        notes: orderData.notes,
        total_price: orderData.total_price,
        status: orderData.status,
        items: orderItems.map(item => ({
          product_name: item.product_name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        })),
        created_at: orderData.created_at
      }
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

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching orders:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch orders',
        error: error.message 
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
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

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ 
        success: false,
        message: 'Order ID is required' 
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Order not found' 
        });
      }
      
      console.error('Error fetching order:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to fetch order',
        error: error.message 
      });
    }

    res.json({
      success: true,
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

// Update order status (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ 
          success: false,
          message: 'Order not found' 
        });
      }
      
      console.error('Error updating order:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update order',
        error: error.message 
      });
    }

    res.json({
      success: true,
      message: 'Order status updated successfully',
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
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};