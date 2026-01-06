import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link, useParams, useNavigate } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface QuizAttempt {
  id: string;
  quizId: string;
  score: number;
  answers: Record<string, string>;
  timeSpent: number;
  submittedAt: string;
}

interface Question {
  id: string;
  question: string;
  type: string;
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  course?: string;
  questions?: Question[];
  passingScore?: number;
}

const QuizResults: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useModal();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  const loadQuizResults = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const quizData = await elearningService.getQuizById(id);
      
      // Load quiz attempts
      const quizAttempts = await elearningService.getQuizAttempts(id);
      
      setQuiz(quizData);
      setAttempts(quizAttempts);
      
      // Set the most recent attempt as selected by default
      if (quizAttempts.length > 0) {
        setSelectedAttempt(quizAttempts[0]);
      }
    } catch (error) {
      console.error('Error loading quiz results:', error);
      toast.showError('Failed to load quiz results');
      navigate('/elearning/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, toast, navigate]);

  useEffect(() => {
    loadQuizResults();
  }, [loadQuizResults]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading quiz results...</p>
        </div>
      </Layout>
    );
  }

  if (!quiz) {
    return (
      <Layout>
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">Quiz not found.</p>
          <Link
            to="/elearning/quizzes"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            Back to Quizzes
          </Link>
        </div>
      </Layout>
    );
  }

  const questions = quiz.questions || [];
  const passed = quiz.passingScore ? (selectedAttempt?.score || 0) >= quiz.passingScore : (selectedAttempt?.score || 0) >= 60;

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quiz Results</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning/quizzes" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Quizzes</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Results</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Attempts List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Quiz Attempts</h3>
            </div>
            <div className="p-4">
              {attempts.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No attempts found</p>
              ) : (
                <div className="space-y-2">
                  {attempts.map((attempt, index) => (
                    <button
                      key={attempt.id}
                      onClick={() => setSelectedAttempt(attempt)}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedAttempt?.id === attempt.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">Attempt {index + 1}</span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          quiz.passingScore && attempt.score >= quiz.passingScore
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatDate(attempt.submittedAt)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Results Details */}
        <div className="lg:col-span-2">
          {selectedAttempt ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
                {quiz.course && (
                  <p className="text-sm text-gray-600 mt-1">Course: {quiz.course}</p>
                )}
              </div>

              <div className="p-4 sm:p-6">
                {/* Score Summary */}
                <div className="text-center mb-6 pb-6 border-b border-gray-200">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <i className={`fas ${passed ? 'fa-check-circle' : 'fa-times-circle'} text-4xl ${
                      passed ? 'text-green-600' : 'text-red-600'
                    }`}></i>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAttempt.score.toFixed(1)}%
                  </div>
                  <p className={`text-lg font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                    {passed ? 'Passed' : 'Failed'}
                  </p>
                  {quiz.passingScore && (
                    <p className="text-sm text-gray-600 mt-2">
                      Passing Score: {quiz.passingScore}%
                    </p>
                  )}
                  <div className="mt-4 text-sm text-gray-600">
                    <p>Time Spent: {formatTime(selectedAttempt.timeSpent)}</p>
                    <p>Submitted: {formatDate(selectedAttempt.submittedAt)}</p>
                  </div>
                </div>

                {/* Question Review */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Question Review</h4>
                  <div className="space-y-4">
                    {questions.map((q, index) => {
                      const userAnswer = selectedAttempt.answers[q.id] || 'Not answered';
                      const isCorrect = q.type !== 'short-answer' && userAnswer === q.correctAnswer;
                      
                      return (
                        <div key={q.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-gray-900">Question {index + 1}</span>
                            {q.type !== 'short-answer' && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700 mb-3">{q.question}</p>
                          
                          {q.type === 'short-answer' ? (
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-600 font-medium">Your answer: </span>
                                <span className="text-gray-900">{userAnswer || 'No answer provided'}</span>
                              </div>
                              {q.correctAnswer && (
                                <div className="text-sm">
                                  <span className="text-gray-600 font-medium">Expected answer: </span>
                                  <span className="text-green-600 font-medium">{q.correctAnswer}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <div className="text-sm">
                                <span className="text-gray-600 font-medium">Your answer: </span>
                                <span className={`font-medium ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                  {userAnswer}
                                </span>
                              </div>
                              {q.correctAnswer && (
                                <div className="text-sm">
                                  <span className="text-gray-600 font-medium">Correct answer: </span>
                                  <span className="text-green-600 font-medium">{q.correctAnswer}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
                <Link
                  to="/elearning/quizzes"
                  className="inline-block px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-100"
                >
                  <i className="fas fa-arrow-left mr-2"></i>Back to Quizzes
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
              <i className="fas fa-chart-bar text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No attempt selected. Please select an attempt from the list.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default QuizResults;

