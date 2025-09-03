import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Login({ onLogin }) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      toast.error('Please enter admin token');
      return;
    }

    setLoading(true);

    try {
      await adminAPI.verifyToken(token);
      localStorage.setItem('adminToken', token);
      toast.success('Login successful');
      
      // Call the onLogin callback to update parent state
      if (onLogin) {
        onLogin();
      }
      
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        toast.error('Invalid admin token');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('Unable to connect to server. Please check your connection.');
      } else {
        toast.error('Login failed. Please try again.');
      }
      
      // Clear any stored token on failed login
      localStorage.removeItem('adminToken');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-sky-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">OneSalt Admin</h1>
          <p className="text-gray-600 mt-2">Enter your admin token to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="sr-only">
              Admin Token
            </label>
            <input
              id="token"
              name="token"
              type="password"
              placeholder="Admin Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading || !token.trim()}
            className="w-full bg-sky-600 text-white py-3 rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Verifying...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Secure admin access for OneSalt store management
          </p>
        </div>
      </div>
    </div>
  );
}