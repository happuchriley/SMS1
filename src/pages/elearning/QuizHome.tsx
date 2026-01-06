import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface Quiz {
  id: string;
  title: string;
  courseId: string;
  course?: string;
  courseTitle?: string;
  date?: string;
  duration?: number;
  questions?: number;
  attempts?: number;
  maxAttempts?: number;
  status?: string;
  description?: string;
  passingScore?: number;
  score?: number;
  completed?: boolean;
  startTime?: string;
  endTime?: string;
}

const QuizHome: React.FC = () => {
  const { toast } = useModal();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourse, setFilterCourse] = useState<string>('all');
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);
  const [activeTab, setActiveTab] = useState<'available' | 'completed' | 'scheduled'>('available');

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const allQuizzes = await elearningService.getAllQuizzes();
      const allCourses = await elearningService.getAllCourses();
      
      // Map course IDs to course names and determine status
      const quizzesWithCourses = allQuizzes.map((quiz) => {
        const course = allCourses.find(c => c.id === quiz.courseId);
        const now = new Date();
        let status = 'scheduled';
        let completed = false;
        
        if (quiz.date) {
          const quizDate = new Date(quiz.date);
          if (quizDate < now) {
            status = 'completed';
            completed = true;
          } else if (quizDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            status = 'active';
          }
        }
        
        return {
          ...quiz,
          course: course?.title || 'Unknown Course',
          courseTitle: course?.title || 'Unknown Course',
          status,
          completed,
          attempts: quiz.attempts || 0,
          score: quiz.score || undefined
        };
      });
      
      setQuizzes(quizzesWithCourses);
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      toast.showError('Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const filteredQuizzes = useMemo(() => {
    let filtered = quizzes;
    
    // Filter by tab
    if (activeTab === 'available') {
      filtered = filtered.filter(q => q.status === 'active' && (!q.maxAttempts || (q.attempts || 0) < q.maxAttempts));
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(q => q.completed || q.status === 'completed');
    } else if (activeTab === 'scheduled') {
      filtered = filtered.filter(q => q.status === 'scheduled');
    }
    
    // Filter by search
    if (searchTerm) {
      filtered = filtered.filter(quiz => 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.course && quiz.course.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Filter by course
    if (filterCourse !== 'all') {
      filtered = filtered.filter(quiz => quiz.courseId === filterCourse);
    }
    
    return filtered;
  }, [quizzes, searchTerm, filterCourse, activeTab]);

  const handleStartQuiz = (quiz: Quiz): void => {
    // Check if quiz can be started
    if (quiz.maxAttempts && (quiz.attempts || 0) >= quiz.maxAttempts) {
      toast.showError('Maximum attempts reached for this quiz');
      return;
    }
    
    const now = new Date();
    if (quiz.date && new Date(quiz.date) > now) {
      toast.showError('This quiz is not available yet');
      return;
    }
    
    // Navigate to take quiz page
    navigate(`/elearning/quizzes/take/${quiz.id}`);
  };

  const handleViewResults = (quiz: Quiz): void => {
    navigate(`/elearning/quizzes/results/${quiz.id}`);
  };

  const stats = useMemo(() => {
    const available = quizzes.filter(q => q.status === 'active' && (!q.maxAttempts || (q.attempts || 0) < q.maxAttempts)).length;
    const completed = quizzes.filter(q => q.completed || q.status === 'completed').length;
    const scheduled = quizzes.filter(q => q.status === 'scheduled').length;
    
    return { available, completed, scheduled, total: quizzes.length };
  }, [quizzes]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quiz Home</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Quiz Home</span>
            </div>
          </div>
          <Link
            to="/elearning/quizzes/create"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100 whitespace-nowrap"
          >
            <i className="fas fa-plus mr-2"></i>Create Quiz
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Available</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.available}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Completed</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.completed}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-yellow-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Scheduled</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.scheduled}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'available'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Available Quizzes
              {stats.available > 0 && (
                <span className="ml-2 bg-primary-100 text-primary-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.available}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'completed'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed
              {stats.completed > 0 && (
                <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.completed}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Scheduled
              {stats.scheduled > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-600 text-xs px-2 py-0.5 rounded-full">
                  {stats.scheduled}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 sm:p-5 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search quizzes by title or course..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                />
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              </div>
            </div>
            <div>
              <label className="block mb-1.5 text-sm font-medium text-gray-700">Filter by Course</label>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="all">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Quizzes List */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">
            {activeTab === 'available' && 'No available quizzes found.'}
            {activeTab === 'completed' && 'No completed quizzes found.'}
            {activeTab === 'scheduled' && 'No scheduled quizzes found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredQuizzes.map(quiz => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-100">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
                      quiz.status === 'active' ? 'bg-green-100 text-green-800' :
                      quiz.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {quiz.status || 'scheduled'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{quiz.course || 'N/A'}</p>
                    {quiz.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{quiz.description}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-calendar mr-2"></i>Date:</span>
                    <span className="font-medium">
                      {quiz.date ? new Date(quiz.date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-clock mr-2"></i>Duration:</span>
                    <span className="font-medium">{quiz.duration || 0} mins</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-question mr-2"></i>Questions:</span>
                    <span className="font-medium">{quiz.questions || 0}</span>
                  </div>
                  {quiz.maxAttempts && (
                    <div className="flex items-center justify-between">
                      <span><i className="fas fa-redo mr-2"></i>Attempts:</span>
                      <span className="font-medium">{quiz.attempts || 0} / {quiz.maxAttempts}</span>
                    </div>
                  )}
                  {quiz.completed && quiz.score !== undefined && (
                    <div className="flex items-center justify-between">
                      <span><i className="fas fa-trophy mr-2"></i>Score:</span>
                      <span className={`font-medium ${
                        quiz.passingScore && quiz.score >= quiz.passingScore 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {quiz.score}% {quiz.passingScore && quiz.score >= quiz.passingScore && '✓'}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {activeTab === 'available' ? (
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      disabled={!!(quiz.maxAttempts && (quiz.attempts || 0) >= quiz.maxAttempts)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors duration-100 text-center disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    >
                      <i className="fas fa-play mr-1"></i>Start Quiz
                    </button>
                  ) : activeTab === 'completed' ? (
                    <button
                      onClick={() => handleViewResults(quiz)}
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors duration-100 text-center min-h-[44px]"
                    >
                      <i className="fas fa-chart-bar mr-1"></i>View Results
                    </button>
                  ) : (
                    <div className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md text-center min-h-[44px] flex items-center justify-center">
                      <i className="fas fa-clock mr-1"></i>Scheduled
                    </div>
                  )}
                  <Link
                    to={`/elearning/quizzes/view/${quiz.id}`}
                    className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-100 min-h-[44px] flex items-center justify-center"
                    title="View Details"
                  >
                    <i className="fas fa-eye"></i>
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

export default QuizHome;

