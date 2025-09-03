const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Check if environment variables are present
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables!');
  console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set in your .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Validate Google Maps link
const validateGoogleMapsLink = (link) => {
  if (!link) return false;
  
  // Check if it's a valid Google Maps link
  const googleMapsPatterns = [
    /^https:\/\/maps\.google\.com\/\?q=[\-\d.]+,[\-\d.]+$/,
    /^https:\/\/www\.google\.com\/maps/,
    /^https:\/\/goo\.gl\/maps/,
    /^https:\/\/maps\.app\.goo\.gl/
  ];
  
  return googleMapsPatterns.some(pattern => pattern.test(link));
};

// Calculate delivery fee based on city
const calculateDeliveryFee = (city) => {
  if (!city) return 3; // Default to 3 JD if no city provided
  
  const cityLower = city.toLowerCase().trim();
  
  // Check if city is Amman (supports both English and Arabic)
  const isAmman = cityLower.includes('amman') || 
                  cityLower.includes('عمان') || 
                  cityLower === 'amman' ||
                  cityLower === 'عمان';
  
  return isAmman ? 2 : 3; // 2 JD for Amman, 3 JD for other cities
};

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
      items,
      location_link,
      latitude,
      longitude,
      payment_method
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

    if (location_link && !validateGoogleMapsLink(location_link)){
      return res.status(400).json({ 
        success: false,
        message: 'Invalid location link format. Please use the map to select location.' 
      });
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'cliq'];
    if (!payment_method || !validPaymentMethods.includes(payment_method)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment method. Must be either "cash" or "cliq"' 
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

    // Validate each item and calculate subtotal
    let calculatedItemsTotal = 0;
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

      calculatedItemsTotal += expectedSubtotal;
    }

    // Calculate delivery fee based on city
    const deliveryFee = calculateDeliveryFee(city);
    const calculatedTotal = calculatedItemsTotal + deliveryFee;

    // Verify total price includes delivery fee
    const providedTotal = parseFloat(total_price);
    if (Math.abs(providedTotal - calculatedTotal) > 0.01) {
      return res.status(400).json({ 
        success: false,
        message: `Total price mismatch. Expected ${calculatedTotal} JD (${calculatedItemsTotal} JD + ${deliveryFee} JD delivery), got ${providedTotal} JD` 
      });
    }

    // Generate order ID
    const orderId = uuidv4();

    // Prepare map address from Google Maps link
    let mapAddress = location_link;
    if (latitude && longitude) {
      mapAddress = `${location_link} (${latitude}, ${longitude})`;
    }

    // Start transaction - Insert order first
    const orderData = {
      id: orderId,
      customer_name: name.trim(),
      phone: cleanPhone,
      address: address.trim(),
      city: city.trim(),
      notes: notes?.trim() || null,
      total_price: calculatedTotal,
      shipping_fee: deliveryFee,
      status: 'pending',
      location_link: location_link,
      latitude: latitude || null,
      longitude: longitude || null,
      map_address: mapAddress,
      payment_method: payment_method,
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
        shipping_fee: orderData.shipping_fee,
        status: orderData.status,
        location_link: orderData.location_link,
        payment_method: orderData.payment_method,
        delivery_info: {
          city: city.trim(),
          delivery_fee: deliveryFee,
          is_amman: calculateDeliveryFee(city) === 2
        },
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
    const { status, payment_method, limit = 50, offset = 0 } = req.query;

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

    if (payment_method) {
      query = query.eq('payment_method', payment_method);
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

    // Get current order for logging revenue impact
    const { data: currentOrder } = await supabase
      .from('orders')
      .select('status, total_price, customer_name')
      .eq('id', id)
      .single();

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

    // Log revenue impact for cancelled orders
    if (currentOrder) {
      if (currentOrder.status !== 'cancelled' && status === 'cancelled') {
        console.log(`Order ${id} cancelled - Revenue impact: -${currentOrder.total_price} JD`);
      } else if (currentOrder.status === 'cancelled' && status !== 'cancelled') {
        console.log(`Order ${id} reactivated - Revenue impact: +${currentOrder.total_price} JD`);
      }
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

// Update payment status (admin)
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const validMethods = ['cash', 'cliq'];
    
    if (!validMethods.includes(payment_method)) {
      return res.status(400).json({ 
        success: false,
        message: `Invalid payment method. Must be one of: ${validMethods.join(', ')}` 
      });
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ payment_method })
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
      
      console.error('Error updating payment method:', error);
      return res.status(500).json({ 
        success: false,
        message: 'Failed to update payment method',
        error: error.message 
      });
    }

    res.json({
      success: true,
      message: 'Payment method updated successfully',
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

// Update order delivery fee when city changes (helper function)
const updateOrderDeliveryFee = async (orderId, newCity) => {
  try {
    const deliveryFee = calculateDeliveryFee(newCity);
    
    // Get current order items total
    const { data: items } = await supabase
      .from('order_items')
      .select('subtotal')
      .eq('order_id', orderId);

    const itemsTotal = items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;
    const newTotal = itemsTotal + deliveryFee;

    // Update order with new delivery fee and total
    await supabase
      .from('orders')
      .update({
        shipping_fee: deliveryFee,
        total_price: newTotal,
        city: newCity
      })
      .eq('id', orderId);

    return {
      delivery_fee: deliveryFee,
      new_total: newTotal,
      items_total: itemsTotal
    };
  } catch (error) {
    console.error('Error updating delivery fee:', error);
    throw error;
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderDeliveryFee,
  calculateDeliveryFee
};