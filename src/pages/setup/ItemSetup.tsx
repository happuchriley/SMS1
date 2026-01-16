import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import financeService from '../../services/financeService';
import { useModal } from '../../components/ModalProvider';

type TabType = 'class' | 'account';

interface ClassFormData {
  nameFull: string;
  nameShort: string;
  category: string;
  description: string;
  status: string;
}

interface AccountFormData {
  accountType: string;
  mainAccountCateg: string;
  subAccountCateg: string;
  accountName: string;
}

const ItemSetup: React.FC = () => {
  const { toast } = useModal();
  const [activeTab, setActiveTab] = useState<TabType>('class');
  const [loading, setLoading] = useState<boolean>(false);
  
  const [classFormData, setClassFormData] = useState<ClassFormData>({
    nameFull: '',
    nameShort: '',
    category: '',
    description: '',
    status: ''
  });

  const [accountFormData, setAccountFormData] = useState<AccountFormData>({
    accountType: '',
    mainAccountCateg: '',
    subAccountCateg: '',
    accountName: ''
  });

  const categories: string[] = ['Nursery', 'Primary', 'JHS', 'Senior High'];
  const statusOptions: string[] = ['Active', 'Inactive'];
  const accountTypes: string[] = ['Asset', 'Liability', 'Revenue', 'Expense', 'Equity'];
  const mainAccountCategories: string[] = ['Current Assets', 'Fixed Assets', 'Current Liabilities', 'Long-term Liabilities', 'Revenue', 'Expenses'];
  const subAccountCategories: string[] = ['Cash', 'Bank', 'Accounts Receivable', 'Inventory', 'Equipment', 'Buildings'];

  const handleClassChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setClassFormData({
      ...classFormData,
      [name]: value
    });
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setAccountFormData({
      ...accountFormData,
      [name]: value
    });
  };

  const handleClassReset = (): void => {
    setClassFormData({
      nameFull: '',
      nameShort: '',
      category: '',
      description: '',
      status: ''
    });
  };

  const handleAccountReset = (): void => {
    setAccountFormData({
      accountType: '',
      mainAccountCateg: '',
      subAccountCateg: '',
      accountName: ''
    });
  };

  const handleClassSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!classFormData.nameFull || !classFormData.nameShort || !classFormData.category || !classFormData.status) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await setupService.createClass({
        name: classFormData.nameFull,
        code: classFormData.nameShort,
        capacity: 0,
        classTeacher: '',
        status: classFormData.status
      });
      toast.showSuccess('Class/Stage created successfully!');
      handleClassReset();
    } catch (error: any) {
      console.error('Error saving class:', error);
      toast.showError(error.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!accountFormData.accountType || !accountFormData.accountName) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const accountCode = `${accountFormData.accountType.substring(0, 1)}${Math.floor(Math.random() * 9000) + 1000}`;
      await financeService.createAccount({
        name: accountFormData.accountName,
        code: accountCode,
        type: accountFormData.accountType
      });
      toast.showSuccess('Account Category created successfully!');
      handleAccountReset();
    } catch (error: any) {
      console.error('Error saving account:', error);
      toast.showError(error.message || 'Failed to save account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Setup Page
            </h1>
            <p className="text-sm text-gray-600">(Stages/Classes/Subjects/Courses/Bill Items/Bills)</p>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mt-2">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Setup Page (Stages/Classes/Subjects/Courses/Bill Items/Bills)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-5 md:p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('class')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
              activeTab === 'class'
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
            }`}
          >
            New Class/Stage
          </button>
          <Link
            to="/setup/subject-course"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            Create New Subject/Course
          </Link>
          <Link
            to="/setup/bill-item"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            Setup New Bill
          </Link>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 rounded-md ${
              activeTab === 'account'
                ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'
            }`}
          >
            New Account Code
          </button>
        </div>

        {/* Class/Stage Form */}
        {activeTab === 'class' && (
          <form onSubmit={handleClassSave}>
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Class/Stage Name (Full) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameFull"
                  value={classFormData.nameFull}
                  onChange={handleClassChange}
                  placeholder="Enter Class/Stage"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Class/Stage Name (Short) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameShort"
                  value={classFormData.nameShort}
                  onChange={handleClassChange}
                  placeholder="Enter Class/Stage"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Class/Stage Category <span className="text-red-500">*</span>
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="category"
                    value={classFormData.category}
                    onChange={handleClassChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
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
                  Class/Stage Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={classFormData.description}
                  onChange={handleClassChange}
                  placeholder="Enter Class/Stage Description"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="status"
                    value={classFormData.status}
                    onChange={handleClassChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <div className="select-dropdown-arrow">
                    <div className="select-dropdown-arrow-icon">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleClassReset}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-save"></i>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Account Code Form */}
        {activeTab === 'account' && (
          <form onSubmit={handleAccountSave}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Account Category</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Account Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="accountType"
                      value={accountFormData.accountType}
                      onChange={handleAccountChange}
                      required
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Account Type</option>
                      {accountTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
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
                    Main Account Categ
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="mainAccountCateg"
                      value={accountFormData.mainAccountCateg}
                      onChange={handleAccountChange}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Main Account Categ</option>
                      {mainAccountCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
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
                    Sub Account Categ
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="subAccountCateg"
                      value={accountFormData.subAccountCateg}
                      onChange={handleAccountChange}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Sub Account Categ</option>
                      {subAccountCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Account Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountName"
                  value={accountFormData.accountName}
                  onChange={handleAccountChange}
                  placeholder="Enter account name"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleAccountReset}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-save"></i>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
};

export default ItemSetup;
