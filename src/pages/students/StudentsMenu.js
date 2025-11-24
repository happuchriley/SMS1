import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StudentsMenu = () => {
  const menuCards = [
    {
      title: 'Add new student',
      subtitle: 'Add or register new Students',
      icon: 'fa-user-plus',
      path: '/students/add',
      color: 'border-blue-500'
    },
    {
      title: 'All Students',
      subtitle: 'View All students',
      icon: 'fa-users',
      path: '/students/all',
      color: 'border-green-500'
    },
    {
      title: 'Active Students',
      subtitle: 'View Active Students',
      icon: 'fa-user-check',
      path: '/students/active',
      color: 'border-green-500'
    },
    {
      title: 'Inactive Students',
      subtitle: 'View Inactive Students',
      icon: 'fa-user-times',
      path: '/students/inactive',
      color: 'border-red-500'
    },
    {
      title: 'New Students',
      subtitle: 'View New Students',
      icon: 'fa-user-tag',
      path: '/students/fresh',
      color: 'border-orange-500'
    },
    {
      title: 'Parents List',
      subtitle: 'Parents/Guardians List',
      icon: 'fa-user-tie',
      path: '/students/parents',
      color: 'border-purple-500'
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard - Students</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Dashboard</span>
        </div>
      </div>

      {/* Student Statistics */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Student Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-blue-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">TOTAL STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">333</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-green-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">ACTIVE STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">270</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-red-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">INACTIVE STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">63</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">NEW STUDENTS (CURRENT TERM)</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">1</div>
          </div>
        </div>
      </div>

      {/* Student Management Cards */}
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

export default StudentsMenu;
