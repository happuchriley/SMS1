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
  placeholder = 'YYYY-MM-DD',
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

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isValidDateFormat = (str: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(str)) return false;
    
    const date = new Date(str);
    return date instanceof Date && !isNaN(date.getTime()) && 
           str === formatDate(date.toISOString());
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const newValue = e.target.value;
    
    let formatted = newValue.replace(/\D/g, '');
    
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
    }
    if (formatted.length >= 8) {
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7, 9);
    }
    
    setInputValue(formatted);
    
    if (formatted.length === 10 && isValidDateFormat(formatted)) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name,
          value: formatted
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
    setInputValue(newValue);
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
          pattern="\d{4}-\d{2}-\d{2}"
          maxLength={10}
          className={baseClasses}
          {...props}
        />
      )}
      
      {inputType === 'date' && (
        <input
          type="date"
          name={name}
          value={inputValue}
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
