import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import studentsService from '../services/studentsService';
import staffService from '../services/staffService';
import billingService from '../services/billingService';

interface StudentsPerClass {
  class: string;
  students: number;
}

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  inactiveStudents: number;
  newStudents: number;
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  newStaff: number;
  totalFees: number;
  paidFees: number;
  feeBalance: number;
  collectionRate: number;
  studentsPerClass: StudentsPerClass[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
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

  const loadDashboardData = async (): Promise<void> => {
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

      const totalFees = bills.reduce((sum, b) => sum + (parseFloat(String(b.total || 0)) || 0), 0);
      const paidFees = payments.reduce((sum, p) => sum + (parseFloat(String(p.amount || 0)) || 0), 0);
      const feeBalance = totalFees - paidFees;
      const collectionRate = totalFees > 0 ? (paidFees / totalFees) * 100 : 0;

      // Calculate students per class
      const classMap = new Map<string, number>();
      activeStudents.forEach(student => {
        const className = student.class || 'Unassigned';
        classMap.set(className, (classMap.get(className) || 0) + 1);
      });

      const studentsPerClass: StudentsPerClass[] = Array.from(classMap.entries()).map(([className, count]) => ({
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
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary-600 transition-colors font-medium">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-modern mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-wrap">
          <select className="input-modern w-full sm:w-auto sm:flex-1 min-h-[48px] sm:min-h-auto">
            <option>2023 Academic Year, 2023/2024</option>
          </select>
          <select className="input-modern w-full md:w-auto flex-1">
            <option>First Term</option>
            <option>Second Term</option>
            <option>Third Term</option>
          </select>
          <select className="input-modern w-full md:w-auto flex-1">
            <option>Basic 1 - Ages 6 years, Basic 2-</option>
          </select>
          <select className="input-modern w-full md:w-auto flex-1">
            <option>Tuition Fee</option>
            <option>Admission Fee</option>
            <option>School Fees</option>
          </select>
        </div>
      </div>

      {/* Student Statistics */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Student Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/students/all" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">TOTAL STUDENTS</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalStudents}</div>
          </Link>
          <Link to="/students/all" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">ACTIVE STUDENTS</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeStudents}</div>
          </Link>
          <Link to="/students/inactive" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-red-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">INACTIVE STUDENTS</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.inactiveStudents}</div>
          </Link>
          <Link to="/students/all" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-orange-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">NEW STUDENTS</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.newStudents}</div>
          </Link>
        </div>
      </div>

      {/* Staff Statistics */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Staff Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/staff/all" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">TOTAL STAFF</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalStaff}</div>
          </Link>
          <Link to="/staff/all" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">ACTIVE STAFF</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.activeStaff}</div>
          </Link>
          <Link to="/staff/inactive" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-red-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">INACTIVE STAFF</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.inactiveStaff}</div>
          </Link>
          <Link to="/staff/all" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-orange-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
            <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">NEW STAFF</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.newStaff}</div>
          </Link>
        </div>
      </div>

      {/* Fees */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-4">Fee Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link to="/billing" className="relative overflow-hidden bg-blue-500 rounded-lg p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 no-underline">
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                GH¢ {stats.totalFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-white/90 font-medium uppercase tracking-wide">Total Sch Fees</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-20 z-0">
              <i className="fas fa-coins text-6xl sm:text-7xl md:text-8xl text-white"></i>
            </div>
          </Link>
          <Link to="/billing" className="relative overflow-hidden bg-green-500 rounded-lg p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 no-underline">
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                GH¢ {stats.paidFees.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-white/90 font-medium uppercase tracking-wide">Total Sch Fee Collections</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-20 z-0">
              <i className="fas fa-money-bill-wave text-6xl sm:text-7xl md:text-8xl text-white"></i>
            </div>
          </Link>
          <Link to="/fee-balance" className="relative overflow-hidden bg-red-500 rounded-lg p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 no-underline">
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                GH¢ {stats.feeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-white/90 font-medium uppercase tracking-wide">Sch Fee Balance</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-20 z-0">
              <i className="fas fa-exclamation-triangle text-6xl sm:text-7xl md:text-8xl text-white"></i>
            </div>
          </Link>
          <Link to="/fee-balance" className="relative overflow-hidden bg-cyan-500 rounded-lg p-5 sm:p-6 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-1 no-underline">
            <div className="relative z-10">
              <div className="text-xl sm:text-2xl font-bold text-white mb-2">
                {stats.collectionRate.toFixed(2)}%
              </div>
              <div className="text-xs text-white/90 font-medium uppercase tracking-wide">Collection Rate</div>
            </div>
            <div className="absolute bottom-0 left-0 opacity-20 z-0">
              <i className="fas fa-chart-line text-6xl sm:text-7xl md:text-8xl text-white"></i>
            </div>
          </Link>
        </div>
      </div>

      {/* Students Per Class Table */}
      <div className="card-modern">
        <div className="section-header">
          <h3 className="section-title">Students Per Class</h3>
        </div>
        <div className="w-full">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-4 sm:px-0">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-gradient-to-r from-primary-600 to-primary-700">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Class</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Number of Students</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-white uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {stats.studentsPerClass.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 sm:px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <i className="fas fa-inbox text-5xl mb-4 text-slate-300"></i>
                          <div className="text-base font-medium">No class data available</div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    stats.studentsPerClass.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50 hover:bg-blue-50/50'}>
                        <td className="px-3 sm:px-6 py-4 whitespace-normal sm:whitespace-nowrap text-sm font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0"></div>
                            <span>{item.class}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-normal sm:whitespace-nowrap text-sm font-bold text-primary-600">{item.students} Students</td>
                        <td className="px-3 sm:px-6 py-4 whitespace-normal sm:whitespace-nowrap text-sm">
                          <Link 
                            to={`/students/classes?class=${encodeURIComponent(item.class)}`}
                            className="btn-ghost px-3 sm:px-4 py-2 text-xs font-semibold inline-flex items-center gap-2 min-h-[36px] sm:min-h-auto hover:bg-primary-100 hover:text-primary-700"
                          >
                            <i className="fas fa-eye"></i> <span className="hidden sm:inline">View</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;

