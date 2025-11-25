import React, { useState, useRef, useCallback, useEffect } from 'react';

// Constants - Industry standard: configuration at the top
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MIN_IMAGE_DIMENSIONS = { width: 100, height: 100 };
const MAX_IMAGE_DIMENSIONS = { width: 4000, height: 4000 };

/**
 * Industry-standard Photo Upload Component
 * Features:
 * - Comprehensive file validation
 * - Image dimension checking
 * - Error handling with user-friendly messages
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Image compression for large files
 * - Loading states and progress indicators
 * - Memory cleanup
 */
const PhotoUploadArea = ({ 
  onImageSelect, 
  currentPreview,
  maxSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_FILE_TYPES,
  label = 'Photo Upload',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(currentPreview || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  // Update preview when currentPreview changes
  useEffect(() => {
    if (currentPreview !== undefined) {
      setPreview(currentPreview);
      if (!currentPreview) {
        setError(null);
      }
    }
  }, [currentPreview]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('data:')) {
        // Revoke object URLs to prevent memory leaks
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Format file size - Industry standard: helper function
  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  // Validate file type
  const validateFileType = useCallback((file) => {
    const isValidType = allowedTypes.some(type => file.type === type);
    const isValidExtension = ALLOWED_EXTENSIONS.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );
    
    if (!isValidType && !isValidExtension) {
      return {
        valid: false,
        error: `Invalid file type. Please upload: ${ALLOWED_EXTENSIONS.join(', ').toUpperCase()}`
      };
    }
    return { valid: true };
  }, [allowedTypes]);

  // Validate file size
  const validateFileSize = useCallback((file) => {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${formatFileSize(maxSize)}. Please choose a smaller file.`
      };
    }
    return { valid: true };
  }, [maxSize, formatFileSize]);

  // Validate image dimensions
  const validateImageDimensions = useCallback((file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const { width, height } = img;
        
        if (width < MIN_IMAGE_DIMENSIONS.width || height < MIN_IMAGE_DIMENSIONS.height) {
          resolve({
            valid: false,
            error: `Image dimensions too small. Minimum size: ${MIN_IMAGE_DIMENSIONS.width}x${MIN_IMAGE_DIMENSIONS.height}px.`
          });
          return;
        }
        
        if (width > MAX_IMAGE_DIMENSIONS.width || height > MAX_IMAGE_DIMENSIONS.height) {
          resolve({
            valid: false,
            error: `Image dimensions too large. Maximum size: ${MAX_IMAGE_DIMENSIONS.width}x${MAX_IMAGE_DIMENSIONS.height}px.`
          });
          return;
        }
        
        resolve({ valid: true, dimensions: { width, height } });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({
          valid: false,
          error: 'Unable to read image file. Please ensure it is a valid image.'
        });
      };
      
      img.src = objectUrl;
    });
  }, []);

  // Compress image if needed (industry standard: optimize before upload)
  const compressImage = useCallback((file, dimensions) => {
    return new Promise((resolve, reject) => {
      // Only compress if file is larger than 2MB or dimensions are large
      if (file.size < 2 * 1024 * 1024 && 
          dimensions.width < 2000 && 
          dimensions.height < 2000) {
        resolve(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 2000px on longest side)
          let { width, height } = dimensions;
          const maxDimension = 2000;
          if (width > height) {
            if (width > maxDimension) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now()
                });
                resolve(compressedFile);
              } else {
                resolve(file); // Fallback to original
              }
            },
            file.type,
            0.85 // 85% quality
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Main file processing handler
  const handleFile = useCallback(async (file) => {
    if (!file) return;

    // Clear previous errors
    setError(null);
    setIsLoading(true);

    try {
      // Validation chain
      const typeValidation = validateFileType(file);
      if (!typeValidation.valid) {
        setError(typeValidation.error);
        setIsLoading(false);
        return;
      }

      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        setError(sizeValidation.error);
        setIsLoading(false);
        return;
      }

      // Validate dimensions
      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.valid) {
        setError(dimensionValidation.error);
        setIsLoading(false);
        return;
      }

      // Compress if needed
      const finalFile = await compressImage(file, dimensionValidation.dimensions);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setIsLoading(false);
        onImageSelect(finalFile, reader.result);
      };
      
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(finalFile);
    } catch (err) {
      setError(err.message || 'An error occurred while processing the image.');
      setIsLoading(false);
    }
  }, [validateFileType, validateFileSize, validateImageDimensions, compressImage, onImageSelect]);

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only reset dragging if we're actually leaving the drop zone
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile, disabled]);

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleSelectClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(() => {
    // Cleanup preview URL
    if (preview && preview.startsWith('data:')) {
      URL.revokeObjectURL(preview);
    }
    
    setPreview(null);
    setError(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    onImageSelect(null, null);
  }, [onImageSelect, preview]);

  const handleKeyDown = useCallback((e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !preview && !disabled) {
      e.preventDefault();
      handleSelectClick();
    } else if ((e.key === 'Delete' || e.key === 'Backspace') && preview && !disabled) {
      e.preventDefault();
      handleRemove();
    }
  }, [preview, disabled, handleSelectClick, handleRemove]);

  return (
    <div className={`w-full ${className}`}>
      {/* Photo Upload Area - Square */}
      <div className="w-full max-w-xs mx-auto">
        <label 
          htmlFor="photo-upload-input"
          className="sr-only"
          aria-label={label}
        >
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={preview ? 'Change photo' : 'Upload photo'}
          aria-disabled={disabled}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!preview && !disabled ? handleSelectClick : undefined}
          onKeyDown={handleKeyDown}
          className={`
            relative w-full aspect-square border-2 border-dashed rounded-lg transition-all duration-300
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            ${!preview && !disabled ? 'cursor-pointer' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging 
              ? 'border-primary bg-primary-50 scale-[1.02] shadow-lg' 
              : preview
                ? 'border-gray-300'
                : 'border-gray-300 hover:border-primary/50 bg-gray-50 focus:border-primary'
            }
            flex flex-col items-center justify-center p-4
            ${preview ? 'overflow-hidden' : ''}
          `}
        >
          <input
            id="photo-upload-input"
            ref={fileInputRef}
            type="file"
            accept={allowedTypes.join(',')}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
            aria-label={label}
          />

          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs text-gray-600">Processing...</p>
            </div>
          ) : preview ? (
            <>
              {/* Image Preview */}
              <img
                ref={imageRef}
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
              {/* Overlay on hover - Desktop */}
              <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 group">
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectClick();
                    }}
                    className="px-3 py-2 bg-white text-gray-900 rounded-md text-xs sm:text-sm font-semibold hover:bg-gray-100 transition-colors shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white"
                    title="Change photo"
                    aria-label="Change photo"
                  >
                    <i className="fas fa-edit mr-1" aria-hidden="true"></i>
                    <span className="hidden sm:inline">Change</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="px-3 py-2 bg-red-500 text-white rounded-md text-xs sm:text-sm font-semibold hover:bg-red-600 transition-colors shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300"
                    title="Remove photo"
                    aria-label="Remove photo"
                  >
                    <i className="fas fa-trash mr-1" aria-hidden="true"></i>
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              </div>
              {/* Image indicator badge */}
              <div className="absolute top-2 right-2 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                <i className="fas fa-check-circle" aria-hidden="true"></i>
                <span>Photo</span>
              </div>
            </>
          ) : (
            <>
              {/* Upload Icon */}
              <div className={`mb-3 ${isDragging ? 'scale-110' : ''} transition-transform`}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <i className="fas fa-camera text-primary text-xl sm:text-2xl" aria-hidden="true"></i>
                </div>
              </div>

              {/* Upload Text */}
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {isDragging ? 'Drop photo here' : 'Click to upload'}
                </p>
                <p className="text-xs text-gray-500">
                  or drag & drop
                </p>
                <p className="text-[10px] text-gray-400 mt-2">
                  {ALLOWED_EXTENSIONS.join(', ').toUpperCase()} (Max {formatFileSize(maxSize)})
                </p>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div 
            role="alert"
            className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 flex items-start gap-2"
          >
            <i className="fas fa-exclamation-circle mt-0.5 flex-shrink-0" aria-hidden="true"></i>
            <span>{error}</span>
          </div>
        )}
      </div>

    </div>
  );
};

export default PhotoUploadArea;
