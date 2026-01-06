import React, { useState, useEffect, ChangeEvent } from 'react';

interface DateInputProps {
  name: string;
  value?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  className?: string;
  label?: string;
  [key: string]: any;
}

/**
 * Industry-standard DateInput component
 * Supports both manual text input and native date picker
 * Mobile-optimized with proper validation
 */
const DateInput: React.FC<DateInputProps> = ({
  name,
  value,
  onChange,
  placeholder = 'DD/MM/YYYY',
  required = false,
  disabled = false,
  min,
  max,
  className = '',
  label,
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(value || '');
  const [inputType, setInputType] = useState<'text' | 'date'>('text');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Convert DD/MM/YYYY to YYYY-MM-DD for date input value
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    // If already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    // If in DD/MM/YYYY format, convert to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    // If in YYYY-MM-DD format, convert to DD/MM/YYYY
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    // If already in DD/MM/YYYY format, return as is
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    if (value) {
      setInputValue(formatDateForDisplay(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const isValidDateFormat = (str: string): boolean => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(str)) return false;
    
    const [day, month, year] = str.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date instanceof Date && !isNaN(date.getTime()) && 
           date.getDate() === day && 
           date.getMonth() === month - 1 && 
           date.getFullYear() === year;
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    
    let formatted = newValue.replace(/\D/g, '');
    
    // Format as DD/MM/YYYY
    if (formatted.length >= 3) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (formatted.length >= 6) {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5, 9);
    }
    
    setInputValue(formatted);
    
    if (formatted.length === 10 && isValidDateFormat(formatted)) {
      // Convert DD/MM/YYYY to YYYY-MM-DD for the onChange handler
      const [day, month, year] = formatted.split('/');
      const isoDate = `${year}-${month}-${day}`;
      onChange({
        ...e,
        target: {
          ...e.target,
          name,
          value: isoDate
        }
      } as ChangeEvent<HTMLInputElement>);
    } else if (formatted === '') {
      onChange({
        ...e,
        target: {
          ...e.target,
          name,
          value: ''
        }
      } as ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDatePickerChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    // Convert YYYY-MM-DD to DD/MM/YYYY for display
    setInputValue(formatDateForDisplay(newValue));
    onChange(e);
  };

  const handleFocus = (): void => {
    setIsFocused(true);
    if (window.innerWidth < 768) {
      setInputType('date');
    }
  };

  const handleBlur = (): void => {
    setIsFocused(false);
    if (window.innerWidth >= 768) {
      setInputType('text');
    }
  };

  const baseClasses = `
    w-full px-4 py-3 border-2 rounded-md text-base
    transition-all duration-300 bg-white
    min-h-[48px]
    ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
    ${isFocused 
      ? 'border-primary-500 focus:outline-none focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]' 
      : 'border-gray-300 hover:border-gray-400'
    }
    ${className}
  `.trim();

  return (
    <div className="relative">
      {inputType === 'text' && (
        <input
          type="text"
          name={name}
          value={inputValue}
          onChange={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          pattern="\d{2}/\d{2}/\d{4}"
          maxLength={10}
          className={baseClasses}
          {...props}
        />
      )}
      
      {inputType === 'date' && (
        <input
          type="date"
          name={name}
          value={formatDateForInput(value || inputValue)}
          onChange={handleDatePickerChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={baseClasses}
          {...props}
        />
      )}
      
      {!disabled && (
        <button
          type="button"
          onClick={() => {
            setInputType(inputType === 'text' ? 'date' : 'text');
            if (inputType === 'text') {
              setTimeout(() => {
                const dateInput = document.querySelector(`input[name="${name}"][type="date"]`) as HTMLInputElement;
                if (dateInput) {
                  if (dateInput.showPicker) {
                    dateInput.showPicker();
                  } else {
                    dateInput.focus();
                  }
                }
              }, 100);
            }
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-500 transition-colors p-1"
          aria-label="Toggle date picker"
          tabIndex={-1}
        >
          <i className="fas fa-calendar-alt"></i>
        </button>
      )}
    </div>
  );
};

export default DateInput;
