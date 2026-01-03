import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const PayrollMenu = () => {
  const menuCards = [
    {
      title: 'Payroll Overview',
      subtitle: 'View payroll summary and statistics',
      icon: 'fa-chart-bar',
      path: '/payroll/overview',
      color: 'border-blue-500'
    },
    {
      title: 'Generate Payslip',
      subtitle: 'Generate payslips for staff',
      icon: 'fa-file-invoice',
      path: '/payroll/generate-payslip',
      color: 'border-green-500'
    },
    {
      title: 'Payroll Schedule',
      subtitle: 'Manage payroll schedule and dates',
      icon: 'fa-calendar-alt',
      path: '/payroll/schedule',
      color: 'border-purple-500'
    },
    {
      title: 'Bank Schedule',
      subtitle: 'Generate bank transfer schedule',
      icon: 'fa-university',
      path: '/payroll/bank-schedule',
      color: 'border-orange-500'
    },
    {
      title: 'Tax Reports',
      subtitle: 'Generate tax reports (GRA, SSNIT)',
      icon: 'fa-receipt',
      path: '/payroll/tax-reports',
      color: 'border-red-500'
    },
    {
      title: 'Salary Advances',
      subtitle: 'Manage staff salary advances',
      icon: 'fa-hand-holding-usd',
      path: '/payroll/advances',
      color: 'border-cyan-500'
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Payroll</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Payroll</span>
        </div>
      </div>

      {/* Payroll Statistics */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Payroll Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-2 font-medium">TOTAL STAFF ON PAYROLL</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">19</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-2 font-medium">THIS MONTH PAYROLL</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">₵45,200</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500">
            <div className="text-xs text-gray-600 mb-2 font-medium">PENDING PAYMENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">2</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-2 font-medium">PAID THIS MONTH</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">17</div>
          </div>
        </div>
      </div>

      {/* Payroll Management Cards */}
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

export default PayrollMenu;


