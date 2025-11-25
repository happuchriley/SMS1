import React from 'react';

const PhotoPreviewCard = ({ preview, onRemove, onEdit, fileName }) => {
  if (!preview) return null;

  return (
    <div className="mt-4 bg-white rounded-lg border-2 border-gray-200 p-4 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
        {/* Image Preview */}
        <div className="relative flex-shrink-0">
          <div 
            className="overflow-hidden rounded-lg border-2 border-gray-200 shadow-md"
            style={{
              width: '120px',
              height: '120px',
              minWidth: '120px',
            }}
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onRemove}
            className="absolute -top-2 -right-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm hover:bg-red-600 transition-colors shadow-lg hover:scale-110 transform transition-transform"
            title="Remove image"
            aria-label="Remove image"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Info and Actions */}
        <div className="flex-1 w-full sm:w-auto min-w-0">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Selected Photo</h4>
            {fileName && (
              <p className="text-xs sm:text-sm text-gray-600 truncate" title={fileName}>
                <i className="fas fa-file-image mr-1"></i>
                {fileName}
              </p>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={onEdit}
              className="flex-1 sm:flex-none px-4 py-2 text-sm bg-gray-100 text-gray-900 rounded-md font-medium hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-edit mr-2"></i>
              Change
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoPreviewCard;

