import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';

export interface EditModalField {
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: string[] | Array<{ value: string; label: string }>;
  rows?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
}

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void | Promise<void>;
  title?: string;
  data?: any;
  fields?: EditModalField[];
  validation?: { [key: string]: (value: any, formData: any) => string | null };
  isLoading?: boolean;
}

/**
 * Edit Modal Component
 * Generic modal for editing entity data with form
 */
const EditModal: React.FC<EditModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  title = 'Edit',
  data = {},
  fields = [],
  validation = {},
  isLoading = false
}) => {
  const [formData, setFormData] = useState<any>(data);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormData(data);
      setErrors({});
    }
  }, [isOpen, data]);

  const handleChange = (name: string, value: any): void => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    fields.forEach(field => {
      const value = formData[field.name];
      
      if (field.required && (!value || value === '')) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }

      if (validation[field.name]) {
        const error = validation[field.name](value, formData);
        if (error) {
          newErrors[field.name] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (validate() && onSave) {
      await onSave(formData);
    }
  };

  if (!isOpen) return null;

  const renderField = (field: EditModalField): React.ReactNode => {
    const value = formData[field.name] || '';
    const error = errors[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              name={field.name}
              value={value}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange(field.name, e.target.value)}
              rows={field.rows || 4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
              disabled={field.disabled || isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                name={field.name}
                value={value}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => handleChange(field.name, e.target.value)}
                className={`select-dropdown w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={field.disabled || isLoading}
              >
                {field.placeholder && <option value="">{field.placeholder}</option>}
                {field.options?.map(opt => (
                  <option key={typeof opt === 'object' ? opt.value : opt} value={typeof opt === 'object' ? opt.value : opt}>
                    {typeof opt === 'object' ? opt.label : opt}
                  </option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                name={field.name}
                checked={!!value}
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(field.name, e.target.checked)}
                className="mr-2"
                disabled={field.disabled || isLoading}
              />
              <span className="text-sm font-medium text-gray-700">
                {field.label || field.name}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );

      default:
        return (
          <div key={field.name} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type || 'text'}
              name={field.name}
              value={value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleChange(field.name, e.target.value)}
              className={`w-full px-3 py-2 sm:px-4 sm:py-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[44px] ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={field.placeholder}
              disabled={field.disabled || isLoading}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto p-0 sm:p-4">
      <div className="bg-white rounded-none sm:rounded-lg shadow-xl max-w-2xl w-full h-full sm:h-auto sm:mx-4 sm:my-8 sm:max-h-[90vh] overflow-y-auto modal-responsive">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4 sm:p-6">
            {fields.map(field => renderField(field))}
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 sm:px-5 sm:py-2.5 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] w-full sm:w-auto"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditModal;
