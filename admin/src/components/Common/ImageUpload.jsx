import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ImageUpload({ 
  images = [], 
  onChange, 
  maxImages = 8,
  maxSizeMB = 10 
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    setUploading(true);
    const newImages = [];

    for (const file of fileArray) {
      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        continue;
      }

      // Check file size (convert MB to bytes)
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        toast.error(`${file.name} is larger than ${maxSizeMB}MB`);
        continue;
      }

      try {
        // Create preview URL
        const imageUrl = URL.createObjectURL(file);
        
        // You can upload to your server here and get the actual URL
        // For now, we'll use the object URL
        newImages.push(imageUrl);
      } catch (error) {
        console.error('Error processing image:', error);
        toast.error(`Failed to process ${file.name}`);
      }
    }

    if (newImages.length > 0) {
      onChange([...images, ...newImages]);
      toast.success(`${newImages.length} image(s) uploaded successfully`);
    }

    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    toast.success('Image removed');
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-sky-500 bg-sky-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF up to {maxSizeMB}MB each (max {maxImages} images)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-600"></div>
          <span>Uploading images...</span>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={index}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border"
            >
              <img
                src={image}
                alt={`Upload ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIxIDlWN0MxIDcgMSA5IDEgOUwxIDE3QzEgMTkgMyAxOSAzIDE5SDE5QzIxIDE5IDIxIDE3IDIxIDE3VjlaTTMgOUwzIDdDMyA3IDMgOSAzIDlaTTkgMTNMMTIgMTBMMTUgMTNNMTIgMTBWMTciIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                }}
              />
              
              {/* Image Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index);
                  }}
                  className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                  title="Remove image"
                >
                  <X size={16} />
                </button>

                {/* Move Left */}
                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index - 1);
                    }}
                    className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-colors"
                    title="Move left"
                  >
                    ←
                  </button>
                )}

                {/* Move Right */}
                {index < images.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      moveImage(index, index + 1);
                    }}
                    className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-colors"
                    title="Move right"
                  >
                    →
                  </button>
                )}
              </div>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Info */}
      <div className="flex items-start space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
        <AlertCircle size={16} className="mt-0.5 text-blue-500 flex-shrink-0" />
        <div>
          <p className="font-medium">Upload Guidelines:</p>
          <ul className="mt-1 space-y-1">
            <li>• Maximum {maxImages} images per product</li>
            <li>• Maximum {maxSizeMB}MB per image</li>
            <li>• Supported formats: JPG, PNG, GIF</li>
            <li>• First image will be used as the primary product image</li>
            <li>• You can reorder images by using the arrow buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
}