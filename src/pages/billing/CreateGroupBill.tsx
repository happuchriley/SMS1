import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface BillItemType {
  id: string;
  name: string;
  defaultAmount: number;
}

interface StudentItem {
  id: string;
  name: string;
  class: string;
  studentId: string;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  billDate: string;
  dueDate: string;
  billItems: string[];
}

const CreateGroupBill: React.FC = () => {
  const { toast } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [billItemTypes, setBillItemTypes] = useState<BillItemType[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    billDate: '',
    dueDate: '',
    billItems: []
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [selectedBillItems, setSelectedBillItems] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [amounts, setAmounts] = useState<Record<string, number>>({});

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  const loadData = useCallback(async () => {
    try {
      const [students, billItems] = await Promise.all([
        studentsService.getAll(),
        setupService.getAllBillItems()
      ]);
      setAllStudents(students);
      
      // Convert bill items to format expected by component
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

  // Filter students by selected class
  const filteredStudents = useMemo<StudentItem[]>(() => {
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

  // Calculate total per item
  const calculateItemTotal = useCallback((itemId: string): number => {
    const quantity = quantities[itemId] || 1;
    const amount = amounts[itemId] || 0;
    return quantity * amount;
  }, [quantities, amounts]);

  // Calculate grand total
  const grandTotal = useMemo<number>(() => {
    return selectedBillItems.reduce((sum, itemId) => {
      return sum + calculateItemTotal(itemId);
    }, 0) * selectedStudents.length;
  }, [selectedBillItems, selectedStudents.length, calculateItemTotal]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      ...(name === 'class' && { students: [] })
    });
    if (name === 'class') {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId: string): void => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = (): void => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handleBillItemToggle = (itemId: string): void => {
    setSelectedBillItems(prev => {
      if (prev.includes(itemId)) {
        const newSelected = prev.filter(id => id !== itemId);
        const newQuantities = { ...quantities };
        const newAmounts = { ...amounts };
        delete newQuantities[itemId];
        delete newAmounts[itemId];
        setQuantities(newQuantities);
        setAmounts(newAmounts);
        return newSelected;
      } else {
        const item = billItemTypes.find(i => i.id === itemId);
        setQuantities(prev => ({ ...prev, [itemId]: 1 }));
        setAmounts(prev => ({ ...prev, [itemId]: item?.defaultAmount || 0 }));
        return [...prev, itemId];
      }
    });
  };

  const handleQuantityChange = (itemId: string, value: string): void => {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(1, parseInt(value) || 1) }));
  };

  const handleAmountChange = (itemId: string, value: string): void => {
    setAmounts(prev => ({ ...prev, [itemId]: Math.max(0, parseFloat(value) || 0) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || 
        !formData.billDate || !formData.dueDate || selectedStudents.length === 0 || selectedBillItems.length === 0) {
      toast.showError('Please fill in all required fields, select at least one student and one bill item.');
      return;
    }
    
    setLoading(true);
    try {
      const billItems = selectedBillItems.map(itemId => {
        const item = billItemTypes.find(i => i.id === itemId);
        return {
          id: itemId,
          name: item?.name,
          quantity: quantities[itemId] || 1,
          amount: amounts[itemId] || 0,
          total: calculateItemTotal(itemId)
        };
      });

      const itemTotal = selectedBillItems.reduce((sum, itemId) => {
        return sum + calculateItemTotal(itemId);
      }, 0);

      // Create bills for each selected student
      for (const studentId of selectedStudents) {
        const billData = {
          studentId: studentId,
          academicYear: formData.academicYear,
          term: formData.term,
          class: formData.class,
          billDate: formData.billDate,
          dueDate: formData.dueDate,
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
    setFormData({ academicYear: '', term: '', class: '', billDate: '', dueDate: '', billItems: [] });
    setSelectedStudents([]);
    setSelectedBillItems([]);
    setQuantities({});
    setAmounts({});
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Group Bill</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Create Group Bill</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Bill Information</h2>
          <p className="text-sm text-gray-600">Fill in the details below to create bills for multiple students.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Bill Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="billDate"
                value={formData.billDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
          </div>

          {/* Students Selection */}
          {filteredStudents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-semibold text-gray-900 text-sm">
                  Select Students <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllStudents}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-md p-4 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredStudents.map(student => (
                    <label
                      key={student.id}
                      className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="mr-3 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{student.id} - {student.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedStudents.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedStudents.length} student(s) selected
                </p>
              )}
            </div>
          )}

          {/* Bill Items */}
          <div className="mb-6">
            <label className="block mb-4 font-semibold text-gray-900 text-sm">
              Bill Items <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-gray-200 rounded-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Select</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Item Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Amount (GHS)</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Total per Student</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {billItemTypes.map(item => (
                      <tr key={item.id} className={selectedBillItems.includes(item.id) ? 'bg-primary-50' : ''}>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedBillItems.includes(item.id)}
                            onChange={() => handleBillItemToggle(item.id)}
                            className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.name}</td>
                        <td className="px-4 py-3">
                          {selectedBillItems.includes(item.id) ? (
                            <input
                              type="number"
                              min="1"
                              value={quantities[item.id] || 1}
                              onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {selectedBillItems.includes(item.id) ? (
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={amounts[item.id] || item.defaultAmount}
                              onChange={(e) => handleAmountChange(item.id, e.target.value)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          {selectedBillItems.includes(item.id) 
                            ? calculateItemTotal(item.id).toFixed(2)
                            : '-'
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary */}
          {selectedBillItems.length > 0 && selectedStudents.length > 0 && (
            <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-md">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Selected Students</div>
                  <div className="text-lg font-bold text-gray-900">{selectedStudents.length}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total per Student</div>
                  <div className="text-lg font-bold text-gray-900">
                    GHS {(grandTotal / selectedStudents.length).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Grand Total</div>
                  <div className="text-2xl font-bold text-primary-600">GHS {grandTotal.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

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
              <i className="fas fa-save mr-2"></i>
              Create Group Bill
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateGroupBill;

