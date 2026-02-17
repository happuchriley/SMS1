import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { Link } from "react-router-dom";
import elearningService from "../services/elearningService";

interface DashboardStats {
  myCourses: number;
  pendingAssignments: number;
  completedAssignments: number;
  upcomingQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
}

const StudentDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    myCourses: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    upcomingQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async (): Promise<void> => {
    try {
      const [courses, quizzes] = await Promise.all([
        elearningService.getAllCourses(),
        elearningService.getAllQuizzes(),
      ]);

      // Mock data for student dashboard
      const studentId = sessionStorage.getItem("studentId") || "";
      const enrolledCourses = courses.filter(
        (c) => c.enrolledStudents?.includes(studentId) || true
      );
      const availableQuizzes = quizzes.filter((q) => q.status === "active");
      const completedQuizzesList = quizzes.filter(
        (q) => q.status === "completed"
      );

      setStats({
        myCourses: enrolledCourses.length || 5,
        pendingAssignments: 3, // Mock
        completedAssignments: 8, // Mock
        upcomingQuizzes: availableQuizzes.length || 2,
        completedQuizzes: completedQuizzesList.length || 5,
        averageScore: 78.5, // Mock
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 tracking-tight">
          Student Dashboard
        </h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link
            to="/"
            className="text-gray-600 no-underline hover:text-primary-600 transition-colors font-medium"
          >
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Dashboard</span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Link
          to="/elearning/my-courses"
          className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-blue-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline"
        >
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            MY COURSES
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.myCourses}
          </div>
        </Link>
        <Link
          to="/elearning/assignments"
          className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-orange-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline"
        >
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            PENDING ASSIGNMENTS
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.pendingAssignments}
          </div>
        </Link>
        <Link
          to="/elearning/assignments"
          className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline"
        >
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            COMPLETED ASSIGNMENTS
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.completedAssignments}
          </div>
        </Link>
        <Link
          to="/elearning/quiz-home"
          className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-purple-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline"
        >
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            UPCOMING QUIZZES
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.upcomingQuizzes}
          </div>
        </Link>
        <Link
          to="/elearning/quiz-home"
          className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-green-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline"
        >
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            COMPLETED QUIZZES
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.completedQuizzes}
          </div>
        </Link>
        <Link
          to="/reports/student-academic-report"
          className="bg-white rounded-lg p-4 sm:p-5 shadow-sm border-l-4 border-indigo-500 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 no-underline"
        >
          <div className="text-xs text-gray-600 mb-2 font-medium uppercase tracking-wide">
            AVERAGE SCORE
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats.averageScore}%
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="card-modern mb-6 sm:mb-8">
        <div className="section-header">
          <h3 className="section-title">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 sm:p-6">
          <Link
            to="/elearning/quiz-home"
            className="flex items-center gap-3 p-4 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-question-circle text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Take Quiz
              </div>
              <div className="text-xs text-gray-600">Start a quiz</div>
            </div>
          </Link>
          <Link
            to="/elearning/assignments"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-tasks text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                View Assignments
              </div>
              <div className="text-xs text-gray-600">Check tasks</div>
            </div>
          </Link>
          <Link
            to="/reports/student-academic-report"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                View Results
              </div>
              <div className="text-xs text-gray-600">Academic report</div>
            </div>
          </Link>
          <Link
            to="/elearning/my-courses"
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors no-underline"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-book text-white"></i>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                My Courses
              </div>
              <div className="text-xs text-gray-600">View courses</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-modern">
        <div className="section-header">
          <h3 className="section-title">Recent Activity</h3>
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-clock text-4xl mb-3 text-gray-300"></i>
            <p className="text-sm">No recent activity</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
