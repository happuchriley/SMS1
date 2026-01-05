import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface MenuCard {
  title: string;
  subtitle: string;
  icon: string;
  path: string;
  color: string;
}

const StaffMenu: React.FC = () => {
  const menuCards: MenuCard[] = [
    {
      title: 'Add new Staff',
      subtitle: 'Add or register new Staff',
      icon: 'fa-user-plus',
      path: '/staff/add',
      color: 'border-blue-500'
    },
    {
      title: 'All Staffs',
      subtitle: 'View All Staffs',
      icon: 'fa-users',
      path: '/staff/all',
      color: 'border-green-500'
    },
    {
      title: 'Active Staffs',
      subtitle: 'View Active Staffs',
      icon: 'fa-user-check',
      path: '/staff/active',
      color: 'border-green-500'
    },
    {
      title: 'Inactive Staffs',
      subtitle: 'View Inactive Staffs',
      icon: 'fa-user-times',
      path: '/staff/inactive',
      color: 'border-red-500'
    },
    {
      title: 'New Staffs',
      subtitle: 'View New Staffs',
      icon: 'fa-user-tag',
      path: '/staff/new',
      color: 'border-orange-500'
    },
    {
      title: 'Staff Restriction',
      subtitle: 'Manage Staff Restriction',
      icon: 'fa-users-cog',
      path: '/staff/restriction',
      color: 'border-purple-500'
    },
    {
      title: 'Setup Salary Structure',
      subtitle: 'Setup Salary Structure - Group',
      icon: 'fa-clipboard-list',
      path: '/staff/salary-structure',
      color: 'border-cyan-500'
    },
    {
      title: 'Pay Reports',
      subtitle: 'Payroll Reports (Payslips, Bank Schedule, GRA, SSNIT etc.)',
      icon: 'fa-file-invoice',
      path: '/staff/pay-reports',
      color: 'border-indigo-500'
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard - Staffs</h1>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Dashboard</span>
        </div>
      </div>

      {/* Staff Statistics */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Staff Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-blue-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">TOTAL STAFF</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">22</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-green-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">ACTIVE STAFF</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">19</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-red-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">INACTIVE STAFF</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">3</div>
          </div>
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">NEW STAFF (CURRENT TERM)</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">1</div>
          </div>
        </div>
      </div>

      {/* Staff Management Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {menuCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-4 sm:p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3 sm:mb-4 border-2 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                <i className={`fas ${card.icon} text-xl sm:text-2xl text-gray-700`}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-1 sm:mb-2">{card.title}</h3>
              <p className="text-xs sm:text-sm text-gray-600">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default StaffMenu;

