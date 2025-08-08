import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Palette } from 'lucide-react';

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/placeholder-tshirt.jpg';

  return (
    <Link to={`/products/${product.slug}`}>
      <div className="group card hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden">
        {/* Product Image */}
        <div className="relative overflow-hidden rounded-lg mb-4 bg-primary-white">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNTAgMTAwQzEzOC45NTQgMTAwIDEzMCAxMDguOTU0IDEzMCAxMjBWMTgwQzEzMCAxOTEuMDQ2IDEzOC45NTQgMjAwIDE1MCAyMDBTMTcwIDE5MS4wNDYgMTcwIDE4MFYxMjBDMTcwIDEwOC45NTQgMTYxLjA0NiAxMDAgMTUwIDEwMFoiIGZpbGw9IiNFOEU4RTgiLz4KPGV4dCB4PSIxMjUiIHk9IjE2MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5Ij5ULVNoaXJ0PC90ZXh0Pgo8L3N2Zz4=';
            }}
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <ShoppingCart className="text-primary-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-8 w-8" />
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-primary-black group-hover:text-gray-700 transition-colors duration-200">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-primary-black">
              {formatPrice(product.price)}
            </span>
            
            {/* Colors indicator */}
            {product.colors && product.colors.length > 0 && (
              <div className="flex items-center space-x-1">
                <Palette className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  {product.colors.length} color{product.colors.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {product.sizes.slice(0, 4).map((size) => (
                <span
                  key={size}
                  className="px-2 py-1 bg-border-gray text-xs font-medium rounded text-gray-700"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 4 && (
                <span className="px-2 py-1 bg-border-gray text-xs font-medium rounded text-gray-700">
                  +{product.sizes.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;