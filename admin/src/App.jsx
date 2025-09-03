import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLayout from './components/Layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Products from './pages/Products';
import ProductEdit from './pages/ProductEdit';
import Login from './pages/log';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on app start
    checkAuth();

    // Auto-logout functionality
    setupAutoLogout();

    // Cleanup function
    return () => {
      if (window.handleBeforeUnload) {
        window.removeEventListener('beforeunload', window.handleBeforeUnload);
      }
      if (window.handleVisibilityChange) {
        document.removeEventListener('visibilitychange', window.handleVisibilityChange);
      }
      if (window.logoutTimer) {
        clearTimeout(window.logoutTimer);
      }
    };
  }, []);

  const checkAuth = () => {
    const token = localStorage.getItem('adminToken');
    setIsAuthenticated(!!token);
    setLoading(false);
  };

  const setupAutoLogout = () => {
    // Handle browser/tab close
    const handleBeforeUnload = () => {
      localStorage.removeItem('adminToken');
    };

    // Handle tab visibility change (when user switches tabs or minimizes)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Start timer when tab becomes hidden
        window.logoutTimer = setTimeout(() => {
          if (document.visibilityState === 'hidden') {
            localStorage.removeItem('adminToken');
            setIsAuthenticated(false);
          }
        }, 10000); // 10 seconds after tab becomes hidden
      } else if (document.visibilityState === 'visible') {
        // Clear timer when tab becomes visible again
        if (window.logoutTimer) {
          clearTimeout(window.logoutTimer);
          window.logoutTimer = null;
        }
      }
    };

    // Handle page unload (refresh, close, navigate away)
    const handleUnload = () => {
      localStorage.removeItem('adminToken');
    };

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Store handlers for cleanup
    window.handleBeforeUnload = handleBeforeUnload;
    window.handleVisibilityChange = handleVisibilityChange;
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<AdminLayout onLogout={handleLogout} />}>
          <Route index element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductEdit />} />
          <Route path="products/:id/edit" element={<ProductEdit />} />
        </Route>
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },
        }}
      />
    </Router>
  );
}

export default App;