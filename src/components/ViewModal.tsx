import React from 'react';

export interface ViewModalField {
  label?: string;
  name?: string;
  key?: string;
  accessor?: string | ((data: any) => any);
  format?: (value: any, data?: any) => string;
  render?: (value: any, data?: any) => React.ReactNode;
}

interface ViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  data?: any;
  fields?: ViewModalField[];
  renderCustomContent?: ((data: any) => React.ReactNode) | null;
}

/**
 * View Modal Component
 * Generic modal for displaying entity details
 */
const ViewModal: React.FC<ViewModalProps> = ({ 
  isOpen, 
  onClose, 
  title = 'View Details',
  data = {},
  fields = [],
  renderCustomContent = null
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl max-w-2xl w-full h-full sm:h-auto sm:mx-4 sm:my-8 sm:max-h-[90vh] overflow-y-auto modal-responsive">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {renderCustomContent ? (
            renderCustomContent(data)
          ) : (
            <div className="space-y-4">
              {fields.map((field: ViewModalField, index: number) => {
                const value = field.accessor 
                  ? (typeof field.accessor === 'function' ? field.accessor(data) : data[field.accessor])
                  : data[field.key || field.name || ''];
                
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

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewModal;
