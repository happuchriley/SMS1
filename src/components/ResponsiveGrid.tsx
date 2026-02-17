import React from 'react';

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: 2 | 3 | 4 | 6;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Responsive Grid Component
 * Provides consistent grid layouts across breakpoints
 */
const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({ 
  children, 
  cols = 3,
  gap = 'md',
  className = ''
}) => {
  const gridClasses = {
    2: 'grid grid-cols-1 sm:grid-cols-2',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
  };

  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
  };

  return (
    <div className={`${gridClasses[cols]} ${gapClasses[gap]} ${className}`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
