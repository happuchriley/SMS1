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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage Subjects</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage Subjects</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Subject' : 'Add New Subject'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subjectName"
                value={formData.subjectName}
                onChange={handleChange}
                placeholder="e.g., Mathematics"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subjectCode"
                value={formData.subjectCode}
                onChange={handleChange}
                placeholder="e.g., MATH"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Description
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div className="flex items-end gap-2">
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
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

      {/* Subjects Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Subjects List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subject Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Subject Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No subjects found. Add one above.
                  </td>
                </tr>
              ) : (
                subjects.map(subject => (
                  <tr key={subject.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{subject.subjectName || subject.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{subject.subjectCode || subject.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{subject.description || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        subject.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {subject.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(subject)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => subject.id && handleDelete(subject.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          disabled={!subject.id}
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
      </div>
    </Layout>
  );
};

export default ManageSubjects;

