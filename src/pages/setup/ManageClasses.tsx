import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface ClassFormData {
  stageNameFull: string;
  stageNameShort: string;
  category: string;
  description: string;
  status: string;
}

interface ClassItem {
  id: string;
  name?: string;
  className?: string;
  code?: string;
  classCode?: string;
  category?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

const ManageClasses: React.FC = () => {
  const { toast } = useModal();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [activeModalTab, setActiveModalTab] = useState<'edit' | 'delete'>('edit');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [formData, setFormData] = useState<ClassFormData>({
    stageNameFull: '',
    stageNameShort: '',
    category: '',
    description: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const categories: string[] = ['Lower Primary', 'Upper Primary', 'Junior High School', 'Senior High School', 'Nursery', 'Kindergarten'];

  const loadClasses = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const allClasses = await setupService.getAllClasses();
      setClasses(allClasses as ClassItem[]);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.showError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.stageNameFull || !formData.stageNameShort) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await setupService.updateClass(editingId, {
          name: formData.stageNameFull,
          code: formData.stageNameShort,
          category: formData.category,
          description: formData.description,
          status: formData.status || 'Active'
        });
        toast.showSuccess('Class updated successfully');
      } else {
        await setupService.createClass({
          name: formData.stageNameFull,
          code: formData.stageNameShort,
          category: formData.category,
          description: formData.description,
          status: formData.status || 'Active',
          capacity: 30,
          currentStudents: 0
        });
        toast.showSuccess('Class created successfully');
      }
      await loadClasses();
      handleClear();
      setShowEditModal(false);
    } catch (error: any) {
      console.error('Error saving class:', error);
      toast.showError(error.message || 'Failed to save class');
    }
  };

  const handleEdit = (cls: ClassItem): void => {
    setFormData({
      stageNameFull: cls.name || cls.className || '',
      stageNameShort: cls.code || cls.classCode || '',
      category: cls.category || '',
      description: cls.description || '',
      status: cls.status || 'Active'
    });
    setEditingId(cls.id);
    setActiveModalTab('edit');
    setShowEditModal(true);
  };

  const handleDeleteClick = (cls: ClassItem): void => {
    setEditingId(cls.id);
    setActiveModalTab('delete');
    setShowEditModal(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!editingId) return;
    
    try {
      await setupService.deleteClass(editingId);
      toast.showSuccess('Class deleted successfully');
      await loadClasses();
      setShowEditModal(false);
      setEditingId(null);
    } catch (error: any) {
      console.error('Error deleting class:', error);
      toast.showError(error.message || 'Failed to delete class');
    }
  };

  const handleClear = (): void => {
    setFormData({ stageNameFull: '', stageNameShort: '', category: '', description: '', status: 'Active' });
    setEditingId(null);
  };

  const handleAddNew = (): void => {
    handleClear();
    setActiveModalTab('edit');
    setShowEditModal(true);
  };

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const name = (cls.name || cls.className || '').toLowerCase();
    const code = (cls.code || cls.classCode || '').toLowerCase();
    const category = (cls.category || '').toLowerCase();
    const description = (cls.description || '').toLowerCase();
    return name.includes(term) || code.includes(term) || category.includes(term) || description.includes(term);
  });

  // Pagination
  const totalPages = Math.ceil(filteredClasses.length / entriesPerPage);
  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleExport = (format: 'excel' | 'csv' | 'pdf'): void => {
    if (filteredClasses.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'stageNameFull', label: 'Stage Name Full' },
      { key: 'stageNameShort', label: 'Class/Stage Name (Short)' },
      { key: 'category', label: 'Class/Stage Category' },
      { key: 'description', label: 'Class/Stage Description' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredClasses.map((cls, index) => ({
      no: index + 1,
      stageNameFull: cls.name || cls.className || '',
      stageNameShort: cls.code || cls.classCode || '',
      category: cls.category || '',
      description: cls.description || '',
      status: cls.status || 'Active'
    }));

    switch (format) {
      case 'excel':
        exportToExcel(exportData, `classes-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `classes-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('classes-table');
        if (printContent) {
          exportToPDF(printContent, `classes-${new Date().toISOString().split('T')[0]}.pdf`);
          toast.showSuccess('Data exported to PDF');
        }
        break;
    }
  };

  const handlePrint = (): void => {
    const printContent = document.getElementById('classes-table');
    if (printContent) {
      window.print();
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Stages/Class</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Stages/Class List</span>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Class</span>
          </button>
        </div>
      </div>

      {/* Classes Table */}
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
              onClick={() => handleExport('excel')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Excel"
            >
              Excel
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="PDF"
            >
              PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Print"
            >
              Print
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Column visibility"
            >
              Column visibility
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
        <div id="classes-table" className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    No.
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Stage Name Full
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Stage Name Short
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Stage Category
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Stage Description
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Result Status
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Stage Status
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading classes...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedClasses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No classes found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedClasses.map((cls, index) => (
                  <tr key={cls.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{cls.name || cls.className || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{cls.code || cls.classCode || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{cls.category || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{cls.description || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Close</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        cls.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {cls.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(cls)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cls)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          title="Delete"
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
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {filteredClasses.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredClasses.length)} of {filteredClasses.length} entries
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

      {/* Edit/Delete Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {activeModalTab === 'edit' ? (editingId ? 'Edit Stage/Class' : 'Add Stage/Class') : 'Delete Stage/Class'}
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    handleClear();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              
              {/* Modal Tabs */}
              <div className="mt-4 flex gap-2 border-b border-gray-200">
                <button
                  onClick={() => setActiveModalTab('edit')}
                  className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                    activeModalTab === 'edit'
                      ? 'text-primary-600 border-primary-600'
                      : 'text-gray-600 border-transparent hover:text-gray-900'
                  }`}
                >
                  {editingId ? 'Edit Class/Stage' : 'Add Class/Stage'}
                </button>
                {editingId && (
                  <button
                    onClick={() => setActiveModalTab('delete')}
                    className={`px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${
                      activeModalTab === 'delete'
                        ? 'text-primary-600 border-primary-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    Delete Class/Stage
                  </button>
                )}
              </div>
            </div>

            <div className="p-6">
              {activeModalTab === 'edit' ? (
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        Class/Stage Name (Full) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="stageNameFull"
                        value={formData.stageNameFull}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                        placeholder="e.g., Basic 1"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        Class/Stage Name (Short) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="stageNameShort"
                        value={formData.stageNameShort}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                        placeholder="e.g., Grade 1"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        Class/Stage Category
                      </label>
                      <div className="relative select-dropdown-wrapper">
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
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
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm"
                        placeholder="e.g., Ages 6 years"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        Status
                      </label>
                      <div className="relative select-dropdown-wrapper">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm min-h-[44px]"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <div className="select-dropdown-arrow">
                          <div className="select-dropdown-arrow-icon">
                            <i className="fas fa-chevron-down"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        handleClear();
                      }}
                      className="px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 flex items-center gap-2"
                    >
                      <i className="fas fa-times"></i>
                      Close
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 flex items-center gap-2"
                    >
                      <i className="fas fa-check"></i>
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <p className="text-gray-700 mb-6">
                    Are you sure you want to delete this class/stage? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        handleClear();
                      }}
                      className="px-5 py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 flex items-center gap-2"
                    >
                      <i className="fas fa-times"></i>
                      Close
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteConfirm}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center gap-2"
                    >
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManageClasses;
