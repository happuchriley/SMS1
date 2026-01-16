import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const EditPayment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const navigate = useNavigate();
  const { toast, showDeleteConfirm } = useModal();
  const [payments, setPayments] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const [studentPayments, studentData] = await Promise.all([
        billingService.getPaymentsByStudent(studentId),
        studentsService.getById(studentId)
      ]);
      setPayments(studentPayments);
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (payment: any) => {
    setEditingPayment(payment.id);
    setFormData({
      amount: payment.amount || 0,
      paymentDate: payment.paymentDate || '',
      paymentMethod: payment.paymentMethod || 'cash',
      reference: payment.reference || '',
      notes: payment.notes || ''
    });
  };

  const handleCancel = () => {
    setEditingPayment(null);
    setFormData({});
  };

  const handleSave = async (paymentId: string) => {
    try {
      await billingService.updatePayment(paymentId, formData);
      toast.showSuccess('Payment updated successfully');
      setEditingPayment(null);
      loadData();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      toast.showError(error.message || 'Failed to update payment');
    }
  };

  const handleDelete = async (paymentId: string) => {
    const confirmed = await showDeleteConfirm(
      'Delete Payment',
      'Are you sure you want to delete this payment? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await billingService.deletePayment(paymentId);
        toast.showSuccess('Payment deleted successfully');
        loadData();
      } catch (error: any) {
        console.error('Error deleting payment:', error);
        toast.showError(error.message || 'Failed to delete payment');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500"></i>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Edit/Delete Payment</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/fee-collection" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Fee Collection</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Edit Payment</span>
            </div>
          </div>
        </div>
      </div>

      {student && (
        <div className="bg-white rounded-lg p-4 mb-4 shadow-md border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Student Information</h2>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Name:</span> {student.firstName} {student.surname} {student.otherNames || ''}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Student ID:</span> {student.studentId || student.id}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Class:</span> {student.class || 'N/A'}
          </p>
        </div>
      )}

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        {payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No payments found for this student.</p>
            <Link
              to="/fee-collection/record-single"
              className="mt-4 inline-block px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
            >
              Record New Payment
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Payment Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reference</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Notes</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    {editingPayment === payment.id ? (
                      <>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            name="paymentDate"
                            value={formData.paymentDate}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            step="0.01"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            name="paymentMethod"
                            value={formData.paymentMethod}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="cash">Cash</option>
                            <option value="cheque">Cheque</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_money">Mobile Money</option>
                            <option value="other">Other</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            name="reference"
                            value={formData.reference}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Reference number"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.billId || payment.bill || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Notes"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(payment.id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.paymentDate || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{parseFloat(payment.amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 capitalize">{payment.paymentMethod || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.reference || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.billId || payment.bill || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.notes || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(payment)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-primary-500 rounded hover:bg-primary-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(payment.id)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EditPayment;
