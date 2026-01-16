import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import billingService from '../../services/billingService';
import { useModal } from '../../components/ModalProvider';

const ViewStatement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const { toast } = useModal();
  const [statement, setStatement] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStatement = useCallback(async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const bills = await billingService.getBillsByStudent(studentId);
      // Calculate statement summary
      let totalBill = 0;
      let totalPaid = 0;
      for (const bill of bills) {
        const billTotal = typeof bill.total === 'string' ? parseFloat(bill.total) : (typeof bill.total === 'number' ? bill.total : 0);
        totalBill += billTotal;
        const paid = await billingService.getTotalPaidForBill(bill.id);
        totalPaid += paid;
      }
      setStatement({
        totalBill,
        totalPaid,
        balance: totalBill - totalPaid,
        bills
      });
    } catch (error) {
      console.error('Error loading statement:', error);
      toast.showError('Failed to load statement');
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  useEffect(() => {
    loadStatement();
  }, [loadStatement]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500"></i>
        </div>
      </Layout>
    );
  }

  if (!statement) {
    return (
      <Layout>
        <div className="text-center py-12">
          <p className="text-gray-600">No statement found for this student.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">View Statement</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">View Statement</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Statement Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <div className="text-sm text-gray-600 mb-1">Total Bill</div>
              <div className="text-2xl font-bold text-gray-900">{statement.totalBill.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-green-50 rounded-md">
              <div className="text-sm text-gray-600 mb-1">Total Paid</div>
              <div className="text-2xl font-bold text-green-600">{statement.totalPaid.toLocaleString()}</div>
            </div>
            <div className="p-4 bg-red-50 rounded-md">
              <div className="text-sm text-gray-600 mb-1">Balance</div>
              <div className="text-2xl font-bold text-red-600">{statement.balance.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {statement.bills && statement.bills.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Bill Number</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {statement.bills.map((bill: any) => (
                    <tr key={bill.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{bill.billNumber || bill.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{bill.billDate || 'N/A'}</td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewStatement;
