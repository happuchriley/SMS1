import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

const ManageClasses = () => {
  const { toast, showDeleteModal } = useModal();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true); // Used in loadClasses

  const [formData, setFormData] = useState({
    className: '',
    classCode: '',
    capacity: '',
    classTeacher: '',
    status: 'Active'
  });

  const [editingId, setEditingId] = useState(null);

  const allTeachers = ['Mr. John Teacher', 'Mrs. Jane Teacher', 'Mr. Michael Teacher', 'Ms. Mary Teacher', 'Ms. Grace Teacher', 'Mr. David Teacher'];

  const loadClasses = useCallback(async () => {
    try {
      setLoading(true);
      const allClasses = await setupService.getAllClasses();
      setClasses(allClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.showError('Failed to load classes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.className || !formData.classCode || !formData.capacity) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await setupService.updateClass(editingId, {
          name: formData.className,
          code: formData.classCode,
          capacity: parseInt(formData.capacity),
          classTeacher: formData.classTeacher || '',
          status: formData.status || 'Active'
        });
        toast.showSuccess('Class updated successfully');
      } else {
        await setupService.createClass({
          name: formData.className,
          code: formData.classCode,
          capacity: parseInt(formData.capacity),
          classTeacher: formData.classTeacher || '',
          status: formData.status || 'Active',
          currentStudents: 0
        });
        toast.showSuccess('Class created successfully');
      }
      await loadClasses();
      handleClear();
    } catch (error) {
      console.error('Error saving class:', error);
      toast.showError(error.message || 'Failed to save class');
    }
  };

  const handleEdit = (cls) => {
    setFormData({
      className: cls.name || cls.className,
      classCode: cls.code || cls.classCode,
      capacity: (cls.capacity || 0).toString(),
      classTeacher: cls.classTeacher || '',
      status: cls.status || 'Active'
    });
    setEditingId(cls.id);
  };

  const handleDelete = (id) => {
    showDeleteModal({
      title: 'Delete Class',
      message: 'Are you sure you want to delete this class? This action cannot be undone.',
      itemName: classes.find(c => c.id === id)?.name || classes.find(c => c.id === id)?.className || 'this class',
      onConfirm: async () => {
        try {
          await setupService.deleteClass(id);
          toast.showSuccess('Class deleted successfully');
          await loadClasses();
        } catch (error) {
          console.error('Error deleting class:', error);
          toast.showError(error.message || 'Failed to delete class');
        }
      }
    });
  };

  const handleClear = () => {
    setFormData({ className: '', classCode: '', capacity: '', classTeacher: '', status: 'Active' });
    setEditingId(null);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage Classes</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage Classes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          {editingId ? 'Edit Class' : 'Add New Class'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleChange}
                placeholder="e.g., Basic 1"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="classCode"
                value={formData.classCode}
                onChange={handleChange}
                placeholder="e.g., B1"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Capacity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="30"
                min="1"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class Teacher
              </label>
              <select
                name="classTeacher"
                value={formData.classTeacher}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Teacher</option>
                {allTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
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

      {/* Classes Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Classes List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Class Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Class Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Capacity</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Students</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Class Teacher</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    No classes found. Add one above.
                  </td>
                </tr>
              ) : (
                classes.map(cls => {
                  const occupancyPercent = (cls.currentStudents / cls.capacity) * 100;
                  return (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{cls.className}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cls.classCode}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cls.capacity}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{cls.currentStudents}</span>
                          <div className="flex-1 max-w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                occupancyPercent >= 90 ? 'bg-red-500' :
                                occupancyPercent >= 70 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${occupancyPercent}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{cls.classTeacher || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cls.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {cls.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(cls)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(cls.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ManageClasses;

