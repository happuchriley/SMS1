import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const TaxReports = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedQuarter, setSelectedQuarter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample tax data
  const taxData = [
    { id: 'STF001', name: 'Mr. John Teacher', grossSalary: 3500, taxAmount: 420, netSalary: 3080, quarter: 'Q1' },
    { id: 'STF002', name: 'Mrs. Jane Principal', grossSalary: 6000, taxAmount: 960, netSalary: 5040, quarter: 'Q1' },
    { id: 'STF003', name: 'Mr. Michael Admin', grossSalary: 2900, taxAmount: 290, netSalary: 2610, quarter: 'Q1' },
    { id: 'STF004', name: 'Ms. Sarah Accountant', grossSalary: 4100, taxAmount: 574, netSalary: 3526, quarter: 'Q1' },
    { id: 'STF005', name: 'Mr. David IT', grossSalary: 3250, taxAmount: 390, netSalary: 2860, quarter: 'Q1' },
  ];

  const years = ['2024', '2023', '2022', '2021'];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

  // Filter tax data
  const filteredTaxData = useMemo(() => {
    return taxData.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesQuarter = !selectedQuarter || item.quarter === selectedQuarter;
      return matchesSearch && matchesQuarter;
    });
  }, [searchTerm, selectedQuarter]);

  // Pagination
  const totalPages = Math.ceil(filteredTaxData.length / itemsPerPage);
  const paginatedTaxData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTaxData.slice(start, start + itemsPerPage);
  }, [filteredTaxData, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: filteredTaxData.length,
      totalGross: filteredTaxData.reduce((sum, t) => sum + t.grossSalary, 0),
      totalTax: filteredTaxData.reduce((sum, t) => sum + t.taxAmount, 0),
      totalNet: filteredTaxData.reduce((sum, t) => sum + t.netSalary, 0),
    };
  }, [filteredTaxData]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedQuarter('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert('Exporting tax report...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Tax Reports</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Tax Reports</span>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Staff</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Gross (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalGross.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Tax (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalTax.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Net (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalNet.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or staff ID..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Quarter</label>
            <select
              value={selectedQuarter}
              onChange={(e) => {
                setSelectedQuarter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Quarters</option>
              {quarters.map(quarter => (
                <option key={quarter} value={quarter}>{quarter}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200">
          {(searchTerm || selectedQuarter) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
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
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Quarter</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Gross Salary (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Tax Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Net Salary (GHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTaxData.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No tax data found.
                  </td>
                </tr>
              ) : (
                paginatedTaxData.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.quarter}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.grossSalary.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{item.taxAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.netSalary.toLocaleString()}</td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTaxData.length)} of {filteredTaxData.length} entries
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

export default TaxReports;
