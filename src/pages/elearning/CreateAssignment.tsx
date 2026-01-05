import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate, useParams } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface FormData {
  title: string;
  courseId: string;
  description: string;
  dueDate: string;
  maxScore: string;
  instructions: string;
}

const CreateAssignment: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; code: string }>>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    courseId: id || '',
    description: '',
    dueDate: '',
    maxScore: '100',
    instructions: ''
  });

  const loadCourses = useCallback(async () => {
    try {
      const allCourses = await elearningService.getAllCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.title || !formData.courseId) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await elearningService.createAssignment({
        title: formData.title,
        courseId: formData.courseId,
        description: formData.description || '',
        dueDate: formData.dueDate || '',
        maxScore: formData.maxScore ? parseInt(formData.maxScore) : 100,
        instructions: formData.instructions || ''
      });
      toast.showSuccess('Assignment created successfully!');
      navigate('/elearning/assignments');
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.showError(error.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Assignment</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <Link to="/elearning/assignments" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Assignments</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Create Assignment</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Assignment Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter assignment title"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.code || ''} - {course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Maximum Score
              </label>
              <input
                type="number"
                name="maxScore"
                value={formData.maxScore}
                onChange={handleChange}
                min="1"
                placeholder="100"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter assignment description..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Instructions
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                placeholder="Enter assignment instructions..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <Link
              to="/elearning/assignments"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-100"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-100 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-save mr-2"></i>
              {loading ? 'Creating...' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateAssignment;

