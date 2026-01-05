import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import payrollService from '../../services/payrollService';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';

interface AdvanceItem {
  id: string;
  staffId: string;
  staffName: string;
  amount: number;
  advanceDate: string;
  repaymentDate: string;
  reason: string;
  repaidAmount: number;
  balance: number;
  status: string;
}

interface FormData {
  staff: string;
  advanceAmount: string;
  advanceDate: string;
  repaymentDate: string;
  reason: string;
  repaymentMethod: string;
}

interface Stats {
  total: number;
  pending: number;
  partiallyPaid: number;
  paid: number;
  totalAdvance: number;
  totalRepaid: number;
  totalBalance: number;
}

const SalaryAdvances: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStaff, setAllStaff] = useState<any[]>([]);
  const [advances, setAdvances] = useState<AdvanceItem[]>([]);
  const [formData, setFormData] = useState<FormData>({
    staff: '',
    advanceAmount: '',
    advanceDate: '',
    repaymentDate: '',
    reason: '',
    repaymentMethod: 'deduct'
  });

  const repaymentMethods: string[] = ['Deduct from Salary', 'Manual Payment'];

  const loadData = useCallback(async () => {
    try {
      const [staff, allAdvances] = await Promise.all([
        staffService.getAll(),
        payrollService.getAllAdvances()
      ]);
      setAllStaff(staff);
      setAdvances(allAdvances.map((a: any) => ({
        id: a.id,
        staffId: a.staffId,
        staffName: a.staffName || `${a.firstName || ''} ${a.surname || ''}`.trim(),
        amount: parseFloat(a.amount?.toString() || '0') || 0,
        advanceDate: a.advanceDate,
        repaymentDate: a.repaymentDate,
        reason: a.reason || '',
        repaidAmount: parseFloat(a.repaidAmount?.toString() || '0') || 0,
        balance: parseFloat(a.balance?.toString() || '0') || 0,
        status: a.status || 'Pending'
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.staff || !formData.advanceAmount || !formData.advanceDate || !formData.repaymentDate || !formData.reason) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await payrollService.createAdvance({
        staffId: formData.staff,
        amount: parseFloat(formData.advanceAmount),
        advanceDate: formData.advanceDate,
        repaymentDate: formData.repaymentDate,
        reason: formData.reason,
        repaymentMethod: formData.repaymentMethod,
        status: 'pending'
      });
      toast.showSuccess('Salary advance recorded successfully!');
      await loadData();
      handleClear();
    } catch (error: any) {
      console.error('Error recording salary advance:', error);
      toast.showError(error.message || 'Failed to record salary advance');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ staff: '', advanceAmount: '', advanceDate: '', repaymentDate: '', reason: '', repaymentMethod: 'deduct' });
  };

  const handleRepayment = (advanceId: string): void => {
    const amount = prompt('Enter repayment amount:');
    if (amount && parseFloat(amount) > 0) {
      setAdvances(prev => prev.map(advance => {
        if (advance.id === advanceId) {
          const newRepaid = advance.repaidAmount + parseFloat(amount);
          const newBalance = advance.amount - newRepaid;
          return {
            ...advance,
            repaidAmount: newRepaid,
            balance: newBalance,
            status: newBalance <= 0 ? 'Paid' : newRepaid > 0 ? 'Partially Paid' : 'Pending'
          };
        }
        return advance;
      }));
    }
  };

  const handleDelete = (id: string): void => {
    const advance = advances.find(a => a.id === id);
    showDeleteModal({
      title: 'Delete Salary Advance',
      message: `Are you sure you want to delete the salary advance record for ${advance?.staffName}? This action cannot be undone.`,
      onConfirm: () => {
        setAdvances(prev => prev.filter(a => a.id !== id));
      }
    });
  };

  const stats = useMemo<Stats>(() => {
    return {
      total: advances.length,
      pending: advances.filter(a => a.status === 'Pending').length,
      partiallyPaid: advances.filter(a => a.status === 'Partially Paid').length,
      paid: advances.filter(a => a.status === 'Paid').length,
      totalAdvance: advances.reduce((sum, a) => sum + a.amount, 0),
      totalRepaid: advances.reduce((sum, a) => sum + a.repaidAmount, 0),
      totalBalance: advances.reduce((sum, a) => sum + a.balance, 0),
    };
  }, [advances]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Salary Advances</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Salary Advances</span>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-yellow-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Pending</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-orange-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Partially</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.partiallyPaid}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Paid</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.paid}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Advance</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalAdvance.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-600">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Repaid</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalRepaid.toLocaleString()}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Balance</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalBalance.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Add Advance Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Record Salary Advance</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Staff <span className="text-red-500">*</span>
              </label>
              <select
                name="staff"
                value={formData.staff}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Staff</option>
                {allStaff.map((staff: any) => (
                  <option key={staff.id} value={staff.id}>{staff.id} - {`${staff.firstName || ''} ${staff.surname || ''}`.trim()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Advance Amount (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="advanceAmount"
                value={formData.advanceAmount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Advance Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="advanceDate"
                value={formData.advanceDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Repayment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="repaymentDate"
                value={formData.repaymentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Repayment Method
              </label>
              <select
                name="repaymentMethod"
                value={formData.repaymentMethod}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {repaymentMethods.map(method => (
                  <option key={method} value={method.toLowerCase().replace(/\s+/g, '-')}>{method}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Reason <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                placeholder="Enter reason for advance"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              Record Advance
            </button>
          </div>
        </form>
      </div>

      {/* Advances List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Salary Advances Record</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Staff Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Advance Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Advance Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repayment Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Repaid</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {advances.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    No salary advances found. Record one above.
                  </td>
                </tr>
              ) : (
                advances.map(advance => (
                  <tr key={advance.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{advance.staffId}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{advance.staffName}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{advance.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(advance.advanceDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(advance.repaymentDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{advance.reason}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{advance.repaidAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">{advance.balance.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        advance.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        advance.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {advance.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {advance.balance > 0 && (
                          <button
                            type="button"
                            onClick={() => handleRepayment(advance.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                            title="Record Repayment"
                          >
                            <i className="fas fa-money-bill-wave"></i>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDelete(advance.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
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

export default SalaryAdvances;

