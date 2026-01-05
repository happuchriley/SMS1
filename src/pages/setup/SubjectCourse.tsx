import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface SubjectItem {
  id: number;
  code: string;
  name: string;
  category: string;
  level: string;
  active: boolean;
}

interface SubjectFormData {
  code: string;
  name: string;
  category: string;
  level: string;
  active: boolean;
}

const SubjectCourse: React.FC = () => {
  const { showDeleteModal } = useModal();
  const [subjects, setSubjects] = useState<SubjectItem[]>([
    { id: 1, code: 'ENG', name: 'English Language', category: 'Core', level: 'All', active: true },
    { id: 2, code: 'MATH', name: 'Mathematics', category: 'Core', level: 'All', active: true },
    { id: 3, code: 'SCI', name: 'Integrated Science', category: 'Core', level: 'JHS', active: true },
    { id: 4, code: 'FRENCH', name: 'French', category: 'Elective', level: 'JHS', active: true },
  ]);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>({
    code: '',
    name: '',
    category: 'Core',
    level: 'All',
    active: true
  });

  const categories: string[] = ['Core', 'Elective', 'Extracurricular'];
  const levels: string[] = ['All', 'Nursery', 'Primary', 'JHS'];

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
    if (editingSubject) {
      setSubjects(subjects.map(subj => subj.id === editingSubject.id ? { ...formData, id: editingSubject.id } : subj));
    } else {
      setSubjects([...subjects, { ...formData, id: subjects.length + 1 }]);
    }
    handleCloseModal();
  };

  const handleEdit = (subject: SubjectItem): void => {
    setEditingSubject(subject);
    setFormData(subject);
    setShowModal(true);
  };

  const handleDelete = (id: number): void => {
    const subject = subjects.find(subj => subj.id === id);
    showDeleteModal({
      title: 'Delete Subject',
      message: `Are you sure you want to delete ${subject?.name}? This action cannot be undone.`,
      onConfirm: () => {
        setSubjects(subjects.filter(subj => subj.id !== id));
      }
    });
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({ code: '', name: '', category: 'Core', level: 'All', active: true });
  };

  const handleAddNew = (): void => {
    setEditingSubject(null);
    setFormData({ code: '', name: '', category: 'Core', level: 'All', active: true });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Subject/Course</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Subject/Course</span>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Add New Subject
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Subject Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {subjects.map((subject) => (
                <tr key={subject.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.code}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{subject.name}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subject.category === 'Core' ? 'bg-blue-100 text-blue-800' :
                      subject.category === 'Elective' ? 'bg-purple-100 text-purple-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {subject.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{subject.level}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subject.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subject.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(subject)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(subject.id)}
                      className="text-red-600 hover:text-red-900"
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
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                      Subject Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      {levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
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
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
                  >
                    {editingSubject ? 'Update' : 'Add'} Subject
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

export default SubjectCourse;

