import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface Course {
  id: number;
  courseCode: string;
  courseTitle: string;
  subject: string;
  class: string;
  term: string;
  academicYear: string;
  instructor: string;
  studentsEnrolled: number;
  lessons: number;
  status: string;
}

const ViewCourses: React.FC = () => {
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);

  // Sample course data
  const courses: Course[] = [
    { id: 1, courseCode: 'MATH101', courseTitle: 'Basic Mathematics', subject: 'Mathematics', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', instructor: 'Mr. John Teacher', studentsEnrolled: 45, lessons: 12, status: 'Published' },
    { id: 2, courseCode: 'ENG101', courseTitle: 'English Language', subject: 'English', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', instructor: 'Mrs. Jane Principal', studentsEnrolled: 42, lessons: 15, status: 'Published' },
    { id: 3, courseCode: 'SCI101', courseTitle: 'Introduction to Science', subject: 'Science', class: 'Basic 2', term: '1st Term', academicYear: '2024/2025', instructor: 'Mr. Michael Admin', studentsEnrolled: 38, lessons: 10, status: 'Published' },
    { id: 4, courseCode: 'SOC101', courseTitle: 'Social Studies Basics', subject: 'Social Studies', class: 'Basic 2', term: '1st Term', academicYear: '2024/2025', instructor: 'Ms. Sarah Teacher', studentsEnrolled: 35, lessons: 8, status: 'Published' },
  ];

  const subjects: string[] = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];
  const classes: string[] = ['All Classes', 'Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter published courses
  const filteredCourses = useMemo(() => {
    let filtered = courses.filter(c => c.status === 'Published');
    if (selectedSubject && selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(c => c.subject === selectedSubject);
    }
    if (selectedClass && selectedClass !== 'All Classes') {
      filtered = filtered.filter(c => c.class === selectedClass);
    }
    return filtered;
  }, [selectedSubject, selectedClass, courses]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(start, start + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">E-Learning Courses</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">View Courses</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject === 'All Subjects' ? '' : subject}>{subject}</option>
              ))}
            </select>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {classes.map(cls => (
                <option key={cls} value={cls === 'All Classes' ? '' : cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      {paginatedCourses.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-graduation-cap text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No courses available.</p>
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
                  <span className="text-xs font-semibold text-gray-600">{course.courseCode}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.courseTitle}</h3>
                <div className="space-y-1 mb-4 text-sm text-gray-600">
                  <p><i className="fas fa-graduation-cap mr-1"></i>{course.class} - {course.term}</p>
                  <p><i className="fas fa-user-tie mr-1"></i>{course.instructor}</p>
                  <p><i className="fas fa-book mr-1"></i>{course.lessons} Lessons</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      <i className="fas fa-users mr-1"></i>{course.studentsEnrolled} Students
                    </span>
                  </div>
                  <button className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors">
                    Enroll <i className="fas fa-arrow-right ml-1"></i>
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

export default ViewCourses;

