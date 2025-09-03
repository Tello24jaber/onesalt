// admin/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
});

// Add auth token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle responses and auto-logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('adminToken');
      
      // Check if we're already on login page to avoid infinite redirects
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
      }
    } else if (error.code === 'NETWORK_ERROR' || !error.response) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  // Auth
  verifyToken: (token) => {
    return API.get('/admin/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
  },

  // Dashboard
  getDashboardStats: () => API.get('/admin/dashboard/stats'),

  // Products
  getProducts: (params) => API.get('/admin/products', { params }),
  getProduct: (id) => API.get(`/admin/products/${id}`),
  createProduct: (data) => API.post('/admin/products', data),
  updateProduct: (id, data) => API.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => API.delete(`/admin/products/${id}`),

  // Orders
  getOrders: (params) => API.get('/admin/orders', { params }),
  getOrder: (id) => API.get(`/admin/orders/${id}`),
  updateOrder: (id, data) => API.put(`/admin/orders/${id}`, data),
  updateOrderStatus: (id, status) => API.put(`/admin/orders/${id}/status`, { status }),
  getOrderReceipt: (id) => API.get(`/admin/orders/${id}/receipt`),

  // Order Items
  addOrderItem: (orderId, data) => API.post(`/admin/orders/${orderId}/items`, data),
  updateOrderItem: (orderId, itemId, data) => API.put(`/admin/orders/${orderId}/items/${itemId}`, data),
  deleteOrderItem: (orderId, itemId) => API.delete(`/admin/orders/${orderId}/items/${itemId}`),

  // Export
  exportOrdersCSV: (params) => {
    return API.get('/admin/export/orders.csv', {
      params,
      responseType: 'blob'
    });
  },

  // Notifications
  getNotifications: () => API.get('/admin/notifications'),
  markNotificationAsRead: (id) => API.post(`/admin/notifications/${id}/read`),
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem('adminToken');
};

// Utility function to logout user
export const logout = () => {
  localStorage.removeItem('adminToken');
  window.location.href = '/login';
};

export default API;