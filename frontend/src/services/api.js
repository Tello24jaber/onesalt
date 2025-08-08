import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timed out. Please try again.');
    }
    
    if (!error.response) {
      throw new Error('Network error. Please check your connection.');
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 404:
        throw new Error(data?.message || 'Resource not found');
      case 400:
        throw new Error(data?.message || 'Invalid request data');
      case 500:
        throw new Error(data?.message || 'Server error. Please try again later.');
      default:
        throw new Error(data?.message || 'An unexpected error occurred');
    }
  }
);

// API functions
export const productsAPI = {
  // Get all products
  getAll: async () => {
    const response = await api.get('/products');
    return response.data;
  },

  // Get product by slug
  getBySlug: async (slug) => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },
};

export const ordersAPI = {
  // Create a new order
  create: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },
};

// Health check
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend server is not responding');
  }
};

export default api;