import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface ClassItem {
  id: number;
  name: string;
  level: string;
  capacity: number;
  active: boolean;
}

interface ClassFormData {
  name: string;
  level: string;
  capacity: string;
  active: boolean;
}

const SetupClassList: React.FC = () => {
  const { showDeleteModal } = useModal();
  const [classes, setClasses] = useState<ClassItem[]>([
    { id: 1, name: 'Nursery 1', level: 'Nursery', capacity: 25, active: true },
    { id: 2, name: 'Nursery 2', level: 'Nursery', capacity: 25, active: true },
    { id: 3, name: 'Basic 1', level: 'Primary', capacity: 30, active: true },
    { id: 4, name: 'Basic 2', level: 'Primary', capacity: 30, active: true },
    { id: 5, name: 'Basic 3', level: 'Primary', capacity: 30, active: true },
    { id: 6, name: 'JHS 1', level: 'JHS', capacity: 35, active: true },
  ]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    level: 'Primary',
    capacity: '',
    active: true
  });

  const levels: string[] = ['Nursery', 'Primary', 'JHS'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (editingClass) {
      setClasses(classes.map(cls => cls.id === editingClass.id ? { ...formData, id: editingClass.id, capacity: parseInt(formData.capacity) } : cls));
    } else {
      setClasses([...classes, { ...formData, id: classes.length + 1, capacity: parseInt(formData.capacity) }]);
    }
    handleCloseModal();
  };

  const handleEdit = (classItem: ClassItem): void => {
    setEditingClass(classItem);
    setFormData({ ...classItem, capacity: classItem.capacity.toString() });
    setShowModal(true);
  };

  const handleDelete = (id: number): void => {
    const classItem = classes.find(cls => cls.id === id);
    showDeleteModal({
      title: 'Delete Class',
      message: `Are you sure you want to delete ${classItem?.name}? This action cannot be undone.`,
      onConfirm: () => {
        setClasses(classes.filter(cls => cls.id !== id));
      }
    });
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({ name: '', level: 'Primary', capacity: '', active: true });
  };

  const handleAddNew = (): void => {
    setEditingClass(null);
    setFormData({ name: '', level: 'Primary', capacity: '', active: true });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Stage/Class List</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Stage/Class List</span>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            <i className="fas fa-plus mr-2"></i>Add New Class
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-bordered">
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Level</th>
                <th>Capacity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {classes.map((classItem) => (
                <tr key={classItem.id}>
                  <td className="font-medium">{classItem.name}</td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      classItem.level === 'Nursery' ? 'bg-pink-100 text-pink-800' :
                      classItem.level === 'Primary' ? 'bg-blue-100 text-blue-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {classItem.level}
                    </span>
                  </td>
                  <td className="text-gray-600">{classItem.capacity} students</td>
                  <td>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      classItem.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {classItem.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="font-medium">
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="text-primary-600 hover:text-primary-900 mr-3 transition-colors duration-100"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-100"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingClass ? 'Edit Class' : 'Add New Class'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Class Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Basic 1"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
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
                      required
                      min="1"
                      placeholder="Maximum students"
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                    />
                    <span className="text-sm text-gray-900 font-medium">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-100"
                  >
                    {editingClass ? 'Update' : 'Add'} Class
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default SetupClassList;

