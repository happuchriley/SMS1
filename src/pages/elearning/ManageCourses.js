import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ManageCourses = () => {
  const [courses, setCourses] = useState([
    { id: 1, courseCode: 'MATH101', courseTitle: 'Basic Mathematics', subject: 'Mathematics', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', instructor: 'Mr. John Teacher', studentsEnrolled: 45, status: 'Published' },
    { id: 2, courseCode: 'ENG101', courseTitle: 'English Language', subject: 'English', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', instructor: 'Mrs. Jane Principal', studentsEnrolled: 42, status: 'Published' },
    { id: 3, courseCode: 'SCI101', courseTitle: 'Introduction to Science', subject: 'Science', class: 'Basic 2', term: '1st Term', academicYear: '2024/2025', instructor: 'Mr. Michael Admin', studentsEnrolled: 38, status: 'Draft' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.courseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !selectedSubject || selectedSubject === 'All Subjects' || course.subject === selectedSubject;
      const matchesStatus = !selectedStatus || course.status === selectedStatus;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [courses, searchTerm, selectedSubject, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setCourses(prev => prev.map(c => 
      c.id === id ? { ...c, status: c.status === 'Published' ? 'Draft' : 'Published' } : c
    ));
  };

  const handleClearFilters = () => {
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
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage Courses</span>
            </div>
          </div>
          <Link
            to="/elearning/create"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
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
              {paginatedCourses.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No courses found.
                  </td>
                </tr>
              ) : (
                paginatedCourses.map(course => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{course.courseCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{course.courseTitle}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.term}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.instructor}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{course.studentsEnrolled}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {course.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          title="View/Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(course.id)}
                          className={`text-sm font-medium ${
                            course.status === 'Published' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                          }`}
                          title={course.status === 'Published' ? 'Unpublish' : 'Publish'}
                        >
                          <i className={`fas fa-${course.status === 'Published' ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          title="Delete"
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

