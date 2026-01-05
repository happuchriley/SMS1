import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

interface StudentProgressData {
  id: string;
  studentId: string;
  courseId: string;
  studentName?: string;
  courseName?: string;
  assignments: number;
  completed: number;
  quizzes: number;
  avgScore: number;
  progress: number;
}

const StudentProgress: React.FC = () => {
  const { toast } = useModal();
  const [students, setStudents] = useState<StudentProgressData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  const loadProgress = useCallback(async () => {
    try {
      setLoading(true);
      const allCourses = await elearningService.getAllCourses();
      const allStudents = await studentsService.getAll();
      const allProgress = await elearningService.getAllProgress();
      
      // Get unique student-course combinations and calculate progress
      const progressMap = new Map<string, StudentProgressData>();
      
      for (const progress of allProgress) {
        const key = `${progress.studentId}-${progress.courseId}`;
        if (!progressMap.has(key)) {
          const course = allCourses.find(c => c.id === progress.courseId);
          const student = allStudents.find((s: any) => s.id === progress.studentId || s.studentId === progress.studentId);
          
          // Calculate progress for this student-course combination
          const progressData = await elearningService.calculateProgress(progress.studentId, progress.courseId);
          const courseAssignments = await elearningService.getAssignmentsByCourse(progress.courseId);
          const courseQuizzes = await elearningService.getQuizzesByCourse(progress.courseId);
          
          progressMap.set(key, {
            id: progress.id,
            studentId: progress.studentId,
            courseId: progress.courseId,
            studentName: student?.name || student?.firstName || 'Unknown Student',
            courseName: course?.title || 'Unknown Course',
            assignments: courseAssignments.length,
            completed: parseInt(progressData.assignmentsCompleted.toString()),
            quizzes: courseQuizzes.length,
            avgScore: 0, // Would need to calculate from quiz scores
            progress: parseFloat(progressData.completion)
          });
        }
      }
      
      setStudents(Array.from(progressMap.values()));
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading student progress:', error);
      toast.showError('Failed to load student progress');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = 
        (student.studentName && student.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCourse = filterCourse === 'all' || student.courseId === filterCourse;
      return matchesSearch && matchesCourse;
    });
  }, [students, searchTerm, filterCourse]);

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Students Progress</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Students Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or student ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Course</label>
            <select
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students Progress Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading student progress...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-chart-line text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No student progress found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-bordered">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Course</th>
                  <th>Assignments</th>
                  <th>Quizzes</th>
                  <th>Avg Score</th>
                  <th>Progress</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => {
                  const assignmentPercent = student.assignments > 0 
                    ? (student.completed / student.assignments) * 100 
                    : 0;
                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="text-sm font-medium">{student.studentName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{student.studentId}</div>
                      </td>
                      <td className="text-sm">{student.courseName || 'N/A'}</td>
                      <td className="whitespace-nowrap">
                        <div className="text-sm">
                          {student.completed} / {student.assignments}
                        </div>
                        {student.assignments > 0 && (
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-100" 
                              style={{ width: `${assignmentPercent}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-sm">{student.quizzes || 0}</td>
                      <td className="whitespace-nowrap">
                        <span className={`text-sm font-semibold ${getScoreColor(student.avgScore)}`}>
                          {student.avgScore.toFixed(1)}%
                        </span>
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-100 ${getProgressColor(student.progress)}`}
                              style={{ width: `${student.progress}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{student.progress.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/elearning/progress/${student.studentId}/${student.courseId}`}
                          className="text-primary-600 hover:text-primary-900 transition-colors duration-100"
                        >
                          <i className="fas fa-chart-bar"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default StudentProgress;

