import React, { useState, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { printPage, exportToCSV } from '../../utils/printExport';

interface LedgerEntry {
  id: number;
  date: string;
  reference: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

interface CSVColumn {
  key: string;
  label: string;
}

const GeneralLedger: React.FC = () => {
  const printRef = useRef<HTMLDivElement>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Sample ledger data - in real app, this would come from API
  const ledgerEntries = useMemo<LedgerEntry[]>(() => [
    { id: 1, date: '2024-01-15', reference: 'REF001', description: 'Tuition fees received', debit: 5000, credit: 0, balance: 5000 },
    { id: 2, date: '2024-01-16', reference: 'REF002', description: 'Salary payment', debit: 0, credit: 3000, balance: 2000 },
    { id: 3, date: '2024-01-17', reference: 'REF003', description: 'Utility payment', debit: 0, credit: 500, balance: 1500 },
    { id: 4, date: '2024-01-18', reference: 'REF004', description: 'Registration fees', debit: 2000, credit: 0, balance: 3500 },
  ], []);

  const accounts: string[] = [
    'Cash',
    'Bank Account',
    'Accounts Receivable',
    'Accounts Payable',
    'Tuition Income',
    'Salary Expense',
    'Utility Expense',
    'Maintenance Expense',
    'Other Income',
    'Other Expense'
  ];

  // Filter entries
  const filteredEntries = useMemo(() => {
    let entries = [...ledgerEntries];
    
    if (selectedAccount) {
      // In real app, filter by account
    }
    
    if (dateFrom) {
      entries = entries.filter(e => e.date >= dateFrom);
    }
    
    if (dateTo) {
      entries = entries.filter(e => e.date <= dateTo);
    }
    
    return entries;
  }, [ledgerEntries, selectedAccount, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEntries.slice(start, start + itemsPerPage);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const handleClearFilters = (): void => {
    setSelectedAccount('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleExport = (): void => {
    const columns: CSVColumn[] = [
      { key: 'date', label: 'Date' },
      { key: 'reference', label: 'Reference' },
      { key: 'description', label: 'Description' },
      { key: 'debit', label: 'Debit' },
      { key: 'credit', label: 'Credit' },
      { key: 'balance', label: 'Balance' }
    ];
    
    exportToCSV(filteredEntries, `general-ledger-${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  const handlePrint = (): void => {
    const element = printRef.current;
    if (element) {
      printPage(element, {
        title: 'General Ledger',
        styles: `
          .ledger-header { text-align: center; margin-bottom: 20px; }
          .ledger-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
        `
      });
    } else {
      window.print();
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">General Ledger</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/finance" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Finance Entries</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">General Ledger</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Account</label>
            <select
              value={selectedAccount}
              onChange={(e) => {
                setSelectedAccount(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Accounts</option>
              {accounts.map(account => (
                <option key={account} value={account}>{account}</option>
              ))}
            </select>
          </div>

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

          <div className="flex items-end">
            {(selectedAccount || dateFrom || dateTo) && (
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
        </div>
      </div>

      {/* Table Card */}
      <div ref={printRef} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print-content">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Reference</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Debit (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Credit (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Balance (GHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No ledger entries found.
                  </td>
                </tr>
              ) : (
                paginatedEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(entry.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.reference}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.debit > 0 ? entry.debit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{entry.credit > 0 ? entry.credit.toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{entry.balance.toLocaleString()}</td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEntries.length)} of {filteredEntries.length} entries
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

export default GeneralLedger;

