import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface ClassData {
  className: string;
  studentCount: number;
}

const ClassList: React.FC = () => {
  const { toast } = useModal();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [classes] = useState<ClassData[]>([
    { className: 'Basic 1', studentCount: 30 },
    { className: 'Basic 2', studentCount: 25 },
    { className: 'Basic 3', studentCount: 24 },
    { className: 'JHS 1', studentCount: 35 },
    { className: 'JHS 2', studentCount: 32 },
    { className: 'JHS 3', studentCount: 28 },
  ]);

  const handleView = async (className: string): Promise<void> => {
    try {
      setLoading(true);
      // Navigate to students list filtered by class
      navigate(`/students/all?class=${encodeURIComponent(className)}`);
    } catch (error) {
      console.error('Error viewing class:', error);
      toast.showError('Failed to load class students');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Get Class List</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/students/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Students</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Get Class List</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Class List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Number of Students</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : classes.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No classes found.
                  </td>
                </tr>
              ) : (
                classes.map((classItem, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors duration-75">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{classItem.className}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{classItem.studentCount} Students</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleView(classItem.className)}
                        disabled={loading}
                        className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <i className="fas fa-eye mr-1"></i>View
                      </button>
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

export default ClassList;

