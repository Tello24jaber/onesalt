import axios from 'axios';
import { toast } from 'react-toastify';

// Base API URL - For Vite, use import.meta.env instead of process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
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

    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      const message = 'Cannot connect to server. Please ensure the backend is running on port 5000.';
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

// Products API – now returns payloads directly (arrays/objects), thanks to the interceptor
export const productsAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Categories API (if present on backend)
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Log the API URL in development
if (import.meta.env.DEV) {
  console.log('API Base URL:', API_BASE_URL);
}

export default api;