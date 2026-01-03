import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ExpenditureReport = () => {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample expenditure data
  const expenditures = [
    { id: 1, date: '2024-01-15', category: 'Salaries', description: 'Staff salaries for January', amount: 50000, paymentMethod: 'Bank Transfer', reference: 'REF001' },
    { id: 2, date: '2024-01-16', category: 'Utilities', description: 'Electricity bill', amount: 5000, paymentMethod: 'Bank Transfer', reference: 'REF002' },
    { id: 3, date: '2024-01-17', category: 'Maintenance', description: 'Building repairs', amount: 3000, paymentMethod: 'Cash', reference: 'REF003' },
    { id: 4, date: '2024-01-18', category: 'Stationery', description: 'Office supplies', amount: 2000, paymentMethod: 'Cash', reference: 'REF004' },
    { id: 5, date: '2024-01-20', category: 'Transportation', description: 'Fuel for school bus', amount: 1500, paymentMethod: 'Cash', reference: 'REF005' },
  ];

  const categories = ['All Categories', 'Salaries', 'Utilities', 'Maintenance', 'Stationery', 'Transportation', 'Communication', 'Insurance', 'Rent', 'Other Expenses'];

  // Filter expenditures
  const filteredExpenditures = useMemo(() => {
    let expenses = [...expenditures];
    
    if (selectedCategory && selectedCategory !== 'All Categories') {
      expenses = expenses.filter(e => e.category === selectedCategory);
    }
    
    if (dateFrom) {
      expenses = expenses.filter(e => e.date >= dateFrom);
    }
    
    if (dateTo) {
      expenses = expenses.filter(e => e.date <= dateTo);
    }
    
    return expenses;
  }, [selectedCategory, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenditures.length / itemsPerPage);
  const paginatedExpenditures = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredExpenditures.slice(start, start + itemsPerPage);
  }, [filteredExpenditures, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredExpenditures.length,
      totalAmount: filteredExpenditures.reduce((sum, e) => sum + e.amount, 0),
      byCategory: filteredExpenditures.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      }, {}),
    };
  }, [filteredExpenditures]);

  const handleClearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert('Exporting expenditure report...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Expenditure Report</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Expenditure Report</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Expenses</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
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
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            {(dateFrom || dateTo || selectedCategory) && (
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Payment Method</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedExpenditures.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No expenditures found.
                  </td>
                </tr>
              ) : (
                paginatedExpenditures.map(expenditure => (
                  <tr key={expenditure.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(expenditure.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{expenditure.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{expenditure.description}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{expenditure.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{expenditure.paymentMethod}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{expenditure.reference}</td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredExpenditures.length)} of {filteredExpenditures.length} entries
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

export default ExpenditureReport;
