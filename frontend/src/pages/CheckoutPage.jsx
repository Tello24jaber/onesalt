import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, RefreshCw } from 'lucide-react';
import { useCart } from '../context/ontext'; // FIXED import path
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { ButtonLoader } from '../components/loadingSpinner';

const CheckoutPage = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: ''
  });

  // Verification states
  const [captcha, setCaptcha] = useState({
    question: '',
    answer: '',
    userAnswer: '',
    correctAnswer: 0
  });

  // Validation states
  const [validation, setValidation] = useState({
    phone: { isValid: null, message: '' },
    address: { isValid: null, message: '' },
    city: { isValid: null, message: '' }
  });

  // Generate simple math captcha
  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operations = ['+', '-', '×'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    let question;
    
    switch(operation) {
      case '+':
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case '-':
        answer = Math.max(num1, num2) - Math.min(num1, num2);
        question = `${Math.max(num1, num2)} - ${Math.min(num1, num2)}`;
        break;
      case '×':
        answer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      default:
        answer = num1 + num2;
        question = `${num1} + ${num2}`;
    }
    
    setCaptcha({
      question,
      answer: '',
      userAnswer: '',
      correctAnswer: answer
    });
  };

  // Validate phone number
  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.length < 8) {
      return { isValid: false, message: 'Phone number too short' };
    }
    if (cleanPhone.length > 15) {
      return { isValid: false, message: 'Phone number too long' };
    }
    if (!phoneRegex.test(cleanPhone)) {
      return { isValid: false, message: 'Invalid phone number format' };
    }
    return { isValid: true, message: 'Valid phone number' };
  };

  // Validate address
  const validateAddress = (address) => {
    if (address.length < 10) {
      return { isValid: false, message: 'Address too short (minimum 10 characters)' };
    }
    if (address.length > 100) {
      return { isValid: false, message: 'Address too long (maximum 100 characters)' };
    }
    if (!/\d/.test(address)) {
      return { isValid: false, message: 'Address should contain house/building number' };
    }
    return { isValid: true, message: 'Valid address' };
  };

  // Validate city
  const validateCity = (city) => {
    const cityRegex = /^[a-zA-Z\s\-']{2,50}$/;
    
    if (city.length < 2) {
      return { isValid: false, message: 'City name too short' };
    }
    if (city.length > 50) {
      return { isValid: false, message: 'City name too long' };
    }
    if (!cityRegex.test(city)) {
      return { isValid: false, message: 'Invalid city name (only letters, spaces, hyphens allowed)' };
    }
    return { isValid: true, message: 'Valid city name' };
  };

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast.info('Your cart is empty. Please add some items first.');
      navigate('/products');
    }
  }, [items, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerForm(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    if (name === 'phone') {
      const phoneValidation = validatePhone(value);
      setValidation(prev => ({ ...prev, phone: phoneValidation }));
    } else if (name === 'address') {
      const addressValidation = validateAddress(value);
      setValidation(prev => ({ ...prev, address: addressValidation }));
    } else if (name === 'city') {
      const cityValidation = validateCity(value);
      setValidation(prev => ({ ...prev, city: cityValidation }));
    }
  };

  const handleCaptchaChange = (e) => {
    setCaptcha(prev => ({ ...prev, userAnswer: e.target.value }));
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'address', 'city'];
    const missing = required.filter(field => !customerForm[field].trim());
    
    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Check individual field validations
    if (!validation.phone.isValid) {
      toast.error('Please enter a valid phone number');
      return false;
    }
    if (!validation.address.isValid) {
      toast.error('Please enter a valid address');
      return false;
    }
    if (!validation.city.isValid) {
      toast.error('Please enter a valid city name');
      return false;
    }

    // Check captcha
    if (parseInt(captcha.userAnswer) !== captcha.correctAnswer) {
      toast.error('Please solve the math question correctly');
      return false;
    }
    
    return true;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsProcessing(true);
      
      // Create orders for each cart item with full details
      const orderPromises = items.map(item => {
        const orderData = {
          // Customer info
          name: customerForm.name,
          phone: customerForm.phone,
          address: customerForm.address,
          city: customerForm.city,
          notes: customerForm.notes,
          
          // Product details
          product_id: item.productId,
          product_name: item.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          price_per_item: item.price,
          total_price: item.price * item.quantity
        };
        
        return ordersAPI.create(orderData);
      });

      await Promise.all(orderPromises);
      
      toast.success('🎉 Order placed successfully!');
      clearCart();
      
      navigate('/thank-you', { 
        state: { 
          orderCount: totalItems,
          totalAmount: totalPrice,
          customerName: customerForm.name
        }
      });
      
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link 
            to="/cart" 
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="font-medium">Back to Cart</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Receipt */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Items List */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.color} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                <span className="font-semibold">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-green-600">Free</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleCheckout} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={customerForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerForm.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all duration-300 ${
                      validation.phone.isValid === null ? 'border-gray-200 focus:border-blue-400' :
                      validation.phone.isValid ? 'border-green-300 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                    }`}
                    placeholder="Enter your phone number"
                  />
                  {validation.phone.isValid !== null && (
                    <p className={`text-sm mt-1 ${validation.phone.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={customerForm.address}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all duration-300 ${
                      validation.address.isValid === null ? 'border-gray-200 focus:border-blue-400' :
                      validation.address.isValid ? 'border-green-300 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                    }`}
                    placeholder="Enter your complete address with house number"
                  />
                  {validation.address.isValid !== null && (
                    <p className={`text-sm mt-1 ${validation.address.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={customerForm.city}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-100 transition-all duration-300 ${
                      validation.city.isValid === null ? 'border-gray-200 focus:border-blue-400' :
                      validation.city.isValid ? 'border-green-300 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                    }`}
                    placeholder="Enter your city"
                  />
                  {validation.city.isValid !== null && (
                    <p className={`text-sm mt-1 ${validation.city.isValid ? 'text-green-600' : 'text-red-600'}`}>
                      {validation.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Special Notes (Optional)
                  </label>
                  <textarea
                    name="notes"
                    value={customerForm.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300 resize-none"
                    placeholder="Any special instructions..."
                  />
                </div>

                {/* Human Verification */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Human Verification *
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="bg-white px-4 py-2 rounded-lg border-2 border-blue-200 font-mono text-lg font-bold text-blue-700">
                      {captcha.question} = ?
                    </div>
                    <input
                      type="number"
                      value={captcha.userAnswer}
                      onChange={handleCaptchaChange}
                      required
                      className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-300"
                      placeholder="Answer"
                    />
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                      title="Generate new question"
                    >
                      <RefreshCw className="h-4 w-4 text-blue-600" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-2">Please solve the math question to verify you're human</p>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <ButtonLoader />
                    <span className="ml-2">Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-6 w-6 mr-3" />
                    <span>Place Order - {formatPrice(totalPrice)}</span>
                  </>
                )}
              </button>

              {/* Delivery Info */}
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-700">
                  <strong>📞 Order Confirmation:</strong> We will call you to confirm your order details.
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>🚚 Delivery:</strong> Your order will arrive in 2-3 business days.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;