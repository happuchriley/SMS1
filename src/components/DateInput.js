import React, { useState, useEffect } from 'react';

/**
 * Industry-standard DateInput component
 * Supports both manual text input and native date picker
 * Mobile-optimized with proper validation
 */
const DateInput = ({
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
  const [inputValue, setInputValue] = useState(value || '');
  const [inputType, setInputType] = useState('text'); // Start with text for manual input
  const [isFocused, setIsFocused] = useState(false);

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Format date to YYYY-MM-DD
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return as-is if invalid
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Validate date format (YYYY-MM-DD)
  const isValidDateFormat = (str) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(str)) return false;
    
    const date = new Date(str);
    return date instanceof Date && !isNaN(date.getTime()) && 
           str === formatDate(date.toISOString());
  };

  const handleTextChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Auto-format as user types
    let formatted = newValue.replace(/\D/g, ''); // Remove non-digits
    
    // Add dashes automatically
    if (formatted.length >= 5) {
      formatted = formatted.slice(0, 4) + '-' + formatted.slice(4);
    }
    if (formatted.length >= 8) {
      formatted = formatted.slice(0, 7) + '-' + formatted.slice(7, 9);
    }
    
    setInputValue(formatted);
    
    // Validate and call onChange if valid
    if (formatted.length === 10 && isValidDateFormat(formatted)) {
      onChange({
        target: {
          name,
          value: formatted
        }
      });
    } else if (formatted === '') {
      onChange({
        target: {
          name,
          value: ''
        }
      });
    }
  };

  const handleDatePickerChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(e);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Switch to date picker on mobile for better UX
    if (window.innerWidth < 768) {
      setInputType('date');
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Switch back to text after blur for desktop to allow manual editing
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
      {/* Text input for manual entry (desktop) */}
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
      
      {/* Date picker (mobile or when focused) */}
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
      
      {/* Calendar icon button for switching to date picker */}
      {!disabled && (
        <button
          type="button"
          onClick={() => {
            setInputType(inputType === 'text' ? 'date' : 'text');
            if (inputType === 'text') {
              // Focus the date input after switching
              setTimeout(() => {
                const dateInput = document.querySelector(`input[name="${name}"][type="date"]`);
                dateInput?.showPicker?.() || dateInput?.focus();
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






