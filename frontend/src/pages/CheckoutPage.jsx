import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, RefreshCw, Phone, MapPin, User, FileText } from 'lucide-react';
import { useCart } from '../context/ontext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { ButtonLoader } from '../components/loadingSpinner';

const CheckoutPage = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Jordanian cities list (English and Arabic)
  const jordanianCities = [
    // English names
    'amman', 'zarqa', 'irbid', 'russeifa', 'quwaysimah', 'wadi as sir', 'tilaa al ali',
    'khuraybat as suq', 'aqaba', 'sahab', 'al jubayhah', 'shafa badran', 'al mafraq',
    'madaba', 'as salt', 'ar ramtha', 'jerash', 'maan', 'tafilah', 'karak', 'ajloun',
    'naour', 'marj al hamam', 'ain al basha', 'al hashimiyah', 'al husn', 'az zarqa al jadidah',
    'muqabalain', 'al quwayrah', 'at turrah', 'dahiyat ar rashid', 'azraq', 'bayt ras',
    'dayr alla', 'jalul', 'kufranjah', 'sahab', 'shafa badran', 'sweileh', 'tabarbour',
    // Arabic names
    'عمان', 'عمّان', 'الزرقاء', 'اربد', 'إربد', 'الرصيفة', 'القويسمة', 'وادي السير',
    'تلاع العلي', 'خريبة السوق', 'العقبة', 'سحاب', 'الجبيهة', 'شفا بدران', 'المفرق',
    'مادبا', 'السلط', 'الرمثا', 'جرش', 'معان', 'الطفيلة', 'الكرك', 'عجلون',
    'ناعور', 'مرج الحمام', 'عين الباشا', 'الهاشمية', 'الحصن', 'الزرقاء الجديدة',
    'مقابلين', 'القويرة', 'الطرة', 'ضاحية الرشيد', 'الأزرق', 'بيت راس',
    'دير علا', 'جلول', 'كفرنجة', 'صويلح', 'طبربور'
  ];
  
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
      userAnswer: '',
      correctAnswer: answer
    });
  };

  // Validate Jordanian phone number (starts with 07, 10 digits)
  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    
    if (cleanPhone.length !== 10) {
      return { isValid: false, message: 'Phone number must be 10 digits' };
    }
    if (!cleanPhone.startsWith('07')) {
      return { isValid: false, message: 'Phone number must start with 07' };
    }
    if (!/^07[0-9]{8}$/.test(cleanPhone)) {
      return { isValid: false, message: 'Invalid Jordanian phone number' };
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
    return { isValid: true, message: 'Valid address' };
  };

  // Validate city (must be a Jordanian city)
  const validateCity = (city) => {
    const normalizedCity = city.trim().toLowerCase();
    
    if (city.length < 2) {
      return { isValid: false, message: 'City name too short' };
    }
    
    // Check if the city is in our list of Jordanian cities
    const isValidCity = jordanianCities.some(validCity => 
      validCity.toLowerCase() === normalizedCity
    );
    
    if (!isValidCity) {
      return { isValid: false, message: 'Please enter a valid Jordanian city' };
    }
    
    return { isValid: true, message: 'Valid city' };
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
      toast.error('Please enter a valid Jordanian phone number (07XXXXXXXX)');
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
      
      // Prepare order data with full item details
      const orderData = {
        // Customer info
        name: customerForm.name,
        phone: customerForm.phone,
        address: customerForm.address,
        city: customerForm.city,
        notes: customerForm.notes || '',
        
        // Order totals
        total_price: totalPrice,
        
        // Full item details
        items: items.map(item => ({
          product_id: item.productId,
          product_name: item.name,
          color: item.color,
          size: item.size,
          quantity: item.quantity,
          unit_price: item.price,
          subtotal: item.price * item.quantity
        }))
      };

      // Send order to backend
      const response = await ordersAPI.create(orderData);
      
      toast.success('🎉 Order placed successfully!');
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate to thank you page with order data
      navigate('/thank-you', { 
        state: { 
          orderData: {
            order_id: response.data.order_id,
            customer_name: customerForm.name,
            phone: customerForm.phone,
            address: customerForm.address,
            city: customerForm.city,
            notes: customerForm.notes,
            total_price: totalPrice,
            items: orderData.items,
            created_at: new Date().toISOString()
          }
        }
      });
      
    } catch (error) {
      console.error('Error during checkout:', error);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Link 
            to="/cart" 
            className="flex items-center gap-2 text-gray-600 hover:text-[#90CAF9] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Cart</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6">Order Summary</h2>
            
            {/* Items List */}
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#0F0F0F]">{item.name}</h4>
                    <p className="text-sm text-gray-600">
                      {item.color} / {item.size} × {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-[#0F0F0F]">
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
              <div className="flex justify-between items-center text-xl font-bold text-[#0F0F0F] mt-4 pt-4 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#90CAF9]">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Form */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <form onSubmit={handleCheckout} className="space-y-5">
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6">Shipping Information</h2>
              
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User className="h-4 w-4" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={customerForm.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#90CAF9] focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="h-4 w-4" />
                  Phone Number * (Jordanian)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={customerForm.phone}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    validation.phone.isValid === null ? 'border-gray-200 focus:border-[#90CAF9]' :
                    validation.phone.isValid ? 'border-green-300 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                  }`}
                  placeholder="07XXXXXXXX"
                  maxLength="10"
                />
                {validation.phone.isValid !== null && (
                  <p className={`text-sm mt-1 ${validation.phone.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.phone.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="h-4 w-4" />
                  Full Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={customerForm.address}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    validation.address.isValid === null ? 'border-gray-200 focus:border-[#90CAF9]' :
                    validation.address.isValid ? 'border-green-300 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                  }`}
                  placeholder="Street, Building, Floor, etc."
                />
                {validation.address.isValid !== null && (
                  <p className={`text-sm mt-1 ${validation.address.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.address.message}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <MapPin className="h-4 w-4" />
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={customerForm.city}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    validation.city.isValid === null ? 'border-gray-200 focus:border-[#90CAF9]' :
                    validation.city.isValid ? 'border-green-300 focus:border-green-400' : 'border-red-300 focus:border-red-400'
                  }`}
                  placeholder="Amman, Irbid, Zarqa, etc."
                />
                {validation.city.isValid !== null && (
                  <p className={`text-sm mt-1 ${validation.city.isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {validation.city.message}
                  </p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText className="h-4 w-4" />
                  Special Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={customerForm.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#90CAF9] focus:outline-none transition-colors resize-none"
                  placeholder="Any special instructions for delivery..."
                />
              </div>

              {/* Human Verification */}
              <div className="bg-[#90CAF9]/10 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Human Verification *
                </label>
                <div className="flex items-center gap-3">
                  <div className="bg-white px-4 py-2 rounded-lg border-2 border-[#90CAF9]/30 font-mono text-lg font-bold text-[#0F0F0F]">
                    {captcha.question} = ?
                  </div>
                  <input
                    type="number"
                    value={captcha.userAnswer}
                    onChange={handleCaptchaChange}
                    required
                    className="w-20 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#90CAF9] focus:outline-none transition-colors"
                    placeholder="?"
                  />
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 bg-[#90CAF9]/20 hover:bg-[#90CAF9]/30 rounded-lg transition-colors"
                    title="Generate new question"
                  >
                    <RefreshCw className="h-4 w-4 text-[#42A5F5]" />
                  </button>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#90CAF9] hover:bg-[#42A5F5] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
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
                  <strong>📞 Order Confirmation:</strong> We'll call you to confirm your order.
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <strong>🚚 Fast Delivery:</strong> Your order will arrive in 1-3 days.
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