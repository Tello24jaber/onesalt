import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Shirt, Sparkles, TrendingUp, Award } from 'lucide-react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/productcard';
import LoadingSpinner from '../components/loadingSpinner';
import { toast } from 'react-toastify';
import whyChooseImage from '../images/hero-bg.png';
import heroBackground from '../images/herobg.png';

// OneSalt SVG Logo Component
const OneSaltLogo = ({ className = "", width = "300", height = "148" }) => (
  <svg 
    version="1.0" 
    xmlns="http://www.w3.org/2000/svg"  
    width={`${width}pt`} 
    height={`${height}pt`} 
    viewBox="0 0 300.000000 148.000000"  
    preserveAspectRatio="xMidYMid meet"
    className={className}
  >  
    <g 
      transform="translate(0.000000,148.000000) scale(0.050000,-0.050000)" 
      fill="#90CAF9" 
      stroke="none"
    > 
      <path d="M5061 1941 c-27 -50 -28 -900 -1 -971 15 -39 32 -51 65 -46 44 6 45 12 55 340 11 378 23 412 138 386 85 -18 95 -45 109 -316 18 -324 75 -414 261 -414 147 0 159 110 16 150 -157 45 -185 512 -33 557 134 40 152 52 145 98 -5 34 -23 47 -82 57 -89 14 -116 37 -146 124 -36 107 -115 100 -165 -15 -61 -138 -190 -170 -215 -54 -30 141 -101 191 -147 104z"/> 
      <path d="M507 1812 c-490 -159 -374 -888 143 -891 338 -2 559 399 379 690 -109 178 -331 263 -522 201z m266 -165 c99 -47 167 -155 167 -267 0 -330 -453 -418 -571 -111 -97 255 159 495 404 378z"/> 
      <path d="M1224 1815 c-31 -38 -55 -798 -26 -852 26 -47 86 -57 118 -18 11 14 23 133 27 265 9 316 75 433 257 462 177 28 265 -110 275 -432 9 -309 13 -324 81 -316 l54 6 6 280 c7 309 -9 395 -91 492 -112 133 -277 168 -447 95 l-100 -43 -40 43 c-45 49 -84 55 -114 18z"/> 
      <path d="M2424 1812 c-464 -151 -394 -840 91 -887 180 -17 395 79 395 176 0 67 -67 74 -182 18 -161 -78 -388 -16 -421 114 -19 78 15 86 347 87 351 0 359 4 324 161 -57 254 -314 408 -554 331z m310 -195 c178 -109 107 -176 -187 -177 -256 0 -298 20 -238 112 81 123 281 154 425 65z"/> 
      <path d="M3548 1819 c-129 -39 -204 -158 -180 -286 17 -92 79 -143 264 -219 141 -59 159 -72 165 -124 13 -111 -156 -151 -289 -69 -121 75 -220 11 -135 -85 191 -214 597 -107 597 157 0 116 -76 192 -246 249 -196 65 -254 144 -154 210 52 34 94 31 205 -14 57 -24 69 -23 100 8 90 90 -161 223 -327 173z"/> 
      <path d="M4370 1822 c-427 -107 -474 -677 -70 -860 121 -55 227 -52 359 9 111 52 161 40 161 -36 0 -10 25 -15 55 -11 l55 6 6 400 c3 220 0 420 -6 445 -13 53 -91 62 -130 15 -31 -37 -86 -38 -156 -2 -72 36 -200 52 -274 34z m250 -187 c282 -143 178 -555 -140 -555 -215 0 -367 233 -272 416 86 166 250 221 412 139z"/> 
    </g> 
  </svg>
);

const AnimatedCounter = ({ 
  endValue = 100, 
  duration = 2000, 
  delay = 0, 
  suffix = "+",
  className = "" 
}) => {
  const [currentValue, setCurrentValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (hasAnimated) return;

    const startAnimation = () => {
      setHasAnimated(true);
      
      const startTime = Date.now();
      const startValue = 0;
      
      const animateCount = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutCubic for smoother animation
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(startValue + (endValue - startValue) * easeOutCubic);
        
        setCurrentValue(value);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          setCurrentValue(endValue);
        }
      };
      
      requestAnimationFrame(animateCount);
    };

    const timer = setTimeout(startAnimation, delay);
    return () => clearTimeout(timer);
  }, [endValue, duration, delay, hasAnimated]);

  return (
    <span className={className}>
      {currentValue}{suffix}
    </span>
  );
};

