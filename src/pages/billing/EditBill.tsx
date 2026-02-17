import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const EditBill: React.FC = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const { toast, showDeleteConfirm } = useModal();
  const [bills, setBills] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingBill, setEditingBill] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const loadData = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const [studentBills, studentData] = await Promise.all([
        billingService.getBillsByStudent(studentId),
        studentsService.getById(studentId)
      ]);
      setBills(studentBills);
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

  const handleEdit = (bill: any) => {
    setEditingBill(bill.id);
    setFormData({
      academicYear: bill.academicYear || '',
      term: bill.term || '',
      billDate: bill.billDate || '',
      dueDate: bill.dueDate || '',
      total: bill.total || 0,
      status: bill.status || 'pending'
    });
  };

  const handleCancel = () => {
    setEditingBill(null);
    setFormData({});
  };

  const handleSave = async (billId: string) => {
    try {
      await billingService.updateBill(billId, formData);
      toast.showSuccess('Bill updated successfully');
      setEditingBill(null);
      loadData();
    } catch (error: any) {
      console.error('Error updating bill:', error);
      toast.showError(error.message || 'Failed to update bill');
    }
  };

  const handleDelete = async (billId: string) => {
    const confirmed = await showDeleteConfirm(
      'Delete Bill',
      'Are you sure you want to delete this bill? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        await billingService.deleteBill(billId);
        toast.showSuccess('Bill deleted successfully');
        loadData();
      } catch (error: any) {
        console.error('Error deleting bill:', error);
        toast.showError(error.message || 'Failed to delete bill');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Edit/Delete Bill</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Edit Bill</span>
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
        {bills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No bills found for this student.</p>
            <Link
              to="/billing/create-single"
              className="mt-4 inline-block px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
            >
              Create New Bill
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Academic Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    {editingBill === bill.id ? (
                      <>
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.billNumber || bill.id}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            name="academicYear"
                            value={formData.academicYear}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            name="term"
                            value={formData.term}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            name="billDate"
                            value={formData.billDate}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            name="total"
                            value={formData.total}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSave(bill.id)}
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
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.billNumber || bill.id}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.academicYear || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.term || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.billDate || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{bill.dueDate || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{parseFloat(bill.total || 0).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                            bill.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {bill.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(bill)}
                              className="px-3 py-1 text-xs font-semibold text-white bg-primary-500 rounded hover:bg-primary-700 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(bill.id)}
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

export default EditBill;
