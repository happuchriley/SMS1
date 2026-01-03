import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const OtherFeeRange = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedFeeType, setSelectedFeeType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample other fee data
  const otherFees = [
    { id: 1, date: '2024-01-15', studentId: 'STU001', studentName: 'John Doe', feeType: 'Library Fine', amount: 50, paymentMethod: 'Cash', receiptNumber: 'RCP001' },
    { id: 2, date: '2024-01-16', studentId: 'STU002', studentName: 'Jane Smith', feeType: 'Late Registration', amount: 100, paymentMethod: 'Cash', receiptNumber: 'RCP002' },
    { id: 3, date: '2024-01-17', studentId: 'STU003', studentName: 'Michael Johnson', feeType: 'ID Card Replacement', amount: 30, paymentMethod: 'Mobile Money', receiptNumber: 'RCP003' },
    { id: 4, date: '2024-01-20', studentId: 'STU004', studentName: 'Emily Brown', feeType: 'Library Fine', amount: 50, paymentMethod: 'Cash', receiptNumber: 'RCP004' },
  ];

  const feeTypes = ['All Types', 'Library Fine', 'Late Registration', 'Examination Retake', 'ID Card Replacement'];

  // Filter fees
  const filteredFees = useMemo(() => {
    let fees = [...otherFees];
    
    if (selectedFeeType && selectedFeeType !== 'All Types') {
      fees = fees.filter(fee => fee.feeType === selectedFeeType);
    }
    
    if (dateFrom) {
      fees = fees.filter(fee => fee.date >= dateFrom);
    }
    
    if (dateTo) {
      fees = fees.filter(fee => fee.date <= dateTo);
    }
    
    return fees;
  }, [selectedFeeType, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const paginatedFees = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFees.slice(start, start + itemsPerPage);
  }, [filteredFees, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredFees.length,
      totalAmount: filteredFees.reduce((sum, f) => sum + f.amount, 0),
    };
  }, [filteredFees]);

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedFeeType('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert('Exporting other fees report by date range...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Other Fee - Range</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Other Fee - Range</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Fees</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Amount (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Fee Type</label>
            <select
              value={selectedFeeType}
              onChange={(e) => {
                setSelectedFeeType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {feeTypes.map(type => (
                <option key={type} value={type === 'All Types' ? '' : type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(dateFrom || dateTo || selectedFeeType) && (
              <button
                onClick={handleClearFilters}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-times mr-1.5"></i> Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 pt-4 mt-4 border-t border-gray-200">
          <button
            onClick={handleExport}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-download mr-1.5"></i> <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handlePrint}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-print mr-1.5"></i> <span className="hidden sm:inline">Print</span>
          </button>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-primary-500"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Fee Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Receipt Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedFees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No other fees found for the selected date range.
                  </td>
                </tr>
              ) : (
                paginatedFees.map(fee => (
                  <tr key={fee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(fee.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fee.studentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{fee.studentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fee.feeType}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{fee.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fee.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{fee.receiptNumber}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredFees.length)} of {filteredFees.length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OtherFeeRange;
