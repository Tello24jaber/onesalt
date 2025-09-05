import axios from 'axios';
import { toast } from 'react-toastify';

// Base API URL - For Vite, use import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (auth token etc.)
api.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – return payload directly
api.interceptors.response.use(
  (response) => response.data, // <-- crucial: callers receive JSON body, not Axios response
  (error) => {
    console.error('API Error:', error?.message);
    console.log('Current API Base URL:', API_BASE_URL); // Debug log

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      const message = `Cannot connect to server at ${API_BASE_URL}. Please check your network connection.`;
      toast.error(message);
      return Promise.reject(new Error(message));
    }

    if (error.response) {
      const message = error.response.data?.message || 'Something went wrong';
      console.error('Server Error:', message);
      switch (error.response.status) {
        case 400:
          toast.error(`Bad Request: ${message}`); break;
        case 401:
          toast.error('Unauthorized. Please login again.'); break;
        case 404:
          toast.error('Resource not found'); break;
        case 500:
          toast.error('Server error. Please try again later.'); break;
        default:
          toast.error(message);
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }

    return Promise.reject(error);
  }
);

// Products API – FIXED: Added /api prefix to all routes
export const productsAPI = {
  getAll: () => api.get('/api/products'),
  getById: (id) => api.get(`/api/products/${id}`),
  getBySlug: (slug) => api.get(`/api/products/slug/${slug}`),
  create: (data) => api.post('/api/products', data),
  update: (id, data) => api.put(`/api/products/${id}`, data),
  delete: (id) => api.delete(`/api/products/${id}`),
};

// Orders API – FIXED: Added /api prefix
export const ordersAPI = {
  create: (data) => api.post('/api/orders', data),
  getAll: (params) => api.get('/api/orders', { params }),
  getById: (id) => api.get(`/api/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
};

// Categories API – FIXED: Added /api prefix  
export const categoriesAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Admin API for the admin dashboard
export const adminAPI = {
  // Products
  getAllProducts: () => api.get('/api/products'),
  getProduct: (id) => api.get(`/api/products/${id}`),
  createProduct: (data) => api.post('/api/products', data),
  updateProduct: (id, data) => api.put(`/api/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/products/${id}`),
  
  // Orders  
  getAllOrders: (params) => api.get('/api/orders', { params }),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
};

// Log the API URL in development AND production for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment variables:', {
  VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE
});

export default api;