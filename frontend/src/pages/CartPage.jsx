import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/ontext'; // FIXED import path

const CartPage = () => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    incrementQuantity, 
    decrementQuantity, 
    removeFromCart,
    clearCart 
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <div className="flex justify-center">
              <div className="bg-blue-100 rounded-full p-12 animate-pulse">
                <ShoppingCart className="h-24 w-24 text-blue-500" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-gray-900">Your Cart is Empty</h1>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Looks like you haven't added anything to your cart yet. 
                Start shopping to fill it up with amazing products!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="inline-flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
                Start Shopping
                <ShoppingCart className="ml-2 h-6 w-6" />
              </Link>
              <Link to="/" className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 transform hover:scale-[1.02]">
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/products" 
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Continue Shopping</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900">
            Your Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
          </h1>

          <button 
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 transition-colors duration-300 text-sm font-medium hover:bg-red-50 px-3 py-1 rounded-lg"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, index) => (
              <div 
                key={item.id} 
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.01]"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center space-x-6">
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik01MCAzMEM0NS4wMjk0IDMwIDQxIDM0LjAyOTQgNDEgMzlWNjFDNDEgNjUuOTcwNiA0NS4wMjk0IDcwIDUwIDcwUzU5IDY1Ljk3MDYgNTkgNjFWMzlDNTkgMzQuMDI5NCA1NC45NzA2IDMwIDUwIDMwWiIgZmlsbD0iIzkwQ0FGOSIvPgo8L3N2Zz4=';
                      }}
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 truncate">{item.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Color: <span className="font-medium">{item.color}</span>
                      </span>
                      <span className="bg-gray-100 px-3 py-1 rounded-full">
                        Size: <span className="font-medium">{item.size}</span>
                      </span>
                    </div>
                    <div className="text-blue-600 font-bold text-xl mt-3">
                      {formatPrice(item.price)} each
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center bg-gray-100 rounded-xl">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 rounded-l-xl text-gray-600 hover:bg-red-100 hover:text-red-600 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="h-5 w-5" />
                      </button>
                      
                      <span className="font-bold text-gray-900 px-4 py-2 min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="w-10 h-10 rounded-r-xl text-gray-600 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 flex items-center justify-center"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 transition-colors duration-300 text-sm flex items-center space-x-1 mt-2 hover:bg-red-50 px-2 py-1 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              {/* Order Total */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-green-600">Free</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="font-semibold">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="flex justify-between text-2xl font-bold text-gray-900 py-6 border-b border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>

              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/products"
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 flex items-center justify-center"
              >
                Continue Shopping
              </Link>

              {/* Trust Indicators */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Free shipping on all orders</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Secure checkout process</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Easy returns & exchanges</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;