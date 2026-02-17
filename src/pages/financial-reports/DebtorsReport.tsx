import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface DebtorItem {
  id: string;
  name: string;
  class: string;
  billNumber: string;
  billDate: string;
  dueDate: string;
  billAmount: number;
  paidAmount: number;
  balance: number;
  daysOverdue: number;
}

interface DebtorStats {
  total: number;
  totalBalance: number;
  totalBillAmount: number;
  totalPaid: number;
}

const FinancialReportsDebtorsReport: React.FC = () => {
  const { toast } = useModal();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Sample data
  const debtors: DebtorItem[] = useMemo(() => [
    { id: 'STU001', name: 'John Doe', class: 'Basic 1', billNumber: 'BL001', billDate: '2024-01-15', dueDate: '2024-02-15', billAmount: 1000, paidAmount: 400, balance: 600, daysOverdue: 10 },
    { id: 'STU002', name: 'Jane Smith', class: 'Basic 2', billNumber: 'BL002', billDate: '2024-01-15', dueDate: '2024-02-15', billAmount: 1200, paidAmount: 500, balance: 700, daysOverdue: 5 },
  ], []);

  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter debtors
  const filteredDebtors = useMemo<DebtorItem[]>(() => {
    return debtors.filter(debtor => {
      const matchesSearch = 
        debtor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debtor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        debtor.billNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = !selectedClass || debtor.class === selectedClass;
      
      let matchesDate = true;
      if (dateFrom && debtor.billDate < dateFrom) matchesDate = false;
      if (dateTo && debtor.billDate > dateTo) matchesDate = false;
      
      return matchesSearch && matchesClass && matchesDate;
    });
  }, [searchTerm, selectedClass, dateFrom, dateTo, debtors]);

  // Pagination
  const totalPages = Math.ceil(filteredDebtors.length / itemsPerPage);
  const paginatedDebtors = useMemo<DebtorItem[]>(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDebtors.slice(start, start + itemsPerPage);
  }, [filteredDebtors, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo<DebtorStats>(() => {
    return {
      total: filteredDebtors.length,
      totalBalance: filteredDebtors.reduce((sum, d) => sum + d.balance, 0),
      totalBillAmount: filteredDebtors.reduce((sum, d) => sum + d.billAmount, 0),
      totalPaid: filteredDebtors.reduce((sum, d) => sum + d.paidAmount, 0),
    };
  }, [filteredDebtors]);

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedClass('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleExport = (): void => {
    toast.showSuccess('Exporting debtors report...');
  };

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Debtors Report</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Debtors Report</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Debtors</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Balance (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalBalance.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Paid (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalPaid.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Bill Amount (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalBillAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, ID, or bill number..."
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

          <div className="sm:col-span-2 lg:col-span-1">
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

          <div className="sm:col-span-2 lg:col-span-1">
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
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200">
          {(searchTerm || selectedClass || dateFrom || dateTo) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
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
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Student ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Student Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Bill Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Bill Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Due Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Bill Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Paid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Days Overdue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedDebtors.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No debtors found.
                  </td>
                </tr>
              ) : (
                paginatedDebtors.map(debtor => (
                  <tr key={debtor.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{debtor.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{debtor.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{debtor.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{debtor.billNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(debtor.billDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(debtor.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{debtor.billAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{debtor.paidAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{debtor.balance.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        debtor.daysOverdue > 30 ? 'bg-red-100 text-red-800' :
                        debtor.daysOverdue > 0 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {debtor.daysOverdue} days
                      </span>
                    </td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDebtors.length)} of {filteredDebtors.length} debtors
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

export default FinancialReportsDebtorsReport;

