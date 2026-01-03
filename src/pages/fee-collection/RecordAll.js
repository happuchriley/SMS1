import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const RecordAll = () => {
  const { toast } = useModal();
  const [, setLoading] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [formData, setFormData] = useState({
    academicYear: '',
    term: '',
    class: '',
    paymentDate: '',
    paymentMethod: '',
    referenceNumber: ''
  });

  const [payments, setPayments] = useState([]);

  // Sample data
  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const classes = ['Basic 1', 'Basic 2', 'Basic 3'];
  const paymentMethods = ['Cash', 'Cheque', 'Bank Transfer', 'Mobile Money', 'Card'];

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
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

  // Initialize payments when class changes
  useEffect(() => {
    const loadBillsForStudents = async () => {
      if (formData.class && filteredStudents.length > 0) {
        try {
          const initialPayments = await Promise.all(
            filteredStudents.map(async (student) => {
              const bills = await billingService.getBillsByStudent(student.id);
              const totalBillAmount = bills.reduce((sum, b) => sum + (parseFloat(b.total) || 0), 0);
              let totalPaid = 0;
              for (const bill of bills) {
                const paid = await billingService.getTotalPaidForBill(bill.id);
                totalPaid += paid;
              }
              const balance = totalBillAmount - totalPaid;
              
              return {
                studentId: student.id,
                studentName: student.name,
                billAmount: totalBillAmount,
                balance: Math.max(0, balance),
                paymentAmount: 0
              };
            })
          );
          setPayments(initialPayments);
        } catch (error) {
          console.error('Error loading bills:', error);
          // Fallback to simple structure
          const initialPayments = filteredStudents.map(student => ({
            studentId: student.id,
            studentName: student.name,
            billAmount: 0,
            balance: 0,
            paymentAmount: 0
          }));
          setPayments(initialPayments);
        }
      } else {
        setPayments([]);
      }
    };
    loadBillsForStudents();
  }, [formData.class, filteredStudents]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentChange = (studentId, value) => {
    const student = filteredStudents.find(s => s.id === studentId);
    const maxAmount = student?.balance || 0;
    const amount = Math.min(Math.max(0, parseFloat(value) || 0), maxAmount);
    setPayments(prev => prev.map(p => {
      if (p.studentId === studentId) {
        return { ...p, paymentAmount: amount };
      }
      return p;
    }));
  };

  const handleBulkFill = () => {
    const amount = prompt('Enter default payment amount for all students:');
    if (amount !== null && amount !== '') {
      const numAmount = parseFloat(amount) || 0;
      setPayments(prev => prev.map(p => ({
        ...p,
        paymentAmount: Math.min(numAmount, p.balance)
      })));
    }
  };

  const calculateTotal = () => {
    return payments.reduce((sum, p) => sum + p.paymentAmount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || 
        !formData.paymentDate || !formData.paymentMethod || payments.length === 0) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    const paymentsToRecord = payments.filter(p => p.paymentAmount > 0);
    if (paymentsToRecord.length === 0) {
      toast.showError('Please enter at least one payment amount.');
      return;
    }

    setLoading(true);
    try {
      // Record payment for each student
      for (const payment of paymentsToRecord) {
        // Get the first pending bill for this student
        const bills = await billingService.getBillsByStudent(payment.studentId);
        const pendingBill = bills.find(b => b.status === 'pending' || b.status === 'partial');
        
        if (pendingBill) {
          await billingService.recordPayment({
            studentId: payment.studentId,
            billId: pendingBill.id,
            amount: payment.paymentAmount,
            paymentDate: formData.paymentDate,
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber,
            academicYear: formData.academicYear,
            term: formData.term
          });
        } else {
          // Record payment without bill reference
          await billingService.recordPayment({
            studentId: payment.studentId,
            amount: payment.paymentAmount,
            paymentDate: formData.paymentDate,
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber,
            academicYear: formData.academicYear,
            term: formData.term
          });
        }
      }

      toast.showSuccess(`${paymentsToRecord.length} payment(s) recorded successfully! Total: GHS ${calculateTotal().toFixed(2)}`);
      handleClear();
    } catch (error) {
      console.error('Error recording payments:', error);
      toast.showError(error.message || 'Failed to record payments');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ academicYear: '', term: '', class: '', paymentDate: '', paymentMethod: '', referenceNumber: '' });
    setPayments([]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Record All Payments</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/fee-collection" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Fee Collection</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Record All Payments</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Payment Information</h2>
          <p className="text-sm text-gray-600">Record payments for all students in a class.</p>
        </div>

        <form onSubmit={handleSubmit}>
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
        </form>
      </div>

      {/* Payments Table */}
      {payments.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Enter Payment Amounts</h2>
            <button
              type="button"
              onClick={handleBulkFill}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
            >
              <i className="fas fa-fill mr-2"></i>Bulk Fill
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Amount (GHS)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance (GHS)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Amount (GHS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map((payment, index) => (
                    <tr key={payment.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payment.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.billAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-red-600">{payment.balance.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max={payment.balance}
                          step="0.01"
                          value={payment.paymentAmount}
                          onChange={(e) => handlePaymentChange(payment.studentId, e.target.value)}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total Payment Amount:</span>
                <span className="text-2xl font-bold text-primary-600">GHS {calculateTotal().toFixed(2)}</span>
              </div>
            </div>

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
                Record All Payments
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default RecordAll;
