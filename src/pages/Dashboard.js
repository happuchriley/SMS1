import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import studentsService from '../services/studentsService';
import staffService from '../services/staffService';
import billingService from '../services/billingService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    inactiveStudents: 0,
    newStudents: 0,
    totalStaff: 0,
    activeStaff: 0,
    inactiveStaff: 0,
    newStaff: 0,
    totalFees: 0,
    paidFees: 0,
    feeBalance: 0,
    collectionRate: 0,
    studentsPerClass: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [students, staff, bills, payments] = await Promise.all([
        studentsService.getAll(),
        staffService.getAll(),
        billingService.getAllBills(),
        billingService.getAllPayments()
      ]);

      const activeStudents = students.filter(s => s.status === 'active');
      const inactiveStudents = students.filter(s => s.status === 'inactive');
      const newStudentsCount = (await studentsService.getFresh()).length;

      const activeStaff = staff.filter(s => s.status === 'active');
      const inactiveStaff = staff.filter(s => s.status === 'inactive');
      const newStaffCount = (await staffService.getNew()).length;

      const totalFees = bills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
      const paidFees = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
      const feeBalance = totalFees - paidFees;
      const collectionRate = totalFees > 0 ? (paidFees / totalFees) * 100 : 0;

      // Calculate students per class
      const classMap = new Map();
      activeStudents.forEach(student => {
        const className = student.class || 'Unassigned';
        classMap.set(className, (classMap.get(className) || 0) + 1);
      });

      const studentsPerClass = Array.from(classMap.entries()).map(([className, count]) => ({
        class: className,
        students: count
      }));

      setStats({
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        inactiveStudents: inactiveStudents.length,
        newStudents: newStudentsCount,
        totalStaff: staff.length,
        activeStaff: activeStaff.length,
        inactiveStaff: inactiveStaff.length,
        newStaff: newStaffCount,
        totalFees,
        paidFees,
        feeBalance,
        collectionRate,
        studentsPerClass
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link to="/students/all" className="bg-white shadow-md cursor-pointer hover:bg-gray-50 overflow-hidden">
            <div className="bg-blue-600 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm uppercase">STUDENTS STATISTICS</span>
              <i className="fas fa-users text-white"></i>
            </div>
            <div className="p-5 md:p-6 grid grid-cols-2 gap-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">TOTAL STUDENTS</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.totalStudents}</div>
              </div>
              <div>
                <div className="text-xs text-blue-600 mb-1 font-medium">ACTIVE STUDENTS</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.activeStudents}</div>
              </div>
            </div>
          </Link>
          <Link to="/students/inactive" className="bg-white shadow-md cursor-pointer hover:bg-gray-50 overflow-hidden">
            <div className="bg-orange-500 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm uppercase">STUDENTS STATISTICS</span>
              <i className="fas fa-users text-white"></i>
            </div>
            <div className="p-5 md:p-6 grid grid-cols-2 gap-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">INACTIVE STUDENTS</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.inactiveStudents}</div>
              </div>
              <div>
                <div className="text-xs text-orange-500 mb-1 font-medium">NEW STUDENTS</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.newStudents}</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Staff Statistics */}
      <div className="mb-5 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link to="/staff/all" className="bg-white shadow-md cursor-pointer hover:bg-gray-50 overflow-hidden">
            <div className="bg-purple-600 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm uppercase">STAFF STATISTICS</span>
              <i className="fas fa-user-tie text-white"></i>
            </div>
            <div className="p-5 md:p-6 grid grid-cols-2 gap-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">TOTAL STAFF</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.totalStaff}</div>
              </div>
              <div>
                <div className="text-xs text-purple-600 mb-1 font-medium">ACTIVE STAFF</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.activeStaff}</div>
              </div>
            </div>
          </Link>
          <Link to="/staff/inactive" className="bg-white shadow-md cursor-pointer hover:bg-gray-50 overflow-hidden">
            <div className="bg-pink-500 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm uppercase">STAFF STATISTICS</span>
              <i className="fas fa-user-tie text-white"></i>
            </div>
            <div className="p-5 md:p-6 grid grid-cols-2 gap-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">INACTIVE STAFF</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.inactiveStaff}</div>
              </div>
              <div>
                <div className="text-xs text-pink-500 mb-1 font-medium">NEW STAFF</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.newStaff}</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Fees */}
      <div className="mb-5 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Link to="/billing" className="bg-white shadow-md cursor-pointer hover:bg-gray-50 overflow-hidden no-underline">
            <div className="bg-green-600 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm uppercase">SCHOOL FEES</span>
              <i className="fas fa-money-bill-wave text-white"></i>
            </div>
            <div className="p-5 md:p-6 grid grid-cols-2 gap-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">TOTAL FEES</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">GH¢ {stats.totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-xs text-green-600 mb-1 font-medium">PAID FEES</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">GH¢ {stats.paidFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          </Link>
          <Link to="/fee-balance" className="bg-white shadow-md cursor-pointer hover:bg-gray-50 overflow-hidden no-underline">
            <div className="bg-red-500 px-5 py-3 flex items-center justify-between">
              <span className="text-white font-semibold text-sm uppercase">FEE BALANCE</span>
              <i className="fas fa-exclamation-triangle text-white"></i>
            </div>
            <div className="p-5 md:p-6 grid grid-cols-2 gap-4 border-t border-gray-200">
              <div>
                <div className="text-xs text-gray-600 mb-1 font-medium">OUTSTANDING</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">GH¢ {stats.feeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
              <div>
                <div className="text-xs text-red-600 mb-1 font-medium">COLLECTION RATE</div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stats.collectionRate.toFixed(2)}%</div>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Students Per Class Table */}
      <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
        <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Students Per Class</h3>
        </div>
        <div className="overflow-x-auto w-full -webkit-overflow-scrolling-touch -mx-4 sm:-mx-5 md:mx-0 px-4 sm:px-5 md:px-0">
          <table className="w-full min-w-[600px] sm:min-w-[700px] border-collapse bg-white rounded-lg overflow-hidden">
            <thead className="bg-primary-500">
              <tr>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white border-b-2 border-primary-700 uppercase tracking-wide">Class</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white border-b-2 border-primary-700 uppercase tracking-wide">Number of Students</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white border-b-2 border-primary-700 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.studentsPerClass.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                    <div>No class data available</div>
                  </td>
                </tr>
              ) : (
                stats.studentsPerClass.map((item, index) => (
                  <tr 
                    key={index}
                    className="transition-all duration-300 hover:bg-primary-50 hover:scale-[1.01]"
                  >
                    <td className="p-3 sm:p-4 border-b border-gray-200 text-sm text-gray-600">{item.class}</td>
                    <td className="p-3 sm:p-4 border-b border-gray-200 text-sm text-gray-600">{item.students} Students</td>
                    <td className="p-3 sm:p-4 border-b border-gray-200 text-sm text-gray-600">
                      <Link 
                        to={`/students/classes?class=${encodeURIComponent(item.class)}`}
                        className="px-2.5 sm:px-3 py-1.5 bg-transparent border border-gray-200 text-gray-900 rounded text-xs font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-2 hover:bg-gray-50 min-h-[36px] sm:min-h-auto touch-manipulation"
                      >
                        <i className="fas fa-cog"></i> <span className="hidden sm:inline">View</span>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
