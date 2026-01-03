import React, { useState, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { printPage, exportToCSV } from '../../utils/printExport';

const TrialBalance = () => {
  const printRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));

  // Sample trial balance data - in real app, this would come from API
  const trialBalance = useMemo(() => [
    { account: 'Cash', debit: 50000, credit: 0 },
    { account: 'Bank Account', debit: 200000, credit: 0 },
    { account: 'Accounts Receivable', debit: 15000, credit: 0 },
    { account: 'Accounts Payable', debit: 0, credit: 8000 },
    { account: 'Tuition Income', debit: 0, credit: 300000 },
    { account: 'Salary Expense', debit: 50000, credit: 0 },
    { account: 'Utility Expense', debit: 5000, credit: 0 },
    { account: 'Maintenance Expense', debit: 3000, credit: 0 },
  ], []);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalDebit: trialBalance.reduce((sum, item) => sum + item.debit, 0),
      totalCredit: trialBalance.reduce((sum, item) => sum + item.credit, 0),
      balance: Math.abs(trialBalance.reduce((sum, item) => sum + item.debit, 0) - trialBalance.reduce((sum, item) => sum + item.credit, 0))
    };
  }, [trialBalance]);

  const handleExport = () => {
    const columns = [
      { key: 'account', label: 'Account' },
      { key: 'debit', label: 'Debit (GHS)' },
      { key: 'credit', label: 'Credit (GHS)' }
    ];
    
    exportToCSV(trialBalance, `trial-balance-${selectedDate}.csv`, columns);
  };

  const handlePrint = () => {
    const element = printRef.current;
    if (element) {
      printPage(element, {
        title: `Trial Balance - ${selectedDate}`,
        styles: `
          .trial-balance-header { text-align: center; margin-bottom: 20px; }
          .trial-balance-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Trial Balance</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Trial Balance</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            />
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-download mr-1.5"></i> Export
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-print mr-1.5"></i> Print
            </button>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div ref={printRef} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print-content">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Trial Balance as of {new Date(selectedDate).toLocaleDateString()}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Account</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">Debit (GHS)</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-white uppercase">Credit (GHS)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trialBalance.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.account}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.debit > 0 ? item.debit.toLocaleString() : '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.credit > 0 ? item.credit.toLocaleString() : '-'}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-bold">
                <td className="px-4 py-3 text-sm text-gray-900 font-semibold">Total</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{totals.totalDebit.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">{totals.totalCredit.toLocaleString()}</td>
              </tr>
              {totals.balance > 0 && (
                <tr className="bg-yellow-50">
                  <td colSpan="3" className="px-4 py-3 text-sm text-center text-yellow-800">
                    <strong>Difference: GHS {totals.balance.toLocaleString()}</strong> (Please verify entries)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default TrialBalance;
