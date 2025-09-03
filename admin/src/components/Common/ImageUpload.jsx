import { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ images = [], onChange, maxImages = 5 }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Handle file selection
  const handleFileSelect = useCallback(async (files) => {
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    const newImages = [];

    try {
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} is not an image file`);
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum size is 5MB`);
          continue;
        }

        const base64 = await fileToBase64(file);
        newImages.push(base64);
      }

      onChange([...images, ...newImages]);
    } catch (error) {
      console.error('Error processing images:', error);
      alert('Error processing images');
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onChange]);

  // Handle drag and drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  // Handle file input change
  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
    e.target.value = ''; // Reset input
  };

  // Remove image
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver
            ? 'border-sky-500 bg-sky-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading || images.length >= maxImages}
        />
        
        <div className="space-y-2">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
            ) : (
              <Upload className="h-6 w-6 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Processing images...' : 'Drop images here or click to upload'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF up to 5MB each. Maximum {maxImages} images.
            </p>
            <p className="text-xs text-gray-500">
              {images.length}/{maxImages} images uploaded
            </p>
          </div>
        </div>
      </div>

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiA5VjEzTTEyIDE3SDE2TTE2IDlIMTJNMTYgMTNIMTIiIHN0cm9rZT0iIzlDQTNBRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiLz4KPC9zdmc+';
                  }}
                />
              </div>
              
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add More Button */}
      {images.length > 0 && images.length < maxImages && (
        <button
          type="button"
          onClick={() => document.querySelector('input[type="file"]').click()}
          disabled={uploading}
          className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-gray-700 disabled:opacity-50"
        >
          <ImageIcon size={16} />
          Add More Images ({images.length}/{maxImages})
        </button>
      )}
    </div>
  );
};

export default ImageUpload;