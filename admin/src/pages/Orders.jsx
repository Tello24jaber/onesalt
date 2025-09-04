import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Eye, Edit, Trash2, 
  ChevronLeft, ChevronRight, Calendar,
  MapPin, DollarSign, Package, AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [page, search, status]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        ...(search && { search }),
        ...(status && { status })
      };
      
      const response = await adminAPI.getOrders(params);
      console.log('Orders API Response:', response);
      
      // Handle Axios response structure
      if (response && response.data && typeof response.data === 'object') {
        const { data } = response;
        
        if (Array.isArray(data.orders)) {
          setOrders(data.orders);
          setTotalPages(data.totalPages || data.total_pages || 1);
        }
        else if (Array.isArray(data)) {
          setOrders(data);
          setTotalPages(1);
        }
        else {
          console.warn('Unexpected orders response structure:', response);
          setOrders([]);
          setTotalPages(1);
        }
      } 
      else if (response && typeof response === 'object') {
        if (Array.isArray(response.orders)) {
          setOrders(response.orders);
          setTotalPages(response.totalPages || 1);
        }
        else if (Array.isArray(response)) {
          setOrders(response);
          setTotalPages(1);
        }
        else {
          console.warn('Unexpected orders response structure:', response);
          setOrders([]);
          setTotalPages(1);
        }
      }
      else {
        console.warn('Invalid orders response:', response);
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Orders API Error:', error);
      toast.error('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, orderNumber) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderNumber}? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleting(id);
      await adminAPI.deleteOrder(id);
      toast.success('Order deleted successfully');
      fetchOrders(); // Refresh the list
    } catch (error) {
      console.error('Delete order error:', error);
      toast.error('Failed to delete order');
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800', 
      processing: 'bg-orange-100 text-orange-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <div className="text-sm text-gray-600">
          Total Orders: {safeOrders.length}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by order number, customer name, or email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center gap-2"
          >
            <Filter size={20} />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {safeOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        <Package className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                        <p>No orders found</p>
                      </td>
                    </tr>
                  ) : (
                    safeOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                #{order.order_number || order.id}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Package size={14} className="mr-1" />
                                {order.items?.length || 0} item(s)
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.customer_name || order.shipping_address?.name || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.customer_email || order.email || 'N/A'}
                            </div>
                            {order.shipping_address?.city && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <MapPin size={12} className="mr-1" />
                                {order.shipping_address.city}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <Calendar size={14} className="mr-1" />
                            {formatDate(order.created_at || order.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <DollarSign size={14} className="mr-1" />
                            {formatPrice(order.total_amount || order.total)}
                          </div>
                          {order.delivery_fee && (
                            <div className="text-xs text-gray-500">
                              +{formatPrice(order.delivery_fee)} delivery
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/orders/${order.id}`}
                              className="text-sky-600 hover:text-sky-700 p-1 rounded hover:bg-sky-50"
                              title="View Order"
                            >
                              <Eye size={18} />
                            </Link>
                            <Link
                              to={`/orders/${order.id}/edit`}
                              className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                              title="Edit Order"
                            >
                              <Edit size={18} />
                            </Link>
                            <button
                              onClick={() => handleDelete(order.id, order.order_number || order.id)}
                              disabled={deleting === order.id}
                              className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete Order"
                            >
                              {deleting === order.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                              ) : (
                                <Trash2 size={18} />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>
                
                <span className="text-sm text-gray-700">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        {[
          { 
            label: 'Total Orders', 
            value: safeOrders.length, 
            color: 'bg-blue-500',
            icon: Package 
          },
          { 
            label: 'Pending', 
            value: safeOrders.filter(o => o.status === 'pending').length, 
            color: 'bg-yellow-500',
            icon: AlertTriangle 
          },
          { 
            label: 'Delivered', 
            value: safeOrders.filter(o => o.status === 'delivered').length, 
            color: 'bg-green-500',
            icon: Package 
          },
          { 
            label: 'Total Revenue', 
            value: formatPrice(safeOrders.reduce((sum, order) => sum + (order.total_amount || order.total || 0), 0)), 
            color: 'bg-purple-500',
            icon: DollarSign 
          }
        ].map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}