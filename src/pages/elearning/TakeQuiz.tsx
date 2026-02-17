import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate, useParams } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer?: string;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  course?: string;
  duration: number;
  questions: Question[];
  passingScore?: number;
}

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast, showDeleteModal } = useModal();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  const loadQuiz = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const quizData = await elearningService.getQuizById(id);
      
      // Mock questions if not provided
      const questions: Question[] = quizData.questions || [
        {
          id: '1',
          question: 'What is 2 + 2?',
          type: 'multiple-choice',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          points: 10
        },
        {
          id: '2',
          question: 'JavaScript is a programming language.',
          type: 'true-false',
          options: ['True', 'False'],
          correctAnswer: 'True',
          points: 10
        },
        {
          id: '3',
          question: 'Explain the concept of React hooks.',
          type: 'short-answer',
          points: 20
        }
      ];
      
      setQuiz({
        ...quizData,
        questions,
        duration: quizData.duration || 30
      });
      setTimeRemaining((quizData.duration || 30) * 60); // Convert to seconds
    } catch (error) {
      console.error('Error loading quiz:', error);
      toast.showError('Failed to load quiz');
      navigate('/elearning/quizzes');
    } finally {
      setLoading(false);
    }
  }, [id, toast, navigate]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const handleSubmitQuiz = useCallback(async (): Promise<void> => {
    if (!quiz) return;
    
    // Calculate score
    let totalScore = 0;
    let totalPoints = 0;
    
    quiz.questions.forEach(q => {
      totalPoints += q.points;
      if (q.type === 'multiple-choice' || q.type === 'true-false') {
        if (answers[q.id] === q.correctAnswer) {
          totalScore += q.points;
        }
      }
      // Short answer questions would need manual grading
    });
    
    const percentage = (totalScore / totalPoints) * 100;
    setScore(percentage);
    setQuizSubmitted(true);
    
    try {
      await elearningService.submitQuizAttempt({
        quizId: quiz.id,
        answers,
        score: percentage,
        timeSpent: (quiz.duration * 60) - timeRemaining
      });
      toast.showSuccess(`Quiz submitted! Your score: ${percentage.toFixed(1)}%`);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      toast.showError('Failed to submit quiz');
    }
  }, [quiz, answers, id, toast]);

  // Timer countdown
  useEffect(() => {
    if (!quizStarted || timeRemaining <= 0 || quizSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizStarted, timeRemaining, quizSubmitted, handleSubmitQuiz]);

  const handleStartQuiz = (): void => {
    if (!quiz) return;
    
    showDeleteModal({
      title: 'Start Quiz',
      message: `You have ${quiz.duration} minutes to complete this quiz. Once started, the timer cannot be paused. Are you ready to begin?`,
      itemName: quiz.title,
      onConfirm: () => {
        setQuizStarted(true);
      }
    });
  };

  const handleAnswerChange = (questionId: string, answer: string): void => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = (): void => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = (): void => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading quiz...</p>
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

  if (!quizStarted) {
    return (
      <Layout>
        <div className="mb-5 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quiz Instructions</h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
                <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
                <span>/</span>
                <Link to="/elearning/quizzes" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Quizzes</Link>
                <span>/</span>
                <span className="text-gray-900 font-medium">{quiz.title}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{quiz.title}</h2>
            {quiz.course && (
              <p className="text-gray-600 mb-6">Course: {quiz.course}</p>
            )}
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Instructions:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li>You have <strong>{quiz.duration} minutes</strong> to complete this quiz</li>
                <li>The quiz contains <strong>{quiz.questions.length} questions</strong></li>
                <li>Once you start, the timer cannot be paused</li>
                <li>Make sure you have a stable internet connection</li>
                <li>Review your answers before submitting</li>
                <li>You cannot go back after submitting</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Link
                to="/elearning/quizzes"
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300 text-center"
              >
                Cancel
              </Link>
              <button
                onClick={handleStartQuiz}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg min-h-[44px]"
              >
                <i className="fas fa-play mr-2"></i>Start Quiz
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (quizSubmitted) {
    const passed = quiz.passingScore ? score >= quiz.passingScore : score >= 60;
    
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
                <span className="text-gray-900 font-medium">{quiz.title}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <i className={`fas ${passed ? 'fa-check-circle' : 'fa-times-circle'} text-5xl ${
                passed ? 'text-green-600' : 'text-red-600'
              }`}></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
            <div className={`text-4xl font-bold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {score.toFixed(1)}%
            </div>
            <p className={`text-lg font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {passed ? 'Passed' : 'Failed'}
            </p>
            {quiz.passingScore && (
              <p className="text-sm text-gray-600 mt-2">
                Passing Score: {quiz.passingScore}%
              </p>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Answers:</h3>
            <div className="space-y-4">
              {quiz.questions.map((q, index) => {
                const userAnswer = answers[q.id] || 'Not answered';
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
                    <p className="text-sm text-gray-700 mb-2">{q.question}</p>
                    <div className="text-sm">
                      <span className="text-gray-600">Your answer: </span>
                      <span className="font-medium">{userAnswer}</span>
                    </div>
                    {q.type !== 'short-answer' && q.correctAnswer && (
                      <div className="text-sm mt-1">
                        <span className="text-gray-600">Correct answer: </span>
                        <span className="font-medium text-green-600">{q.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
            <Link
              to="/elearning/quizzes"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 text-center min-h-[44px] flex items-center justify-center"
            >
              <i className="fas fa-arrow-left mr-2"></i>Back to Quizzes
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning/quizzes" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Quizzes</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{quiz.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timer and Progress */}
      <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1 w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <span className={`text-sm font-bold ${
                timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'
              }`}>
                <i className="fas fa-clock mr-1"></i>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {currentQ.question}
          </h2>
          
          {currentQ.type === 'multiple-choice' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQ.id] === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="mr-3 w-4 h-4 text-primary-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'true-false' && currentQ.options && (
            <div className="space-y-3">
              {currentQ.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    answers[currentQ.id] === option
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option}
                    checked={answers[currentQ.id] === option}
                    onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
                    className="mr-3 w-4 h-4 text-primary-500"
                  />
                  <span className="text-gray-900">{option}</span>
                </label>
              ))}
            </div>
          )}

          {currentQ.type === 'short-answer' && (
            <textarea
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(currentQ.id, e.target.value)}
              placeholder="Type your answer here..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[150px] resize-vertical"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          >
            <i className="fas fa-arrow-left mr-2"></i>Previous
          </button>
          
          <div className="flex gap-2">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-md text-xs font-medium transition-colors ${
                  index === currentQuestion
                    ? 'bg-primary-500 text-white'
                    : answers[quiz.questions[index].id]
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={`Question ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmitQuiz}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors min-h-[44px]"
            >
              Submit Quiz <i className="fas fa-check ml-2"></i>
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors min-h-[44px]"
            >
              Next <i className="fas fa-arrow-right ml-2"></i>
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TakeQuiz;

