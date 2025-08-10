// admin/src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Edit2, Trash2, 
  Receipt, User, MapPin, Phone, 
  MessageSquare, X 
} from 'lucide-react';
import { adminAPI } from '../services/api';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    shipping_fee: 0,
    status: 'pending'
  });

  const [newItem, setNewItem] = useState({
    product_id: '',
    product_name: '',
    color: '',
    size: '',
    quantity: 1,
    unit_price: 0
  });

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getOrder(id);
      setOrder(response.data);
      setFormData({
        customer_name: response.data.customer_name,
        phone: response.data.phone,
        address: response.data.address,
        city: response.data.city,
        notes: response.data.notes || '',
        shipping_fee: response.data.shipping_fee,
        status: response.data.status
      });
    } catch (error) {
      toast.error('Failed to load order');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    try {
      setSaving(true);
      await adminAPI.updateOrder(id, formData);
      toast.success('Order updated successfully');
      setEditMode(false);
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    try {
      await adminAPI.updateOrderStatus(id, newStatus);
      toast.success('Status updated successfully');
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.product_name || !newItem.color || !newItem.size) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await adminAPI.addOrderItem(id, {
        ...newItem,
        product_id: newItem.product_id || crypto.randomUUID(),
        quantity: parseInt(newItem.quantity),
        unit_price: parseFloat(newItem.unit_price)
      });
      toast.success('Item added successfully');
      setShowAddItem(false);
      setNewItem({
        product_id: '',
        product_name: '',
        color: '',
        size: '',
        quantity: 1,
        unit_price: 0
      });
      fetchOrder();
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleUpdateItem = async (itemId, updates) => {
    try {
      await adminAPI.updateOrderItem(id, itemId, {
        ...updates,
        quantity: parseInt(updates.quantity),
        unit_price: parseFloat(updates.unit_price)
      });
      toast.success('Item updated successfully');
      setEditingItem(null);
      fetchOrder();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await adminAPI.deleteOrderItem(id, itemId);
        toast.success('Item deleted successfully');
        fetchOrder();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!order) {
    return <div>Order not found</div>;
  }

  const subtotal = order.items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Order #{order.id.substring(0, 8)}
            </h1>
            <p className="text-sm text-gray-500">
              Created {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowReceipt(true)}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 inline-flex items-center gap-2"
        >
          <Receipt size={20} />
          View Receipt
        </button>
      </div>

      {/* Order Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => handleUpdateStatus(status)}
              className={`px-4 py-2 rounded-lg capitalize ${
                order.status === status
                  ? getStatusBadgeClass(status)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Information */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="text-sky-600 hover:text-sky-700"
            >
              <Edit2 size={20} />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleUpdateOrder}
                disabled={saving}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    customer_name: order.customer_name,
                    phone: order.phone,
                    address: order.address,
                    city: order.city,
                    notes: order.notes || '',
                    shipping_fee: order.shipping_fee,
                    status: order.status
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <User size={16} />
              Customer Name
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <p className="text-gray-900">{order.customer_name}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <Phone size={16} />
              Phone
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <p className="text-gray-900">{order.phone}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} />
              Address
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <p className="text-gray-900">{order.address}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} />
              City
            </label>
            {editMode ? (
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <p className="text-gray-900">{order.city}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MessageSquare size={16} />
              Notes
            </label>
            {editMode ? (
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <p className="text-gray-900">{order.notes || 'No notes'}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Shipping Fee
            </label>
            {editMode ? (
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.shipping_fee}
                onChange={(e) => setFormData({ ...formData, shipping_fee: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            ) : (
              <p className="text-gray-900">{formatCurrency(order.shipping_fee)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
          <button
            onClick={() => setShowAddItem(true)}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Add Item
          </button>
        </div>

        {/* Add Item Form */}
        {showAddItem && (
          <div className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
            <h3 className="font-medium text-gray-900 mb-3">Add New Item</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Product Name *"
                value={newItem.product_name}
                onChange={(e) => setNewItem({ ...newItem, product_name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="text"
                placeholder="Color *"
                value={newItem.color}
                onChange={(e) => setNewItem({ ...newItem, color: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="text"
                placeholder="Size *"
                value={newItem.size}
                onChange={(e) => setNewItem({ ...newItem, size: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <input
                type="number"
                placeholder="Unit Price"
                step="0.01"
                min="0"
                value={newItem.unit_price}
                onChange={(e) => setNewItem({ ...newItem, unit_price: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddItem(false);
                    setNewItem({
                      product_id: '',
                      product_name: '',
                      color: '',
                      size: '',
                      quantity: 1,
                      unit_price: 0
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Color</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit Price</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.items?.map((item) => (
                <tr key={item.id}>
                  {editingItem === item.id ? (
                    <>
                      <td className="px-4 py-2">{item.product_name}</td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) => {
                            const updated = order.items.map(i => 
                              i.id === item.id ? { ...i, color: e.target.value } : i
                            );
                            setOrder({ ...order, items: updated });
                          }}
                          className="w-20 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="text"
                          value={item.size}
                          onChange={(e) => {
                            const updated = order.items.map(i => 
                              i.id === item.id ? { ...i, size: e.target.value } : i
                            );
                            setOrder({ ...order, items: updated });
                          }}
                          className="w-16 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = order.items.map(i => 
                              i.id === item.id ? { ...i, quantity: e.target.value } : i
                            );
                            setOrder({ ...order, items: updated });
                          }}
                          className="w-16 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unit_price}
                          onChange={(e) => {
                            const updated = order.items.map(i => 
                              i.id === item.id ? { ...i, unit_price: e.target.value } : i
                            );
                            setOrder({ ...order, items: updated });
                          }}
                          className="w-24 px-2 py-1 border rounded"
                        />
                      </td>
                      <td className="px-4 py-2">
                        {formatCurrency(item.quantity * item.unit_price)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateItem(item.id, item)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Save size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingItem(null);
                              fetchOrder();
                            }}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2 text-sm">{item.product_name}</td>
                      <td className="px-4 py-2 text-sm">{item.color}</td>
                      <td className="px-4 py-2 text-sm">{item.size}</td>
                      <td className="px-4 py-2 text-sm">{item.quantity}</td>
                      <td className="px-4 py-2 text-sm">{formatCurrency(item.unit_price)}</td>
                      <td className="px-4 py-2 text-sm font-medium">{formatCurrency(item.subtotal)}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(item.id)}
                            className="text-sky-600 hover:text-sky-700"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Summary */}
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{formatCurrency(order.total_price)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <OrderReceipt 
          order={order}
          onClose={() => setShowReceipt(false)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

// Receipt Component
function OrderReceipt({ order, onClose, formatCurrency }) {
  const subtotal = order.items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Order Receipt</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="border-t border-b py-4 mb-4">
            <h3 className="font-bold text-lg mb-2">OneSalt</h3>
            <p className="text-sm text-gray-600">Order #{order.id}</p>
            <p className="text-sm text-gray-600">
              {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <p className="text-sm">{order.customer_name}</p>
            <p className="text-sm">{order.phone}</p>
            <p className="text-sm">{order.address}</p>
            <p className="text-sm">{order.city}</p>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold mb-2">Order Items</h4>
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-2">Item</th>
                  <th className="text-right py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">
                      {item.product_name}
                      <div className="text-xs text-gray-500">
                        {item.color} / {item.size}
                      </div>
                    </td>
                    <td className="text-right py-2">{item.quantity}</td>
                    <td className="text-right py-2">{formatCurrency(item.unit_price)}</td>
                    <td className="text-right py-2">{formatCurrency(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping:</span>
              <span>{formatCurrency(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>{formatCurrency(order.total_price)}</span>
            </div>
          </div>

          {order.notes && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-semibold mb-2">Notes</h4>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}