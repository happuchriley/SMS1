import React from 'react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

/**
 * Delete Confirmation Modal
 * Reusable modal for confirming delete operations
 */
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  itemName = '',
  isLoading = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 p-4 sm:p-6">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-xl max-w-md w-full sm:mx-4 modal-responsive">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 text-center mb-4">
            {message}
          </p>
          
          {itemName && (
            <p className="text-sm font-medium text-gray-900 text-center mb-4">
              <span className="text-red-600">{itemName}</span>
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash mr-2"></i>
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
