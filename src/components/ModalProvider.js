/**
 * Modal Provider Context
 * Global state management for modals
 */
import React, { createContext, useContext, useState } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';
import ViewModal from './ViewModal';
import EditModal from './EditModal';
import { ToastContainer, useToast } from './Toast';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [deleteModal, setDeleteModal] = useState({ isOpen: false });
  const [viewModal, setViewModal] = useState({ isOpen: false });
  const [editModal, setEditModal] = useState({ isOpen: false });
  const toast = useToast();

  const showDeleteModal = (config) => {
    setDeleteModal({ isOpen: true, ...config });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ isOpen: false });
  };

  const showViewModal = (config) => {
    setViewModal({ isOpen: true, ...config });
  };

  const hideViewModal = () => {
    setViewModal({ isOpen: false });
  };

  const showEditModal = (config) => {
    setEditModal({ isOpen: true, ...config });
  };

  const hideEditModal = () => {
    setEditModal({ isOpen: false });
  };

  const value = {
    showDeleteModal,
    hideDeleteModal,
    showViewModal,
    hideViewModal,
    showEditModal,
    hideEditModal,
    toast
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={hideDeleteModal}
        onConfirm={async () => {
          if (deleteModal.onConfirm) {
            try {
              await deleteModal.onConfirm();
              hideDeleteModal();
            } catch (error) {
              console.error('Delete error:', error);
            }
          }
        }}
        title={deleteModal.title}
        message={deleteModal.message}
        itemName={deleteModal.itemName}
        isLoading={deleteModal.isLoading}
      />
      <ViewModal
        isOpen={viewModal.isOpen}
        onClose={hideViewModal}
        title={viewModal.title}
        data={viewModal.data}
        fields={viewModal.fields}
        renderCustomContent={viewModal.renderCustomContent}
      />
      <EditModal
        isOpen={editModal.isOpen}
        onClose={hideEditModal}
        onSave={async (data) => {
          if (editModal.onSave) {
            try {
              await editModal.onSave(data);
              hideEditModal();
            } catch (error) {
              console.error('Save error:', error);
            }
          }
        }}
        title={editModal.title}
        data={editModal.data}
        fields={editModal.fields}
        validation={editModal.validation}
        isLoading={editModal.isLoading}
      />
      <ToastContainer toasts={toast.toasts} removeToast={toast.removeToast} />
    </ModalContext.Provider>
  );
};

export default ModalProvider;

