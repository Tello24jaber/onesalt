import React, { useState, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, X } from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/loadingSpinner';
import { toast } from 'react-toastify';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getAll();
        const productsList = response.data || [];
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-high':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchTerm, sortBy]);

  if (loading) {
    return <PageLoader message="Loading amazing products..." />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header with Gradient */}
        <div className="text-center space-y-4 mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#90CAF9]/10 to-[#42A5F5]/10 rounded-3xl blur-3xl"></div>
          <h1 className="relative text-5xl lg:text-6xl font-bold text-[#0F0F0F]">
            Our Collection
          </h1>
          <p className="relative text-gray-600 max-w-2xl mx-auto text-lg">
            Discover our complete range of premium t-shirts with unique designs
          </p>
        </div>

        {/* Search and Filter Bar - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[#90CAF9]" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent transition-all duration-300 text-[#0F0F0F]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-[#0F0F0F] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Sort and Filter Controls - Single Row on Mobile */}
          <div className="flex items-center justify-between gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 flex-1">
              <Filter className="h-5 w-5 text-[#42A5F5]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 border-2 border-[#E5E7EB] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#90CAF9] focus:border-transparent bg-white text-[#0F0F0F] transition-all duration-300"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Advanced Filters Button - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#90CAF9] to-[#42A5F5] text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Advanced Filters Panel - Collapsible */}
          {showFilters && (
            <div className="pt-4 border-t border-[#E5E7EB] space-y-4 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-[#0F0F0F] mb-2 block">
                    Price Range
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#90CAF9]"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      className="w-full px-3 py-2 border-2 border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#90CAF9]"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count with Gradient Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div className="bg-gradient-to-r from-[#90CAF9] to-[#42A5F5] text-white px-4 py-2 rounded-full text-sm font-medium shadow-md">
            {filteredProducts.length} Product{filteredProducts.length !== 1 ? 's' : ''} Found
          </div>
          {searchTerm && (
            <p className="text-gray-600 text-sm">
              Results for "<span className="font-semibold text-[#0F0F0F]">{searchTerm}</span>"
            </p>
          )}
        </div>

        {/* Products Grid - Mobile Optimized */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="space-y-6">
              <div className="text-8xl animate-bounce">🔍</div>
              <h3 className="text-2xl font-bold text-[#0F0F0F]">No products found</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {searchTerm 
                  ? `We couldn't find any products matching "${searchTerm}". Try adjusting your search.`
                  : "No products available at the moment. Please check back later!"
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-gradient-to-r from-[#90CAF9] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#90CAF9] text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Clear Search
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Products Grid - Always grid view for consistency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id}
                  className="animate-fade-in transform hover:scale-105 transition-all duration-300"
                  style={{ 
                    animationDelay: `${Math.min(index * 0.1, 1)}s`,
                    opacity: 0,
                    animation: `fadeIn 0.5s ease-out ${Math.min(index * 0.1, 1)}s forwards`
                  }}
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden group">
                    <div className="relative">
                      {/* Product Badge */}
                      {index < 3 && (
                        <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-[#90CAF9] to-[#42A5F5] text-white text-xs px-3 py-1 rounded-full font-semibold shadow-md">
                          Popular
                        </div>
                      )}
                      <ProductCard product={product} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Section */}
            <div className="text-center mt-16 space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-md">
                <div className="w-2 h-2 bg-[#90CAF9] rounded-full animate-pulse"></div>
                <p className="text-gray-600 font-medium">
                  Showing all {filteredProducts.length} products
                </p>
                <div className="w-2 h-2 bg-[#42A5F5] rounded-full animate-pulse"></div>
              </div>
              
              {/* Back to Top Button for Mobile */}
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-[#90CAF9] to-[#42A5F5] text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 z-40 md:hidden"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage;