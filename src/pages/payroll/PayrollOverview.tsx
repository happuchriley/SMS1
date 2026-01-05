import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface PayrollItem {
  id: string;
  name: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
}

interface PeriodData {
  month: string;
  year: string;
}

interface Stats {
  totalStaff: number;
  paid: number;
  pending: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
}

const PayrollOverview: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodData>({
    month: new Date().toISOString().slice(0, 7),
    year: new Date().getFullYear().toString()
  });

  // Sample payroll data
  const payrollData: PayrollItem[] = [
    { id: 'STF001', name: 'Mr. John Teacher', department: 'Mathematics', basicSalary: 3000, allowances: 500, deductions: 300, netSalary: 3200, status: 'Paid' },
    { id: 'STF002', name: 'Mrs. Jane Principal', department: 'Administration', basicSalary: 5000, allowances: 1000, deductions: 500, netSalary: 5500, status: 'Paid' },
    { id: 'STF003', name: 'Mr. Michael Admin', department: 'Administration', basicSalary: 2500, allowances: 400, deductions: 250, netSalary: 2650, status: 'Pending' },
    { id: 'STF004', name: 'Ms. Sarah Accountant', department: 'Finance', basicSalary: 3500, allowances: 600, deductions: 350, netSalary: 3750, status: 'Paid' },
    { id: 'STF005', name: 'Mr. David IT', department: 'IT', basicSalary: 2800, allowances: 450, deductions: 280, netSalary: 2970, status: 'Paid' },
  ];

  // Statistics
  const stats = useMemo<Stats>(() => {
    return {
      totalStaff: payrollData.length,
      paid: payrollData.filter(p => p.status === 'Paid').length,
      pending: payrollData.filter(p => p.status === 'Pending').length,
      totalGross: payrollData.reduce((sum, p) => sum + p.basicSalary + p.allowances, 0),
      totalDeductions: payrollData.reduce((sum, p) => sum + p.deductions, 0),
      totalNet: payrollData.reduce((sum, p) => sum + p.netSalary, 0),
    };
  }, []);

  const handlePeriodChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSelectedPeriod({
      ...selectedPeriod,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Payroll Overview</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Payroll Overview</span>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="month"
              name="month"
              value={selectedPeriod.month}
              onChange={handlePeriodChange}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            />
            <Link
              to="/payroll/generate-payslip"
              className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
            >
              <i className="fas fa-plus mr-2"></i>Generate Payslips
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Staff</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalStaff}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Paid</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.paid}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-yellow-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Pending</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Gross (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalGross.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Deductions (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalDeductions.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-600">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Net (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalNet.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Payroll Details</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-download mr-1.5"></i>Export
            </button>
            <button
              type="button"
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-print mr-1.5"></i>Print
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Basic Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Allowances</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Deductions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Net Salary</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payrollData.map(payroll => (
                <tr key={payroll.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900">{payroll.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payroll.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{payroll.department}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{payroll.basicSalary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-green-600">{payroll.allowances.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-red-600">{payroll.deductions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{payroll.netSalary.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payroll.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payroll.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        title="View Payslip"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        type="button"
                        className="text-gray-600 hover:text-gray-700 text-sm font-medium"
                        title="Print Payslip"
                      >
                        <i className="fas fa-print"></i>
                      </button>
                    </div>
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

export default PayrollOverview;

