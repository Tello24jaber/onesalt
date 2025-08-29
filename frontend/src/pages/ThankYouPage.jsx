import React, { useEffect, useState } from 'react';
import { CheckCircle, Home, Package } from 'lucide-react';

const ThankYouPage = () => {
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Small delay to prevent immediate redirect issues
    const timer = setTimeout(() => {
      // Get order data from sessionStorage
      const storedOrderData = sessionStorage.getItem('orderData');
      
      if (storedOrderData) {
        try {
          const parsedOrderData = JSON.parse(storedOrderData);
          
          // Check if data is recent (within last 10 minutes) to prevent stale data
          const now = Date.now();
          const dataAge = now - (parsedOrderData.timestamp || 0);
          const tenMinutes = 10 * 60 * 1000;
          
          if (dataAge < tenMinutes) {
            setOrderData(parsedOrderData);
            // Clear the order data from sessionStorage after successfully reading it
            sessionStorage.removeItem('orderData');
          } else {
            // Data is too old, redirect to home
            console.log('Order data is stale, redirecting to home');
            window.location.href = '/';
            return;
          }
        } catch (error) {
          console.error('Error parsing order data:', error);
          // Redirect to home if parsing fails
          window.location.href = '/';
          return;
        }
      } else {
        // No order data found, redirect to home
        console.log('No order data found, redirecting to home');
        window.location.href = '/';
        return;
      }
      
      setLoading(false);
    }, 500); // 500ms delay to prevent immediate redirect

    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2, 
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeliveryInfo = (city) => {
    if (city === 'Amman') {
      return {
        fee: 2.00,
        note: 'Local delivery rate applied for Amman'
      };
    } else {
      return {
        fee: 3.00,
        note: 'Standard delivery rate for areas outside Amman'
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to homepage...</p>
        </div>
      </div>
    );
  }

  

  

  const deliveryInfo = getDeliveryInfo(orderData.city);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">Order #{orderData.order_id?.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-gray-900 text-white p-6 text-center">
            <h2 className="text-2xl font-bold">OneSalt</h2>
            <p className="text-sm opacity-75 mt-1">Premium Fashion</p>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-2">CUSTOMER DETAILS</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">Name:</span> <strong>{orderData.customer_name}</strong></p>
                <p><span className="text-gray-600">Phone:</span> <strong>{orderData.phone}</strong></p>
                <p><span className="text-gray-600">Address:</span> <strong>{orderData.address}</strong></p>
                <p><span className="text-gray-600">City:</span> <strong>{orderData.city}</strong></p>
                {orderData.created_at && (
                  <p><span className="text-gray-600">Date:</span> <strong>{formatDate(orderData.created_at)}</strong></p>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="pb-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">ORDER ITEMS</h3>
              <div className="space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        {item.color} / {item.size} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-medium">{formatPrice(item.subtotal)}</p>
                      <p className="text-gray-500 text-xs">{formatPrice(item.unit_price)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(orderData.subtotal_price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Delivery to {orderData.city}</span>
                <span>{formatPrice(deliveryInfo.fee)}</span>
              </div>
              {/* Delivery fee note */}
              <div className="text-xs text-gray-500 py-2 bg-gray-50 rounded-lg px-3">
                {deliveryInfo.note}
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
                <span>Total Paid</span>
                <span className="text-blue-400">{formatPrice(orderData.total_price)}</span>
              </div>
            </div>

            {/* Delivery Note */}
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 mb-1">What's Next?</p>
                  <p className="text-gray-600 mb-2">
                    We'll confirm your order via WhatsApp/phone within one day.
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p><strong>Delivery:</strong> 1-3 business days</p>
                    <p><strong>Fee:</strong> {formatPrice(deliveryInfo.fee)} for {orderData.city}</p>
                    <p><strong>Payment:</strong> Cash on delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes if any */}
            {orderData.notes && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-sm text-gray-500">Special Instructions:</p>
                <p className="text-sm mt-1 bg-gray-50 p-2 rounded">{orderData.notes}</p>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Thank you for your purchase! • wearonesalt@gmail.com
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center">
          <button
            onClick={() => window.location.href = '/'}
            className="inline-flex items-center justify-center bg-blue-400 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="mr-2 h-5 w-5" />
            Continue Shopping
          </button>
          
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-700 px-8 py-3 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-300 transition-all duration-300"
          >
            <Package className="mr-2 h-5 w-5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;