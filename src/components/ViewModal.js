/**
 * View Modal Component
 * Generic modal for displaying entity details
 */
import React from 'react';

const ViewModal = ({ 
  isOpen, 
  onClose, 
  title = 'View Details',
  data = {},
  fields = [],
  renderCustomContent = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {renderCustomContent ? (
            renderCustomContent(data)
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => {
                const value = field.accessor 
                  ? (typeof field.accessor === 'function' ? field.accessor(data) : data[field.accessor])
                  : data[field.key || field.name];
                
                const displayValue = field.format 
                  ? field.format(value, data)
                  : (value !== null && value !== undefined ? String(value) : '-');

                return (
                  <div key={index} className="border-b border-gray-100 pb-3">
                    <div className="text-sm font-medium text-gray-500 mb-1">
                      {field.label || field.name}
                    </div>
                    <div className="text-base text-gray-900">
                      {field.render ? field.render(value, data) : displayValue}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;

