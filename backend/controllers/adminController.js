// backend/controllers/adminController.js
// Version without CSV export - remove this comment after installing json2csv
const supabase = require('../config/supabaseClient');
// const { Parser } = require('json2csv'); // Uncomment after installing json2csv

const adminController = {
  // Dashboard Stats
  async getDashboardStats(req, res) {
    try {
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Orders today
      const { data: ordersToday } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', today.toISOString());

      // Orders last 7 days
      const { data: orders7Days } = await supabase
        .from('orders')
        .select('total_price')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Orders by status
      const { data: ordersByStatus } = await supabase
        .from('orders')
        .select('status');

      const statusCounts = ordersByStatus?.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});

      // Recent orders
      const { data: recentOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      res.json({
        ordersToday: ordersToday?.length || 0,
        revenueToday: ordersToday?.reduce((sum, o) => sum + parseFloat(o.total_price), 0) || 0,
        orders7Days: orders7Days?.length || 0,
        revenue7Days: orders7Days?.reduce((sum, o) => sum + parseFloat(o.total_price), 0) || 0,
        statusCounts: statusCounts || {},
        recentOrders: recentOrders || []
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Products CRUD
  async getProducts(req, res) {
    try {
      const { search, category, is_active, page = 1, limit = 20 } = req.query;
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
      }
      if (category) {
        query = query.eq('category', category);
      }
      if (is_active !== undefined) {
        query = query.eq('is_active', is_active === 'true');
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      res.json({
        products: data,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getProduct(req, res) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(404).json({ error: 'Product not found' });
    }
  },

  async createProduct(req, res) {
    try {
      const productData = {
        name: req.body.name,
        slug: req.body.slug,
        description: req.body.description,
        price: req.body.price,
        images: req.body.images || [],
        colors: req.body.colors || ['Black', 'White', 'Baby Blue'],
        sizes: req.body.sizes || ['S', 'M', 'L', 'XL'],
        category: req.body.category || 'general',
        stock: req.body.stock || 100,
        is_featured: req.body.is_featured || false,
        is_active: req.body.is_active !== undefined ? req.body.is_active : true
      };

      // Validate price
      if (productData.price < 0) {
        return res.status(400).json({ error: 'Price must be >= 0' });
      }

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const updates = {};
      const allowedFields = ['name', 'slug', 'description', 'price', 'images', 
                           'colors', 'sizes', 'category', 'stock', 'is_featured', 'is_active'];
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      if (updates.price !== undefined && updates.price < 0) {
        return res.status(400).json({ error: 'Price must be >= 0' });
      }

      updates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteProduct(req, res) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Orders
  async getOrders(req, res) {
    try {
      const { status, city, from, to, search, page = 1, limit = 20 } = req.query;
      let query = supabase.from('orders').select('*', { count: 'exact' });

      if (status) {
        query = query.eq('status', status);
      }
      if (city) {
        query = query.ilike('city', `%${city}%`);
      }
      if (from) {
        query = query.gte('created_at', from);
      }
      if (to) {
        query = query.lte('created_at', to);
      }
      if (search) {
        query = query.or(`id.eq.${search},customer_name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const offset = (page - 1) * limit;
      
      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      res.json({
        orders: data,
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getOrder(req, res) {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', req.params.id)
        .order('created_at');

      if (itemsError) throw itemsError;

      res.json({ ...order, items });
    } catch (error) {
      res.status(404).json({ error: 'Order not found' });
    }
  },

  async updateOrder(req, res) {
    try {
      const updates = {};
      const allowedFields = ['customer_name', 'phone', 'address', 'city', 'notes', 'shipping_fee'];
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // If shipping_fee changed, recalculate total
      if (updates.shipping_fee !== undefined) {
        await this.recalculateOrderTotal(req.params.id);
      }

      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { status } = req.body;
      const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async getOrderReceipt(req, res) {
    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', req.params.id)
        .single();

      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', req.params.id);

      if (itemsError) throw itemsError;

      const subtotal = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

      res.json({
        order: {
          id: order.id,
          customer_name: order.customer_name,
          phone: order.phone,
          address: order.address,
          city: order.city,
          notes: order.notes,
          status: order.status,
          created_at: order.created_at
        },
        items: items,
        subtotal: subtotal,
        shipping_fee: parseFloat(order.shipping_fee),
        total: parseFloat(order.total_price)
      });
    } catch (error) {
      res.status(404).json({ error: 'Order not found' });
    }
  },

  // Order Items
  async addOrderItem(req, res) {
    try {
      const { product_id, product_name, color, size, quantity, unit_price } = req.body;
      
      // Validate
      if (quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be > 0' });
      }
      if (unit_price < 0) {
        return res.status(400).json({ error: 'Unit price must be >= 0' });
      }

      const subtotal = quantity * unit_price;

      const { data, error } = await supabase
        .from('order_items')
        .insert([{
          order_id: req.params.orderId,
          product_id,
          product_name,
          color,
          size,
          quantity,
          unit_price,
          subtotal
        }])
        .select()
        .single();

      if (error) throw error;

      // Recalculate order total
      await this.recalculateOrderTotal(req.params.orderId);

      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateOrderItem(req, res) {
    try {
      const { color, size, quantity, unit_price } = req.body;
      const updates = {};

      if (color !== undefined) updates.color = color;
      if (size !== undefined) updates.size = size;
      if (quantity !== undefined) {
        if (quantity <= 0) {
          return res.status(400).json({ error: 'Quantity must be > 0' });
        }
        updates.quantity = quantity;
      }
      if (unit_price !== undefined) {
        if (unit_price < 0) {
          return res.status(400).json({ error: 'Unit price must be >= 0' });
        }
        updates.unit_price = unit_price;
      }

      // Recalculate subtotal if quantity or price changed
      if (quantity !== undefined || unit_price !== undefined) {
        const { data: currentItem } = await supabase
          .from('order_items')
          .select('quantity, unit_price')
          .eq('id', req.params.itemId)
          .single();

        const newQuantity = quantity !== undefined ? quantity : currentItem.quantity;
        const newPrice = unit_price !== undefined ? unit_price : currentItem.unit_price;
        updates.subtotal = newQuantity * newPrice;
      }

      const { data, error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', req.params.itemId)
        .select()
        .single();

      if (error) throw error;

      // Recalculate order total
      await this.recalculateOrderTotal(req.params.orderId);

      res.json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteOrderItem(req, res) {
    try {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', req.params.itemId);

      if (error) throw error;

      // Recalculate order total
      await this.recalculateOrderTotal(req.params.orderId);

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // Helper function to recalculate order total
  async recalculateOrderTotal(orderId) {
    const { data: items } = await supabase
      .from('order_items')
      .select('subtotal')
      .eq('order_id', orderId);

    const { data: order } = await supabase
      .from('orders')
      .select('shipping_fee')
      .eq('id', orderId)
      .single();

    const itemsTotal = items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;
    const shippingFee = parseFloat(order?.shipping_fee || 0);
    const totalPrice = itemsTotal + shippingFee;

    await supabase
      .from('orders')
      .update({ total_price: totalPrice })
      .eq('id', orderId);
  },

  // Export - Temporary implementation without CSV
  async exportOrdersCSV(req, res) {
    try {
      // Temporary: Return JSON instead of CSV
      res.status(501).json({ 
        error: 'CSV export not available. Please install json2csv package: npm install json2csv' 
      });
      
     
      const { from, to, status } = req.query;
      let query = supabase.from('orders').select('*');

      if (from) query = query.gte('created_at', from);
      if (to) query = query.lte('created_at', to);
      if (status) query = query.eq('status', status);

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const fields = ['id', 'customer_name', 'phone', 'address', 'city', 
                     'total_price', 'shipping_fee', 'status', 'created_at'];
      const parser = new Parser({ fields });
      const csv = parser.parse(data);

      res.header('Content-Type', 'text/csv');
      res.attachment('orders.csv');
      res.send(csv);
      
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminController;