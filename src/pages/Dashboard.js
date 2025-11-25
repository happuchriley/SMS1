import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Dashboard</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-7 shadow-md mb-4 sm:mb-5 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
          <select className="w-full sm:w-auto sm:flex-1 px-4 py-3 sm:py-2.5 border-2 border-gray-200 rounded-md text-base sm:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[48px] sm:min-h-auto">
            <option>2023 Academic Year, 2023/2024</option>
          </select>
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
            <option>Basic 1 - Ages 6 years, Basic 2-</option>
          </select>
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]">
            <option>Tuition Fee</option>
            <option>Admission Fee</option>
            <option>School Fees</option>
          </select>
        </div>
      </div>

      {/* Student Statistics */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Student Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Link to="/students/all" className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">TOTAL STUDENTS</div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">333</div>
          </Link>
          <Link to="/students/active" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">ACTIVE STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">270</div>
          </Link>
          <Link to="/students/inactive" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">INACTIVE STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">63</div>
          </Link>
          <Link to="/students/fresh" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">NEW STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">1</div>
          </Link>
        </div>
      </div>

      {/* Staff Statistics */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Staff Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <Link to="/staff/all" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">TOTAL STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">22</div>
          </Link>
          <Link to="/staff/active" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">ACTIVE STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">19</div>
          </Link>
          <Link to="/staff/inactive" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-pink-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">INACTIVE STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">3</div>
          </Link>
          <Link to="/staff/new" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-pink-500 cursor-pointer hover:bg-gray-50">
            <div className="text-xs text-gray-600 mb-2 font-medium">NEW STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
          </Link>
        </div>
      </div>

      {/* Fees */}
      <div className="mb-5 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Fees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          <Link to="/billing" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-blue-500 cursor-pointer hover:bg-gray-50 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium">Total Sch Fees</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 625,963</div>
          </Link>
          <Link to="/fee-collection" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-gray-50 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium">Total Sch Fee Paid</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 537,242</div>
          </Link>
          <Link to="/fee-balance" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-red-500 cursor-pointer hover:bg-gray-50 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium">Sch Fee Balance</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 88,721</div>
          </Link>
          <Link to="/transport-fees" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-cyan-500 cursor-pointer hover:bg-gray-50 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium">Other Fees (Bus)</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 0</div>
          </Link>
          <Link to="/other-fees" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-green-500 cursor-pointer hover:bg-gray-50 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium">Other Fees</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 0</div>
          </Link>
          <Link to="/other-fees" className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-red-500 cursor-pointer hover:bg-gray-50 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium">Total Other Fees</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 0</div>
          </Link>
        </div>
      </div>

      {/* Students Per Class Table */}
      <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Students Per Class</h3>
        </div>
        <div className="overflow-x-auto w-full -webkit-overflow-scrolling-touch -mx-4 sm:mx-0 px-4 sm:px-0">
          <table className="w-full min-w-[600px] border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-primary-500">
              <tr>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white border-b-2 border-primary-700 uppercase tracking-wide">Class</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white border-b-2 border-primary-700 uppercase tracking-wide">Number of Students</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white border-b-2 border-primary-700 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { class: 'Basic 2', students: 25 },
                { class: 'Basic 3', students: 24 },
                { class: 'Basic 4', students: 21 },
                { class: 'Basic 5', students: 14 },
                { class: 'Basic 6', students: 18 },
                { class: 'Basic 7', students: 18 },
                { class: 'Basic 8', students: 10 },
                { class: 'Basic 9', students: 14 },
                { class: 'KG 2', students: 31 },
                { class: 'Basic 1', students: 30 },
                { class: 'Nursery 2', students: 18 }
              ].map((item, index) => (
                <tr 
                  key={index}
                  className="transition-all duration-300 hover:bg-primary-50 hover:scale-[1.01]"
                >
                  <td className="p-3 sm:p-4 border-b border-gray-200 text-sm text-gray-600">{item.class}</td>
                  <td className="p-3 sm:p-4 border-b border-gray-200 text-sm text-gray-600">{item.students} Students</td>
                  <td className="p-3 sm:p-4 border-b border-gray-200 text-sm text-gray-600">
                    <button className="px-2.5 sm:px-3 py-1.5 bg-transparent border border-gray-200 text-gray-900 rounded text-xs font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-2 hover:bg-gray-50 min-h-[36px] sm:min-h-auto touch-manipulation">
                      <i className="fas fa-cog"></i> <span className="hidden sm:inline">Action</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