// Enhanced Minimal Splash Screen Component with SVG Logo
const SplashScreen = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Reduced fade out time
    }, 2500); // Reduced display time

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-white flex items-center justify-center transition-opacity duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="text-center space-y-6">
        {/* SVG Logo with Animation */}
        <div className="relative animate-fade-in-up">
          <OneSaltLogo 
            className="w-64 h-32 md:w-80 md:h-40 lg:w-96 lg:h-48 mx-auto drop-shadow-lg" 
            width="400"
            height="200"
          />
          
          {/* Subtle underline animation */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-transparent via-[#90CAF9] to-transparent animate-expand-width"></div>
        </div>

        {/* Tagline */}
        <p className="text-[#0F0F0F]/70 text-lg md:text-xl font-light tracking-widest animate-fade-in-delayed">
          All it takes is one.
        </p>

        {/* Minimal Loading Indicator */}
        <div className="flex justify-center space-x-1 animate-fade-in-delayed-more">
          <div className="w-2 h-2 bg-[#90CAF9] rounded-full animate-pulse-slow"></div>
          <div className="w-2 h-2 bg-[#90CAF9] rounded-full animate-pulse-slow" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-[#90CAF9] rounded-full animate-pulse-slow" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>

      {/* CSS for Splash Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes expandWidth {
          0% {
            width: 0;
          }
          100% {
            width: 200px;
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }

        .animate-fade-in-delayed {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.4s forwards;
        }

        .animate-fade-in-delayed-more {
          opacity: 0;
          animation: fadeIn 0.6s ease-out 0.8s forwards;
        }

        .animate-expand-width {
          animation: expandWidth 1.2s ease-out 0.4s forwards;
        }

        .animate-pulse-slow {
          animation: pulseSlow 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAnimated, setIsAnimated] = useState(false);

  // Scroll to top and prevent scroll restoration
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Disable scroll restoration for this session
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Re-enable scroll restoration when component unmounts
    return () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {const fetchFeaturedProducts = async () => {
  try {
    setLoading(true);
    const response = await productsAPI.getAll();
    console.log('Featured Products API Response:', response); // Debug log
    
    let products = [];
    
    // Handle Axios response structure
    if (response && response.data && typeof response.data === 'object') {
      // If response.data has products array
      if (Array.isArray(response.data.products)) {
        products = response.data.products;
      }
      // If response.data itself is an array  
      else if (Array.isArray(response.data)) {
        products = response.data;
      }
      // Fallback for unexpected structure
      else {
        console.warn('Unexpected featured products response structure:', response);
        products = [];
      }
    }
    // Handle direct response (non-Axios)
    else if (response && Array.isArray(response)) {
      products = response;
    }
    // Complete fallback
    else {
      console.warn('Invalid featured products response:', response);
      products = [];
    }
    
    // Filter only featured products and take first 3
    const featured = products.filter(product => product.is_featured).slice(0, 3);
    
    // If no featured products, take first 3 products
    setFeaturedProducts(featured.length > 0 ? featured : products.slice(0, 3));
    
  } catch (error) {
    console.error('Error fetching featured products:', error);
    toast.error('Failed to load featured products');
    setFeaturedProducts([]); // Ensure it's always an array
  } finally {
    setLoading(false);
  }
};
    // Only fetch after splash screen and trigger animations
    if (!showSplash) {
      fetchFeaturedProducts();
      // Trigger animations after a short delay to ensure smooth rendering
      setTimeout(() => setIsAnimated(true), 100);
    }
  }, [showSplash]);

  // Smooth scroll function for internal links
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Hero Section with Background Image - Mobile Optimized */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] lg:min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${heroBackground})`,
            filter: 'brightness(0.7)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F]/40 via-[#0F0F0F]/20 to-[#F9FAFB]"></div>
        
        {/* Floating elements - Simplified and fewer */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-[#90CAF9]/20 rounded-full animate-float-gentle backdrop-blur-sm hidden lg:block"></div>
        <div className="absolute bottom-32 right-16 w-24 h-24 bg-[#42A5F5]/15 rounded-full animate-float-gentle backdrop-blur-sm hidden lg:block" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
          <div className={`text-center space-y-6 md:space-y-8 lg:space-y-10 transition-all duration-700 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* SVG Logo - Responsive Sizing */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex justify-center">
                <OneSaltLogo 
                  className="w-48 h-24 sm:w-64 sm:h-32 md:w-80 md:h-40 lg:w-96 lg:h-48 drop-shadow-2xl" 
                  width="400"
                  height="200"
                />
              </div>
              <p className="text-lg sm:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow-lg px-4">
                Premium streetwear bold, comfy and made for your vibe
              </p>
            </div>

            {/* CTA Buttons - Better Mobile Spacing */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <Link 
                to="/products" 
                className="group bg-[#90CAF9] hover:bg-[#42A5F5] text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center w-full sm:w-auto justify-center"
              >
                Browse Collection
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <button 
                onClick={(e) => handleSmoothScroll(e, 'featured')}
                className="bg-white/90 backdrop-blur-sm hover:bg-white text-[#0F0F0F] text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                View Featured
              </button>
            </div>

            {/* Stats - Improved Mobile Layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 pt-8 sm:pt-12 max-w-3xl mx-auto px-4">
              {[
                { icon: Shirt, value: 4, suffix: "+", label: "Unique Designs", delay: 200 },
                { icon: Star, value: "Premium", suffix: "", label: "Quality", delay: 400 },
                { icon: Users, value: 100, suffix: "+", label: "Happy Customers", delay: 600 }
              ].map((stat, index) => (
                <div 
                  key={index}
                  className={`text-center space-y-2 sm:space-y-3 bg-white/90 backdrop-blur-sm p-4 sm:p-6 rounded-2xl shadow-lg transition-all duration-500 ${
                    isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{transitionDelay: `${stat.delay - 200}ms`}}
                >
                  <div className="bg-[#90CAF9]/20 rounded-full p-3 sm:p-4 w-14 h-14 sm:w-16 sm:h-16 mx-auto flex items-center justify-center">
                    <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-[#42A5F5]" />
                  </div>
                  
                  <div className="text-2xl sm:text-3xl font-bold text-[#0F0F0F]">
                    {typeof stat.value === 'number' ? (
                      <AnimatedCounter
                        endValue={stat.value}
                        duration={2000}
                        delay={stat.delay}
                        suffix={stat.suffix}
                      />
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-sm sm:text-base text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Featured Products Section */}
      <section id="featured" className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 lg:mb-16 transition-all duration-700 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F0F0F]">
              Featured Designs
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-base sm:text-lg px-4">
              Discover our handpicked selection of premium t-shirts with unique designs
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {featuredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className={`transition-all duration-500 ${
                    isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${0.8 + (index * 0.1)}s` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {/* View All Products Button */}
          <div className={`text-center mt-8 sm:mt-12 lg:mt-16 transition-all duration-700 ${
            isAnimated ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`} style={{ transitionDelay: '1.2s' }}>
            <Link 
              to="/products" 
              className="inline-flex items-center bg-gradient-to-r from-[#90CAF9] to-[#42A5F5] hover:from-[#42A5F5] hover:to-[#90CAF9] text-white text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
            >
              View All Products
              <ArrowRight className="ml-2 sm:ml-3 h-5 w-5 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>

      {/* About Section with Image - Mobile Responsive */}
      <section className="py-12 sm:py-16 lg:py-20 bg-[#F9FAFB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            <div className={`space-y-6 sm:space-y-8 order-2 lg:order-1 transition-all duration-700 ${
              isAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
            }`} style={{ transitionDelay: '1.4s' }}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0F0F0F] text-center lg:text-left">
                Why Choose onesalt?
              </h2>
              <p className="text-gray-600 text-base sm:text-lg leading-relaxed text-center lg:text-left">
                We believe in creating more than just clothing. Each onesalt t-shirt 
                represents a commitment to quality, comfort, and unique design that 
                stands out from the crowd.
              </p>
              <div className="space-y-4 sm:space-y-6">
                {[
                  { icon: Award, title: "Premium Materials", desc: "French Cotton 85% pure cotton for comfort & durability" },
                  { icon: Sparkles, title: "Unique Designs", desc: "Carefully crafted designs you won't find anywhere else" },
                  { icon: TrendingUp, title: "Perfect Fit", desc: "Multiple sizes available for the perfect fit every time" }
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start space-x-4 group hover:translate-x-2 transition-transform duration-300"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#90CAF9]/20 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-[#42A5F5]/20 transition-colors">
                      <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-[#42A5F5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[#0F0F0F] text-base sm:text-lg">{feature.title}</h3>
                      <p className="text-gray-600 text-sm sm:text-base">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Why Choose Image - Responsive on All Screens */}
            <div className={`text-center order-1 lg:order-2 transition-all duration-700 ${
              isAnimated ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
            }`} style={{ transitionDelay: '1.6s' }}>
              <div className="relative inline-block max-w-xs sm:max-w-sm lg:max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-[#90CAF9] to-[#42A5F5] rounded-3xl transform rotate-2 lg:rotate-3"></div>
                <img 
                  src={whyChooseImage} 
                  alt="Why Choose OneSalt" 
                  className="relative w-full rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback if image doesn't exist
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="relative bg-white rounded-3xl shadow-2xl p-8 sm:p-12 transform hover:scale-105 transition-all duration-500">
                        <div class="text-7xl sm:text-8xl lg:text-9xl text-center animate-float-gentle">👕</div>
                      </div>
                    `;
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Animation Styles */}
      <style jsx>{`
        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float-gentle {
          animation: floatGentle 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;