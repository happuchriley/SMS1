import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import studentsService from '../services/studentsService';
import academicService from '../services/academicService';
import setupService from '../services/setupService';
import staffService from '../services/staffService';

interface DashboardStats {
  myClasses: number;
  myStudents: number;
  pendingResults: number;
  completedResults: number;
  upcomingQuizzes: number;
  assignmentsDue: number;
}

interface ClassInfo {
  id: string;
  name: string;
  code: string;
  studentCount: number;
  classTeacher?: string;
}

interface StudentInfo {
  id: string;
  studentId?: string;
  name: string;
  class?: string;
  status?: string;
}

const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    myClasses: 0,
    myStudents: 0,
    pendingResults: 0,
    completedResults: 0,
    upcomingQuizzes: 0,
    assignmentsDue: 0
  });
  const [myClasses, setMyClasses] = useState<ClassInfo[]>([]);
  const [myStudents, setMyStudents] = useState<StudentInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedClass, setSelectedClass] = useState<string>('all');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const username = sessionStorage.getItem('username') || '';
      
      // Get current staff member
      const allStaff = await staffService.getAll();
      const currentStaff = allStaff.find(s => 
        s.staffId === username || 
        s.email === username ||
        `${s.firstName} ${s.surname}` === username ||
        `${s.firstName} ${s.surname} ${s.otherNames || ''}`.trim() === username
      );

      if (!currentStaff) {
        console.warn('Current staff member not found');
        setLoading(false);
        return;
      }

      const staffName = `${currentStaff.firstName} ${currentStaff.surname} ${currentStaff.otherNames || ''}`.trim();
      
      // Get all classes and filter by class teacher
      const [allClasses, allStudents] = await Promise.all([
        setupService.getAllClasses(),
        studentsService.getAll()
      ]);

      // Find classes where this staff is the class teacher
      const classesTaught = allClasses.filter((cls: any) => 
        cls.classTeacher === staffName || 
        cls.classTeacher === `${currentStaff.firstName} ${currentStaff.surname}` ||
        cls.classTeacher === currentStaff.staffId
      );

      // Get students for these classes
      const classNames = classesTaught.map((cls: any) => cls.name || cls.className).filter(Boolean);
      const studentsInMyClasses: StudentInfo[] = allStudents
        .filter((student: any) => classNames.includes(student.class))
        .map((student: any): StudentInfo => ({
          id: (student as any).id || '',
          studentId: student.studentId,
          name: `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim() || 'N/A',
          class: student.class,
          status: student.status
        }));

      // Calculate student counts per class
      const classInfo: ClassInfo[] = classesTaught.map((cls: any) => {
        const className = cls.name || cls.className;
        const studentCount = allStudents.filter((s: any) => s.class === className && s.status === 'active').length;
        return {
          id: cls.id,
          name: className,
          code: cls.code || cls.classCode || '',
          studentCount,
          classTeacher: cls.classTeacher
        };
      });

      // Get results data for pending/completed counts
      const allResults = await academicService.getAllResults();
      const currentYear = new Date().getFullYear().toString();
      
      const pendingResults = allResults.filter((r: any) => 
        !r.completed && r.academicYear === currentYear
      ).length;

      const completedResults = allResults.filter((r: any) => 
        r.completed && r.academicYear === currentYear
      ).length;

      setMyClasses(classInfo);
      setMyStudents(studentsInMyClasses);
      setStats({
        myClasses: classInfo.length,
        myStudents: studentsInMyClasses.filter((s: any) => s.status === 'active').length,
        pendingResults,
        completedResults,
        upcomingQuizzes: 3, // Mock - can be enhanced later
        assignmentsDue: 2 // Mock - can be enhanced later
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (student: StudentInfo): string => {
    if (typeof student === 'object' && 'firstName' in student) {
      const s = student as any;
      return `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim() || 'N/A';
    }
    return student.name || 'N/A';
  };

  const filteredStudents = selectedClass === 'all' 
    ? myStudents.filter(s => s.status === 'active')
    : myStudents.filter(s => s.class === selectedClass && s.status === 'active');

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">Staff Dashboard</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/staff/menu" className="text-gray-600 no-underline hover:text-primary-600 transition-colors font-medium">Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">MY CLASSES</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.myClasses}</div>
        </div>
        <div className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">MY STUDENTS</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.myStudents}</div>
        </div>
        <Link to="/reports/enter-academic-result" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-orange-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">PENDING RESULTS</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.pendingResults}</div>
        </Link>
        <Link to="/reports/enter-academic-result" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">COMPLETED RESULTS</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.completedResults}</div>
        </Link>
        <Link to="/elearning/quiz-home" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-purple-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">UPCOMING QUIZZES</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.upcomingQuizzes}</div>
        </Link>
        <Link to="/elearning/assignments" className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-red-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline">
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">ASSIGNMENTS DUE</div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.assignmentsDue}</div>
        </Link>
      </div>

      {/* My Classes Section */}
      {loading ? (
        <div className="card-modern mb-6 sm:mb-8">
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : myClasses.length > 0 ? (
        <>
          <div className="card-modern mb-6 sm:mb-8">
            <div className="section-header">
              <h3 className="section-title">My Classes</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6">
              {myClasses.map((cls) => (
                <div
                  key={cls.id}
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-5 border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg cursor-pointer"
                  onClick={() => setSelectedClass(selectedClass === cls.name ? 'all' : cls.name)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{cls.name}</h4>
                      <p className="text-xs text-gray-600">{cls.code}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {cls.studentCount}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <i className="fas fa-users text-blue-600"></i>
                    <span>{cls.studentCount} {cls.studentCount === 1 ? 'Student' : 'Students'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Students List Section */}
          <div className="card-modern mb-6 sm:mb-8">
            <div className="section-header">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h3 className="section-title">My Students</h3>
                <div className="flex items-center gap-3">
                  <div className="relative select-dropdown-wrapper">
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="select-dropdown px-4 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary-500 transition-colors min-h-[44px] sm:min-h-[40px] md:min-h-[44px]"
                    >
                      <option value="all">All Classes</option>
                      {myClasses.map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name} ({cls.studentCount})
                        </option>
                      ))}
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/reports/enter-academic-result')}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    <i className="fas fa-edit mr-2"></i>Enter Results
                  </button>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table-modern w-full">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Name</th>
                    <th>Class</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                        <p>No students found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student) => (
                      <tr key={student.id}>
                        <td className="font-semibold text-slate-800">
                          {student.studentId || student.id}
                        </td>
                        <td className="font-medium text-slate-900">
                          {getStudentName(student)}
                        </td>
                        <td>
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-100 text-primary-700">
                            {student.class || 'N/A'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${
                            student.status === 'active' 
                              ? 'badge-success' 
                              : 'badge-danger'
                          }`}>
                            {student.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => navigate(`/reports/enter-academic-result?student=${student.id}`)}
                              className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors duration-150"
                              title="Enter Results"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              onClick={() => navigate(`/reports/student-academic-report?student=${student.id}`)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                              title="View Report"
                            >
                              <i className="fas fa-file-alt"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="card-modern mb-6 sm:mb-8">
          <div className="p-8 text-center">
            <i className="fas fa-chalkboard-teacher text-4xl text-gray-300 mb-4"></i>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Classes Assigned</h3>
            <p className="text-gray-600 mb-4">You haven't been assigned to any classes yet.</p>
            <p className="text-sm text-gray-500">Contact the administrator to be assigned as a class teacher.</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="card-modern mb-6 sm:mb-8">
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6">
          <Link
            to="/reports/enter-academic-result"
            className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-edit text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Enter Results</div>
              <div className="text-xs text-gray-600">Record student scores</div>
            </div>
          </Link>
          <Link
            to="/elearning/quizzes/create"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-question-circle text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Create Quiz</div>
              <div className="text-xs text-gray-600">Set up new quiz</div>
            </div>
          </Link>
          <Link
            to="/elearning/assignments/create"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Create Assignment</div>
              <div className="text-xs text-gray-600">Assign new task</div>
            </div>
          </Link>
          <Link
            to="/tlms/upload"
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-upload text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">Upload TLM</div>
              <div className="text-xs text-gray-600">Share materials</div>
            </div>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherDashboard;
