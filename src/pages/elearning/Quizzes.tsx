import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
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
  status?: string;
  description?: string;
}

const Quizzes: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const allQuizzes = await elearningService.getAllQuizzes();
      const allCourses = await elearningService.getAllCourses();
      
      // Map course IDs to course names
      const quizzesWithCourses = allQuizzes.map((quiz) => {
        const course = allCourses.find(c => c.id === quiz.courseId);
        
        // Determine status based on date
        let status = 'scheduled';
        if (quiz.date) {
          const quizDate = new Date(quiz.date);
          const now = new Date();
          if (quizDate < now) {
            status = 'completed';
          } else if (quizDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            status = 'active';
          }
        }
        
        return {
          ...quiz,
          course: course?.title || 'Unknown Course',
          courseTitle: course?.title || 'Unknown Course',
          status,
          attempts: 0 // This would need to be tracked separately
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
    return quizzes.filter(quiz => {
      const matchesSearch = 
        quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.course && quiz.course.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || quiz.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [quizzes, searchTerm, filterStatus]);

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Quiz',
      message: 'Are you sure you want to delete this quiz? This action cannot be undone.',
      itemName: quizzes.find(q => q.id === id)?.title || 'this quiz',
      onConfirm: async () => {
        try {
          await elearningService.deleteQuiz(id);
          toast.showSuccess('Quiz deleted successfully');
          await loadQuizzes();
        } catch (error: any) {
          console.error('Error deleting quiz:', error);
          toast.showError(error.message || 'Failed to delete quiz');
        }
      }
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quizzes</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Quizzes</span>
            </div>
          </div>
          <Link
            to="/elearning/quizzes/create"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            <i className="fas fa-plus mr-2"></i>Create Quiz
          </Link>
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
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading quizzes...</p>
        </div>
      ) : filteredQuizzes.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-question-circle text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No quizzes found.</p>
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
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-users mr-2"></i>Attempts:</span>
                    <span className="font-medium">{quiz.attempts || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/elearning/quizzes/view/${quiz.id}`}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors duration-100 text-center"
                  >
                    <i className="fas fa-eye mr-1"></i>View
                  </Link>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors duration-100"
                  >
                    <i className="fas fa-trash"></i>
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

