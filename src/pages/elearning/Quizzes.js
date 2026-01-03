import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([
    { id: 1, title: 'Mathematics Quiz - Chapter 5', course: 'Mathematics Fundamentals', date: '2024-02-10', duration: 30, questions: 20, attempts: 25, status: 'completed' },
    { id: 2, title: 'English Grammar Quiz', course: 'English Language', date: '2024-02-15', duration: 20, questions: 15, attempts: 28, status: 'active' },
    { id: 3, title: 'Science Knowledge Test', course: 'Integrated Science', date: '2024-02-18', duration: 45, questions: 30, attempts: 0, status: 'scheduled' },
    { id: 4, title: 'ICT Practical Quiz', course: 'Information Technology', date: '2024-02-12', duration: 25, questions: 18, attempts: 20, status: 'completed' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredQuizzes = useMemo(() => {
    return quizzes.filter(quiz => {
      const matchesSearch = 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quiz.course.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quizzes, searchTerm, filterStatus]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quizzes</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Quizzes</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300">
            <i className="fas fa-plus mr-2"></i>Create Quiz
          </button>
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
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quizzes Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No quizzes found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                      quiz.status === 'active' ? 'bg-green-100 text-green-800' :
                      quiz.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quiz.status}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{quiz.course}</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-calendar mr-2"></i>Date:</span>
                    <span className="font-medium">{new Date(quiz.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-clock mr-2"></i>Duration:</span>
                    <span className="font-medium">{quiz.duration} mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-question mr-2"></i>Questions:</span>
                    <span className="font-medium">{quiz.questions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-users mr-2"></i>Attempts:</span>
                    <span className="font-medium">{quiz.attempts}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors">
                    <i className="fas fa-eye mr-1"></i>View
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                    <i className="fas fa-edit"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Quizzes;
