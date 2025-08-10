import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Home, Package } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  useEffect(() => {
    // Redirect if no order data
    if (!orderData) {
      navigate('/');
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F0F0F]">Order Receipt</h1>
          <p className="text-gray-600 mt-2">Order #{orderData.order_id?.slice(0, 8).toUpperCase()}</p>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Receipt Header */}
          <div className="bg-[#0F0F0F] text-white p-6 text-center">
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
                      <p className="font-medium text-[#0F0F0F]">{item.product_name}</p>
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
                <span>{formatPrice(orderData.total_price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <span className="text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold pt-2 border-t border-gray-200">
                <span>Order Total</span>
                <span className="text-[#90CAF9]">{formatPrice(orderData.total_price)}</span>
              </div>
            </div>

            {/* Delivery Note */}
            <div className="bg-[#90CAF9]/10 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-[#42A5F5] flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-[#0F0F0F] mb-1">What's Next?</p>
                  <p className="text-gray-600">
                    We'll confirm your order on WhatsApp/phone soon. 
                    Estimated delivery: 1-3 days. Thanks for choosing OneSalt!
                  </p>
                </div>
              </div>
            </div>

            {/* Notes if any */}
            {orderData.notes && (
              <div className="pt-2">
                <p className="text-sm text-gray-500">Special Instructions:</p>
                <p className="text-sm mt-1">{orderData.notes}</p>
              </div>
            )}
          </div>

          {/* Receipt Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center">
            <p className="text-xs text-gray-500">
              Thank you for your purchase! • support@onesalt.jo
            </p>
          </div>
        </div>

        {/* Back to Home Button */}
        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center bg-[#90CAF9] hover:bg-[#42A5F5] text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;