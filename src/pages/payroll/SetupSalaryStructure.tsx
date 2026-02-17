import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import salaryStructureService from '../../services/salaryStructureService';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface SalaryStructure {
  id?: string;
  name: string;
  description?: string;
  basicSalary: number;
  allowances: Allowance[];
  deductions: Deduction[];
  taxRate?: number;
  ssnitRate?: number;
  status?: string;
}

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

interface StaffPayee {
  id: string;
  staffId: string;
  name: string;
  position: string;
  department: string;
  salaryStructureId?: string;
  salaryStructureName?: string;
  basicSalary: number;
  grossSalary: number;
  netSalary: number;
  status: string;
}

const SetupSalaryStructure: React.FC = () => {
  const { toast, showDeleteModal, showEditModal } = useModal();
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [staffPayees, setStaffPayees] = useState<StaffPayee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'structures' | 'payees'>('structures');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [showStructureForm, setShowStructureForm] = useState<boolean>(false);
  const [editingStructure, setEditingStructure] = useState<SalaryStructure | null>(null);
  const [formData, setFormData] = useState<SalaryStructure>({
    name: '',
    description: '',
    basicSalary: 0,
    allowances: [],
    deductions: [],
    taxRate: 0,
    ssnitRate: 5.5,
    status: 'active'
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [structuresData, staffData] = await Promise.all([
        salaryStructureService.getAll(),
        staffService.getAll()
      ]);
      setStructures(structuresData);

      // Create payee list from staff
      const payees: StaffPayee[] = staffData.map((staff: any) => {
        const structure = structuresData.find((s: any) => s.id === staff.salaryStructureId);
        const basicSalary = structure?.basicSalary || 0;
        const grossSalary = structure ? salaryStructureService.calculateGrossSalary(structure) : basicSalary;
        const netSalary = structure ? salaryStructureService.calculateNetSalary(structure) : basicSalary;

        return {
          id: staff.id || staff.staffId,
          staffId: staff.staffId || staff.id,
          name: `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim(),
          position: staff.position || 'N/A',
          department: staff.department || 'N/A',
          salaryStructureId: staff.salaryStructureId,
          salaryStructureName: structure?.name || 'Not Assigned',
          basicSalary,
          grossSalary,
          netSalary,
          status: staff.status || 'active'
        };
      });
      setStaffPayees(payees);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddStructure = (): void => {
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
    setShowStructureForm(true);
  };

  const handleEditStructure = (structure: SalaryStructure): void => {
    setEditingStructure(structure);
    setFormData(structure);
    setShowStructureForm(true);
  };

  const handleDeleteStructure = (id: string): void => {
    const structure = structures.find(s => s.id === id);
    showDeleteModal({
      title: 'Delete Salary Structure',
      message: 'Are you sure you want to delete this salary structure?',
      itemName: structure?.name || 'structure',
      onConfirm: async () => {
        try {
          await salaryStructureService.delete(id);
          toast.showSuccess('Salary structure deleted successfully');
          loadData();
        } catch (error: any) {
          toast.showError(error.message || 'Failed to delete structure');
        }
      }
    });
  };

  const handleStructureSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.name || formData.basicSalary <= 0) {
      toast.showError('Please fill in all required fields');
      return;
    }

    try {
      if (editingStructure && editingStructure.id) {
        await salaryStructureService.update(editingStructure.id, formData);
        toast.showSuccess('Salary structure updated successfully');
      } else {
        await salaryStructureService.create(formData);
        toast.showSuccess('Salary structure created successfully');
      }
      setShowStructureForm(false);
      loadData();
    } catch (error: any) {
      toast.showError(error.message || 'Failed to save structure');
    }
  };

  const handleAddAllowance = (): void => {
    setFormData({
      ...formData,
      allowances: [...formData.allowances, { name: '', amount: 0, type: 'fixed' }]
    });
  };

  const handleRemoveAllowance = (index: number): void => {
    setFormData({
      ...formData,
      allowances: formData.allowances.filter((_, i) => i !== index)
    });
  };

  const handleAddDeduction = (): void => {
    setFormData({
      ...formData,
      deductions: [...formData.deductions, { name: '', amount: 0, type: 'fixed' }]
    });
  };

  const handleRemoveDeduction = (index: number): void => {
    setFormData({
      ...formData,
      deductions: formData.deductions.filter((_, i) => i !== index)
    });
  };

  const handleAssignStructure = (payeeId: string): void => {
    const payee = staffPayees.find(p => p.id === payeeId);
    showEditModal({
      title: 'Assign Salary Structure',
      data: payee,
      fields: [
        {
          name: 'salaryStructureId',
          label: 'Salary Structure',
          type: 'select',
          options: structures.map(s => ({ value: s.id || '', label: s.name }))
        }
      ],
      onSave: async (data: any) => {
        try {
          await staffService.update(payeeId, { salaryStructureId: data.salaryStructureId });
          toast.showSuccess('Salary structure assigned successfully');
          loadData();
        } catch (error: any) {
          toast.showError(error.message || 'Failed to assign structure');
          throw error;
        }
      }
    });
  };

  const filteredPayees = useMemo(() => {
    if (!searchTerm) return staffPayees;
    const term = searchTerm.toLowerCase();
    return staffPayees.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.staffId.toLowerCase().includes(term) ||
      p.position.toLowerCase().includes(term) ||
      p.department.toLowerCase().includes(term)
    );
  }, [staffPayees, searchTerm]);

  const totalPages = Math.ceil(filteredPayees.length / entriesPerPage);
  const paginatedPayees = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredPayees.slice(start, end);
  }, [filteredPayees, currentPage, entriesPerPage]);

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filteredPayees.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'staffId', label: 'Staff ID' },
      { key: 'name', label: 'Name' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'salaryStructureName', label: 'Salary Structure' },
      { key: 'basicSalary', label: 'Basic Salary' },
      { key: 'grossSalary', label: 'Gross Salary' },
      { key: 'netSalary', label: 'Net Salary' }
    ];

    const exportData = filteredPayees.map(p => ({
      staffId: p.staffId,
      name: p.name,
      position: p.position,
      department: p.department,
      salaryStructureName: p.salaryStructureName,
      basicSalary: p.basicSalary,
      grossSalary: p.grossSalary,
      netSalary: p.netSalary
    }));

    switch (format) {
      case 'copy':
        const text = exportData.map(row => Object.values(row).join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        toast.showSuccess('Data copied to clipboard');
        break;
      case 'excel':
        exportToExcel(exportData, `payees-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `payees-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('payee-table');
        if (printContent) {
          exportToPDF(printContent, `payees-${new Date().toISOString().split('T')[0]}.pdf`);
          toast.showSuccess('Data exported to PDF');
        }
        break;
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Setup Salary Structure</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/payroll/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Payroll</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Setup Salary Structure</span>
            </div>
          </div>
          <button
            onClick={handleAddStructure}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Structure</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('structures')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'structures'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-cog mr-2"></i>Salary Structures
          </button>
          <button
            onClick={() => setActiveTab('payees')}
            className={`flex-1 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'payees'
                ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <i className="fas fa-users mr-2"></i>Payees ({staffPayees.length})
          </button>
        </div>
      </div>

      {/* Structure Form Modal */}
      {showStructureForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingStructure ? 'Edit Salary Structure' : 'Add Salary Structure'}
                </h2>
                <button
                  onClick={() => setShowStructureForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleStructureSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Structure Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                      placeholder="e.g., Teacher Grade 1"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Basic Salary (GHS) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: parseFloat(e.target.value) || 0 })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                    placeholder="Optional description"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={formData.taxRate || 0}
                      onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">SSNIT Rate (%)</label>
                    <input
                      type="number"
                      value={formData.ssnitRate || 5.5}
                      onChange={(e) => setFormData({ ...formData, ssnitRate: parseFloat(e.target.value) || 5.5 })}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                    />
                  </div>
                </div>

                {/* Allowances */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-semibold text-gray-900 text-sm">Allowances</label>
                    <button
                      type="button"
                      onClick={handleAddAllowance}
                      className="px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100"
                    >
                      <i className="fas fa-plus mr-1"></i>Add Allowance
                    </button>
                  </div>
                  {formData.allowances.map((allowance, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={allowance.name}
                          onChange={(e) => {
                            const newAllowances = [...formData.allowances];
                            newAllowances[index].name = e.target.value;
                            setFormData({ ...formData, allowances: newAllowances });
                          }}
                          placeholder="Allowance name"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={allowance.amount}
                          onChange={(e) => {
                            const newAllowances = [...formData.allowances];
                            newAllowances[index].amount = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, allowances: newAllowances });
                          }}
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={allowance.type}
                          onChange={(e) => {
                            const newAllowances = [...formData.allowances];
                            newAllowances[index].type = e.target.value as 'fixed' | 'percentage';
                            setFormData({ ...formData, allowances: newAllowances });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveAllowance(index)}
                          className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Deductions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-semibold text-gray-900 text-sm">Deductions</label>
                    <button
                      type="button"
                      onClick={handleAddDeduction}
                      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                    >
                      <i className="fas fa-plus mr-1"></i>Add Deduction
                    </button>
                  </div>
                  {formData.deductions.map((deduction, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-4">
                        <input
                          type="text"
                          value={deduction.name}
                          onChange={(e) => {
                            const newDeductions = [...formData.deductions];
                            newDeductions[index].name = e.target.value;
                            setFormData({ ...formData, deductions: newDeductions });
                          }}
                          placeholder="Deduction name"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={deduction.amount}
                          onChange={(e) => {
                            const newDeductions = [...formData.deductions];
                            newDeductions[index].amount = parseFloat(e.target.value) || 0;
                            setFormData({ ...formData, deductions: newDeductions });
                          }}
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        />
                      </div>
                      <div className="col-span-3">
                        <select
                          value={deduction.type}
                          onChange={(e) => {
                            const newDeductions = [...formData.deductions];
                            newDeductions[index].type = e.target.value as 'fixed' | 'percentage';
                            setFormData({ ...formData, deductions: newDeductions });
                          }}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                        >
                          <option value="fixed">Fixed</option>
                          <option value="percentage">Percentage</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveDeduction(index)}
                          className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                {formData.basicSalary > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="font-semibold text-gray-900 mb-2">Salary Summary</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Basic Salary:</span>
                        <span className="font-semibold">GHS {formData.basicSalary.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Allowances:</span>
                        <span className="font-semibold text-green-600">
                          +GHS {formData.allowances.reduce((sum, a) => {
                            if (a.type === 'fixed') return sum + a.amount;
                            return sum + (formData.basicSalary * a.amount / 100);
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Deductions:</span>
                        <span className="font-semibold text-red-600">
                          -GHS {formData.deductions.reduce((sum, d) => {
                            if (d.type === 'fixed') return sum + d.amount;
                            return sum + (formData.basicSalary * d.amount / 100);
                          }, 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-bold">Net Salary:</span>
                        <span className="font-bold text-primary-600">
                          GHS {(() => {
                            const gross = formData.basicSalary + formData.allowances.reduce((sum, a) => {
                              if (a.type === 'fixed') return sum + a.amount;
                              return sum + (formData.basicSalary * a.amount / 100);
                            }, 0);
                            const deductions = formData.deductions.reduce((sum, d) => {
                              if (d.type === 'fixed') return sum + d.amount;
                              return sum + (formData.basicSalary * d.amount / 100);
                            }, 0);
                            const tax = gross * (formData.taxRate || 0) / 100;
                            const ssnit = gross * (formData.ssnitRate || 0) / 100;
                            return (gross - deductions - tax - ssnit).toFixed(2);
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowStructureForm(false)}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700"
                  >
                    {editingStructure ? 'Update' : 'Create'} Structure
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Structures Tab */}
      {activeTab === 'structures' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {loading ? (
            <div className="p-12 text-center">
              <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
              <p className="text-gray-600">Loading structures...</p>
            </div>
          ) : structures.length === 0 ? (
            <div className="p-12 text-center">
              <i className="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
              <p className="text-gray-600">No salary structures found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Basic Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Allowances</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Deductions</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Net Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {structures.map((structure) => {
                    const net = salaryStructureService.calculateNetSalary(structure);
                    return (
                      <tr key={structure.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{structure.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">GHS {structure.basicSalary.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{structure.allowances.length}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{structure.deductions.length}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">GHS {net.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            structure.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {structure.status || 'active'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditStructure(structure)}
                              className="px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                            >
                              <i className="fas fa-edit mr-1"></i>Edit
                            </button>
                            <button
                              onClick={() => structure.id && handleDeleteStructure(structure.id)}
                              className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100"
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
      )}

      {/* Payees Tab */}
      {activeTab === 'payees' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          {/* Table Controls */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Show</label>
              <select
                value={entriesPerPage}
                onChange={(e) => {
                  setEntriesPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <label className="text-sm text-gray-700">entries</label>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleExport('copy')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Copy
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Excel
              </button>
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                PDF
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500 w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div id="payee-table" className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Staff.ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Position</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Salary Structure</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Basic Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Gross Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Net Salary</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                        <div className="text-lg font-semibold">Loading payees...</div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedPayees.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                        <div className="text-lg font-semibold">No payees found</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedPayees.map((payee, index) => (
                    <tr key={payee.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 relative">
                        <div ref={actionMenuRef}>
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === payee.id ? null : payee.id)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <i className="fas fa-cog"></i>
                            <i className="fas fa-chevron-right text-xs"></i>
                          </button>
                          {openActionMenu === payee.id && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                              <button
                                onClick={() => {
                                  handleAssignStructure(payee.id);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-link text-blue-500"></i>
                                Assign Structure
                              </button>
                              <button
                                onClick={() => {
                                  toast.showInfo(`Viewing payee: ${payee.name}`);
                                  setOpenActionMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-eye text-green-500"></i>
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{payee.staffId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payee.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payee.position}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payee.department}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          payee.salaryStructureName === 'Not Assigned' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {payee.salaryStructureName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">GHS {payee.basicSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">GHS {payee.grossSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-primary-600">GHS {payee.netSalary.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          payee.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700">
              Showing {filteredPayees.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredPayees.length)} of {filteredPayees.length} entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SetupSalaryStructure;
