import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const FinanceMenu = () => {
  const menuCards = [
    {
      title: 'Debtor Entry',
      subtitle: 'Record debtor transactions',
      icon: 'fa-user-minus',
      path: '/finance/debtor-entry',
      color: 'border-blue-500'
    },
    {
      title: 'Creditor Entry',
      subtitle: 'Record creditor transactions',
      icon: 'fa-user-plus',
      path: '/finance/creditor-entry',
      color: 'border-green-500'
    },
    {
      title: 'Income Entry',
      subtitle: 'Record income transactions',
      icon: 'fa-arrow-down',
      path: '/finance/income-entry',
      color: 'border-emerald-500'
    },
    {
      title: 'Expense Entry',
      subtitle: 'Record expense transactions',
      icon: 'fa-arrow-up',
      path: '/finance/expense-entry',
      color: 'border-red-500'
    },
    {
      title: 'General Journal',
      subtitle: 'Manage general journal entries',
      icon: 'fa-book',
      path: '/finance/general-journal',
      color: 'border-purple-500'
    },
    {
      title: 'General Ledger',
      subtitle: 'View general ledger accounts',
      icon: 'fa-book-open',
      path: '/finance/general-ledger',
      color: 'border-orange-500'
    },
    {
      title: 'Fixed Asset',
      subtitle: 'Manage fixed assets',
      icon: 'fa-building',
      path: '/finance/fixed-asset',
      color: 'border-cyan-500'
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Finance Entries</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Finance Entries</span>
        </div>
      </div>

      {/* Finance Entries Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {menuCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                <i className={`fas ${card.icon} text-2xl text-gray-700`}></i>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default FinanceMenu;


