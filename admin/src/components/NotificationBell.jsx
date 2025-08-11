import React, { useState, useEffect } from 'react';
import { Bell, X, Eye, Phone, MapPin } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [audio] = useState(new Audio('/notification-sound.mp3')); // Add a notification sound

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    
    // Request browser notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/admin/notifications');
      const data = await response.json();
      
      // Check for new notifications
      const newNotifications = data.filter(n => !n.read);
      const prevUnreadCount = unreadCount;
      
      setNotifications(data);
      setUnreadCount(newNotifications.length);
      
      // If there are new notifications, show browser notification
      if (newNotifications.length > prevUnreadCount && prevUnreadCount !== 0) {
        showBrowserNotification(newNotifications[0]);
        playNotificationSound();
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const showBrowserNotification = (notification) => {
    if (Notification.permission === 'granted') {
      const browserNotif = new Notification('New Order Received!', {
        body: notification.message,
        icon: '/logo.png',
        badge: '/badge.png',
        vibrate: [200, 100, 200],
        tag: notification.id,
        requireInteraction: true
      });
      
      browserNotif.onclick = () => {
        window.focus();
        setShowDropdown(true);
        browserNotif.close();
      };
    }
  };

  const playNotificationSound = () => {
    try {
      audio.play();
    } catch (error) {
      console.log('Could not play notification sound');
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`/admin/notifications/${notificationId}/read`, {
        method: 'POST'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const openWhatsApp = (phone, name) => {
    const message = encodeURIComponent(`Hello ${name}, calling to confirm your OneSalt order.`);
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl z-20 max-h-[500px] overflow-hidden">
            <div className="p-4 border-b bg-gradient-to-r from-sky-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Order Notifications</h3>
                <button
                  onClick={() => setShowDropdown(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No new orders yet</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      !notif.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">
                          {notif.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {notif.message}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openWhatsApp(notif.data.phone, notif.data.customer_name);
                            }}
                            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1"
                          >
                            <Phone size={12} />
                            WhatsApp
                          </button>
                          {notif.data.location_link && (
                            <a
                              href={notif.data.location_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              <MapPin size={12} />
                              Location
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(notif.created_at), 'HH:mm')}
                      </div>
                    </div>
                    {!notif.read && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                        New
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
