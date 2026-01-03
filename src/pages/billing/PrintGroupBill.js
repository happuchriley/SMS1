import React, { useState, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { printPage, exportToCSV } from '../../utils/printExport';

const PrintGroupBill = () => {
  const printRef = useRef(null);
  const [formData, setFormData] = useState({
    academicYear: '',
    term: '',
    class: '',
    billStatus: 'all'
  });

  const [selectedBills, setSelectedBills] = useState([]);

  // Sample data
  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter bills
  const filteredBills = useMemo(() => {
    // Sample bills - in real app, this would come from API
    const allBills = [
      { id: 'BL001', studentId: 'STU001', studentName: 'John Doe', class: 'Basic 1', billDate: '2024-01-15', dueDate: '2024-02-15', amount: 1000, status: 'Pending' },
      { id: 'BL002', studentId: 'STU002', studentName: 'Jane Smith', class: 'Basic 1', billDate: '2024-01-15', dueDate: '2024-02-15', amount: 1200, status: 'Pending' },
      { id: 'BL003', studentId: 'STU003', studentName: 'Michael Johnson', class: 'Basic 1', billDate: '2024-01-20', dueDate: '2024-02-20', amount: 1000, status: 'Paid' },
      { id: 'BL004', studentId: 'STU004', studentName: 'Emily Brown', class: 'Basic 1', billDate: '2024-01-15', dueDate: '2024-02-15', amount: 1500, status: 'Pending' },
      { id: 'BL005', studentId: 'STU005', studentName: 'David Wilson', class: 'Basic 1', billDate: '2024-01-25', dueDate: '2024-02-25', amount: 1200, status: 'Partial' },
    ];
    
    let bills = allBills.filter(bill => bill.class === formData.class);
    
    if (formData.billStatus !== 'all') {
      bills = bills.filter(bill => bill.status.toLowerCase() === formData.billStatus.toLowerCase());
    }
    
    return bills;
  }, [formData.class, formData.billStatus]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'class' || e.target.name === 'billStatus') {
      setSelectedBills([]);
    }
  };

  const handleBillToggle = (billId) => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        return prev.filter(id => id !== billId);
      } else {
        return [...prev, billId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedBills.length === filteredBills.length) {
      setSelectedBills([]);
    } else {
      setSelectedBills(filteredBills.map(b => b.id));
    }
  };

  const handlePrint = () => {
    const billsToPrint = selectedBills.length > 0 
      ? filteredBills.filter(b => selectedBills.includes(b.id))
      : filteredBills;

    if (billsToPrint.length === 0) {
      alert('No bills selected for printing.');
      return;
    }

    const element = printRef.current;
    if (element) {
      printPage(element, {
        title: `Group Bills - ${formData.class || 'All Classes'}`,
        styles: `
          .bill-header { text-align: center; margin-bottom: 20px; }
          .bill-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
          .bill-info { font-size: 12pt; color: #666; }
        `
      });
    } else {
      window.print();
    }
  };

  const handlePreview = () => {
    const billsToPreview = selectedBills.length > 0 
      ? filteredBills.filter(b => selectedBills.includes(b.id))
      : filteredBills;

    if (billsToPreview.length === 0) {
      alert('No bills selected for preview.');
      return;
    }

    const element = printRef.current;
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Preview - Group Bills</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleExport = () => {
    const billsToExport = selectedBills.length > 0 
      ? filteredBills.filter(b => selectedBills.includes(b.id))
      : filteredBills;

    if (billsToExport.length === 0) {
      alert('No bills selected for export.');
      return;
    }

    const columns = [
      { key: 'studentName', label: 'Student Name' },
      { key: 'class', label: 'Class' },
      { key: 'billDate', label: 'Bill Date' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' }
    ];
    
    exportToCSV(billsToExport, `group-bills-${formData.class || 'all'}-${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Print Group Bill</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Print Group Bill</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Select Bills to Print</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              name="academicYear"
              value={formData.academicYear}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">Select Academic Year</option>
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Term <span className="text-red-500">*</span>
            </label>
            <select
              name="term"
              value={formData.term}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">Select Term</option>
              {terms.map(term => (
                <option key={term} value={term}>{term}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Class <span className="text-red-500">*</span>
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Bill Status
            </label>
            <select
              name="billStatus"
              value={formData.billStatus}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        {filteredBills.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
            <button
              onClick={handlePreview}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
            >
              <i className="fas fa-eye mr-2"></i>Preview
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
            >
              <i className="fas fa-download mr-2"></i>Export PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-print mr-2"></i>Print Bills
            </button>
          </div>
        )}
      </div>

      {/* Bills List */}
      {filteredBills.length > 0 && (
        <div ref={printRef} className="bg-white rounded-lg shadow-md border border-gray-200 print-content">
          <div className="bill-header p-4 border-b border-gray-200">
            <div className="bill-title">Group Bills</div>
            <div className="bill-info">
              {formData.academicYear && `Academic Year: ${formData.academicYear}`}
              {formData.term && ` | Term: ${formData.term}`}
              {formData.class && ` | Class: ${formData.class}`}
            </div>
          </div>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Bills ({filteredBills.length})
            </h2>
            <button
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
            >
              {selectedBills.length === filteredBills.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedBills.length === filteredBills.length && filteredBills.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount (GHS)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBills.map(bill => (
                  <tr key={bill.id} className={selectedBills.includes(bill.id) ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedBills.includes(bill.id)}
                        onChange={() => handleBillToggle(bill.id)}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{bill.studentName}</div>
                        <div className="text-gray-500 text-xs">{bill.studentId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(bill.billDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{bill.amount.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        bill.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bill.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedBills.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-primary-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>{selectedBills.length}</strong> bill(s) selected for printing
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default PrintGroupBill;
