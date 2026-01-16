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

interface FeeType {
  id: string;
  name: string;
  amount: number;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  student: string;
  feeType: string;
  receiptDate: string;
  receivedBy: string;
  receiptNumber: string;
  amount: string;
  notes: string;
}

const ReceiveOtherFee: React.FC = () => {
  const { toast } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [otherFeeTypes, setOtherFeeTypes] = useState<FeeType[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    student: '',
    feeType: '',
    receiptDate: '',
    receivedBy: '',
    receiptNumber: '',
    amount: '',
    notes: ''
  });

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const classes: string[] = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const staffMembers: string[] = ['Admin User', 'Finance Officer', 'Cashier'];

  const loadData = useCallback(async () => {
    try {
      const [students, fees] = await Promise.all([
        studentsService.getAll(),
        billingService.getAllOtherFees()
      ]);
      setAllStudents(students);
      setOtherFeeTypes(fees.map((f: any) => ({ id: f.id, name: f.name, amount: parseFloat(f.amount) || 0 })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Auto-fill amount when fee type is selected
  useEffect(() => {
    if (formData.feeType) {
      const fee = otherFeeTypes.find(f => f.id.toString() === formData.feeType);
      if (fee) {
        setFormData(prev => ({ ...prev, amount: fee.amount.toString() }));
      }
    }
  }, [formData.feeType, otherFeeTypes]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || !formData.student ||
        !formData.feeType || !formData.receiptDate || !formData.receivedBy || !formData.receiptNumber || !formData.amount) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const fee = otherFeeTypes.find(f => f.id.toString() === formData.feeType);
      await billingService.recordPayment({
        studentId: formData.student,
        amount: parseFloat(formData.amount),
        paymentDate: formData.receiptDate,
        paymentMethod: 'Cash',
        referenceNumber: formData.receiptNumber,
        academicYear: formData.academicYear,
        term: formData.term,
        feeType: formData.feeType,
        feeName: fee?.name,
        receivedBy: formData.receivedBy,
        notes: formData.notes
      });

      toast.showSuccess(`Other fee receipt issued successfully! Receipt Number: ${formData.receiptNumber}`);
      handleClear();
    } catch (error: any) {
      console.error('Error receiving other fee:', error);
      toast.showError(error.message || 'Failed to issue receipt');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ academicYear: '', term: '', class: '', student: '', feeType: '', receiptDate: '', receivedBy: '', receiptNumber: '', amount: '', notes: '' });
  };

  const generateReceiptNumber = (): void => {
    const receiptNum = 'RCP-' + Date.now().toString().slice(-8);
    setFormData(prev => ({ ...prev, receiptNumber: receiptNum }));
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Receive Other Fee</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/fee-collection" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Fee Collection</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Receive Other Fee</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Receipt Information</h2>
          <p className="text-sm text-gray-600">Issue receipt for other fee payments received.</p>
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
              <div className="relative select-dropdown-wrapper">
                <select
                  name="term"
                  value={formData.term}
                  onChange={handleChange}
                  required
                  className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select Term</option>
                  {terms.map(term => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
                <div className="select-dropdown-arrow">
                  <div className="select-dropdown-arrow-icon">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <div className="relative select-dropdown-wrapper">
                <select
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  required
                  className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
                <div className="select-dropdown-arrow">
                  <div className="select-dropdown-arrow-icon">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Student <span className="text-red-500">*</span>
              </label>
              <div className="relative select-dropdown-wrapper">
                <select
                  name="student"
                  value={formData.student}
                  onChange={handleChange}
                  required
                  disabled={!formData.class}
                  className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed min-h-[44px]"
                >
                  <option value="">{formData.class ? 'Select Student' : 'Select Class First'}</option>
                  {filteredStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.id} - {student.name}</option>
                  ))}
                </select>
                <div className="select-dropdown-arrow">
                  <div className="select-dropdown-arrow-icon">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Fee Type <span className="text-red-500">*</span>
              </label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Fee Type</option>
                {otherFeeTypes.map(fee => (
                  <option key={fee.id} value={fee.id}>{fee.name} - GHS {fee.amount}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Receipt Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="receiptDate"
                value={formData.receiptDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Received By <span className="text-red-500">*</span>
              </label>
              <select
                name="receivedBy"
                value={formData.receivedBy}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Staff</option>
                {staffMembers.map(staff => (
                  <option key={staff} value={staff}>{staff}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Receipt Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="receiptNumber"
                  value={formData.receiptNumber}
                  onChange={handleChange}
                  placeholder="Auto-generate or enter manually"
                  required
                  className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
                <button
                  type="button"
                  onClick={generateReceiptNumber}
                  className="px-4 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Amount (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Enter any additional notes..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
              />
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
              <i className="fas fa-receipt mr-2"></i>
              Issue Receipt
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default ReceiveOtherFee;

