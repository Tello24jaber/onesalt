import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Home, ShoppingBag, Mail, Phone, Package, Clock, Star } from 'lucide-react';

const ThankYouPage = () => {
  const location = useLocation();
  const orderDetails = location.state || {};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Success Animation */}
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-8 animate-bounce relative">
              <CheckCircle className="h-20 w-20 text-green-600" />
              <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg animate-pulse">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              </div>
            </div>
          </div>

          {/* Thank You Message */}
          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              Order Confirmed! 🎉
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Thank you{orderDetails.customerName ? `, ${orderDetails.customerName}` : ''}! 
              Your order has been placed successfully and we're excited to get your items to you.
            </p>
          </div>

          {/* Order Summary Card */}
          {(orderDetails.orderCount || orderDetails.totalAmount) && (
            <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h3>
              <div className="space-y-4">
                {orderDetails.orderCount && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Items Ordered:
                    </span>
                    <span className="font-bold text-2xl text-blue-600">{orderDetails.orderCount}</span>
                  </div>
                )}
                {orderDetails.totalAmount && (
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-2xl text-green-600">
                      {formatPrice(orderDetails.totalAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* What Happens Next */}
          <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto text-left">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What happens next?</h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  1
                </div>
                <div className="group-hover:translate-x-1 transition-transform duration-200">
                  <h4 className="font-bold text-gray-900 text-lg">Order Confirmation Call</h4>
                  <p className="text-gray-600">
                    We'll call you within <strong>24 hours</strong> to confirm your order details and delivery preferences.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  2
                </div>
                <div className="group-hover:translate-x-1 transition-transform duration-200">
                  <h4 className="font-bold text-gray-900 text-lg">Careful Preparation</h4>
                  <p className="text-gray-600">
                    Your premium t-shirts will be <strong>quality-checked</strong> and packaged with care using eco-friendly materials.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 group">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                  3
                </div>
                <div className="group-hover:translate-x-1 transition-transform duration-200">
                  <h4 className="font-bold text-gray-900 text-lg">Fast & Free Delivery</h4>
                  <p className="text-gray-600">
                    Your order will be delivered to your specified address within <strong>2-3 business days</strong> at no extra cost.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <a 
                href="mailto:hello@onesalt.com" 
                className="flex items-center justify-center space-x-3 bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                <Mail className="h-6 w-6" />
                <span className="font-semibold">hello@onesalt.com</span>
              </a>
              <a 
                href="tel:+1234567890" 
                className="flex items-center justify-center space-x-3 bg-white/20 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/30 transition-all duration-300 transform hover:scale-105"
              >
                <Phone className="h-6 w-6" />
                <span className="font-semibold">+1 (234) 567-890</span>
              </a>
            </div>
            <p className="text-center text-blue-100 text-sm mt-4">
              Our customer service team is here to help with any questions about your order.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Link 
              to="/" 
              className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:from-blue-600 hover:to-blue-700 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <Home className="mr-3 h-6 w-6" />
              Back to Home
            </Link>
            
            <Link 
              to="/products" 
              className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-2xl font-bold text-lg border-3 border-blue-200 shadow-xl hover:bg-blue-50 hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <ShoppingBag className="mr-3 h-6 w-6" />
              Continue Shopping
            </Link>
          </div>

          {/* Order Reference */}
          <div className="bg-gray-100 rounded-2xl p-6 max-w-md mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="h-5 w-5 text-gray-500" />
              <p className="text-sm font-semibold text-gray-700">Order Reference</p>
            </div>
            <p className="text-2xl font-bold text-gray-900 tracking-wider">
              #OS-{Date.now().toString().slice(-8)}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Save this reference number for your records
            </p>
          </div>

          {/* Thank You Note */}
          <div className="bg-yellow-50 rounded-2xl p-6 border-2 border-yellow-200">
            <p className="text-gray-700 italic">
              "Thank you for choosing OneSalt! We're committed to delivering premium quality 
              and exceptional service with every order. Your support means the world to us!" 
            </p>
            <p className="text-sm text-gray-600 mt-2 font-semibold">
              — The OneSalt Team 💙
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;