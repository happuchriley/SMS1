import React, { useState, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { printPage, exportToCSV } from '../../utils/printExport';

const IncomeStatement = () => {
  const printRef = useRef(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Sample income statement data - in real app, this would come from API
  const income = useMemo(() => [
    { category: 'Tuition Fees', amount: 300000 },
    { category: 'Registration Fees', amount: 50000 },
    { category: 'Examination Fees', amount: 30000 },
    { category: 'Other Income', amount: 20000 },
  ], []);

  const expenses = useMemo(() => [
    { category: 'Salaries', amount: 150000 },
    { category: 'Utilities', amount: 15000 },
    { category: 'Maintenance', amount: 10000 },
    { category: 'Stationery', amount: 5000 },
    { category: 'Transportation', amount: 8000 },
    { category: 'Other Expenses', amount: 7000 },
  ], []);

  // Calculate totals
  const totals = useMemo(() => {
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const netIncome = totalIncome - totalExpenses;
    return { totalIncome, totalExpenses, netIncome };
  }, [income, expenses]);

  const handleGenerate = () => {
    if (!dateFrom || !dateTo) {
      alert('Please select date range.');
      return;
    }
    console.log('Generating income statement from', dateFrom, 'to', dateTo);
    alert('Income statement generated successfully!');
  };

  const handleExport = () => {
    const allData = [
      ...income.map(item => ({ type: 'Income', category: item.category, amount: item.amount })),
      ...expenses.map(item => ({ type: 'Expense', category: item.category, amount: item.amount }))
    ];
    
    const columns = [
      { key: 'type', label: 'Type' },
      { key: 'category', label: 'Category' },
      { key: 'amount', label: 'Amount (GHS)' }
    ];
    
    exportToCSV(allData, `income-statement-${dateFrom || 'all'}-${dateTo || 'all'}.csv`, columns);
  };

  const handlePrint = () => {
    const element = printRef.current;
    if (element) {
      printPage(element, {
        title: `Income Statement - ${dateFrom || 'All'} to ${dateTo || 'All'}`,
        styles: `
          .income-statement-header { text-align: center; margin-bottom: 20px; }
          .income-statement-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Income Statement</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Income Statement</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="From Date"
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="To Date"
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            />
            <button
              onClick={handleGenerate}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
            >
              Generate
            </button>
          </div>
        </div>
      </div>

      {/* Income Statement Card */}
      <div ref={printRef} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden print-content">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Income Statement
            {dateFrom && dateTo && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({new Date(dateFrom).toLocaleDateString()} - {new Date(dateTo).toLocaleDateString()})
              </span>
            )}
          </h2>
          <div className="flex gap-2">
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

        <div className="p-4 sm:p-6">
          {/* Income Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income</h3>
            <div className="space-y-2">
              {income.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{item.category}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 mt-4 pt-4 border-t-2 border-gray-300">
                <span className="text-base font-semibold text-gray-900">Total Income</span>
                <span className="text-base font-bold text-green-600">{totals.totalIncome.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses</h3>
            <div className="space-y-2">
              {expenses.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-700">{item.category}</span>
                  <span className="text-sm font-semibold text-red-600">{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 mt-4 pt-4 border-t-2 border-gray-300">
                <span className="text-base font-semibold text-gray-900">Total Expenses</span>
                <span className="text-base font-bold text-red-600">{totals.totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="pt-4 border-t-2 border-gray-400">
            <div className="flex justify-between items-center py-3 bg-primary-50 rounded-md px-4">
              <span className="text-lg font-bold text-gray-900">Net Income</span>
              <span className={`text-xl font-bold ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totals.netIncome >= 0 ? '+' : ''}{totals.netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IncomeStatement;
