import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Star, StarIcon } from 'lucide-react';
import { adminAPI } from '../services/api';
import ChipInput from '../components/Common/ChipInput';
import ImageUpload from '../components/Common/ImageUpload';
import toast from 'react-hot-toast';

export default function ProductEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    images: [],
    colors: ['Black', 'White', 'Baby Blue'],
    sizes: ['S', 'M', 'L', 'XL'],
    category: 'general',
    stock: 100,
    is_featured: false,
    is_active: true
  });

  useEffect(() => {
    if (isEdit) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getProduct(id);
      console.log('Product API Response:', response); // Debug log
      
      // Handle Axios response structure
      if (response && response.data && typeof response.data === 'object') {
        setFormData(response.data);
      }
      // Handle direct response (non-Axios) 
      else if (response && typeof response === 'object' && response.id) {
        setFormData(response);
      }
      else {
        console.warn('Unexpected product response structure:', response);
        toast.error('Failed to load product data');
        navigate('/products');
      }
    } catch (error) {
      console.error('Fetch product error:', error);
      toast.error('Failed to load product');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.price < 0) {
      toast.error('Price must be greater than or equal to 0');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    try {
      setSaving(true);
      
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      };

      if (isEdit) {
        await adminAPI.updateProduct(id, dataToSend);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(dataToSend);
        toast.success('Product created successfully');
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(isEdit ? 'Failed to update product' : 'Failed to create product');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Toggle featured status with visual feedback
  const toggleFeatured = () => {
    const newFeaturedStatus = !formData.is_featured;
    setFormData({ ...formData, is_featured: newFeaturedStatus });
    
    // Show immediate feedback
    if (newFeaturedStatus) {
      toast.success('Product marked as featured');
    } else {
      toast.success('Product removed from featured');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/products')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Product' : 'New Product'}
        </h1>
        
        {/* Featured Badge */}
        {formData.is_featured && (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
            <Star size={14} fill="currentColor" />
            Featured
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  const newName = e.target.value;
                  if (!isEdit || formData.slug === generateSlug(formData.name)) {
                    // Auto-generate slug for new products or if slug matches current name
                    setFormData({ 
                      ...formData, 
                      name: newName,
                      slug: generateSlug(newName) 
                    });
                  } else {
                    setFormData({ ...formData, name: newName });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (JD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="general">General</option>
                <option value="featured">Featured</option>
                <option value="new">New Arrivals</option>
                <option value="sale">Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              placeholder="Describe your product..."
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h2>
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            maxImages={8}
            maxSizeMB={10}
          />
        </div>

        {/* Product Variants */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Variants</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Colors
              </label>
              <ChipInput
                value={formData.colors}
                onChange={(colors) => setFormData({ ...formData, colors })}
                placeholder="Enter color and press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available Sizes
              </label>
              <ChipInput
                value={formData.sizes}
                onChange={(sizes) => setFormData({ ...formData, sizes })}
                placeholder="Enter size and press Enter"
              />
            </div>
          </div>
        </div>

        {/* Product Settings */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Settings</h2>
          
          <div className="space-y-6">
            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  formData.is_active ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <div className={`w-6 h-6 rounded-full ${
                    formData.is_active ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Product Status</div>
                  <div className="text-sm text-gray-500">
                    {formData.is_active ? 'Product is visible to customers' : 'Product is hidden from customers'}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
              </label>
            </div>

            {/* Featured Status */}
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  formData.is_featured ? 'bg-yellow-100' : 'bg-gray-100'
                }`}>
                  <Star 
                    size={24} 
                    className={formData.is_featured ? 'text-yellow-500' : 'text-gray-400'}
                    fill={formData.is_featured ? 'currentColor' : 'none'}
                  />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">Featured Product</div>
                  <div className="text-sm text-gray-500">
                    {formData.is_featured ? 'Product appears in featured section' : 'Product is not featured'}
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_featured}
                  onChange={toggleFeatured}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="bg-sky-600 text-white px-6 py-2 rounded-lg hover:bg-sky-700 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Save size={20} />
            {saving ? 'Saving...' : (isEdit ? 'Update Product' : 'Create Product')}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/products')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}