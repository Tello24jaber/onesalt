import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, CreditCard, RefreshCw, Phone, MapPin, User, FileText, 
  Navigation, DollarSign, Smartphone, Shield, Copy, Check
} from 'lucide-react';
import { ordersAPI } from '../services/api'; 
import { useCart } from '../context/ontext';

const CheckoutPage = () => {
 
  const { items, totalItems, totalPrice, clearCart } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
 
  // Jordanian cities with delivery fees
  const jordanianCities = [
    { name: 'Amman', fee: 2 },
    { name: 'Ajloun', fee: 3 },
    { name: 'Aqaba', fee: 3 },
    { name: 'Irbid', fee: 3 },
    { name: 'Madaba', fee: 3 },
    { name: 'Jerash', fee: 3 },
    { name: 'Petra', fee: 3 },
    { name: 'Salt', fee: 3 },
    { name: 'Karak', fee: 3 },
    { name: "Ma'an", fee: 3 },
    { name: 'Tafilah', fee: 3 },
    { name: 'Zarqa', fee: 3 },
    { name: 'Al Husn', fee: 3 },
    { name: 'Azraq', fee: 3 },
    { name: 'Wadi Rum', fee: 3 },
    { name: 'Dead Sea', fee: 3 },
    { name: 'Umm Qais', fee: 3 },
    { name: 'Wadi Al-Seer', fee: 3 },
    { name: 'Russeifa', fee: 3 }
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

  // Verification states
  const [captcha, setCaptcha] = useState({
    question: '',
    userAnswer: '',
    correctAnswer: 0
  });

  // Validation states
  const [validation, setValidation] = useState({
    phone: { isValid: null, message: '' },
    address: { isValid: null, message: '' }
  });

  

  // Calculate delivery fee based on selected city
  const getDeliveryFee = () => {
    const selectedCity = jordanianCities.find(city => city.name === customerForm.city);
    return selectedCity ? selectedCity.fee : 0;
  };

  // Calculate total price including delivery
  const getTotalPrice = () => {
    return totalPrice + getDeliveryFee();
  };

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

  // Get current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'en'
              }
            }
          );
          
          const data = await response.json();
          const formattedAddress = data.display_name || 'Location captured';
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
          
          alert('Location captured successfully!');
        } catch (error) {
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
          
          alert('Location captured!');
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Unable to get location. Please enable location services.');
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
      alert('Location link copied!');
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

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2,
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
    }
  };

  const handleCaptchaChange = (e) => {
    setCaptcha(prev => ({ ...prev, userAnswer: e.target.value }));
  };

  const validateForm = () => {
    const required = ['name', 'phone', 'address', 'city'];
    const missing = required.filter(field => !customerForm[field].trim());
    
    if (missing.length > 0) {
      alert(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    // Check individual field validations
    if (!validation.phone.isValid) {
      alert('Please enter a valid Jordanian phone number (07XXXXXXXX)');
      return false;
    }
    if (!validation.address.isValid) {
      alert('Please enter a valid address');
      return false;
    }

    // Check captcha
    if (parseInt(captcha.userAnswer) !== captcha.correctAnswer) {
      alert('Please solve the math question correctly');
      return false;
    }
    
    return true;
  };
// Enhanced handleCheckout with debugging for CheckoutPage.jsx
const handleCheckout = async () => {
  if (!validateForm()) return;
  
  // Additional check to ensure cart isn't empty at checkout time
  if (!items || items.length === 0) {
    alert('Your cart is empty. Please add some items first.');
    window.location.href = '/products';
    return;
  }
  
  try {
    setIsProcessing(true);
    
    // Parse location coordinates
    let latitude = null;
    let longitude = null;
    if (customerForm.location_coordinates) {
      const coords = customerForm.location_coordinates.split(',');
      if (coords.length === 2) {
        latitude = parseFloat(coords[0]);
        longitude = parseFloat(coords[1]);
      }
    }

    // Create order data matching backend validation expectations
    const orderData = {
      name: customerForm.name.trim(),
      phone: customerForm.phone.trim(),
      address: customerForm.address.trim(),
      city: customerForm.city.trim(),
      notes: customerForm.notes?.trim() || '',
      total_price: getTotalPrice(),
      payment_method: customerForm.payment_method,
      location_link: locationData?.link || null,
      latitude: latitude,
      longitude: longitude,
      items: items.map(item => {
        // Generate proper UUID if item doesn't have valid ID
        const productId = (item.id && item.id.length === 36) ? item.id : crypto.randomUUID();
        
        return {
          product_id: productId,
          product_name: item.name.trim(),
          color: item.color.trim(),
          size: item.size.trim(),
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.price),
          subtotal: parseFloat(item.price * item.quantity)
        };
      })
    };

    // Validate data before sending
    console.log('=== ORDER DATA VALIDATION ===');
    console.log('Order Data:', JSON.stringify(orderData, null, 2));
    
    // Check required fields
    const requiredFields = ['name', 'phone', 'address', 'city'];
    const missingFields = requiredFields.filter(field => !orderData[field] || !orderData[field].trim());
    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Validate phone format (Jordanian)
    const phoneRegex = /^07[0-9]{8}$/;
    if (!phoneRegex.test(orderData.phone)) {
      alert('Invalid phone format. Must be 07XXXXXXXX');
      return;
    }
    
    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      alert('No items in order');
      return;
    }
    
    // Check each item
    for (let item of orderData.items) {
      console.log('Validating item:', item);
      
      // Check UUID format for product_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(item.product_id)) {
        console.error('Invalid UUID for product_id:', item.product_id);
        alert(`Invalid product ID format for ${item.product_name}`);
        return;
      }
      
      if (!item.product_name || !item.color || !item.size) {
        alert(`Missing required item fields for ${item.product_name}`);
        return;
      }
      
      if (item.quantity < 1) {
        alert(`Invalid quantity for ${item.product_name}`);
        return;
      }
      
      if (item.unit_price < 0) {
        alert(`Invalid price for ${item.product_name}`);
        return;
      }
    }

    console.log('=== SENDING API REQUEST ===');

    // ACTUAL API call to create order
    const response = await ordersAPI.create(orderData);
    
    console.log('Order created successfully:', response);
    
    // Store order data for thank you page
    const orderWithTimestamp = {
      ...response.data,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('orderData', JSON.stringify(orderWithTimestamp));
    
    // Clear the cart after successful order creation
    clearCart();
    
    // Redirect to thank you page
    setTimeout(() => {
      window.location.href = '/thank-you';
    }, 200);
    
  } catch (error) {
    console.error('=== CHECKOUT ERROR ===');
    console.error('Full error:', error);
    console.error('Error response:', error.response);
    
    let errorMessage = 'Failed to place order. Please try again.';
    
    if (error.response?.data) {
      console.error('Server response data:', error.response.data);
      
      // Handle validation errors specifically
      if (error.response.data.errors) {
        const validationErrors = error.response.data.errors
          .map(err => `${err.param}: ${err.msg}`)
          .join('\n');
        errorMessage = `Validation failed:\n${validationErrors}`;
      } else if (error.response.data.message) {
        errorMessage = `Order failed: ${error.response.data.message}`;
      }
    } else if (error.message.includes('Cannot connect to server')) {
      errorMessage = 'Cannot connect to server. Please ensure the backend is running and try again.';
    }
    
    alert(errorMessage);
  } finally {
    setIsProcessing(false);
  }
};
  // Don't render if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center mb-4 sm:mb-6">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-400 transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="font-medium">Back to Cart</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Shipping Form */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Shipping Information</h2>
                
                <div className="space-y-4 sm:space-y-5">
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
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-base"
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
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-colors text-base ${
                        validation.phone.isValid === null ? 'border-gray-200 focus:border-blue-400' :
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
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 rounded-lg sm:rounded-xl focus:outline-none transition-colors text-base ${
                        validation.address.isValid === null ? 'border-gray-200 focus:border-blue-400' :
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

                  {/* City Dropdown */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="h-4 w-4" />
                      City *
                    </label>
                    <select
                      name="city"
                      value={customerForm.city}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:outline-none transition-colors text-base"
                    >
                      <option value="">Select your city</option>
                      {jordanianCities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Location Button */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Navigation className="h-4 w-4" />
                        Share Precise Location (optional but recommended)
                      </label>
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="px-3 py-2 sm:px-4 sm:py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        {locationLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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
                            <p className="text-sm text-green-700 font-medium">Location Captured</p>
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
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-blue-400 focus:outline-none transition-colors resize-none text-base"
                      placeholder="Landmark, special delivery instructions, etc..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Payment Method</h2>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:bg-gray-50 border-green-200 bg-green-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash"
                    checked={customerForm.payment_method === 'cash'}
                    onChange={() => setCustomerForm(prev => ({ ...prev, payment_method: 'cash' }))}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 focus:ring-blue-400"
                  />
                  <div className="ml-3 sm:ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">Cash on Delivery</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Recommended</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">Pay when you receive your order</p>
                  </div>
                </label>

                <label className="flex items-center p-3 sm:p-4 border-2 rounded-lg sm:rounded-xl cursor-pointer transition-all hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cliq"
                    checked={customerForm.payment_method === 'cliq'}
                    onChange={() => setCustomerForm(prev => ({ ...prev, payment_method: 'cliq' }))}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 focus:ring-blue-400"
                  />
                  <div className="ml-3 sm:ml-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">CliQ Transfer</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">We'll send you payment details after confirmation</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Human Verification */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quick Math Verification *
                </label>
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <div className="bg-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg border-2 border-blue-200 font-mono text-base sm:text-lg font-bold text-gray-900">
                    {captcha.question} = ?
                  </div>
                  <input
                    type="number"
                    value={captcha.userAnswer}
                    onChange={handleCaptchaChange}
                    required
                    className="w-16 sm:w-20 px-2 py-2 sm:px-3 sm:py-2 border-2 border-gray-200 rounded-lg focus:border-blue-400 focus:outline-none transition-colors text-base"
                    placeholder="?"
                  />
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                    title="Generate new question"
                  >
                    <RefreshCw className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 lg:sticky lg:top-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Order Summary</h2>
              
              {/* Items List */}
              <div className="space-y-3 mb-4 sm:mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start py-2 border-b border-gray-100">
                    <div className="flex-1 pr-2">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.color} / {item.size} × {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm sm:text-base">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm sm:text-base">Subtotal ({totalItems} items)</span>
                  <span className="font-semibold text-sm sm:text-base">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 text-sm sm:text-base">Delivery Fee</span>
                  <span className="font-semibold text-sm sm:text-base">
                    {customerForm.city ? formatPrice(getDeliveryFee()) : 'Select city first'}
                  </span>
                </div>
                
                {/* Delivery Fee Notice */}
                {customerForm.city && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-blue-800">
                      <strong>Delivery to {customerForm.city}:</strong> {formatPrice(getDeliveryFee())}
                    </p>
                    {customerForm.city === 'Amman' ? (
                      <p className="text-xs text-blue-700 mt-1">
                        You're in Amman - enjoy reduced delivery rates!
                      </p>
                    ) : (
                      <p className="text-xs text-blue-700 mt-1">
                        Standard delivery rate applies for areas outside Amman.
                      </p>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-blue-400">
                    {customerForm.city ? formatPrice(getTotalPrice()) : formatPrice(totalPrice)}
                  </span>
                </div>
                {!customerForm.city && (
                  <p className="text-xs text-gray-500 mt-1">+ Delivery fee (select city first)</p>
                )}
              </div>

              {/* Place Order Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isProcessing || !customerForm.city}
                className="w-full mt-4 sm:mt-6 bg-blue-400 hover:bg-blue-500 disabled:bg-gray-400 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-white mr-2 sm:mr-3"></div>
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3" />
                    <span className="truncate">Place Order {customerForm.city && `(${formatPrice(getTotalPrice())})`}</span>
                  </>
                )}
              </button>

              {/* Important Info */}
              <div className="bg-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-4 mt-4 space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-base sm:text-lg">📞</span>
                  <div className="text-xs sm:text-xs text-gray-700">
                    <strong>Quick Confirmation:</strong>
                    <p className="mt-1">We'll call you within one day to confirm your order and schedule delivery.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-base sm:text-lg">🚚</span>
                  <div className="text-xs sm:text-xs text-gray-700">
                    <strong>Fast Delivery:</strong>
                    <p className="mt-1">1-3 days anywhere in Jordan</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-base sm:text-lg">✅</span>
                  <div className="text-xs sm:text-xs text-gray-700">
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