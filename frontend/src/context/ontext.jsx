import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

// Fixed cart reducer with proper logic
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, options, quantity = 1 } = action.payload;
      const cartItemId = `${product.id}-${options.color}-${options.size}`;
      
      const existingItemIndex = state.items.findIndex(item => item.id === cartItemId);
      const productPrice = parseFloat(product.price);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedItems = [...state.items];
        const currentItem = updatedItems[existingItemIndex];
        const newQuantity = currentItem.quantity + quantity;
        
        updatedItems[existingItemIndex] = {
          ...currentItem,
          quantity: newQuantity
        };
        
        // Recalculate totals from scratch to avoid drift
        const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          ...state,
          items: updatedItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice
        };
      } else {
        // New item
        const newItem = {
          id: cartItemId,
          productId: product.id,
          name: product.name,
          image: product.images && product.images.length > 0 ? product.images[0] : '/placeholder-tshirt.jpg',
          size: options.size,
          color: options.color,
          price: productPrice,
          quantity: quantity,
          slug: product.slug
        };
        
        const newItems = [...state.items, newItem];
        const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const newTotalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return {
          ...state,
          items: newItems,
          totalItems: newTotalItems,
          totalPrice: newTotalPrice
        };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const itemToRemove = state.items.find(item => item.id === action.payload.id);
      if (!itemToRemove) return state;
      
      const newItems = state.items.filter(item => item.id !== action.payload.id);
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice
      };
    }
    
    case 'INCREMENT_QUANTITY': {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (itemIndex === -1) return state;
      
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: updatedItems[itemIndex].quantity + 1
      };
      
      const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice
      };
    }
    
    case 'DECREMENT_QUANTITY': {
      const itemIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (itemIndex === -1) return state;
      
      const item = state.items[itemIndex];
      if (item.quantity <= 1) return state; // Don't decrement below 1
      
      const updatedItems = [...state.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: updatedItems[itemIndex].quantity - 1
      };
      
      const newTotalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        ...state,
        items: updatedItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice
      };
    }
    
    case 'CLEAR_CART':
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      };
    
    case 'LOAD_CART': {
      const loadedState = action.payload;
      // Recalculate totals to ensure consistency
      const recalculatedTotalItems = loadedState.items.reduce((total, item) => total + item.quantity, 0);
      const recalculatedTotalPrice = loadedState.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      
      return {
        items: loadedState.items || [],
        totalItems: recalculatedTotalItems,
        totalPrice: recalculatedTotalPrice
      };
    }
    
    default:
      return state;
  }
};

// Initial state
const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
};

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('onesalt-cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('onesalt-cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('onesalt-cart', JSON.stringify(state));
  }, [state]);

  // Add to cart function
  const addToCart = (product, options, quantity = 1) => {
    // Validate required options
    if (!options.color || !options.size) {
      toast.error('Please select color and size');
      return;
    }

    // Validate quantity
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    // Single dispatch with exact quantity
    dispatch({ 
      type: 'ADD_TO_CART', 
      payload: { product, options, quantity } 
    });
    
    // Toast notification
    const itemText = quantity === 1 ? product.name : `${quantity} × ${product.name}`;
    toast.success(`${itemText} added to cart!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const removeFromCart = (id) => {
    const item = state.items.find(item => item.id === id);
    if (!item) return;
    
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id } });
    toast.info(`${item.name} removed from cart`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const incrementQuantity = (id) => {
    dispatch({ type: 'INCREMENT_QUANTITY', payload: { id } });
  };

  const decrementQuantity = (id) => {
    dispatch({ type: 'DECREMENT_QUANTITY', payload: { id } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared', {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  // Helper function to get item quantity
  const getItemQuantity = (productId, color, size) => {
    const cartItemId = `${productId}-${color}-${size}`;
    const item = state.items.find(item => item.id === cartItemId);
    return item ? item.quantity : 0;
  };

  // Helper function to check if item is in cart
  const isInCart = (productId, color, size) => {
    return getItemQuantity(productId, color, size) > 0;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getItemQuantity,
    isInCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};