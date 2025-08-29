import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../context/ontext';

const CartPage = () => {
  const { 
    items, 
    totalItems, 
    totalPrice, 
    incrementQuantity, 
    decrementQuantity, 
    removeFromCart 
  } = useCart();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD',
       minimumFractionDigits: 2, 
        maximumFractionDigits: 2, 
    }).format(price);
  };

  // Empty cart state
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="bg-[#90CAF9]/10 rounded-full p-8 w-32 h-32 mx-auto flex items-center justify-center">
            <ShoppingCart className="h-16 w-16 text-[#90CAF9]" />
          </div>
          <h1 className="text-3xl font-bold text-[#0F0F0F]">Your Cart is Empty</h1>
          <p className="text-gray-600">Start shopping to add items to your cart</p>
          <Link 
            to="/products" 
            className="inline-flex items-center bg-[#90CAF9] hover:bg-[#42A5F5] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Browse Products
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <h1 className="text-3xl font-bold text-[#0F0F0F] mb-8">Shopping Cart</h1>

        {/* Cart Items */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div className="divide-y divide-gray-200">
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Item Image and Details */}
                  <div className="flex gap-4 flex-1">
                    {/* Product Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik01MCAzMEM0NS4wMjk0IDMwIDQxIDM0LjAyOTQgNDEgMzlWNjFDNDEgNjUuOTcwNiA0NS4wMjk0IDcwIDUwIDcwUzU5IDY1Ljk3MDYgNTkgNjFWMzlDNTkgMzQuMDI5NCA1NC45NzA2IDMwIDUwIDMwWiIgZmlsbD0iIzkwQ0FGOSIvPgo8L3N2Zz4=';
                        }}
                      />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[#0F0F0F]">{item.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Color: <strong>{item.color}</strong></span>
                        <span>Size: <strong>{item.size}</strong></span>
                      </div>
                      <div className="mt-2 text-[#90CAF9] font-semibold">
                        {formatPrice(item.price)} each
                      </div>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-[#F9FAFB] rounded-lg">
                      <button
                        onClick={() => decrementQuantity(item.id)}
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-gray-200 rounded-l-lg transition-colors disabled:opacity-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => incrementQuantity(item.id)}
                        className="p-2 hover:bg-gray-200 rounded-r-lg transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Line Subtotal */}
                    <div className="text-right min-w-[100px]">
                      <div className="font-bold text-lg text-[#0F0F0F]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {item.quantity >= 1 && (
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs text-red-500 hover:text-red-700 mt-1"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Total */}
          <div className="bg-[#90CAF9]/5 p-4 sm:p-6">
            <div className="flex justify-between items-center text-xl font-bold">
              <span className="text-[#0F0F0F]">Cart Total:</span>
              <span className="text-[#90CAF9]">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Link
            to="/products"
            className="flex items-center justify-center bg-white text-[#0F0F0F] px-6 py-3 rounded-full font-semibold border-2 border-gray-200 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
          <Link
            to="/checkout"
            className="flex items-center justify-center bg-blue-300 text-white px-6 py-3 rounded-full font-semibold shadow-lg transition-all duration-300"
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;