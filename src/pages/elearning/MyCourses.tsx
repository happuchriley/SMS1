import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface MyCourse {
  id: number;
  courseCode: string;
  courseTitle: string;
  subject: string;
  class: string;
  instructor: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
  status: string;
  lastAccessed: string;
}

const MyCourses: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);

  // Sample enrolled courses data
  const myCourses: MyCourse[] = [
    { id: 1, courseCode: 'MATH101', courseTitle: 'Basic Mathematics', subject: 'Mathematics', class: 'Basic 1', instructor: 'Mr. John Teacher', progress: 75, lessonsCompleted: 9, totalLessons: 12, status: 'Active', lastAccessed: '2024-01-20' },
    { id: 2, courseCode: 'ENG101', courseTitle: 'English Language', subject: 'English', class: 'Basic 1', instructor: 'Mrs. Jane Principal', progress: 60, lessonsCompleted: 9, totalLessons: 15, status: 'Active', lastAccessed: '2024-01-19' },
    { id: 3, courseCode: 'SCI101', courseTitle: 'Introduction to Science', subject: 'Science', class: 'Basic 2', instructor: 'Mr. Michael Admin', progress: 40, lessonsCompleted: 4, totalLessons: 10, status: 'Active', lastAccessed: '2024-01-18' },
    { id: 4, courseCode: 'SOC101', courseTitle: 'Social Studies Basics', subject: 'Social Studies', class: 'Basic 2', instructor: 'Ms. Sarah Teacher', progress: 100, lessonsCompleted: 8, totalLessons: 8, status: 'Completed', lastAccessed: '2024-01-17' },
  ];

  const statuses: string[] = ['All Status', 'Active', 'Completed', 'Not Started'];

  // Filter courses
  const filteredCourses = useMemo(() => {
    if (!selectedStatus || selectedStatus === 'All Status') return myCourses;
    return myCourses.filter(c => c.status === selectedStatus);
  }, [selectedStatus, myCourses]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const getProgressColor = (progress: number): string => {
    if (progress >= 75) return 'bg-green-500';
    if (progress >= 50) return 'bg-primary-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Courses</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My Courses</span>
            </div>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
          >
            {statuses.map(status => (
              <option key={status} value={status === 'All Status' ? '' : status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Course Cards */}
      {paginatedCourses.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-graduation-cap text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No courses found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          {paginatedCourses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                    {course.subject}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    course.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    course.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.courseTitle}</h3>
                <div className="space-y-1 mb-4 text-sm text-gray-600">
                  <p><i className="fas fa-graduation-cap mr-1"></i>{course.class}</p>
                  <p><i className="fas fa-user-tie mr-1"></i>{course.instructor}</p>
                  <p><i className="fas fa-book mr-1"></i>{course.lessonsCompleted} / {course.totalLessons} Lessons</p>
                  <p className="text-xs text-gray-500">Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}</p>
                </div>
                
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-700">Progress</span>
                    <span className="text-xs font-semibold text-gray-900">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getProgressColor(course.progress)} h-2 rounded-full transition-all duration-300`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    <i className="fas fa-code mr-1"></i>{course.courseCode}
                  </span>
                  <button className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors">
                    Continue <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
};

export default MyCourses;

