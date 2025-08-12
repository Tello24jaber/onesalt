import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/ontext'; // FIXED import path
import logoImage from '../images/logo.jpg'; 

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'Cart', href: '/cart' },
  ];

  const isActiveLink = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-50 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center group transition-transform duration-300 hover:scale-105"
          >
            <img 
              src={logoImage} 
              alt="OneSalt" 
              className="h-12 w-auto sm:h-14 lg:h-16 object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  isActiveLink(item.href)
                    ? 'text-white bg-[#90CAF9] shadow-md'
                    : 'text-[#0F0F0F] hover:text-white hover:bg-[#42A5F5] hover:shadow-md'
                }`}
              >
                {item.name}
                {item.name === 'Cart' && totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#42A5F5] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce shadow-lg">
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Cart Icon */}
            <Link to="/cart" className="relative p-2">
              <ShoppingCart className="h-6 w-6 text-[#0F0F0F]" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#42A5F5] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce shadow-md">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-[#0F0F0F] hover:bg-[#90CAF9]/20 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#E5E7EB] animate-slide-down bg-white">
            <div className="px-2 pt-4 pb-6 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 ${
                    isActiveLink(item.href)
                      ? 'text-white bg-[#90CAF9] shadow-md'
                      : 'text-[#0F0F0F] hover:text-white hover:bg-[#42A5F5]'
                  }`}
                >
                  <span>{item.name}</span>
                  {item.name === 'Cart' && totalItems > 0 && (
                    <span className="bg-white text-[#42A5F5] text-sm font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-inner">
                      {totalItems > 9 ? '9+' : totalItems}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;