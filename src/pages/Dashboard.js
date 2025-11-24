import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Dashboard</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-lg p-5 md:p-7 shadow-md mb-5 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center flex-wrap">
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)]">
            <option>2023 Academic Year, 2023/2024</option>
          </select>
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)]">
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)]">
            <option>Basic 1 - Ages 6 years, Basic 2-</option>
          </select>
          <select className="w-full md:w-auto flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)]">
            <option>Tuition Fee</option>
            <option>Admission Fee</option>
            <option>School Fees</option>
          </select>
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
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">ACTIVE STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">270</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">INACTIVE STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">63</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">NEW STUDENTS</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">1</div>
          </div>
        </div>
      </div>

      {/* Staff Statistics */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Staff Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">TOTAL STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">22</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-orange-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">ACTIVE STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">19</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-pink-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">INACTIVE STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">3</div>
          </div>
          <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-pink-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
            <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="text-xs text-gray-600 mb-2 font-medium">NEW STAFF</div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">0</div>
          </div>
        </div>
      </div>

      {/* Fees */}
      <div className="mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Fees</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-blue-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="text-xs text-gray-600 mb-2 font-medium">Total Sch Fees</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 625,963</div>
        </div>
        <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-green-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="text-xs text-gray-600 mb-2 font-medium">Total Sch Fee Paid</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 537,242</div>
        </div>
        <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-red-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="text-xs text-gray-600 mb-2 font-medium">Sch Fee Balance</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 88,721</div>
        </div>
        <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-cyan-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="text-xs text-gray-600 mb-2 font-medium">Other Fees (Bus)</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 0</div>
        </div>
        <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-green-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="text-xs text-gray-600 mb-2 font-medium">Other Fees</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 0</div>
        </div>
        <div className="bg-white rounded-lg p-5 md:p-6 shadow-md border-l-4 border-red-500 transition-all duration-300 relative overflow-hidden hover:-translate-y-1 hover:shadow-lg group">
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          <div className="text-xs text-gray-600 mb-2 font-medium">Total Other Fees</div>
          <div className="text-3xl md:text-4xl font-bold text-gray-900">GH¢ 0</div>
        </div>
        </div>
      </div>

      {/* Students Per Class Table */}
      <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Students Per Class</h3>
        </div>
        <div className="overflow-x-auto w-full -webkit-overflow-scrolling-touch">
          <table className="w-full min-w-[600px] border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-br from-gray-50 to-gray-100">
              <tr>
                <th className="p-4 text-left font-bold text-xs text-gray-900 border-b-2 border-gray-200 uppercase tracking-wide">Class</th>
                <th className="p-4 text-left font-bold text-xs text-gray-900 border-b-2 border-gray-200 uppercase tracking-wide">Number of Students</th>
                <th className="p-4 text-left font-bold text-xs text-gray-900 border-b-2 border-gray-200 uppercase tracking-wide">Action</th>
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
                  className="transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent hover:scale-[1.01]"
                >
                  <td className="p-4 border-b border-gray-200 text-sm text-gray-600">{item.class}</td>
                  <td className="p-4 border-b border-gray-200 text-sm text-gray-600">{item.students} Students</td>
                  <td className="p-4 border-b border-gray-200 text-sm text-gray-600">
                    <button className="px-3 py-1.5 bg-transparent border border-gray-200 text-gray-900 rounded text-xs font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-2 hover:bg-gray-50">
                      <i className="fas fa-cog"></i> Action
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
