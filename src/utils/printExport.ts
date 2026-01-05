/**
 * Print and Export Utilities
 * Provides reusable functions for printing and exporting data to PDF, CSV, and Excel
 */

export interface PrintOptions {
  title?: string;
  styles?: string;
}

export interface CSVColumn {
  key: string;
  label: string;
}

/**
 * Print the current page or a specific element
 * @param element - Optional element to print. If not provided, prints the entire page
 * @param options - Print options
 */
export const printPage = (element: HTMLElement | null = null, options: PrintOptions = {}): void => {
  const {
    title = 'Document',
    styles = ''
  } = options;

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to print this document.');
    return;
  }

  // Get the content to print
  let content = '';
  if (element) {
    content = element.innerHTML;
  } else {
    // Get the main content area
    const mainContent = document.querySelector('.print-content') || document.body;
    content = mainContent.innerHTML;
  }

  // Build the HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          @media print {
            @page {
              margin: 1cm;
            }
            body {
              font-family: Arial, sans-serif;
              font-size: 12pt;
              line-height: 1.5;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .no-print {
              display: none !important;
            }
            ${styles}
          }
          ${styles}
        </style>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      // Close the window after printing (optional)
      // printWindow.close();
    }, 250);
  };
};

/**
 * Export data to CSV
 * @param data - Array of objects to export
 * @param filename - Name of the file
 * @param columns - Array of column definitions [{key: 'name', label: 'Name'}, ...]
 */
export const exportToCSV = (data: any[], filename: string = 'export.csv', columns: CSVColumn[] | null = null): void => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // If columns not provided, use all keys from first object
  if (!columns) {
    const keys = Object.keys(data[0]);
    columns = keys.map(key => ({ key, label: key }));
  }

  // Build CSV header
  const header = columns.map(col => col.label).join(',');

  // Build CSV rows
  const rows = data.map(item => {
    return columns!.map(col => {
      const value = item[col.key] || '';
      // Escape commas and quotes in values
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  // Combine header and rows
  const csvContent = [header, ...rows].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Export data to Excel (CSV format with .xlsx extension)
 * @param data - Array of objects to export
 * @param filename - Name of the file
 * @param columns - Array of column definitions
 */
export const exportToExcel = (data: any[], filename: string = 'export.xlsx', columns: CSVColumn[] | null = null): void => {
  // For now, we'll use CSV format with .xlsx extension
  // In a real implementation, you might want to use a library like xlsx
  exportToCSV(data, filename.replace('.xlsx', '.csv'), columns);
};

/**
 * Export table to PDF (using browser print functionality)
 * @param element - Element to export
 * @param filename - Name of the file
 * @param options - Export options
 */
export const exportToPDF = (element: HTMLElement | null = null, filename: string = 'export.pdf', options: PrintOptions = {}): void => {
  printPage(element, {
    ...options,
    title: filename.replace('.pdf', '')
  });
};

/**
 * Export data as JSON
 * @param data - Data to export
 * @param filename - Name of the file
 */
export const exportToJSON = (data: any, filename: string = 'export.json'): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Format data for table export
 * @param data - Raw data array
 * @param columns - Column definitions
 * @returns Formatted data array
 */
export const formatDataForExport = (data: any[], columns: CSVColumn[]): any[] => {
  return data.map(item => {
    const formatted: Record<string, any> = {};
    columns.forEach(col => {
      const value = item[col.key];
      // Note: formatter function type would need to be defined if used
      formatted[col.label] = value || '';
    });
    return formatted;
  });
};

