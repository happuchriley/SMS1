import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';
import { getAccessibleClasses, filterStudentsByAccessibleClasses } from '../../utils/classRestriction';

interface BillItemType {
  id: string;
  name: string;
  defaultAmount: number;
}

interface BillItemRow {
  id: string;
  billItem: string;
  amount: number;
}

interface FormData {
  class: string;
  academicYear: string;
  term: string;
  billName: string;
  academicEndDate: string;
  nextResumptionDate: string;
  billType: string;
  billDate: string;
}

const CreateGroupBill: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [billItemTypes, setBillItemTypes] = useState<BillItemType[]>([]);
  const [billItemRows, setBillItemRows] = useState<BillItemRow[]>([]);
  const [formData, setFormData] = useState<FormData>({
    class: '',
    academicYear: '',
    term: '',
    billName: '',
    academicEndDate: '',
    nextResumptionDate: '',
    billType: '',
    billDate: ''
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const billTypes: string[] = ['Tuition', 'Registration', 'Library', 'PTA', 'Other'];

  const loadData = useCallback(async () => {
    try {
      const [students, billItems, accessibleClasses] = await Promise.all([
        studentsService.getAll(),
        setupService.getAllBillItems(),
        getAccessibleClasses()
      ]);
      const filteredStudents = await filterStudentsByAccessibleClasses(students);
      setAllStudents(filteredStudents);
      setClasses(accessibleClasses);
      
      const items: BillItemType[] = billItems.map((item: any) => ({
        id: item.id,
        name: item.name,
        defaultAmount: parseFloat(item.amount) || 0
      }));
      setBillItemTypes(items.length > 0 ? items : [
        { id: 'TUITION', name: 'Tuition Fee', defaultAmount: 500 },
        { id: 'REGISTRATION', name: 'Registration Fee', defaultAmount: 100 },
        { id: 'LIBRARY', name: 'Library Fee', defaultAmount: 50 },
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Initialize with one row
  useEffect(() => {
    if (billItemRows.length === 0) {
      setBillItemRows([{ id: '1', billItem: '', amount: 0 }]);
    }
  }, [billItemRows.length]);

  // Filter students by selected class
  const filteredStudents = useMemo<{ id: string; name: string; class: string; studentId: string }[]>(() => {
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

  // Auto-select all students when class is selected
  useEffect(() => {
    if (formData.class && filteredStudents.length > 0) {
      setSelectedStudents(filteredStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  }, [formData.class, filteredStudents]);

  // Calculate grand total
  const grandTotal = useMemo<number>(() => {
    return billItemRows.reduce((sum, row) => sum + (row.amount || 0), 0);
  }, [billItemRows]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: value
    };

    // Update bill name when year and term are selected
    if (name === 'academicYear' || name === 'term') {
      if (name === 'academicYear') {
        updatedFormData.academicYear = value;
      } else {
        updatedFormData.term = value;
      }
      
      if (updatedFormData.academicYear && updatedFormData.term) {
        updatedFormData.billName = `${updatedFormData.academicYear} - ${updatedFormData.term}`;
      }
    }

    setFormData(updatedFormData);
  };

  const handleBillItemChange = (rowId: string, field: 'billItem' | 'amount', value: string | number): void => {
    setBillItemRows(prev => prev.map(row => {
      if (row.id === rowId) {
        if (field === 'billItem') {
          const item = billItemTypes.find(i => i.id === value);
          return {
            ...row,
            billItem: value as string,
            amount: item?.defaultAmount || 0
          };
        } else {
          return { ...row, amount: typeof value === 'number' ? value : parseFloat(value) || 0 };
        }
      }
      return row;
    }));
  };

  const handleAddRow = (): void => {
    const newId = String(Date.now());
    setBillItemRows([...billItemRows, { id: newId, billItem: '', amount: 0 }]);
  };

  const handleDeleteRow = (rowId: string): void => {
    if (billItemRows.length > 1) {
      setBillItemRows(billItemRows.filter(row => row.id !== rowId));
    } else {
      toast.showError('At least one row is required');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.class || !formData.academicYear || !formData.term || 
        !formData.billDate || selectedStudents.length === 0 || billItemRows.length === 0) {
      toast.showError('Please fill in all required fields and add at least one bill item.');
      return;
    }
    
    setLoading(true);
    try {
      const billItems = billItemRows
        .filter(row => row.billItem && row.amount > 0)
        .map(row => {
          const item = billItemTypes.find(i => i.id === row.billItem);
          return {
            id: row.billItem,
            name: item?.name || '',
            quantity: 1,
            amount: row.amount,
            total: row.amount
          };
        });

      const itemTotal = billItems.reduce((sum, item) => sum + item.total, 0);

      // Create bills for each selected student
      for (const studentId of selectedStudents) {
        const billData = {
          studentId: studentId,
          academicYear: formData.academicYear,
          term: formData.term,
          class: formData.class,
          billDate: formData.billDate,
          dueDate: formData.academicEndDate,
          items: billItems,
          total: itemTotal,
          status: 'pending'
        };

        await billingService.createBill(billData);
      }

      toast.showSuccess(`Group bill created successfully for ${selectedStudents.length} student(s)! Total Amount: GHS ${grandTotal.toFixed(2)}`);
      handleClear();
    } catch (error: any) {
      console.error('Error creating group bill:', error);
      toast.showError(error.message || 'Failed to create group bill');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ 
      class: '', 
      academicYear: '', 
      term: '', 
      billName: '', 
      academicEndDate: '', 
      nextResumptionDate: '', 
      billType: '', 
      billDate: '' 
    });
    setSelectedStudents([]);
    setBillItemRows([{ id: '1', billItem: '', amount: 0 }]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Bill all Students (Group Billing)</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Bill for all Students (Group Billing)</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Panel - Step 1: Bill Details */}
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">Step 1</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Select Class/Group
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="class"
                    value={formData.class}
                    onChange={handleChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
                  >
                    <option value="">Select class group</option>
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
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
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
                  Term/Semester
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="term"
                    value={formData.term}
                    onChange={handleChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
                  >
                    <option value="">Select Term/s</option>
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
                  Bill Name/Description
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="billName"
                    value={formData.billName}
                    onChange={handleChange}
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
                    disabled={!formData.academicYear || !formData.term}
                  >
                    <option value="">Selection Year & Term first</option>
                    {formData.academicYear && formData.term && (
                      <option value={`${formData.academicYear} - ${formData.term}`}>
                        {formData.academicYear} - {formData.term}
                      </option>
                    )}
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
                  Academic End Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="academicEndDate"
                    value={formData.academicEndDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm pr-10"
                  />
                  <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Next Resumption Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="nextResumptionDate"
                    value={formData.nextResumptionDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm pr-10"
                  />
                  <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Bill Type
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="billType"
                    value={formData.billType}
                    onChange={handleChange}
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
                  >
                    <option value="">Select Bill Type</option>
                    {billTypes.map(type => (
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
                  Select Bill Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="billDate"
                    value={formData.billDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm pr-10"
                    placeholder="mm/dd/yyyy"
                  />
                  <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Step 2: Bill Items */}
          <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Run Bill for students below</p>
            <h2 className="text-lg sm:text-xl font-semibold text-green-600 mb-4">Step 2</h2>
            
            <div className="mb-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Bill Item</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Amount (GHS)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billItemRows.map((row, index) => (
                      <tr key={row.id}>
                        <td className="px-3 py-2 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-3 py-2">
                          <div className="relative select-dropdown-wrapper">
                            <select
                              value={row.billItem}
                              onChange={(e) => handleBillItemChange(row.id, 'billItem', e.target.value)}
                              className="select-dropdown w-full px-3 py-2 border border-gray-300 rounded-md text-sm min-h-[36px]"
                            >
                              <option value="">Select Bill Item</option>
                              {billItemTypes.map(item => (
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
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={row.amount || ''}
                            onChange={(e) => handleBillItemChange(row.id, 'amount', e.target.value)}
                            placeholder="Enter Price"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={() => {
                  if (billItemRows.length > 1) {
                    handleDeleteRow(billItemRows[billItemRows.length - 1].id);
                  } else {
                    toast.showError('At least one row is required');
                  }
                }}
                className="px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                Delete Row
              </button>
              <button
                type="button"
                onClick={handleAddRow}
                className="px-4 py-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
              >
                Add Row
              </button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-gray-900 text-sm">Grand Total</label>
                <input
                  type="text"
                  value={grandTotal.toFixed(2)}
                  readOnly
                  className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm font-semibold text-gray-900 bg-gray-50 w-32 text-right"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6">
          <button
            type="button"
            onClick={handleClear}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all duration-300"
          >
            Reset Bill Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Run Bill for All'}
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default CreateGroupBill;
