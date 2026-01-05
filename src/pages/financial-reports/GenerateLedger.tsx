import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface FormData {
  account: string;
  dateFrom: string;
  dateTo: string;
}

const GenerateLedger: React.FC = () => {
  const { toast } = useModal();
  const [formData, setFormData] = useState<FormData>({
    account: '',
    dateFrom: '',
    dateTo: ''
  });

  const accounts: string[] = [
    'Cash',
    'Bank Account',
    'Accounts Receivable',
    'Accounts Payable',
    'Tuition Income',
    'Salary Expense',
    'Utility Expense',
    'Maintenance Expense',
    'Other Income',
    'Other Expense'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!formData.account || !formData.dateFrom || !formData.dateTo) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    toast.showSuccess(`Ledger report generated for ${formData.account} from ${formData.dateFrom} to ${formData.dateTo}`);
    // In real app, this would navigate to the ledger view or download PDF
  };

  const handleClear = (): void => {
    setFormData({ account: '', dateFrom: '', dateTo: '' });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Generate Ledger</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Generate Ledger</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Generate Account Ledger</h2>
          <p className="text-sm text-gray-600">Select account and date range to generate ledger report.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Account <span className="text-red-500">*</span>
              </label>
              <select
                name="account"
                value={formData.account}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Account</option>
                {accounts.map(account => (
                  <option key={account} value={account}>{account}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Date From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateFrom"
                value={formData.dateFrom}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Date To <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dateTo"
                value={formData.dateTo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
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
              <i className="fas fa-file-pdf mr-2"></i>
              Generate Ledger
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default GenerateLedger;

