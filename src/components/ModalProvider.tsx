/**
 * Modal Provider Context
 * Global state management for modals
 */
import React, { createContext, useContext, useState, ReactNode } from 'react';
import DeleteConfirmModal from './DeleteConfirmModal';
import ViewModal, { ViewModalField } from './ViewModal';
import EditModal, { EditModalField } from './EditModal';
import { ToastContainer, useToast } from './Toast';

interface DeleteModalConfig {
  isOpen: boolean;
  onConfirm?: () => void | Promise<void>;
  title?: string;
  message?: string;
  itemName?: string;
  isLoading?: boolean;
}

interface ViewModalConfig {
  isOpen: boolean;
  title?: string;
  data?: Record<string, any>;
  fields?: ViewModalField[];
  renderCustomContent?: ((data: any) => React.ReactNode) | null;
}

interface EditModalConfig {
  isOpen: boolean;
  onSave?: (data: Record<string, any>) => void | Promise<void>;
  title?: string;
  data?: Record<string, any>;
  fields?: EditModalField[];
  validation?: Record<string, (value: any, formData: Record<string, any>) => string | null>;
  isLoading?: boolean;
}

interface ModalContextType {
  showDeleteModal: (config: Omit<DeleteModalConfig, 'isOpen'>) => void;
  hideDeleteModal: () => void;
  showDeleteConfirm: (title: string, message: string) => Promise<boolean>;
  showViewModal: (config: Omit<ViewModalConfig, 'isOpen'>) => void;
  hideViewModal: () => void;
  showEditModal: (config: Omit<EditModalConfig, 'isOpen'>) => void;
  hideEditModal: () => void;
  toast: ReturnType<typeof useToast>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
};

interface ModalProviderProps {
  children: ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const [deleteModal, setDeleteModal] = useState<DeleteModalConfig>({ isOpen: false });
  const [viewModal, setViewModal] = useState<ViewModalConfig>({ isOpen: false });
  const [editModal, setEditModal] = useState<EditModalConfig>({ isOpen: false });
  const deleteConfirmResolveRef = React.useRef<((value: boolean) => void) | null>(null);
  const toast = useToast();

  const showDeleteModal = (config: Omit<DeleteModalConfig, 'isOpen'>) => {
    setDeleteModal({ isOpen: true, ...config });
  };

  const hideDeleteModal = () => {
    if (deleteConfirmResolveRef.current) {
      deleteConfirmResolveRef.current(false);
      deleteConfirmResolveRef.current = null;
    }
    setDeleteModal({ isOpen: false });
  };

  const showDeleteConfirm = (title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      deleteConfirmResolveRef.current = resolve;
      setDeleteModal({
        isOpen: true,
        title,
        message,
        onConfirm: () => {
          if (deleteConfirmResolveRef.current) {
            deleteConfirmResolveRef.current(true);
            deleteConfirmResolveRef.current = null;
          }
          setDeleteModal({ isOpen: false });
        },
        isLoading: false
      });
    });
  };

  const showViewModal = (config: Omit<ViewModalConfig, 'isOpen'>) => {
    setViewModal({ isOpen: true, ...config });
  };

  const hideViewModal = () => {
    setViewModal({ isOpen: false });
  };

  const showEditModal = (config: Omit<EditModalConfig, 'isOpen'>) => {
    setEditModal({ isOpen: true, ...config });
  };

  const hideEditModal = () => {
    setEditModal({ isOpen: false });
  };

  const value: ModalContextType = {
    showDeleteModal,
    hideDeleteModal,
    showDeleteConfirm,
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

