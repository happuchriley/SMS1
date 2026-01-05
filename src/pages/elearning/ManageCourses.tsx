import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface Course {
  id: string;
  code: string;
  title: string;
  courseCode?: string;
  courseTitle?: string;
  subject?: string;
  class?: string;
  term?: string;
  academicYear?: string;
  instructor?: string;
  studentsEnrolled?: number;
  status?: string;
}

const ManageCourses: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const allCourses = await elearningService.getAllCourses();
      // Get enrollment counts for each course
      const coursesWithEnrollments = await Promise.all(allCourses.map(async (course) => {
        const enrollments = await elearningService.getEnrollmentsByCourse(course.id);
        return {
          ...course,
          courseCode: course.code,
          courseTitle: course.title,
          studentsEnrolled: enrollments.length
        };
      }));
      setCourses(coursesWithEnrollments);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const subjects: string[] = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const title = course.courseTitle || course.title || '';
      const code = course.courseCode || course.code || '';
      const matchesSearch = 
        title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !selectedSubject || selectedSubject === 'All Subjects' || course.subject === selectedSubject;
      const status = course.status === 'published' ? 'Published' : 'Draft';
      const matchesStatus = !selectedStatus || status === selectedStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [courses, searchTerm, selectedSubject, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Course',
      message: 'Are you sure you want to delete this course? This action cannot be undone.',
      itemName: courses.find(c => c.id === id)?.courseTitle || courses.find(c => c.id === id)?.title || 'this course',
      onConfirm: async () => {
        try {
          await elearningService.deleteCourse(id);
          toast.showSuccess('Course deleted successfully');
          await loadCourses();
        } catch (error: any) {
          console.error('Error deleting course:', error);
          toast.showError(error.message || 'Failed to delete course');
        }
      }
    });
  };

  const handleToggleStatus = async (id: string): Promise<void> => {
    try {
      await elearningService.toggleCourseStatus(id);
      toast.showSuccess('Course status updated');
      await loadCourses();
    } catch (error: any) {
      console.error('Error toggling course status:', error);
      toast.showError(error.message || 'Failed to update course status');
    }
  };

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage Courses</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage Courses</span>
            </div>
          </div>
          <Link
            to="/elearning/create"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            <i className="fas fa-plus mr-2"></i>Create New
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by course title or code..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject === 'All Subjects' ? '' : subject}>{subject}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedSubject || selectedStatus) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Course Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Course Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Term</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Instructor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Students</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Loading courses...
                  </td>
                </tr>
              ) : paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                paginatedCourses.map(course => {
                  const status = course.status === 'published' ? 'Published' : 'Draft';
                  return (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors duration-75">
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{course.courseCode || course.code}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{course.courseTitle || course.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{course.subject || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{course.class || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{course.term || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{course.instructor || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{course.studentsEnrolled || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/elearning/create?id=${course.id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-100"
                            title="Edit"
                          >
                            <i className="fas fa-edit"></i>
                          </Link>
                          <Link
                            to={`/elearning/view/${course.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-100"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleToggleStatus(course.id)}
                            className={`text-sm font-medium transition-colors duration-100 ${
                              status === 'Published' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                            }`}
                            title={status === 'Published' ? 'Unpublish' : 'Publish'}
                          >
                            <i className={`fas fa-${status === 'Published' ? 'eye-slash' : 'eye'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-100"
                            title="Delete"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageCourses;

