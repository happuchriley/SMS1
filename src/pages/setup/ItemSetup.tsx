import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import financeService from '../../services/financeService';
import { useModal } from '../../components/ModalProvider';

type TabType = 'class' | 'subject' | 'bill' | 'account';

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
  reportHead: string;
  newCode: string;
}

interface SubjectFormData {
  subjectNameFull: string;
  subjectNameShort: string;
  category: string;
  classStage: string;
  status: string;
}

interface BillItemRow {
  id: string;
  billItem: string;
  amount: number;
}

interface BillFormData {
  academicYear: string;
  term: string;
  classGroup: string;
  billName: string;
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

  const [subjectFormData, setSubjectFormData] = useState<SubjectFormData>({
    subjectNameFull: '',
    subjectNameShort: '',
    category: '',
    classStage: '',
    status: ''
  });

  const [billFormData, setBillFormData] = useState<BillFormData>({
    academicYear: '2024/2025',
    term: 'Term 3',
    classGroup: '',
    billName: ''
  });

  const [billItemRows, setBillItemRows] = useState<BillItemRow[]>([
    { id: '1', billItem: '', amount: 0 }
  ]);

  const [accountFormData, setAccountFormData] = useState<AccountFormData>({
    accountType: '',
    mainAccountCateg: '',
    subAccountCateg: '',
    accountName: '',
    reportHead: '',
    newCode: ''
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
    // If account type changes, reset dependent fields
    if (name === 'accountType') {
      setAccountFormData(prev => ({
        ...prev,
        accountType: value,
        mainAccountCateg: '',
        subAccountCateg: '',
        reportHead: ''
      }));
    }
    // If main account category changes, reset sub category
    if (name === 'mainAccountCateg') {
      setAccountFormData(prev => ({
        ...prev,
        mainAccountCateg: value,
        subAccountCateg: '',
        reportHead: ''
      }));
    }
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
      accountName: '',
      reportHead: '',
      newCode: ''
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
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === 'class'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            New Class/Stage
          </button>
          <button
            onClick={() => setActiveTab('subject')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === 'subject'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Create New Subject/Course
          </button>
          <button
            onClick={() => setActiveTab('bill')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === 'bill'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-primary-600'
            }`}
          >
            Setup New Bill
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ${
              activeTab === 'account'
                ? 'text-primary-600 border-b-2 border-primary-500'
                : 'text-gray-600 hover:text-primary-600'
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

        {/* Subject/Course Form */}
        {activeTab === 'subject' && (
          <form onSubmit={(e) => { e.preventDefault(); toast.showSuccess('Subject created successfully!'); }}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Subject Name (Full) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subjectNameFull"
                    value={subjectFormData.subjectNameFull}
                    onChange={(e) => setSubjectFormData({...subjectFormData, subjectNameFull: e.target.value})}
                    placeholder="Enter subject name full"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Subject Name (Short) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="subjectNameShort"
                    value={subjectFormData.subjectNameShort}
                    onChange={(e) => setSubjectFormData({...subjectFormData, subjectNameShort: e.target.value})}
                    placeholder="Enter subject name short"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={subjectFormData.category}
                    onChange={(e) => setSubjectFormData({...subjectFormData, category: e.target.value})}
                    placeholder="Enter subject category"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Class/Stage
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="classStage"
                      value={subjectFormData.classStage}
                      onChange={(e) => setSubjectFormData({...subjectFormData, classStage: e.target.value})}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Class/Stage</option>
                      <option>Basic 1</option>
                      <option>Basic 2</option>
                      <option>Basic 3</option>
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
                    Status
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="status"
                      value={subjectFormData.status}
                      onChange={(e) => setSubjectFormData({...subjectFormData, status: e.target.value})}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Status</option>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setSubjectFormData({subjectNameFull: '', subjectNameShort: '', category: '', classStage: '', status: ''})}
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

        {/* Setup New Bill Form */}
        {activeTab === 'bill' && (
          <form onSubmit={(e) => { e.preventDefault(); toast.showSuccess('Bill setup created successfully!'); }}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup bill for the Term</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Academic Year</label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="academicYear"
                      value={billFormData.academicYear}
                      onChange={(e) => setBillFormData({...billFormData, academicYear: e.target.value})}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option>2024/2025</option>
                      <option>2023/2024</option>
                      <option>2025/2026</option>
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Term</label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="term"
                      value={billFormData.term}
                      onChange={(e) => setBillFormData({...billFormData, term: e.target.value})}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option>Term 3</option>
                      <option>Term 1</option>
                      <option>Term 2</option>
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Select class group</label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="classGroup"
                      value={billFormData.classGroup}
                      onChange={(e) => setBillFormData({...billFormData, classGroup: e.target.value})}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select class group</option>
                      <option>Basic 1</option>
                      <option>Basic 2</option>
                      <option>Basic 3</option>
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Bill Name/Description</label>
                  <input
                    type="text"
                    name="billName"
                    value={billFormData.billName}
                    onChange={(e) => setBillFormData({...billFormData, billName: e.target.value})}
                    placeholder="Enter Bill Name / Description eg. Bills for basic 1, 2022 year, term 1."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>

              {/* Bill Items Table */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">#</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Bill Item</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border border-gray-200">Amount (GHS)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItemRows.map((row, index) => (
                        <tr key={row.id}>
                          <td className="px-4 py-3 border border-gray-200">{index + 1}</td>
                          <td className="px-4 py-3 border border-gray-200">
                            <div className="relative select-dropdown-wrapper">
                              <select
                                value={row.billItem}
                                onChange={(e) => {
                                  const newRows = [...billItemRows];
                                  newRows[index].billItem = e.target.value;
                                  setBillItemRows(newRows);
                                }}
                                className="select-dropdown w-full px-3 py-2 border border-gray-200 rounded text-sm min-h-[36px]"
                              >
                                <option value="">Select Bill Item</option>
                                <option>Tuition Fee</option>
                                <option>Library Fee</option>
                                <option>PTA Dues</option>
                                <option>Computer Lab Fee</option>
                              </select>
                              <div className="select-dropdown-arrow">
                                <div className="select-dropdown-arrow-icon">
                                  <i className="fas fa-chevron-down text-xs"></i>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 border border-gray-200">
                            <input
                              type="number"
                              value={row.amount || ''}
                              onChange={(e) => {
                                const newRows = [...billItemRows];
                                newRows[index].amount = parseFloat(e.target.value) || 0;
                                setBillItemRows(newRows);
                              }}
                              placeholder="Enter Price"
                              className="w-full px-3 py-2 border border-gray-200 rounded text-sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      const newRows = [...billItemRows];
                      if (newRows.length > 1) {
                        newRows.pop();
                        setBillItemRows(newRows);
                      }
                    }}
                    disabled={billItemRows.length <= 1}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Row
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBillItemRows([...billItemRows, { id: Date.now().toString(), billItem: '', amount: 0 }]);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Add Row
                  </button>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-700">Grand Total:</span>
                    <input
                      type="text"
                      value={billItemRows.reduce((sum, row) => sum + (row.amount || 0), 0).toFixed(2)}
                      readOnly
                      className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700 w-32"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setBillFormData({academicYear: '2024/2025', term: 'Term 3', classGroup: '', billName: ''});
                    setBillItemRows([{ id: '1', billItem: '', amount: 0 }]);
                  }}
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
                      <option value="">Select Account Type first</option>
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
                      <option value="">Select Account Type first</option>
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
                      <option value="">Select Main Category first</option>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Enter new account name
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

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Report Head
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="reportHead"
                      value={accountFormData.reportHead}
                      onChange={handleAccountChange}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Sub Account Categ first</option>
                      <option>Income</option>
                      <option>Expense</option>
                      <option>Asset</option>
                      <option>Liability</option>
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
                    New code
                  </label>
                  <input
                    type="text"
                    name="newCode"
                    value={accountFormData.newCode}
                    onChange={handleAccountChange}
                    placeholder="Account Code"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
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
