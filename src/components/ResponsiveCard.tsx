import React from 'react';

interface ResponsiveCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

/**
 * Responsive Card Component
 * Provides consistent responsive padding and spacing
 */
const ResponsiveCard: React.FC<ResponsiveCardProps> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const paddingClasses = {
    sm: 'p-3 sm:p-4 md:p-5',
    md: 'p-4 sm:p-5 md:p-6',
    lg: 'p-5 sm:p-6 md:p-8',
  };

  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-md border border-gray-200 ${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveCard;
