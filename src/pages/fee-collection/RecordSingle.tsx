import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

interface StudentItem {
  id: string;
  name: string;
  class: string;
  studentId: string;
}

interface BillItem {
  id: string;
  billNumber: string;
  amount: number;
  paid: number;
  balance: number;
  dueDate: string;
  status: string;
  academicYear?: string;
  term?: string;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  student: string;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  amount: string;
  billNumber: string;
}

const RecordSingle: React.FC = () => {
  const { toast } = useModal();
  const [, setIsSubmitting] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    student: '',
    paymentDate: '',
    paymentMethod: '',
    referenceNumber: '',
    amount: '',
    billNumber: ''
  });

  const [bills, setBills] = useState<BillItem[]>([]);
  const [selectedBills, setSelectedBills] = useState<string[]>([]);
  const [paymentAmounts, setPaymentAmounts] = useState<Record<string, number>>({});

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }, []);

  const loadBillsForStudent = useCallback(async (studentId: string, academicYear: string, term: string) => {
    try {
      const studentBills = await billingService.getBillsByStudent(studentId);
      // Filter by academic year and term if selected
      let filtered = studentBills;
      if (academicYear) {
        filtered = filtered.filter((b: any) => b.academicYear === academicYear);
      }
      if (term) {
        filtered = filtered.filter((b: any) => b.term === term);
      }
      // Only show pending/partial bills
      filtered = filtered.filter((b: any) => b.status === 'pending' || b.status === 'partial');
      setBills(filtered.map((b: any) => ({
        id: b.id,
        billNumber: b.billNumber || b.id,
        amount: b.total || 0,
        paid: b.paid || 0,
        balance: (b.total || 0) - (b.paid || 0),
        dueDate: b.dueDate || '',
        status: b.status || 'pending'
      })));
    } catch (error) {
      console.error('Error loading bills:', error);
      toast.showError('Failed to load bills for student');
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (formData.student) {
      loadBillsForStudent(formData.student, formData.academicYear, formData.term);
    } else {
      setBills([]);
    }
  }, [formData.student, formData.academicYear, formData.term, loadBillsForStudent]);

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const paymentMethods: string[] = ['Cash', 'Cheque', 'Bank Transfer', 'Mobile Money', 'Card'];

  // Filter students by selected class
  const filteredStudents = useMemo<StudentItem[]>(() => {
    if (!formData.class) return [];
    return allStudents
      .filter(s => s.class === formData.class)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        class: s.class,
        studentId: s.studentId || s.id
      }));
  }, [formData.class, allStudents]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'class' && { student: '' })
    });
  };

  const handleBillToggle = (billId: string): void => {
    setSelectedBills(prev => {
      if (prev.includes(billId)) {
        const newSelected = prev.filter(id => id !== billId);
        const newAmounts = { ...paymentAmounts };
        delete newAmounts[billId];
        setPaymentAmounts(newAmounts);
        return newSelected;
      } else {
        const bill = bills.find(b => b.id === billId);
        setPaymentAmounts(prev => ({ ...prev, [billId]: bill?.balance || 0 }));
        return [...prev, billId];
      }
    });
  };

  const handleAmountChange = (billId: string, value: string): void => {
    const bill = bills.find(b => b.id === billId);
    const maxAmount = bill?.balance || 0;
    const amount = Math.min(Math.max(0, parseFloat(value) || 0), maxAmount);
    setPaymentAmounts(prev => ({ ...prev, [billId]: amount }));
  };

  const calculateTotal = (): number => {
    return selectedBills.reduce((sum, billId) => {
      return sum + (paymentAmounts[billId] || 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || !formData.student ||
        !formData.paymentDate || !formData.paymentMethod || selectedBills.length === 0) {
      toast.showError('Please fill in all required fields and select at least one bill.');
      return;
    }

    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      toast.showError('Payment amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Record payment for each selected bill
      for (const billId of selectedBills) {
        const amount = paymentAmounts[billId] || 0;
        if (amount > 0) {
          await billingService.recordPayment({
            studentId: formData.student,
            billId: billId,
            amount: amount,
            paymentDate: formData.paymentDate,
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber,
            academicYear: formData.academicYear,
            term: formData.term
          });
        }
      }

      toast.showSuccess(`Payment of GHS ${totalAmount.toFixed(2)} recorded successfully!`);
      handleClear();
      // Reload bills to reflect updated status
      await loadBillsForStudent(formData.student, formData.academicYear, formData.term);
    } catch (error: any) {
      console.error('Error recording payment:', error);
      toast.showError(error.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ academicYear: '', term: '', class: '', student: '', paymentDate: '', paymentMethod: '', referenceNumber: '', amount: '', billNumber: '' });
    setBills([]);
    setSelectedBills([]);
    setPaymentAmounts({});
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Record Single Payment</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/fee-collection" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Fee Collection</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Record Single Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Payment Information</h2>
          <p className="text-sm text-gray-600">Record payment for a single student.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                name="student"
                value={formData.student}
                onChange={handleChange}
                required
                disabled={!formData.class}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{formData.class ? 'Select Student' : 'Select Class First'}</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.id} - {student.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="paymentDate"
                value={formData.paymentDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Payment Method</option>
                {paymentMethods.map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Reference Number
              </label>
              <input
                type="text"
                name="referenceNumber"
                value={formData.referenceNumber}
                onChange={handleChange}
                placeholder="Enter reference number"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>

          {/* Bills Selection */}
          {bills.length > 0 && (
            <div className="mb-6">
              <label className="block mb-4 font-semibold text-gray-900 text-sm">
                Select Bills to Pay <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Select</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Number</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paid</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {bills.map(bill => (
                        <tr key={bill.id} className={selectedBills.includes(bill.id) ? 'bg-primary-50' : ''}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selectedBills.includes(bill.id)}
                              onChange={() => handleBillToggle(bill.id)}
                              disabled={bill.balance === 0}
                              className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{bill.billNumber}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{bill.amount.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-green-600">{bill.paid.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-red-600">{bill.balance.toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{new Date(bill.dueDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            {selectedBills.includes(bill.id) ? (
                              <input
                                type="number"
                                min="0"
                                max={bill.balance}
                                step="0.01"
                                value={paymentAmounts[bill.id] || bill.balance}
                                onChange={(e) => handleAmountChange(bill.id, e.target.value)}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          {selectedBills.length > 0 && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Payment Amount:</span>
                <span className="text-2xl font-bold text-primary-600">GHS {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
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
              Record Payment
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default RecordSingle;

