import React from 'react';
import { ShoppingBag, Heart, Instagram, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-text text-white mt-auto">
      <div className="max-w-7xl mx-auto container-padding section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-primary rounded-full p-2">
                <ShoppingBag className="h-6 w-6 text-accent" />
              </div>
              <span className="text-2xl font-bold">onesalt</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Premium t-shirt collection featuring unique designs crafted with quality and style in mind.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/products" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:underline">
                  Products
                </a>
              </li>
              <li>
                <a href="/cart" className="text-gray-300 hover:text-blue-400 transition-colors duration-300 hover:underline">
                  Cart
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Contact</h3>
            <div className="text-gray-300 space-y-4">
              <p>wearonesalt@gmail.com</p>
              <div className="flex space-x-4">
                <a 
                  href="https://www.instagram.com/wearonesalt?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  className="text-gray-300 hover:text-pink-400 transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram className="h-6 w-6" />
                </a>
                <a 
                  href="https://www.facebook.com/profile.php?id=61574852161639" 
                  className="text-gray-300 hover:text-blue-400 transition-colors duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Facebook className="h-6 w-6" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-300 flex items-center justify-center gap-2">
            © {currentYear} OneSalt. All rights reserved.
            <Heart className="h-4 w-4 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;