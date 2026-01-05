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

const StudentsMenu: React.FC = () => {
  const menuCards: MenuCard[] = [
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
      <div className="mb-8 sm:mb-10 md:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-3 tracking-tight">Dashboard - Students</h1>
        <div className="flex flex-wrap items-center gap-2 text-slate-600 text-sm sm:text-base">
          <Link to="/" className="text-slate-600 no-underline hover:text-primary-600 transition-colors font-medium">Home</Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Student Statistics */}
      <div className="mb-8 sm:mb-10">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-6 tracking-tight">Student Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card border-l-4 border-primary-500">
            <div className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wide">TOTAL STUDENTS</div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">333</div>
          </div>
          <div className="stat-card border-l-4 border-green-500">
            <div className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wide">ACTIVE STUDENTS</div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">270</div>
          </div>
          <div className="stat-card border-l-4 border-red-500">
            <div className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wide">INACTIVE STUDENTS</div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">63</div>
          </div>
          <div className="stat-card border-l-4 border-orange-500">
            <div className="text-xs text-slate-600 mb-2 font-semibold uppercase tracking-wide">NEW STUDENTS</div>
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">1</div>
          </div>
        </div>
      </div>

      {/* Student Management Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="card group"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center mb-4 border-2 ${card.color} shadow-md`}>
                <i className={`fas ${card.icon} text-2xl sm:text-3xl text-slate-700`}></i>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-primary-600 mb-2">{card.title}</h3>
              <p className="text-sm text-slate-600">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default StudentsMenu;

