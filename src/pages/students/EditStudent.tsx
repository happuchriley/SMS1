import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const EditStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(true);
  const [formData, setFormData] = useState({
    firstName: '',
    surname: '',
    otherNames: '',
    gender: '',
    class: '',
    email: '',
    contact: '',
    address: ''
  });

  const loadStudent = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const student = await studentsService.getById(id);
      setFormData({
        firstName: student.firstName || '',
        surname: student.surname || '',
        otherNames: student.otherNames || '',
        gender: student.gender || '',
        class: student.class || '',
        email: student.email || '',
        contact: student.contact || '',
        address: student.address || ''
      });
    } catch (error) {
      console.error('Error loading student:', error);
      toast.showError('Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await studentsService.update(id, formData);
      toast.showSuccess('Student updated successfully');
      navigate('/students/all');
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast.showError(error.message || 'Failed to update student');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500"></i>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Edit Student</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/students/all" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Students</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Edit Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Surname <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Other Names</label>
              <input
                type="text"
                name="otherNames"
                value={formData.otherNames}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Class</label>
              <input
                type="text"
                name="class"
                value={formData.class}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Contact</label>
              <input
                type="text"
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/students/all"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditStudent;
