import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, Minus, Heart, Star, Ruler, Info } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useCart } from '../context/ontext';
import { PageLoader } from '../components/loadingSpinner';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, getItemQuantity, incrementQuantity, decrementQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(''); // No default selection
  const [selectedSize, setSelectedSize] = useState('');   // No default selection
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Size measurements in centimeters
  const sizeMeasurements = {
    'S': { length: 69, chestWidth: 56, shoulderWidth: 59, sleeveLength: 21 },
    'M': { length: 71, chestWidth: 58, shoulderWidth: 61, sleeveLength: 22 },
    'L': { length: 73, chestWidth: 60, shoulderWidth: 63, sleeveLength: 23 },
    'XL': { length: 73.5, chestWidth: 63, shoulderWidth: 65.5, sleeveLength: 23.5 }
  };

  const selectedSizeMeasurements = selectedSize ? sizeMeasurements[selectedSize] : null;

  // Prevent scroll to bottom on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        // Scroll to top when loading starts
        window.scrollTo(0, 0);
        const response = await productsAPI.getBySlug(slug);
        const productData = response.data;
        
        setProduct(productData);
        
        // NO default selections - user must choose
        
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Product not found');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug, navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'JOD',
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2, 
    }).format(price);
  };

  // Get current cart quantity for this specific product variant
  const currentCartQuantity = product ? getItemQuantity(product.id, selectedColor, selectedSize) : 0;

  const handleAddToCart = () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select color and size');
      return;
    }

    if (!product || isAddingToCart) return; // Prevent multiple clicks

    setIsAddingToCart(true);
    
    try {
      // Single call with quantity - no loops, no multiple dispatches
      addToCart(product, { color: selectedColor, size: selectedSize }, quantity);
      setQuantity(1); // Reset quantity after adding
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      // Reset loading state after a delay
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 1000);
    }
  };

  const handleCartIncrement = () => {
    if (!product) return;
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}`;
    incrementQuantity(cartItemId);
  };

  const handleCartDecrement = () => {
    if (!product) return;
    const cartItemId = `${product.id}-${selectedColor}-${selectedSize}`;
    decrementQuantity(cartItemId);
  };

  if (loading) {
    return <PageLoader message="Loading product..." />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <div className="text-6xl">😕</div>
          <h2 className="text-2xl font-semibold text-gray-900">Product not found</h2>
          <Link to="/products" className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-300">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : ['/placeholder-tshirt.jpg'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/products"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-300 mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          <span className="font-medium">Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRjlGQUZCIi8+CjxwYXRoIGQ9Ik0yNTAgMTUwQzIyMC4xNDcgMTUwIDIwMCAxNzAuMTQ3IDIwMCAyMDBWMzAwQzIwMCAzMjkuODUzIDIyMC4xNDcgMzUwIDI1MCAzNTBTMzAwIDMyOS44NTMgMzAwIDMwMFYyMDBDMzAwIDE3MC4xNDcgMjc5Ljg1MyAxNTAgMjUwIDE1MFoiIGZpbGw9IiM5MENBRSKII8+CjwvZz4K';
                }}
              />
            </div>

            {/* Image Thumbnails */}
            {productImages.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-3 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-blue-500 ring-4 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Product Details */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
               
              </div>
              
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-blue-300">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(4.8 rating)</span>
                </div>
              </div>

              {product.description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-6">
              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-lg font-semibold text-gray-900">
                    Color: {selectedColor ? <span className="text-blue-300">{selectedColor}</span> : <span className="text-gray-400">Please select</span>}
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          selectedColor === color
                            ? 'bg-blue-300 text-white shadow-lg ring-4 ring-blue-200'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection with Measurements */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-lg font-semibold text-gray-900">
                      Size: {selectedSize ? <span className="text-blue-300">{selectedSize}</span> : <span className="text-gray-400">Please select</span>}
                    </label>
                    <button
                      onClick={() => setShowSizeChart(!showSizeChart)}
                      className="flex items-center text-sm text-blue-300 hover:text-blue-500 transition-colors"
                    >
                      <Ruler className="h-4 w-4 mr-1" />
                      Size Guide
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                          selectedSize === size
                            ? 'bg-blue-300 text-white shadow-lg ring-4 ring-blue-200'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  {/* Size Measurements Display */}
                  {selectedSizeMeasurements && (
                    <div className="bg-blue-50 rounded-xl p-4 mt-4">
                      <div className="flex items-center mb-3">
                        <Ruler className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-semibold text-gray-900">Size {selectedSize} Measurements</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Length:</span>
                          <span className="font-medium">{selectedSizeMeasurements.length} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chest Width:</span>
                          <span className="font-medium">{selectedSizeMeasurements.chestWidth} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shoulder Width:</span>
                          <span className="font-medium">{selectedSizeMeasurements.shoulderWidth} cm</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sleeve Length:</span>
                          <span className="font-medium">{selectedSizeMeasurements.sleeveLength} cm</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Full Size Chart */}
                  {showSizeChart && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Size Chart (cm)</h4>
                        <button
                          onClick={() => setShowSizeChart(false)}
                          className="text-gray-400 hover:text-gray-600 text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 font-semibold">Size</th>
                              <th className="text-center py-2 font-semibold">Length</th>
                              <th className="text-center py-2 font-semibold">Chest Width</th>
                              <th className="text-center py-2 font-semibold">Shoulder Width</th>
                              <th className="text-center py-2 font-semibold">Sleeve Length</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.sizes.map((size) => (
                              <tr
                                key={size}
                                className={`border-b border-gray-100 ${
                                  selectedSize === size ? 'bg-blue-50' : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className="py-2 font-medium">{size}</td>
                                <td className="py-2 text-center">{sizeMeasurements[size]?.length}</td>
                                <td className="py-2 text-center">{sizeMeasurements[size]?.chestWidth}</td>
                                <td className="py-2 text-center">{sizeMeasurements[size]?.shoulderWidth}</td>
                                <td className="py-2 text-center">{sizeMeasurements[size]?.sleeveLength}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Selection Warning */}
              {(!selectedColor || !selectedSize) && (
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-orange-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-orange-800 text-sm">
                      <p className="font-medium">Please make your selections</p>
                      <p>Choose both color and size before adding to cart.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-3">
                <label className="block text-lg font-semibold text-gray-900">
                  Quantity
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 shadow-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-100 rounded-l-xl transition-colors duration-200 disabled:opacity-50"
                    >
                      <Minus className="h-5 w-5 text-gray-600" />
                    </button>
                    <span className="px-6 py-3 font-semibold text-gray-900 min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-100 rounded-r-xl transition-colors duration-200"
                    >
                      <Plus className="h-5 w-5 text-gray-600" />
                    </button>
                  </div>
                  
                  {currentCartQuantity > 0 && (
                    <div className="text-sm text-gray-600">
                      ({currentCartQuantity} already in cart)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cart Management */}
            {currentCartQuantity > 0 && selectedColor && selectedSize && (
              <div className="bg-blue-50 rounded-2xl p-6 space-y-4">
                <h3 className="font-semibold text-gray-900">In Your Cart</h3>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">
                    {currentCartQuantity} × {selectedColor} / {selectedSize}
                  </span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleCartDecrement}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 flex items-center justify-center"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-semibold w-8 text-center">{currentCartQuantity}</span>
                    <button
                      onClick={handleCartIncrement}
                      className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-300 transition-all duration-200 flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedColor || !selectedSize}
                className="flex-1 bg-gradient-to-r from-blue-300 to-blue-400 text-white py-4 px-8 rounded-xl font-semibold text-lg shadow-lg hover:from-blue-600 hover:to-blue-700 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center"
              >
                {isAddingToCart ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-3 h-6 w-6" />
                    Add {quantity} to Cart
                  </>
                )}
              </button>
              
              <Link
                to="/cart"
                className="sm:flex-shrink-0 bg-white text-blue-300 py-4 px-8 rounded-xl font-semibold text-lg border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98]"
              >
                View Cart ({currentCartQuantity})
              </Link>
            </div>

            {/* Product Features */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-4">Product Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">85% Premium Cotton</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Oversized Fit</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Durable Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;