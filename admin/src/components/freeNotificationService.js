
class FreeNotificationService {
  
  // Store order for admin dashboard (using file system or database)
  async storeOrderNotification(orderData) {
    try {
      // Store in database with 'unread' flag
      const notification = {
        id: orderData.order_id,
        type: 'new_order',
        title: `New Order from ${orderData.customer_name}`,
        message: `Order #${orderData.order_id.substring(0, 8)} - ${orderData.city} - $${orderData.total_price}`,
        data: orderData,
        read: false,
        created_at: new Date().toISOString()
      };

      // If using Supabase, create a notifications table
      // Or store in a JSON file for simplicity
      const fs = require('fs').promises;
      const path = require('path');
      
      const notificationsFile = path.join(__dirname, '../../data/notifications.json');
      
      // Ensure directory exists
      await fs.mkdir(path.dirname(notificationsFile), { recursive: true });
      
      // Read existing notifications
      let notifications = [];
      try {
        const data = await fs.readFile(notificationsFile, 'utf8');
        notifications = JSON.parse(data);
      } catch (error) {
        // File doesn't exist yet
      }
      
      // Add new notification
      notifications.unshift(notification);
      
      // Keep only last 100 notifications
      notifications = notifications.slice(0, 100);
      
      // Save back
      await fs.writeFile(notificationsFile, JSON.stringify(notifications, null, 2));
      
      console.log('Order notification stored for admin dashboard');
      return true;
    } catch (error) {
      console.error('Error storing notification:', error);
      return false;
    }
  }

  // Generate WhatsApp link for admin to click
  generateWhatsAppLink(orderData) {
    // Admin's WhatsApp number
    const adminPhone = '96279o489125';
    
    // Format order details for WhatsApp
    const message = encodeURIComponent(
      `🛍️ *New Order Alert!*\n\n` +
      `*Customer:* ${orderData.customer_name}\n` +
      `*Phone:* ${orderData.phone}\n` +
      `*City:* ${orderData.city}\n` +
      `*Address:* ${orderData.address}\n\n` +
      `*Items:* ${orderData.items.length} items\n` +
      `*Total:* $${orderData.total_price}\n` +
      `*Payment:* ${orderData.payment_method === 'cash' ? 'Cash on Delivery' : 'CliQ'}\n\n` +
      `${orderData.location_link ? `📍 Location: ${orderData.location_link}\n\n` : ''}` +
      `*Action Required:* Please call customer to confirm order.`
    );
    
    return `https://wa.me/${adminPhone}?text=${message}`;
  }

  // Create a simple webhook URL that admin can check
  async createWebhookNotification(orderData) {
    // Create a unique URL that admin can bookmark
    const webhookData = {
      timestamp: new Date().toISOString(),
      order: orderData,
      whatsapp_link: this.generateWhatsAppLink(orderData)
    };
    
    // Store this in a public accessible endpoint
    return webhookData;
  }

  // Main notification function
  async notifyAdmin(orderData) {
    const results = {
      stored: false,
      whatsapp_link: null
    };

    // Store notification for admin dashboard
    results.stored = await this.storeOrderNotification(orderData);
    
    // Generate WhatsApp link
    results.whatsapp_link = this.generateWhatsAppLink(orderData);
    
    console.log('===========================================');
    console.log('🛍️ NEW ORDER RECEIVED!');
    console.log('===========================================');
    console.log(`Customer: ${orderData.customer_name}`);
    console.log(`Phone: ${orderData.phone}`);
    console.log(`City: ${orderData.city}`);
    console.log(`Total: $${orderData.total_price}`);
    console.log('-------------------------------------------');
    console.log('WhatsApp Admin (Click to open):');
    console.log(results.whatsapp_link);
    console.log('===========================================');
    
    return results;
  }
}

module.exports = new FreeNotificationService();
