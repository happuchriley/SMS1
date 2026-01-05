/**
 * Toast Notification Component
 * Displays temporary success/error/info messages
 */
import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for fade out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors: Record<ToastType, string> = {
    success: 'bg-primary-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-500',
    info: 'bg-primary-500'
  };

  const icons: Record<ToastType, string> = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] ${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in-right`}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <i className={`fas ${icons[type]} text-xl`}></i>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) setTimeout(onClose, 300);
        }}
        className="ml-2 text-white hover:text-gray-200"
        type="button"
      >
        <i className="fas fa-times"></i>
      </button>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration: number;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: number) => void;
}

// Toast Container - manages multiple toasts
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

interface UseToastReturn {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: number) => void;
  showSuccess: (msg: string, dur?: number) => void;
  showError: (msg: string, dur?: number) => void;
  showWarning: (msg: string, dur?: number) => void;
  showInfo: (msg: string, dur?: number) => void;
}

// Hook for using toast
export const useToast = (): UseToastReturn => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    showToast,
    removeToast,
    showSuccess: (msg: string, dur?: number) => showToast(msg, 'success', dur),
    showError: (msg: string, dur?: number) => showToast(msg, 'error', dur),
    showWarning: (msg: string, dur?: number) => showToast(msg, 'warning', dur),
    showInfo: (msg: string, dur?: number) => showToast(msg, 'info', dur)
  };
};

export default Toast;

