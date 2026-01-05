import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface AccountItem {
  id: number;
  code: string;
  name: string;
  type: string;
  balance: number;
  status: string;
}

interface FormData {
  code: string;
  name: string;
  type: string;
  status: string;
}

const ChartOfAccounts: React.FC = () => {
  const { showDeleteModal, toast } = useModal();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const [accounts, setAccounts] = useState<AccountItem[]>([
    { id: 1, code: '1000', name: 'Cash', type: 'Asset', balance: 50000, status: 'Active' },
    { id: 2, code: '1001', name: 'Bank Account', type: 'Asset', balance: 200000, status: 'Active' },
    { id: 3, code: '2000', name: 'Accounts Receivable', type: 'Asset', balance: 15000, status: 'Active' },
    { id: 4, code: '3000', name: 'Accounts Payable', type: 'Liability', balance: 8000, status: 'Active' },
    { id: 5, code: '4000', name: 'Tuition Income', type: 'Revenue', balance: 300000, status: 'Active' },
    { id: 6, code: '5000', name: 'Salary Expense', type: 'Expense', balance: 50000, status: 'Active' },
    { id: 7, code: '5001', name: 'Utility Expense', type: 'Expense', balance: 5000, status: 'Active' },
    { id: 8, code: '5002', name: 'Maintenance Expense', type: 'Expense', balance: 3000, status: 'Active' },
  ]);

  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    type: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState<number | null>(null);

  const accountTypes: string[] = ['Asset', 'Liability', 'Revenue', 'Expense', 'Equity'];

  // Filter accounts
  const filteredAccounts = useMemo<AccountItem[]>(() => {
    return accounts.filter(account => {
      const matchesSearch = 
        account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.includes(searchTerm);
      const matchesType = !selectedType || account.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [accounts, searchTerm, selectedType]);

  // Pagination
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const paginatedAccounts = useMemo<AccountItem[]>(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAccounts.slice(start, start + itemsPerPage);
  }, [filteredAccounts, currentPage, itemsPerPage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!formData.code || !formData.name || !formData.type) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    if (editingId) {
      setAccounts(prev => prev.map(a => 
        a.id === editingId ? { ...a, ...formData } : a
      ));
      setEditingId(null);
    } else {
      const newId = Math.max(...accounts.map(a => a.id), 0) + 1;
      setAccounts([...accounts, { id: newId, ...formData, balance: 0 }]);
    }

    setFormData({ code: '', name: '', type: '', status: 'Active' });
  };

  const handleEdit = (account: AccountItem): void => {
    setFormData({
      code: account.code,
      name: account.name,
      type: account.type,
      status: account.status
    });
    setEditingId(account.id);
  };

  const handleDelete = (id: number): void => {
    const account = accounts.find(a => a.id === id);
    showDeleteModal({
      title: 'Delete Account',
      message: `Are you sure you want to delete ${account?.name}? This action cannot be undone.`,
      onConfirm: () => {
        setAccounts(prev => prev.filter(a => a.id !== id));
      }
    });
  };

  const handleClear = (): void => {
    setFormData({ code: '', name: '', type: '', status: 'Active' });
    setEditingId(null);
  };

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedType('');
    setCurrentPage(1);
  };

  const handleExport = (): void => {
    toast.showSuccess('Exporting chart of accounts...');
  };

  const handlePrint = (): void => {
    window.print();
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Chart of Accounts</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/financial-reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Financial Reports</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Chart of Accounts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Account' : 'Add New Account'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Account Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="1000"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Account Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter account name"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Account Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Type</option>
                {accountTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by account name or code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Account Type</label>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Types</option>
              {accountTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {(searchTerm || selectedType) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-times mr-1.5"></i> Clear
              </button>
            )}
            <button
              type="button"
              onClick={handleExport}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-download mr-1.5"></i> <span className="hidden sm:inline">Export</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-print mr-1.5"></i> <span className="hidden sm:inline">Print</span>
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-primary-500"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Account Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Account Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Balance (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No accounts found.
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map(account => (
                  <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{account.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{account.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.type === 'Asset' ? 'bg-blue-100 text-blue-800' :
                        account.type === 'Liability' ? 'bg-red-100 text-red-800' :
                        account.type === 'Revenue' ? 'bg-green-100 text-green-800' :
                        account.type === 'Expense' ? 'bg-orange-100 text-orange-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {account.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{account.balance.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        account.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {account.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(account)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(account.id)}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAccounts.length)} of {filteredAccounts.length} accounts
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ChartOfAccounts;

