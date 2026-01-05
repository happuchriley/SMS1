import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface BankScheduleItem {
  id: string;
  name: string;
  accountNumber: string;
  bankName: string;
  netSalary: number;
  status: string;
}

interface Stats {
  total: number;
  processed: number;
  pending: number;
  totalAmount: number;
}

const BankSchedule: React.FC = () => {
  const { toast } = useModal();
  const [selectedPeriod, setSelectedPeriod] = useState<string>(new Date().toISOString().slice(0, 7));
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Sample bank schedule data
  const bankScheduleData: BankScheduleItem[] = [
    { id: 'STF001', name: 'Mr. John Teacher', accountNumber: '1234567890', bankName: 'GCB Bank', netSalary: 3200, status: 'Processed' },
    { id: 'STF002', name: 'Mrs. Jane Principal', accountNumber: '0987654321', bankName: 'Ecobank', netSalary: 5500, status: 'Processed' },
    { id: 'STF003', name: 'Mr. Michael Admin', accountNumber: '1122334455', bankName: 'GCB Bank', netSalary: 2650, status: 'Pending' },
    { id: 'STF004', name: 'Ms. Sarah Accountant', accountNumber: '5566778899', bankName: 'Access Bank', netSalary: 3750, status: 'Processed' },
    { id: 'STF005', name: 'Mr. David IT', accountNumber: '6677889900', bankName: 'GCB Bank', netSalary: 2970, status: 'Processed' },
  ];

  const banks: string[] = ['All Banks', 'GCB Bank', 'Ecobank', 'Access Bank', 'Fidelity Bank', 'Stanbic Bank'];

  // Filter schedule
  const filteredSchedule = useMemo<BankScheduleItem[]>(() => {
    return bankScheduleData.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.accountNumber.includes(searchTerm);
      const matchesBank = !selectedBank || selectedBank === 'All Banks' || item.bankName === selectedBank;
      return matchesSearch && matchesBank;
    });
  }, [searchTerm, selectedBank]);

  // Pagination
  const totalPages = Math.ceil(filteredSchedule.length / itemsPerPage);
  const paginatedSchedule = useMemo<BankScheduleItem[]>(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSchedule.slice(start, start + itemsPerPage);
  }, [filteredSchedule, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo<Stats>(() => {
    return {
      total: filteredSchedule.length,
      processed: filteredSchedule.filter(s => s.status === 'Processed').length,
      pending: filteredSchedule.filter(s => s.status === 'Pending').length,
      totalAmount: filteredSchedule.reduce((sum, s) => sum + s.netSalary, 0),
    };
  }, [filteredSchedule]);

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedBank('');
    setCurrentPage(1);
  };

  const handleExport = (): void => {
    toast.showSuccess('Exporting bank schedule...');
  };

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bank Schedule</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Bank Schedule</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            />
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Staff</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Processed</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.processed}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-yellow-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Pending</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Amount (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()}</div>
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
                placeholder="Search by name, ID, or account number..."
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
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Bank</label>
            <select
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Banks</option>
              {banks.slice(1).map(bank => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200">
          {(searchTerm || selectedBank) && (
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Bank Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Account Number</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Net Salary (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedSchedule.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No bank schedule found.
                  </td>
                </tr>
              ) : (
                paginatedSchedule.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{item.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.bankName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{item.accountNumber}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.netSalary.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Processed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status}
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredSchedule.length)} of {filteredSchedule.length} entries
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

export default BankSchedule;

