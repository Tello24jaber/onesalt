import { useState, useRef, useEffect } from 'react';
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
  const [uploadProgress, setUploadProgress] = useState({});
  const [previewImages, setPreviewImages] = useState([]); // Separate state for previews
  const fileInputRef = useRef(null);

  // Get your backend URL from environment or use default for Vite
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  // Clean up data URLs when component unmounts
  useEffect(() => {
    return () => {
      // No cleanup needed for data URLs, but keeping for consistency
      setPreviewImages([]);
    };
  }, []);

  const uploadToBackend = async (files) => {
    const formData = new FormData();
    
    // Append all files to form data
    Array.from(files).forEach((file, index) => {
      formData.append('images', file);
    });

    try {
      console.log('Uploading to:', `${BACKEND_URL}/api/upload/images`);
      
      const response = await fetch(`${BACKEND_URL}/api/upload/images`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      console.log('Upload success:', data);
      return data.data; // Array of uploaded image objects with URLs
    } catch (error) {
      console.error('Backend upload error:', error);
      throw error;
    }
  };

  // Convert file to data URL for preview
  const fileToDataURL = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s)`);
      return;
    }

    // Validate files before uploading
    const validFiles = [];
    const newPreviews = [];
    
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

      validFiles.push(file);
      
      // Create data URL for immediate preview (instead of blob URL)
      try {
        const dataUrl = await fileToDataURL(file);
        newPreviews.push({
          url: dataUrl,
          isDataURL: true,
          file: file,
          id: Date.now() + Math.random() // Temporary ID
        });
      } catch (error) {
        console.error('Error creating preview for', file.name, error);
      }
    }

    if (validFiles.length === 0) {
      return;
    }

    // Add preview images immediately for better UX
    setPreviewImages(prev => [...prev, ...newPreviews]);
    setUploading(true);

    try {
      // Show progress
      setUploadProgress({ uploading: true });

      // Upload to backend
      const uploadedImages = await uploadToBackend(validFiles);
      
      // Extract permanent URLs from the response
      const permanentUrls = uploadedImages.map(img => img.url);
      
      // Update parent component with permanent URLs only
      onChange([...images, ...permanentUrls]);
      
      // Remove the preview images (they're now in the main images array)
      setPreviewImages(prev => 
        prev.filter(preview => !newPreviews.includes(preview))
      );
      
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload images');
      
      // Remove failed previews
      setPreviewImages(prev => 
        prev.filter(preview => !newPreviews.includes(preview))
      );
    } finally {
      setUploading(false);
      setUploadProgress({});
    }
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

  const removePreview = (previewIndex) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== previewIndex));
  };

  const moveImage = (fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onChange(newImages);
  };

  // Combine permanent images and preview images for display
  const allImages = [
    ...images.map((url, index) => ({ url, isPermanent: true, index })),
    ...previewImages.map((preview, index) => ({ 
      url: preview.url, 
      isPermanent: false, 
      previewIndex: index,
      isUploading: uploading
    }))
  ];

  return (
    <div className="space-y-4">
      {/* Debug info (remove in production) */}
      <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
        Backend URL: {BACKEND_URL} | Permanent: {images.length} | Previews: {previewImages.length}
      </div>

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
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={uploading}
        />
        
        <div className="space-y-2">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {uploading ? 'Uploading images...' : 'Click to upload or drag and drop'}
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
          <span>Uploading to secure storage...</span>
        </div>
      )}

      {/* Images Grid */}
      {allImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {allImages.map((imageData, displayIndex) => (
            <div
              key={imageData.isPermanent ? `perm-${imageData.index}` : `preview-${imageData.previewIndex}`}
              className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border"
            >
              <img
                src={imageData.url}
                alt={`Image ${displayIndex + 1}`}
                className={`w-full h-full object-cover ${imageData.isUploading ? 'opacity-75' : ''}`}
                onError={(e) => {
                  console.error('Image failed to load:', imageData.url);
                  // Fallback to a placeholder
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gray-200">
                      <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                  `;
                }}
              />
              
              {/* Uploading overlay */}
              {imageData.isUploading && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-600"></div>
                </div>
              )}
              
              {/* Image Controls */}
              {!imageData.isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (imageData.isPermanent) {
                        removeImage(imageData.index);
                      } else {
                        removePreview(imageData.previewIndex);
                      }
                    }}
                    className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                    title="Remove image"
                  >
                    <X size={16} />
                  </button>

                  {/* Move buttons only for permanent images */}
                  {imageData.isPermanent && (
                    <>
                      {/* Move Left */}
                      {imageData.index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(imageData.index, imageData.index - 1);
                          }}
                          className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-colors"
                          title="Move left"
                        >
                          ←
                        </button>
                      )}

                      {/* Move Right */}
                      {imageData.index < images.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveImage(imageData.index, imageData.index + 1);
                          }}
                          className="p-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full transition-colors"
                          title="Move right"
                        >
                          →
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Primary Badge - only for first permanent image */}
              {imageData.isPermanent && imageData.index === 0 && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}

              {/* Preview Badge */}
              {!imageData.isPermanent && (
                <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Preview
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
            <li>• Images are securely stored with permanent URLs</li>
            <li>• First uploaded image will be the primary product image</li>
            <li>• You can reorder uploaded images using the arrow buttons</li>
          </ul>
        </div>
      </div>
    </div>
  );
}