import React, { useState, useRef, useCallback, useEffect, DragEvent, ChangeEvent, KeyboardEvent } from 'react';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MIN_IMAGE_DIMENSIONS = { width: 100, height: 100 };
const MAX_IMAGE_DIMENSIONS = { width: 4000, height: 4000 };

interface PhotoUploadAreaProps {
  onImageSelect: (file: File | null, preview: string | null) => void;
  currentPreview?: string | null;
  maxSize?: number;
  allowedTypes?: string[];
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

interface ValidationResult {
  valid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}

const PhotoUploadArea: React.FC<PhotoUploadAreaProps> = ({ 
  onImageSelect, 
  currentPreview,
  maxSize = MAX_FILE_SIZE,
  allowedTypes = ALLOWED_FILE_TYPES,
  label = 'Photo Upload',
  required = false,
  disabled = false,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [preview, setPreview] = useState<string | null>(currentPreview || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (currentPreview !== undefined) {
      setPreview(currentPreview);
      if (!currentPreview) {
        setError(null);
      }
    }
  }, [currentPreview]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('data:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const formatFileSize = useCallback((bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const validateFileType = useCallback((file: File): ValidationResult => {
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

  const validateFileSize = useCallback((file: File): ValidationResult => {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${formatFileSize(maxSize)}. Please choose a smaller file.`
      };
    }
    return { valid: true };
  }, [maxSize, formatFileSize]);

  const validateImageDimensions = useCallback((file: File): Promise<ValidationResult> => {
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

  const compressImage = useCallback((file: File, dimensions: { width: number; height: number }): Promise<File> => {
    return new Promise((resolve, reject) => {
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
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

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
                resolve(file);
              }
            },
            file.type,
            0.85
          );
        };
        img.onerror = () => reject(new Error('Failed to load image for compression'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  const handleFile = useCallback(async (file: File | null): Promise<void> => {
    if (!file) return;

    setError(null);
    setIsLoading(true);

    try {
      const typeValidation = validateFileType(file);
      if (!typeValidation.valid) {
        setError(typeValidation.error || 'Invalid file type');
        setIsLoading(false);
        return;
      }

      const sizeValidation = validateFileSize(file);
      if (!sizeValidation.valid) {
        setError(sizeValidation.error || 'File too large');
        setIsLoading(false);
        return;
      }

      const dimensionValidation = await validateImageDimensions(file);
      if (!dimensionValidation.valid) {
        setError(dimensionValidation.error || 'Invalid image dimensions');
        setIsLoading(false);
        return;
      }

      const finalFile = await compressImage(file, dimensionValidation.dimensions!);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setIsLoading(false);
        onImageSelect(finalFile, reader.result as string);
      };
      
      reader.onerror = () => {
        setError('Error reading file. Please try again.');
        setIsLoading(false);
      };
      
      reader.readAsDataURL(finalFile);
    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the image.');
      setIsLoading(false);
    }
  }, [validateFileType, validateFileSize, validateImageDimensions, compressImage, onImageSelect]);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile, disabled]);

  const handleFileInputChange = useCallback((e: ChangeEvent<HTMLInputElement>): void => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleSelectClick = useCallback((): void => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback((): void => {
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

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>): void => {
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
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
            ${!preview && !disabled ? 'cursor-pointer' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${isDragging 
              ? 'border-primary-500 bg-primary-50 scale-[1.02] shadow-lg' 
              : preview
                ? 'border-gray-300'
                : 'border-gray-300 hover:border-primary-500/50 bg-gray-50 focus:border-primary-500'
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
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-xs text-gray-600">Processing...</p>
            </div>
          ) : preview ? (
            <>
              <img
                ref={imageRef}
                src={preview}
                alt="Preview"
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                loading="lazy"
              />
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
              <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                <i className="fas fa-check-circle" aria-hidden="true"></i>
                <span>Photo</span>
              </div>
            </>
          ) : (
            <>
              <div className={`mb-3 ${isDragging ? 'scale-110' : ''} transition-transform`}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-500/10 flex items-center justify-center">
                  <i className="fas fa-camera text-primary-500 text-xl sm:text-2xl" aria-hidden="true"></i>
                </div>
              </div>

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

