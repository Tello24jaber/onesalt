// admin/src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Plus, Edit2, Trash2, 
  Printer, User, MapPin, Phone, 
  MessageSquare, X , DollarSign, Smartphone, ExternalLink 
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
      currency: 'JOD',
      minimumFractionDigits: 2
    }).format(amount).replace('JOD', 'JD');
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
          <Printer size={20} />
          Print Receipt
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

      {/* Payment & Delivery */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment & Delivery</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Payment Method */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              {order.payment_method === 'cash' ? <DollarSign size={16} /> : <Smartphone size={16} />}
              Payment Method
            </label>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                order.payment_method === 'cash' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {order.payment_method === 'cash' ? 'Cash on Delivery' : 'CliQ Transfer'}
              </span>
            </div>
          </div>

          {/* Delivery Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
              <MapPin size={16} />
              Delivery Location
            </label>
            {order.location_link ? (
              <a 
                href={order.location_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 hover:underline"
              >
                <span>View on Google Maps</span>
                <ExternalLink size={14} />
              </a>
            ) : order.latitude && order.longitude ? (
              <a 
                href={`https://maps.google.com/?q=${order.latitude},${order.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sky-600 hover:text-sky-700 hover:underline"
              >
                <span>View on Google Maps</span>
                <ExternalLink size={14} />
              </a>
            ) : (
              <span className="text-gray-500">No location provided</span>
            )}
          </div>

          {/* Map Address if available */}
          {order.map_address && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Map Address Details
              </label>
              <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">{order.map_address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order Items</h2>
        
        </div>

       

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
// Professional Print Receipt Component - CLEAN VERSION
function OrderReceipt({ order, onClose, formatCurrency }) {
  const subtotal = order.items?.reduce((sum, item) => sum + parseFloat(item.subtotal), 0) || 0;
  
  // Calculate shipping fee based on city
  const calculateShippingFee = (city) => {
    if (!city) return 3;
    const cityLower = city.toLowerCase().trim();
    const isAmman = cityLower.includes('amman') || cityLower.includes('عمان');
    return isAmman ? 2 : 3;
  };

  const shippingFee = order.shipping_fee || calculateShippingFee(order.city);

  const handlePrint = () => {
    // Create a new window for printing to avoid blank page issue
    const printWindow = window.open('', '_blank');
    const printContent = document.getElementById('receipt-content').innerHTML;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - Order #${order.id.substring(0, 8).toUpperCase()}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              color: black;
            }
            .receipt-container { 
              max-width: 400px; 
              margin: 0 auto; 
              border: 2px solid #333;
            }
            .store-header { 
              background: #1f2937; 
              color: white; 
              padding: 16px; 
              text-align: center; 
            }
            .store-title { 
              font-size: 24px; 
              font-weight: bold; 
              margin-bottom: 4px; 
            }
            .store-subtitle { 
              font-size: 14px; 
              opacity: 0.9; 
            }
            .store-contact { 
              border-top: 1px solid #4b5563; 
              margin-top: 12px; 
              padding-top: 8px; 
            }
            .store-contact p { 
              font-size: 12px; 
              margin: 2px 0; 
            }
            .receipt-info { 
              padding: 16px; 
              border-bottom: 1px solid #d1d5db; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
            }
            .info-row:last-child { 
              margin-bottom: 0; 
            }
            .label { 
              font-weight: bold; 
            }
            .customer-section { 
              padding: 16px; 
              border-bottom: 1px solid #d1d5db; 
              background: #f9fafb; 
            }
            .section-title { 
              font-weight: bold; 
              margin-bottom: 8px; 
              text-align: center; 
              border-bottom: 1px solid #d1d5db; 
              padding-bottom: 8px; 
            }
            .customer-info div { 
              font-size: 14px; 
              margin-bottom: 4px; 
            }
            .items-section { 
              padding: 16px; 
            }
            .item { 
              margin-bottom: 12px; 
              padding-bottom: 8px; 
              border-bottom: 1px solid #f3f4f6; 
            }
            .item:last-child { 
              border-bottom: none; 
            }
            .item-name { 
              font-weight: 500; 
              font-size: 14px; 
            }
            .item-details { 
              font-size: 12px; 
              color: #6b7280; 
              margin-bottom: 4px; 
            }
            .item-pricing { 
              display: flex; 
              justify-content: space-between; 
              font-size: 14px; 
            }
            .totals-section { 
              padding: 16px; 
              border-top: 2px solid #d1d5db; 
              background: #f9fafb; 
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px; 
            }
            .total-final { 
              display: flex; 
              justify-content: space-between; 
              font-size: 18px; 
              font-weight: bold; 
              border-top: 1px solid #d1d5db; 
              padding-top: 8px; 
            }
            .payment-section { 
              padding: 16px; 
              border-top: 1px solid #d1d5db; 
              text-align: center; 
            }
            .payment-method { 
              display: inline-block; 
              padding: 4px 8px; 
              border-radius: 4px; 
              font-size: 12px; 
              font-weight: bold; 
            }
            .payment-cash { 
              background: #dcfce7; 
              color: #166534; 
            }
            .payment-cliq { 
              background: #e0e7ff; 
              color: #3730a3; 
            }
            .footer { 
              padding: 16px; 
              border-top: 1px solid #d1d5db; 
              text-align: center; 
              font-size: 12px; 
              color: white; 
              background: #1f2937; 
            }
            .footer p { 
              margin: 4px 0; 
            }
            @media print {
              body { margin: 0; padding: 0; }
              .receipt-container { max-width: none; border: none; }
            }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-8">
          {/* Header with close button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Receipt Preview</h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePrint}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 inline-flex items-center gap-2"
              >
                <Printer size={16} />
                Print
              </button>
              <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Professional Receipt */}
          <div id="receipt-content">
            <div className="receipt-container bg-white border-2 border-gray-200 max-w-md mx-auto">
              {/* Store Header */}
              <div className="store-header bg-gray-900 text-white p-4 text-center">
                <h1 className="store-title text-2xl font-bold mb-1">OneSalt</h1>
                <p className="store-subtitle text-sm opacity-90">Fashion Store</p>
                <div className="store-contact border-t border-gray-600 mt-3 pt-2">
                
                  <p className="text-xs">Email: wearonesalt@gmail.com</p>
                </div>
              </div>

              {/* Receipt Info */}
              <div className="receipt-info p-4 border-b border-gray-200">
                <div className="info-row flex justify-between items-center mb-2">
                  <span className="label font-bold">Receipt #:</span>
                  <span className="font-mono text-sm">{order.id.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="info-row flex justify-between items-center mb-2">
                  <span className="label font-bold">Date:</span>
                  <span className="text-sm">{format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</span>
                </div>
                <div className="info-row flex justify-between items-center">
                
                </div>
              </div>

              {/* Customer Information */}
              <div className="customer-section p-4 border-b border-gray-200 bg-gray-50">
                <h3 className="section-title font-bold mb-2 text-center">CUSTOMER DETAILS</h3>
                <div className="customer-info text-sm space-y-1">
                  <div><strong>Name:</strong> {order.customer_name}</div>
                  <div><strong>Phone:</strong> {order.phone}</div>
                  <div><strong>Address:</strong> {order.address}</div>
                  <div><strong>City:</strong> {order.city}</div>
                  {order.notes && <div><strong>Notes:</strong> {order.notes}</div>}
                </div>
              </div>

              {/* Items */}
              <div className="items-section p-4">
                <h3 className="section-title font-bold mb-3 text-center border-b pb-2">ITEMS PURCHASED</h3>
                {order.items?.map((item, index) => (
                  <div key={item.id} className="item mb-3 pb-2 border-b border-gray-100 last:border-b-0">
                    <div className="item-name font-medium text-sm mb-1">{item.product_name}</div>
                    <div className="item-details text-xs text-gray-600 mb-1">
                      Color: {item.color} • Size: {item.size}
                    </div>
                    <div className="item-pricing flex justify-between items-center text-sm">
                      <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                      <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="totals-section p-4 border-t-2 border-gray-300 bg-gray-50">
                <div className="space-y-2">
                  <div className="total-row flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="total-row flex justify-between text-sm">
                    <span>Delivery Fee ({order.city}):</span>
                    <span>{formatCurrency(shippingFee)}</span>
                  </div>
                  <div className="total-final flex justify-between text-lg font-bold border-t pt-2">
                    <span>TOTAL:</span>
                    <span>{formatCurrency(subtotal + shippingFee)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="payment-section p-4 border-t border-gray-200 text-center">
                <div className="mb-2">
                  <span className="font-bold">Payment Method: </span>
                  <span className={`payment-method inline-block px-2 py-1 rounded text-xs font-semibold ${
                    order.payment_method === 'cash' 
                      ? 'payment-cash bg-green-100 text-green-800' 
                      : 'payment-cliq bg-purple-100 text-purple-800'
                  }`}>
                    {order.payment_method === 'cash' ? 'Cash on Delivery' : 'CliQ Transfer'}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="footer p-4 border-t border-gray-200 text-center text-xs text-white bg-gray-900">
                <p className="mb-1">Thank you for shopping with OneSalt!</p>
                <p className="mb-1">For support, contact us at wearonesalt@gmail.com</p>
                <p>Return Policy: 7 days from delivery date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}