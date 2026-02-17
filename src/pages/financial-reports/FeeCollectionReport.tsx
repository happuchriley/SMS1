import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface FeeCollectionItem {
  id: number;
  date: string;
  studentId: string;
  studentName: string;
  class: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
}

interface FeeCollectionStats {
  total: number;
  totalAmount: number;
  cash: number;
  bank: number;
  mobile: number;
}

const FeeCollectionReport: React.FC = () => {
  const { toast } = useModal();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Sample fee collection data
  const feeCollections: FeeCollectionItem[] = [
    { id: 1, date: '2024-01-15', studentId: 'STU001', studentName: 'John Doe', class: 'Basic 1', amount: 500, paymentMethod: 'Cash', receiptNumber: 'RCP001' },
    { id: 2, date: '2024-01-16', studentId: 'STU002', studentName: 'Jane Smith', class: 'Basic 1', amount: 600, paymentMethod: 'Bank Transfer', receiptNumber: 'RCP002' },
    { id: 3, date: '2024-01-17', studentId: 'STU003', studentName: 'Michael Johnson', class: 'Basic 2', amount: 550, paymentMethod: 'Mobile Money', receiptNumber: 'RCP003' },
    { id: 4, date: '2024-01-18', studentId: 'STU004', studentName: 'Emily Brown', class: 'Basic 1', amount: 700, paymentMethod: 'Cash', receiptNumber: 'RCP004' },
  ];

  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter collections
  const filteredCollections = useMemo<FeeCollectionItem[]>(() => {
    return feeCollections.filter(collection => {
      const matchesDate = (!dateFrom || collection.date >= dateFrom) && (!dateTo || collection.date <= dateTo);
      const matchesClass = !selectedClass || collection.class === selectedClass;
      return matchesDate && matchesClass;
    });
  }, [dateFrom, dateTo, selectedClass, feeCollections]);

  // Pagination
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const paginatedCollections = useMemo<FeeCollectionItem[]>(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCollections.slice(start, start + itemsPerPage);
  }, [filteredCollections, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo<FeeCollectionStats>(() => {
    return {
      total: filteredCollections.length,
      totalAmount: filteredCollections.reduce((sum, c) => sum + c.amount, 0),
      cash: filteredCollections.filter(c => c.paymentMethod === 'Cash').reduce((sum, c) => sum + c.amount, 0),
      bank: filteredCollections.filter(c => c.paymentMethod === 'Bank Transfer').reduce((sum, c) => sum + c.amount, 0),
      mobile: filteredCollections.filter(c => c.paymentMethod === 'Mobile Money').reduce((sum, c) => sum + c.amount, 0),
    };
  }, [filteredCollections]);

  const handleClearFilters = (): void => {
    setDateFrom('');
    setDateTo('');
    setSelectedClass('');
    setCurrentPage(1);
  };

  const handleExport = (): void => {
    toast.showSuccess('Exporting fee collection report...');
  };

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Fee Collection Report</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Fee Collection Report</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Collections</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Amount (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Cash (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.cash.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-600">
            <div className="text-xs text-gray-600 mb-1 font-medium">Bank (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.bank.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-purple-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Mobile Money (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.mobile.toLocaleString()}</div>
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
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(dateFrom || dateTo || selectedClass) && (
              <button
                type="button"
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
            type="button"
            onClick={handleExport}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <i className="fas fa-download mr-1.5"></i> <span className="hidden sm:inline">Export</span>
          </button>
          <button
            type="button"
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Receipt Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedCollections.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No fee collections found.
                  </td>
                </tr>
              ) : (
                paginatedCollections.map(collection => (
                  <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(collection.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{collection.studentId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{collection.studentName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{collection.class}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{collection.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{collection.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{collection.receiptNumber}</td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCollections.length)} of {filteredCollections.length} entries
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
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

export default FeeCollectionReport;

