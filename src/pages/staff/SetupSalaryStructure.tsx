import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';
import salaryStructureService from '../../services/salaryStructureService';

interface Allowance {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

interface Deduction {
  name: string;
  amount: number;
  type: 'fixed' | 'percentage';
}

interface SalaryStructure {
  id: string;
  name: string;
  description?: string;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  taxRate?: number;
  ssnitRate?: number;
  status?: string;
}

const SetupSalaryStructure: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [formData, setFormData] = useState<Partial<SalaryStructure>>({
    name: '',
    description: '',
    basicSalary: 0,
    allowances: [],
    deductions: [],
    taxRate: 0,
    ssnitRate: 5.5,
    status: 'active'
  });
  const [newAllowance, setNewAllowance] = useState<Allowance>({ name: '', amount: 0, type: 'fixed' });
  const [newDeduction, setNewDeduction] = useState<Deduction>({ name: '', amount: 0, type: 'fixed' });

  const loadStructures = useCallback(async () => {
    try {
      setLoading(true);
      const data = await salaryStructureService.getAll();
      // Map data to ensure all required fields have defaults
      const mappedData: SalaryStructure[] = data.map(item => ({
        ...item,
        taxRate: item.taxRate ?? 0,
        ssnitRate: item.ssnitRate ?? 5.5,
        status: item.status ?? 'active',
        allowances: item.allowances || [],
        deductions: item.deductions || []
      }));
      setStructures(mappedData);
    } catch (error) {
      console.error('Error loading structures:', error);
      toast.showError('Failed to load salary structures');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStructures();
  }, [loadStructures]);

  const handleAdd = (): void => {
    setEditingStructure(null);
    setFormData({
      name: '',
      description: '',
      basicSalary: 0,
      allowances: [],
      deductions: [],
      taxRate: 0,
      ssnitRate: 5.5,
      status: 'active'
    });
    setShowForm(true);
  };

  const handleEdit = (structure: SalaryStructure): void => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      description: structure.description || '',
      basicSalary: structure.basicSalary,
      allowances: structure.allowances || [],
      deductions: structure.deductions || [],
      taxRate: structure.taxRate || 0,
      ssnitRate: structure.ssnitRate || 5.5,
      status: structure.status
    });
    setShowForm(true);
  };

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Salary Structure',
      message: 'Are you sure you want to delete this salary structure?',
      itemName: 'salary structure',
      onConfirm: async () => {
        try {
          await salaryStructureService.delete(id);
          toast.showSuccess('Salary structure deleted successfully');
          loadStructures();
        } catch (error) {
          console.error('Error deleting structure:', error);
          toast.showError('Failed to delete salary structure');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.name || !formData.basicSalary || formData.basicSalary <= 0) {
      toast.showError('Please fill in all required fields');
      return;
    }

    try {
      if (editingStructure) {
        await salaryStructureService.update(editingStructure.id, formData);
        toast.showSuccess('Salary structure updated successfully');
      } else {
        await salaryStructureService.create(formData as SalaryStructure);
        toast.showSuccess('Salary structure created successfully');
      }
      setShowForm(false);
      loadStructures();
    } catch (error: any) {
      console.error('Error saving structure:', error);
      toast.showError(error.message || 'Failed to save salary structure');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const addAllowance = (): void => {
    if (!newAllowance.name || newAllowance.amount <= 0) {
      toast.showError('Please enter allowance name and amount');
      return;
    }
    setFormData({
      ...formData,
      allowances: [...(formData.allowances || []), { ...newAllowance }]
    });
    setNewAllowance({ name: '', amount: 0, type: 'fixed' });
  };

  const removeAllowance = (index: number): void => {
    const updated = [...(formData.allowances || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, allowances: updated });
  };

  const addDeduction = (): void => {
    if (!newDeduction.name || newDeduction.amount <= 0) {
      toast.showError('Please enter deduction name and amount');
      return;
    }
    setFormData({
      ...formData,
      deductions: [...(formData.deductions || []), { ...newDeduction }]
    });
    setNewDeduction({ name: '', amount: 0, type: 'fixed' });
  };

  const removeDeduction = (index: number): void => {
    const updated = [...(formData.deductions || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, deductions: updated });
  };

  const calculateGross = (): number => {
    return salaryStructureService.calculateGrossSalary(formData as SalaryStructure);
  };

  const calculateNet = (): number => {
    return salaryStructureService.calculateNetSalary(formData as SalaryStructure);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Setup Salary Structure</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/staff/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Staff</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Setup Salary Structure</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors duration-150 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus"></i>
            <span>Add Structure</span>
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-6">
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Structure Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    required
                    className="input-modern w-full"
                    placeholder="e.g., Teacher Grade 1"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleChange}
                    rows={2}
                    className="input-modern w-full"
                    placeholder="Optional description"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Basic Salary (GH¢) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basicSalary"
                    value={formData.basicSalary || 0}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Tax Rate (%)</label>
                  <input
                    type="number"
                    name="taxRate"
                    value={formData.taxRate || 0}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">SSNIT Rate (%)</label>
                  <input
                    type="number"
                    name="ssnitRate"
                    value={formData.ssnitRate || 5.5}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="0.1"
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Status</label>
                  <select
                    name="status"
                    value={formData.status || 'active'}
                    onChange={handleChange}
                    className="input-modern w-full"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Allowances */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Allowances</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Allowance name"
                    value={newAllowance.name}
                    onChange={(e) => setNewAllowance({ ...newAllowance, name: e.target.value })}
                    className="input-modern sm:col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newAllowance.amount || ''}
                    onChange={(e) => setNewAllowance({ ...newAllowance, amount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="input-modern"
                  />
                  <select
                    value={newAllowance.type}
                    onChange={(e) => setNewAllowance({ ...newAllowance, type: e.target.value as 'fixed' | 'percentage' })}
                    className="input-modern"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addAllowance}
                  className="mb-4 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>Add Allowance
                </button>
                {formData.allowances && formData.allowances.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    {formData.allowances.map((allowance, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">
                          {allowance.name}: {allowance.type === 'fixed' ? `GH¢ ${allowance.amount.toFixed(2)}` : `${allowance.amount}%`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAllowance(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deductions */}
              <div className="mb-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Deductions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="Deduction name"
                    value={newDeduction.name}
                    onChange={(e) => setNewDeduction({ ...newDeduction, name: e.target.value })}
                    className="input-modern sm:col-span-2"
                  />
                  <input
                    type="number"
                    placeholder="Amount"
                    value={newDeduction.amount || ''}
                    onChange={(e) => setNewDeduction({ ...newDeduction, amount: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="input-modern"
                  />
                  <select
                    value={newDeduction.type}
                    onChange={(e) => setNewDeduction({ ...newDeduction, type: e.target.value as 'fixed' | 'percentage' })}
                    className="input-modern"
                  >
                    <option value="fixed">Fixed</option>
                    <option value="percentage">%</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={addDeduction}
                  className="mb-4 px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                >
                  <i className="fas fa-plus mr-1"></i>Add Deduction
                </button>
                {formData.deductions && formData.deductions.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    {formData.deductions.map((deduction, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="text-sm text-gray-700">
                          {deduction.name}: {deduction.type === 'fixed' ? `GH¢ ${deduction.amount.toFixed(2)}` : `${deduction.amount}%`}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeDeduction(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {formData.basicSalary && formData.basicSalary > 0 && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Salary Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary:</span>
                      <span className="font-semibold">GH¢ {formData.basicSalary.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Salary:</span>
                      <span className="font-semibold text-green-600">GH¢ {calculateGross().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Deductions:</span>
                      <span className="font-semibold text-red-600">GH¢ {(calculateGross() - calculateNet()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="text-gray-900 font-semibold">Net Salary:</span>
                      <span className="font-bold text-primary-600 text-lg">GH¢ {calculateNet().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingStructure ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structures List */}
      <div className="card-modern overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
            <p className="text-gray-600">Loading salary structures...</p>
          </div>
        ) : structures.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">No salary structures found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Basic Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Gross Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Net Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {structures.map((structure) => {
                  const gross = salaryStructureService.calculateGrossSalary(structure);
                  const net = salaryStructureService.calculateNetSalary(structure);
                  return (
                    <tr key={structure.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{structure.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">GH¢ {structure.basicSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">GH¢ {gross.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">GH¢ {net.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          (structure.status || 'active') === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {structure.status || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(structure)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                          >
                            <i className="fas fa-edit mr-1"></i>Edit
                          </button>
                          <button
                            onClick={() => handleDelete(structure.id)}
                            className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                          >
                            <i className="fas fa-trash mr-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SetupSalaryStructure;
