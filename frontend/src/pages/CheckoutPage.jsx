import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, CreditCard, RefreshCw, Phone, MapPin, User, FileText, 
  Navigation, DollarSign, Smartphone, Shield, Copy, Check
} from 'lucide-react';
import { useCart } from '../context/ontext';
import { ordersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { ButtonLoader } from '../components/loadingSpinner';

const CheckoutPage = () => {
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  setLocationCopied(true);
  // Jordanian cities list
  const jordanianCities = [
    'amman', 'zarqa', 'irbid', 'russeifa', 'quwaysimah', 'wadi as sir', 'tilaa al ali',
    'khuraybat as suq', 'aqaba', 'sahab', 'al jubayhah', 'shafa badran', 'al mafraq',
    'madaba', 'as salt', 'ar ramtha', 'jerash', 'maan', 'tafilah', 'karak', 'ajloun',
    'naour', 'marj al hamam', 'ain al basha', 'al hashimiyah', 'al husn', 'az zarqa al jadidah',
    'muqabalain', 'al quwayrah', 'at turrah', 'dahiyat ar rashid', 'azraq', 'bayt ras',
    'dayr alla', 'jalul', 'kufranjah', 'sahab', 'shafa badran', 'sweileh', 'tabarbour',
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
    notes: '',
    location_coordinates: '',
    location_address: '',
    payment_method: 'cash',
    verification_confirmed: false
  });

  // Location state
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [locationCopied, setLocationCopied] = useState(false);

  // Verification state (simple client-side verification)
  const [verificationCode, setVerificationCode] = useState('');
  const [userVerificationCode, setUserVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

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

  // Get current location and address (FREE - no API key needed)
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          // Use OpenStreetMap Nominatim API (FREE, no API key required)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en' // Get results in English
              }
            }
          );
          
          const data = await response.json();
          
          // Extract address components
          const address = data.address || {};
          const formattedAddress = data.display_name || 'Location captured';
          
          // Create Google Maps link (anyone can open this)
          const googleMapsLink = `https://maps.google.com/?q=${lat},${lng}`;
          
          setLocationData({
            lat,
            lng,
            address: formattedAddress,
            link: googleMapsLink
          });
          
          setCustomerForm(prev => ({
            ...prev,
            location_coordinates: `${lat},${lng}`,
            location_address: formattedAddress
          }));
          
          toast.success('Location captured successfully!');
        } catch (error) {
          // Still save coordinates even if address lookup fails
          const googleMapsLink = `https://maps.google.com/?q=${lat},${lng}`;
          setLocationData({
            lat,
            lng,
            address: 'Location captured (coordinates saved)',
            link: googleMapsLink
          });
          
          setCustomerForm(prev => ({
            ...prev,
            location_coordinates: `${lat},${lng}`,
            location_address: 'Location captured'
          }));
          
          toast.info('Location captured!');
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error('Unable to get location. Please enable location services.');
        setLocationLoading(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000,
        maximumAge: 0 
      }
    );
  };

  // Copy location to clipboard
  const copyLocationToClipboard = () => {
    if (locationData?.link) {
      navigator.clipboard.writeText(locationData.link);
      setLocationCopied(true);
      toast.success('Location link copied!');
      setTimeout(() => setLocationCopied(false), 3000);
    }
  };


  // Validate Jordanian phone number
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

  // Validate city
  const validateCity = (city) => {
    const normalizedCity = city.trim().toLowerCase();
    
    if (city.length < 2) {
      return { isValid: false, message: 'City name too short' };
    }
    
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
      // Reset verification if phone changes
      if (verificationSent) {
        setVerificationSent(false);
        setVerificationCode('');
        setUserVerificationCode('');
      }
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

  // ...existing code...
const validateForm = () => {
  const required = ['name', 'phone', 'address', 'city'];
  const missing = required.filter(field => !customerForm[field].trim());

  if (missing.length > 0) {
    toast.error(`Please fill in: ${missing.join(', ')}`);
    return false;
  }



  // ...existing validation checks...
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
// ...existing code...

    
    

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setIsProcessing(true);
      
      // Prepare order data
      const orderData = {
        // Customer info
        name: customerForm.name,
        phone: customerForm.phone,
        address: customerForm.address,
        city: customerForm.city,
        notes: customerForm.notes || '',
        
        // Location data (if provided)
        location_link: locationData?.link || null,
        latitude: locationData?.lat || null,
        longitude: locationData?.lng || null,
        map_address: customerForm.location_address || null,
        
        // Payment method
        payment_method: customerForm.payment_method,
        
        // Verification
        verified: true,
        
        // Order totals
        total_price: totalPrice,
        shipping_fee: 0, // Will be calculated by admin
        
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
      
      toast.success('🎉 Order placed successfully! We will call you soon.');
      
      // Clear cart after successful order
      clearCart();
      
      // Navigate to thank you page
      navigate('/thank-you', { 
        state: { 
          orderData: {
            ...response.data,
            delivery_note: 'We will contact you within 30 minutes to confirm your order and delivery fee.'
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
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-6xl mx-auto px-4">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form - 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleCheckout} id="checkout-form">
                <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6">Shipping Information</h2>
                
                <div className="space-y-5">
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

                  {/* Location Button (FREE) */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Navigation className="h-4 w-4" />
                        Share Precise Location 
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="px-4 py-2 bg-[#90CAF9]/20 hover:bg-[#90CAF9]/30 text-[#42A5F5] rounded-lg transition-colors flex items-center gap-2"
                      >
                        {locationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#42A5F5]"></div>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <Navigation className="h-4 w-4" />
                            Get My Location
                          </>
                        )}
                      </button>
                    </div>
                    
                    {locationData && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-green-700 font-medium">📍 Location Captured</p>
                            <p className="text-xs text-gray-600 mt-1 break-all">{locationData.address}</p>
                          </div>
                          <button
                            type="button"
                            onClick={copyLocationToClipboard}
                            className="ml-2 p-2 hover:bg-green-100 rounded-lg transition-colors"
                            title="Copy location link"
                          >
                            {locationCopied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-600" />}
                          </button>
                        </div>
                        <a 
                          href={locationData.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Preview on Google Maps →
                        </a>
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Sharing your location helps us deliver faster and calculate accurate delivery fees
                    </p>
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
                      placeholder="Landmark, special delivery instructions, etc..."
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-[#0F0F0F] mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 border-green-200 bg-green-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={customerForm.payment_method === 'cash'}
                    onChange={() => setCustomerForm(prev => ({ ...prev, payment_method: 'cash' }))}
                    className="w-5 h-5 text-[#90CAF9] focus:ring-[#90CAF9]"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <span className="font-semibold text-gray-900">Cash on Delivery</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cliq"
                    checked={customerForm.payment_method === 'cliq'}
                    onChange={() => setCustomerForm(prev => ({ ...prev, payment_method: 'cliq' }))}
                    className="w-5 h-5 text-[#90CAF9] focus:ring-[#90CAF9]"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900">CliQ Transfer</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">We'll send you payment details after confirmation</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Human Verification */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="bg-[#90CAF9]/10 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Math Verification *
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
            </div>
          </div>

          {/* Order Summary - 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-2xl font-bold text-[#0F0F0F] mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
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
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="text-orange-600 text-sm font-medium">Depends on location</span>
                </div>
                
                {/* Delivery Fee Notice */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-xs text-orange-800">
                    <strong>📍 Delivery Fee:</strong> Will be calculated based on your location:
                  </p>
                  <ul className="text-xs text-orange-700 mt-1 ml-4">
                    <li>• Inside Amman: 2 JD</li>
                    <li>• Outside Amman: 3 JD</li>
                    
                  </ul>
                  <p className="text-xs text-orange-800 mt-2">
                    We'll confirm the exact fee when we call you.
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-xl font-bold text-[#0F0F0F] pt-4 border-t border-gray-200">
                  <span>Subtotal</span>
                  <span className="text-[#90CAF9]">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">+ Delivery fee (TBD)</p>
              </div>

              {/* Place Order Button */}
              <button
                type="submit"
                form="checkout-form"
                
                className="w-full mt-6 bg-[#90CAF9] hover:bg-[#42A5F5] text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <ButtonLoader />
                    <span className="ml-2">Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-6 w-6 mr-3" />
                    <span>Place Order</span>
                  </>
                )}
              </button>

              {/* Important Info */}
              <div className="bg-blue-50 rounded-xl p-4 mt-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-lg">📞</span>
                  <div className="text-xs text-gray-700">
                    <strong>Quick Confirmation:</strong>
                    <p className="mt-1">We'll call you within 30 minutes to:</p>
                    <ul className="mt-1 ml-2 text-xs">
                      <li>• Confirm your order details</li>
                      <li>• Calculate exact delivery fee</li>
                      <li>• Schedule delivery time</li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-lg">🚚</span>
                  <div className="text-xs text-gray-700">
                    <strong>Fast Delivery:</strong>
                    <p className="mt-1">1-3 days anywhere in Jordan</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-lg">✅</span>
                  <div className="text-xs text-gray-700">
                    <strong>Quality Guarantee:</strong>
                    <p className="mt-1">100% authentic products with return policy</p>
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

export default CheckoutPage;