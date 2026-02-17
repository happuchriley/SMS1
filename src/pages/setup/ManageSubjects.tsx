import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface SubjectFormData {
  subjectName: string;
  subjectCode: string;
  description: string;
  status: string;
}

interface SubjectItem {
  id?: string;
  name?: string;
  subjectName?: string;
  code?: string;
  subjectCode?: string;
  description?: string;
  status?: string;
  [key: string]: any;
}

const ManageSubjects: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [formData, setFormData] = useState<SubjectFormData>({
    subjectName: '',
    subjectCode: '',
    description: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const loadSubjects = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const allSubjects = await setupService.getAllSubjects();
      setSubjects(allSubjects as SubjectItem[]);
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast.showError('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.subjectName || !formData.subjectCode) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await setupService.updateSubject(editingId, {
          name: formData.subjectName,
          code: formData.subjectCode,
          description: formData.description || '',
          status: formData.status || 'Active'
        });
        toast.showSuccess('Subject updated successfully');
      } else {
        await setupService.createSubject({
          name: formData.subjectName,
          code: formData.subjectCode,
          description: formData.description || '',
          status: formData.status || 'Active'
        });
        toast.showSuccess('Subject created successfully');
      }
      await loadSubjects();
      handleClear();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast.showError(error.message || 'Failed to save subject');
    }
  };

  const handleEdit = (subject: SubjectItem): void => {
    setFormData({
      subjectName: subject.name || subject.subjectName || '',
      subjectCode: subject.code || subject.subjectCode || '',
      description: subject.description || '',
      status: subject.status || 'Active'
    });
    setEditingId(subject.id || null);
  };

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Subject',
      message: 'Are you sure you want to delete this subject? This action cannot be undone.',
      itemName: subjects.find(s => s.id === id)?.name || subjects.find(s => s.id === id)?.subjectName || 'this subject',
      onConfirm: async () => {
        try {
          await setupService.deleteSubject(id);
          toast.showSuccess('Subject deleted successfully');
          await loadSubjects();
        } catch (error: any) {
          console.error('Error deleting subject:', error);
          toast.showError(error.message || 'Failed to delete subject');
        }
      }
    });
  };

  const handleClear = (): void => {
    setFormData({ subjectName: '', subjectCode: '', description: '', status: 'Active' });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Courses/Subjects List</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Courses/Subjects List</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Show</label>
            <select
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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Excel"
            >
              Excel
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="PDF"
            >
              PDF
            </button>
            <button
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
              placeholder="Search..."
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500 w-48"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
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
                    Subject Name Full
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Subject Name Short
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Subject Code
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Subject Category 1
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Subject Category 2
                    <div className="flex flex-col">
                      <i className="fas fa-chevron-up text-xs"></i>
                      <i className="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase cursor-pointer hover:bg-blue-700">
                  <div className="flex items-center gap-1">
                    Subject Status
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
                    Loading...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No subjects found.
                  </td>
                </tr>
              ) : (
                subjects.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{subject.subjectName || subject.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{subject.subjectName || subject.name || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{subject.subjectCode || subject.code || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">PRE SCHOOL</td>
                    <td className="px-4 py-3 text-sm text-gray-900">Creche</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subject.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subject.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => subject.id && handleDelete(subject.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          disabled={!subject.id}
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
            Showing 1 to {subjects.length} of {subjects.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md">1</span>
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManageSubjects;

