import React from 'react';

interface ResponsiveTableProps {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}

/**
 * Responsive Table Wrapper Component
 * Ensures tables are scrollable on mobile and properly displayed on desktop
 */
const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  children, 
  className = '',
  minWidth = '600px'
}) => {
  return (
    <div className={`table-responsive ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div style={{ minWidth }} className="overflow-x-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTable;
