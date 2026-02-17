import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import billingService from '../../services/billingService';
import { useModal } from '../../components/ModalProvider';

const ViewBill: React.FC = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const { toast } = useModal();
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadBills = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const studentBills = await billingService.getBillsByStudent(studentId);
      setBills(studentBills);
    } catch (error) {
      toast.showError('Failed to load bills');
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  useEffect(() => {
    loadBills();
  }, [loadBills]);

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">View Bill</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">View Bill</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        {bills.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No bills found for this student.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Number</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Academic Year</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Term</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Paid</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bills.map((bill) => (
                  <tr key={bill.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.billNumber || bill.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.academicYear || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{bill.term || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{parseFloat(bill.total || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-green-600">{parseFloat(bill.paid || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-red-600">
                      {(parseFloat(bill.total || 0) - parseFloat(bill.paid || 0)).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                        bill.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {bill.status || 'Pending'}
                      </span>
                    </td>
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

export default ViewBill;
