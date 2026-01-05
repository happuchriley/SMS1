import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';

interface StaffItem {
  id: string;
  name: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
}

interface PayslipData {
  grossSalary: number;
  netSalary: number;
  [key: string]: any;
}

interface FormData {
  payPeriod: string;
  department: string;
  staff: string;
}

const GeneratePayslip: React.FC = () => {
  const { toast } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    payPeriod: '',
    department: '',
    staff: ''
  });

  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [payslipData, setPayslipData] = useState<Record<string, PayslipData>>({});

  // Sample data
  const departments: string[] = ['All Departments', 'Mathematics', 'Administration', 'Finance', 'IT', 'Science'];

  const loadStaff = useCallback(async () => {
    try {
      const staff = await staffService.getAll();
      setAllStaff(staff);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.showError('Failed to load staff');
    }
  }, [toast]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Filter staff by department
  const filteredStaff = useMemo<StaffItem[]>(() => {
    if (!formData.department || formData.department === 'All Departments') {
      return allStaff.map((s: any) => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        department: s.department,
        basicSalary: parseFloat(s.basicSalary?.toString() || '0') || 0,
        allowances: parseFloat(s.allowances?.toString() || '0') || 0,
        deductions: parseFloat(s.deductions?.toString() || '0') || 0
      }));
    }
    return allStaff
      .filter(s => s.department === formData.department)
      .map((s: any) => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        department: s.department,
        basicSalary: parseFloat(s.basicSalary?.toString() || '0') || 0,
        allowances: parseFloat(s.allowances?.toString() || '0') || 0,
        deductions: parseFloat(s.deductions?.toString() || '0') || 0
      }));
  }, [formData.department, allStaff]);

  // Calculate payslip when staff is selected
  const calculatePayslip = (staff: StaffItem): PayslipData => {
    const gross = staff.basicSalary + staff.allowances;
    const net = gross - staff.deductions;
    return {
      ...staff,
      grossSalary: gross,
      netSalary: net
    };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'department') {
      setSelectedStaff([]);
      setPayslipData({});
    }
  };

  const handleStaffToggle = (staffId: string): void => {
    setSelectedStaff(prev => {
      if (prev.includes(staffId)) {
        const newSelected = prev.filter(id => id !== staffId);
        const newPayslips = { ...payslipData };
        delete newPayslips[staffId];
        setPayslipData(newPayslips);
        return newSelected;
      } else {
        const staff = filteredStaff.find(s => s.id === staffId);
        if (staff) {
          setPayslipData(prev => ({ ...prev, [staffId]: calculatePayslip(staff) }));
        }
        return [...prev, staffId];
      }
    });
  };

  const handleSelectAll = (): void => {
    if (selectedStaff.length === filteredStaff.length) {
      setSelectedStaff([]);
      setPayslipData({});
    } else {
      const allIds = filteredStaff.map(s => s.id);
      const allPayslips: Record<string, PayslipData> = {};
      filteredStaff.forEach(s => {
        allPayslips[s.id] = calculatePayslip(s);
      });
      setSelectedStaff(allIds);
      setPayslipData(allPayslips);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.payPeriod || selectedStaff.length === 0) {
      toast.showError('Please select pay period and at least one staff member.');
      return;
    }

    setLoading(true);
    try {
      for (const staffId of selectedStaff) {
        const payslip = payslipData[staffId];
        if (payslip) {
          await payrollService.generatePayslip({
            staffId: staffId,
            period: formData.payPeriod,
            grossPay: payslip.grossSalary,
            netPay: payslip.netSalary,
            basicSalary: payslip.basicSalary,
            allowances: payslip.allowances,
            deductions: payslip.deductions,
            tax: payslip.deductions * 0.3, // Simplified tax calculation
            ssnit: payslip.deductions * 0.7 // Simplified SSNIT calculation
          });
        }
      }
      toast.showSuccess(`${selectedStaff.length} payslip(s) generated successfully!`);
      setFormData({ payPeriod: '', department: '', staff: '' });
      setSelectedStaff([]);
      setPayslipData({});
    } catch (error: any) {
      console.error('Error generating payslips:', error);
      toast.showError(error.message || 'Failed to generate payslips');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ payPeriod: '', department: '', staff: '' });
    setSelectedStaff([]);
    setPayslipData({});
  };

  const totalNetSalary = useMemo<number>(() => {
    return Object.values(payslipData).reduce((sum, p) => sum + (p.netSalary || 0), 0);
  }, [payslipData]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Generate Payslip</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Generate Payslip</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Payslip Generation</h2>
          <p className="text-sm text-gray-600">Select pay period and staff members to generate payslips.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Pay Period <span className="text-red-500">*</span>
              </label>
              <input
                type="month"
                name="payPeriod"
                value={formData.payPeriod}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept === 'All Departments' ? '' : dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Staff Selection */}
      {filteredStaff.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Select Staff ({filteredStaff.length})
            </h2>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
            >
              {selectedStaff.length === filteredStaff.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedStaff.length === filteredStaff.length && filteredStaff.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Staff ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Basic Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Allowances</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Deductions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Net Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStaff.map(staff => {
                  const payslip = payslipData[staff.id] || calculatePayslip(staff);
                  return (
                    <tr key={staff.id} className={selectedStaff.includes(staff.id) ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStaff.includes(staff.id)}
                          onChange={() => handleStaffToggle(staff.id)}
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{staff.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{staff.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{staff.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{staff.basicSalary.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-green-600">{staff.allowances.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-red-600">{staff.deductions.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{payslip.netSalary.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {selectedStaff.length > 0 && (
            <div className="px-4 sm:px-6 py-4 bg-primary-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    <strong>{selectedStaff.length}</strong> staff selected
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-600">Total Net Salary</p>
                  <p className="text-xl font-bold text-primary-600">GHS {totalNetSalary.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e as any)}
              disabled={selectedStaff.length === 0 || !formData.payPeriod}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-file-invoice mr-2"></i>
              Generate Payslips
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GeneratePayslip;

