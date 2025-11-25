import React, { useState, useRef, useCallback, useEffect } from 'react';

const PhotoUploadModal = ({ isOpen, onClose, onImageSelect, currentPreview }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const fileInputRef = useRef(null);

  // Update preview when modal opens with current preview
  useEffect(() => {
    if (isOpen) {
      setPreview(currentPreview || null);
    }
  }, [isOpen, currentPreview]);

  // Handle window resize for responsive aspect ratio
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFile = useCallback((file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file, reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageSelect]);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect(null, null);
  }, [onImageSelect]);

  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center sm:items-center items-end p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="photo-upload-title"
    >
      <div 
        className="bg-white rounded-t-2xl sm:rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <h2 id="photo-upload-title" className="text-xl sm:text-2xl font-bold text-gray-900">Upload Photo</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-all duration-200 hover:rotate-90 min-w-[2rem] min-h-[2rem] sm:min-w-[2.5rem] sm:min-h-[2.5rem]"
            aria-label="Close modal"
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 -webkit-overflow-scrolling-touch">
          {/* Drop Zone / Preview Area */}
          <div
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              border-2 border-dashed rounded-lg transition-all duration-300
              ${isDragging 
                ? 'border-primary bg-primary-50 scale-[1.02]' 
                : 'border-gray-300 hover:border-primary/50'
              }
              ${preview 
                ? 'p-2 sm:p-4' 
                : 'p-8 sm:p-12 md:p-16'
              }
              flex flex-col items-center justify-center
              min-h-[200px] sm:min-h-[250px] md:min-h-[300px]
              cursor-pointer
            `}
            onClick={!preview ? handleSelectClick : undefined}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {preview ? (
              <div className="relative w-full">
                {/* Image Preview - Responsive Rectangle/Box */}
                <div 
                  className="relative mx-auto w-full max-w-full"
                  style={{
                    aspectRatio: isMobile ? '1/1' : '4/3',
                  }}
                >
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg shadow-lg"
                  />
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center gap-3 opacity-0 hover:opacity-100">
                    <button
                      onClick={handleSelectClick}
                      className="px-4 py-2 bg-white text-gray-900 rounded-md font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      Change
                    </button>
                    <button
                      onClick={handleRemove}
                      className="px-4 py-2 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <i className="fas fa-trash mr-2"></i>
                      Remove
                    </button>
                  </div>
                </div>
                
                {/* Mobile-friendly action buttons (always visible on mobile) */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4 sm:hidden">
                  <button
                    onClick={handleSelectClick}
                    className="flex-1 px-4 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors shadow-md"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Change Photo
                  </button>
                  <button
                    onClick={handleRemove}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-md font-semibold hover:bg-red-600 transition-colors shadow-md"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Upload Icon */}
                <div className={`mb-4 sm:mb-6 ${isDragging ? 'scale-110' : ''} transition-transform`}>
                  <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center">
                    <i className="fas fa-cloud-upload-alt text-primary text-2xl sm:text-3xl md:text-4xl"></i>
                  </div>
                </div>

                {/* Upload Text */}
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {isDragging ? 'Drop image here' : 'Drag & drop your photo'}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4">
                    or click to browse
                  </p>
                  <button
                    onClick={handleSelectClick}
                    className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <i className="fas fa-folder-open mr-2"></i>
                    Select Photo
                  </button>
                </div>

                {/* Supported formats */}
                <p className="text-xs sm:text-sm text-gray-500 mt-4">
                  Supports: JPG, PNG, GIF (Max 5MB)
                </p>
              </>
            )}
          </div>

        </div>
        
        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row gap-3 p-4 sm:p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-3 bg-gray-100 text-gray-900 rounded-md font-semibold hover:bg-gray-200 transition-colors min-h-[48px] sm:min-h-auto"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (preview) {
                onClose();
              } else {
                handleSelectClick();
              }
            }}
            className="flex-1 sm:flex-none px-6 py-3 rounded-md font-semibold transition-colors bg-primary-500 text-white hover:bg-primary-700 shadow-md hover:shadow-lg min-h-[48px] sm:min-h-auto"
            type="button"
          >
            {preview ? 'Done' : 'Select Photo'}
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadModal;

