import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService, { BillItemData } from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface BillRow {
  id: string;
  billItem: string;
  amount: string;
}

interface BillFormData {
  academicYear: string;
  term: string;
  classGroup: string;
  billName: string;
}

const BillItem: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [billItems, setBillItems] = useState<BillItemData[]>([]);
  const [rows, setRows] = useState<BillRow[]>([
    { id: '1', billItem: '', amount: '' }
  ]);

  const [formData, setFormData] = useState<BillFormData>({
    academicYear: '',
    term: '',
    classGroup: '',
    billName: ''
  });

  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['Term 1', 'Term 2', 'Term 3'];
  const classGroups: string[] = ['Nursery', 'Primary', 'JHS', 'All Classes'];

  const loadBillItems = useCallback(async (): Promise<void> => {
    try {
      const items = await setupService.getAllBillItems();
      setBillItems(items);
    } catch (error) {
      console.error('Error loading bill items:', error);
      toast.showError('Failed to load bill items');
    }
  }, [toast]);

  useEffect(() => {
    loadBillItems();
  }, [loadBillItems]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRowChange = (id: string, field: keyof BillRow, value: string): void => {
    setRows(rows.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleAddRow = (): void => {
    const newId = (rows.length + 1).toString();
    setRows([...rows, { id: newId, billItem: '', amount: '' }]);
  };

  const handleDeleteRow = (id: string): void => {
    if (rows.length > 1) {
      setRows(rows.filter(row => row.id !== id));
    } else {
      toast.showError('At least one row is required');
    }
  };

  const calculateGrandTotal = (): number => {
    return rows.reduce((total, row) => {
      const amount = parseFloat(row.amount) || 0;
      return total + amount;
    }, 0);
  };

  const handleReset = (): void => {
    setFormData({
      academicYear: '',
      term: '',
      classGroup: '',
      billName: ''
    });
    setRows([{ id: '1', billItem: '', amount: '' }]);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.classGroup || !formData.billName) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    const validRows = rows.filter(row => row.billItem && row.amount);
    if (validRows.length === 0) {
      toast.showError('Please add at least one bill item with amount.');
      return;
    }

    setLoading(true);
    try {
      // Here you would create the bill - for now just show success
      toast.showSuccess('Bill setup created successfully!');
      handleReset();
    } catch (error: any) {
      console.error('Error saving bill:', error);
      toast.showError(error.message || 'Failed to save bill');
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
          <Link
            to="/setup/item-setup"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            New Class/Stage
          </Link>
          <Link
            to="/setup/subject-course"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            Create New Subject/Course
          </Link>
          <button
            className="px-4 py-2 text-sm font-medium bg-primary-100 text-primary-700 border-2 border-primary-500 rounded-md"
          >
            Setup New Bill
          </button>
          <Link
            to="/setup/item-setup"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            New Account Code
          </Link>
        </div>

        {/* Setup bill for the Term Form */}
        <form onSubmit={handleSave}>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Setup bill for the Term</h2>
          
          <div className="space-y-4 mb-6">
            {/* Term Selection Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Academic Year
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="academicYear"
                    value={formData.academicYear}
                    onChange={handleChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
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
                  Term
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
                  Class Group
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="classGroup"
                    value={formData.classGroup}
                    onChange={handleChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select class gro</option>
                    {classGroups.map(group => (
                      <option key={group} value={group}>{group}</option>
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

            {/* Bill Name/Description */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Bill Name/Description
              </label>
              <input
                type="text"
                name="billName"
                value={formData.billName}
                onChange={handleChange}
                placeholder="Enter Bill Name / Description eg. Bills for basic 1, 2022 year, term"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>

          {/* Bill Items Table */}
          <div className="mb-6">
            <table className="w-full border-collapse border-2 border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">#</th>
                  <th className="border-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Bill Item</th>
                  <th className="border-2 border-gray-200 px-4 py-3 text-left text-sm font-semibold text-gray-900">Amount (GHS)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={row.id}>
                    <td className="border-2 border-gray-200 px-4 py-3 text-center text-sm text-gray-900">{index + 1}</td>
                    <td className="border-2 border-gray-200 px-4 py-3">
                      <div className="relative select-dropdown-wrapper">
                        <select
                          value={row.billItem}
                          onChange={(e) => handleRowChange(row.id, 'billItem', e.target.value)}
                          className="select-dropdown w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 min-h-[40px]"
                        >
                          <option value="">Select Bill Item</option>
                          {billItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                        <div className="select-dropdown-arrow">
                          <div className="select-dropdown-arrow-icon">
                            <i className="fas fa-chevron-down"></i>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="border-2 border-gray-200 px-4 py-3">
                      <input
                        type="number"
                        value={row.amount}
                        onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                        placeholder="Enter Price"
                        step="0.01"
                        min="0"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Add Row / Delete Row Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2 text-sm font-semibold text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-all duration-300"
              >
                Add Row
              </button>
              <button
                type="button"
                onClick={() => rows.length > 1 && handleDeleteRow(rows[rows.length - 1].id)}
                disabled={rows.length <= 1}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Delete Row
              </button>
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-gray-900">Grand Total:</label>
              <input
                type="text"
                value={`GHS ${calculateGrandTotal().toFixed(2)}`}
                readOnly
                className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm font-semibold text-gray-900 bg-gray-50"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
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
        </form>
      </div>
    </Layout>
  );
};

export default BillItem;
