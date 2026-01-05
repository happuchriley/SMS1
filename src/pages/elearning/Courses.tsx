import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface Course {
  id: string;
  code: string;
  title: string;
  instructor?: string;
  class?: string;
  level?: string;
  students?: number;
  status?: string;
  description?: string;
}

const Courses: React.FC = () => {
  const { toast } = useModal();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const levels: string[] = ['All Levels', 'Nursery', 'Primary', 'JHS'];

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      const publishedCourses = await elearningService.getPublishedCourses();
      setCourses(publishedCourses);
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

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()));
      const courseLevel = course.level || course.class || '';
      const matchesLevel = filterLevel === 'all' || courseLevel.toLowerCase().includes(filterLevel.toLowerCase());
      return matchesSearch && matchesLevel;
    });
  }, [courses, searchTerm, filterLevel]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Courses</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Courses</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search Courses</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title, code, or instructor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Filter by Level</label>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {levels.map(level => (
                <option key={level} value={level === 'All Levels' ? 'all' : level}>{level}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading courses...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-graduation-cap text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-100">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded">{course.code}</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status || 'draft'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      <i className="fas fa-user-tie mr-1"></i>{course.instructor || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                  <span>
                    <i className="fas fa-layer-group mr-1"></i>{course.level || course.class || 'N/A'}
                  </span>
                  <span>
                    <i className="fas fa-users mr-1"></i>{course.students || 0} students
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/elearning/view/${course.id}`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors duration-100 text-center"
                  >
                    <i className="fas fa-eye mr-1"></i>View
                  </Link>
                  <Link
                    to={`/elearning/manage`}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-100"
                  >
                    <i className="fas fa-edit"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Courses;

