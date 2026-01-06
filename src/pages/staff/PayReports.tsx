import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface ReportCard {
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

const PayReports: React.FC = () => {
  const reportCards: ReportCard[] = [
    {
      title: 'Payslips',
      description: 'Generate and view staff payslips',
      icon: 'fa-file-invoice',
      path: '/payroll/generate-payslip',
      color: 'border-blue-500'
    },
    {
      title: 'Bank Schedule',
      description: 'Generate bank transfer schedule for payroll',
      icon: 'fa-university',
      path: '/payroll/bank-schedule',
      color: 'border-green-500'
    },
    {
      title: 'GRA Report',
      description: 'Generate Ghana Revenue Authority tax reports',
      icon: 'fa-receipt',
      path: '/payroll/tax-reports',
      color: 'border-purple-500'
    },
    {
      title: 'SSNIT Report',
      description: 'Generate Social Security and National Insurance Trust reports',
      icon: 'fa-shield-alt',
      path: '/payroll/tax-reports',
      color: 'border-orange-500'
    },
    {
      title: 'Payroll Schedule',
      description: 'View and manage payroll schedule',
      icon: 'fa-calendar-alt',
      path: '/payroll/schedule',
      color: 'border-cyan-500'
    },
    {
      title: 'Payroll Overview',
      description: 'View payroll summary and statistics',
      icon: 'fa-chart-bar',
      path: '/payroll/overview',
      color: 'border-indigo-500'
    }
  ];

  return (
    <Layout>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Pay Reports</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <Link to="/staff/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Staff</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Pay Reports</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Payroll Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">TOTAL PAYSLIPS</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">THIS MONTH</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">0</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-orange-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">PENDING REPORTS</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">0</div>
          </div>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <p className="text-sm text-gray-600">
          Access various payroll reports including payslips, bank schedules, tax reports (GRA), SSNIT reports, and more.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {reportCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-5 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group no-underline"
          >
            <div className="flex flex-col items-center text-center">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4 border-2 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
              >
                <i className={`fas ${card.icon} text-xl sm:text-2xl text-gray-700`}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-1 sm:mb-2">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default PayReports;
