import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate, useParams } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string;
  shortAnswer?: string; // For short answer questions
}

interface FormData {
  courseId: string;
  topic: string;
  quizType: string;
  quizStatus: string;
  dateCreated: string;
  submissionDate: string;
  quizFor: string;
  durationHours: string;
  durationMinutes: string;
  durationSeconds: string;
  document: File | null;
  instructions: string;
  questions: Question[];
}

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; code: string }>>([]);
  
  const [formData, setFormData] = useState<FormData>({
    courseId: id || '',
    topic: '',
    quizType: '',
    quizStatus: '',
    dateCreated: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
    submissionDate: '',
    quizFor: '',
    durationHours: '0',
    durationMinutes: '0',
    durationSeconds: '0',
    document: null,
    instructions: '',
    questions: [{
      id: '1',
      question: '',
      type: 'multiple-choice' as 'multiple-choice' | 'true-false' | 'short-answer',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      shortAnswer: ''
    }]
  });

  const quizTypes = ['Multiple Choice', 'True/False', 'Short Answer', 'Mixed'];
  const quizStatuses = ['Draft', 'Published', 'Archived'];
  const quizForOptions = ['Assessment', 'Trial'];

  const loadCourses = useCallback(async () => {
    try {
      const allCourses = await elearningService.getAllCourses();
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading courses:', error);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const files = e.target.files;
      if (files && files.length > 0) {
        setFormData({
          ...formData,
          document: files[0]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleQuestionChange = (questionId: string, field: keyof Question, value: string): void => {
    setFormData({
      ...formData,
      questions: formData.questions.map(q => {
        if (q.id === questionId) {
          const updated = { ...q, [field]: value };
          // If type changes, reset options appropriately
          if (field === 'type') {
            if (value === 'true-false') {
              updated.optionA = 'True';
              updated.optionB = 'False';
              updated.optionC = '';
              updated.optionD = '';
              updated.correctAnswer = '';
            } else if (value === 'short-answer') {
              updated.optionA = '';
              updated.optionB = '';
              updated.optionC = '';
              updated.optionD = '';
              updated.correctAnswer = '';
            } else if (value === 'multiple-choice') {
              updated.optionA = updated.optionA || '';
              updated.optionB = updated.optionB || '';
              updated.optionC = updated.optionC || '';
              updated.optionD = updated.optionD || '';
            }
          }
          return updated;
        }
        return q;
      })
    });
  };

  const addQuestion = (): void => {
    // Determine default type based on quiz type
    let defaultType: 'multiple-choice' | 'true-false' | 'short-answer' = 'multiple-choice';
    if (formData.quizType === 'True/False') {
      defaultType = 'true-false';
    } else if (formData.quizType === 'Short Answer') {
      defaultType = 'short-answer';
    } else if (formData.quizType === 'Mixed') {
      defaultType = 'multiple-choice'; // Default for mixed
    }

    const newQuestion: Question = {
      id: Date.now().toString(),
      question: '',
      type: defaultType,
      optionA: defaultType === 'true-false' ? 'True' : '',
      optionB: defaultType === 'true-false' ? 'False' : '',
      optionC: '',
      optionD: '',
      correctAnswer: '',
      shortAnswer: ''
    };
    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });
  };

  const removeQuestion = (questionId: string): void => {
    if (formData.questions.length > 1) {
      setFormData({
        ...formData,
        questions: formData.questions.filter(q => q.id !== questionId)
      });
    } else {
      toast.showError('At least one question is required');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    // Validation
    if (!formData.courseId || !formData.topic || !formData.quizType || !formData.quizStatus || 
        !formData.submissionDate || !formData.quizFor || !formData.instructions) {
      toast.showError('Please fill in all required fields marked with (*)');
      return;
    }

    // Validate questions based on type
    const invalidQuestions = formData.questions.filter(q => {
      if (!q.question) return true;
      if (q.type === 'short-answer') {
        return !q.shortAnswer; // Short answer needs expected answer
      } else if (q.type === 'true-false') {
        return !q.correctAnswer;
      } else {
        return !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer;
      }
    });
    
    if (invalidQuestions.length > 0) {
      toast.showError('Please fill in all question fields including correct answer');
      return;
    }

    // Calculate total duration in minutes
    const totalMinutes = (parseInt(formData.durationHours) || 0) * 60 + 
                        (parseInt(formData.durationMinutes) || 0) + 
                        (parseInt(formData.durationSeconds) || 0) / 60;

    setLoading(true);
    try {
      // Convert questions to the format expected by the service
      const questionsData = formData.questions.map((q, index) => {
        if (q.type === 'short-answer') {
          return {
            id: q.id,
            question: q.question,
            type: 'short-answer',
            correctAnswer: q.shortAnswer || '',
            points: 10
          };
        } else if (q.type === 'true-false') {
          return {
            id: q.id,
            question: q.question,
            type: 'true-false',
            options: [q.optionA, q.optionB],
            correctAnswer: q.correctAnswer,
            points: 10
          };
        } else {
          return {
            id: q.id,
            question: q.question,
            type: 'multiple-choice',
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctAnswer: q.correctAnswer,
            points: 10
          };
        }
      });

      // Convert submission date to ISO format
      const submissionDateISO = new Date(formData.submissionDate).toISOString();

      await elearningService.createQuiz({
        title: formData.topic,
        courseId: formData.courseId,
        description: formData.instructions,
        date: submissionDateISO,
        duration: Math.round(totalMinutes),
        questions: questionsData.length,
        quizType: formData.quizType,
        quizStatus: formData.quizStatus,
        quizFor: formData.quizFor,
        dateCreated: formData.dateCreated,
        questionsData: questionsData
      });
      
      toast.showSuccess('Quiz created successfully!');
      navigate('/elearning/quizzes');
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast.showError(error.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create Test/Quiz</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <Link to="/elearning/quizzes" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Quizzes</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Create Quiz</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Fields marked with <span className="text-red-500">(*)</span> cannot be blank
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  name="courseId"
                  value={formData.courseId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select Subject/Course Here</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code || ''} - {course.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Topic <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="Enter assignment title/topic here"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Quiz Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="quizType"
                  value={formData.quizType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select Quiz Type here</option>
                  {quizTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Quiz Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="quizStatus"
                  value={formData.quizStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select Quiz status here</option>
                  {quizStatuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Date Created <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="dateCreated"
                  value={formData.dateCreated}
                  readOnly
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm bg-gray-50 text-gray-700 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Submission Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="submissionDate"
                  value={formData.submissionDate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Quiz for Assessment/Trial <span className="text-red-500">*</span>
                </label>
                <select
                  name="quizFor"
                  value={formData.quizFor}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                >
                  <option value="">Select option here</option>
                  {quizForOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Test Duration */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Test Duration (Hrs/Min/Sec) <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1 text-xs text-gray-600">Hours</label>
                  <input
                    type="number"
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleChange}
                    min="0"
                    max="23"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-gray-600">Minutes</label>
                  <input
                    type="number"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-xs text-gray-600">Seconds</label>
                  <input
                    type="number"
                    name="durationSeconds"
                    value={formData.durationSeconds}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  />
                </div>
              </div>
            </div>

            {/* Upload Document */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Upload Document
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="document"
                  onChange={handleChange}
                  accept=".pdf,.doc,.docx,.txt"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.document ? formData.document.name : 'No file chosen'}
                </p>
              </div>
            </div>

            {/* Quiz Instructions */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Enter Quiz Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={4}
                placeholder="Enter quiz instructions here..."
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical min-h-[100px]"
              />
            </div>
          </div>

          {/* Questions Table */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <button
                type="button"
                onClick={addQuestion}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>Add Question
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-primary-500 text-white">
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">#</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Question Type</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Question</th>
                    {(formData.quizType === 'Multiple Choice' || formData.quizType === 'Mixed') && (
                      <>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Enter Option A and B</th>
                        <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Enter Option C and D</th>
                      </>
                    )}
                    {(formData.quizType === 'True/False' || formData.quizType === 'Mixed') && (
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Options</th>
                    )}
                    {(formData.quizType === 'Short Answer' || formData.quizType === 'Mixed') && (
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Expected Answer</th>
                    )}
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Correct Answer</th>
                    <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.questions.map((question, index) => {
                    // Determine question type - use quiz type if not mixed, otherwise use question's own type
                    const questionType = formData.quizType === 'Mixed' ? question.type : 
                      formData.quizType === 'True/False' ? 'true-false' :
                      formData.quizType === 'Short Answer' ? 'short-answer' : 'multiple-choice';
                    
                    return (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2 text-center text-sm font-medium">
                          {index + 1}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {formData.quizType === 'Mixed' ? (
                            <select
                              value={question.type}
                              onChange={(e) => handleQuestionChange(question.id, 'type', e.target.value)}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                            >
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="true-false">True/False</option>
                              <option value="short-answer">Short Answer</option>
                            </select>
                          ) : (
                            <span className="text-sm text-gray-600">{formData.quizType}</span>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                            placeholder="Enter Question here"
                            required
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                          />
                        </td>
                        
                        {/* Multiple Choice Options */}
                        {(questionType === 'multiple-choice') && (
                          <>
                            <td className="border border-gray-300 px-3 py-2">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={question.optionA}
                                  onChange={(e) => handleQuestionChange(question.id, 'optionA', e.target.value)}
                                  placeholder="Option A here"
                                  required
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                                />
                                <input
                                  type="text"
                                  value={question.optionB}
                                  onChange={(e) => handleQuestionChange(question.id, 'optionB', e.target.value)}
                                  placeholder="Option B here"
                                  required
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                                />
                              </div>
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <div className="space-y-2">
                                <input
                                  type="text"
                                  value={question.optionC}
                                  onChange={(e) => handleQuestionChange(question.id, 'optionC', e.target.value)}
                                  placeholder="Option C here"
                                  required
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                                />
                                <input
                                  type="text"
                                  value={question.optionD}
                                  onChange={(e) => handleQuestionChange(question.id, 'optionD', e.target.value)}
                                  placeholder="Option D here"
                                  required
                                  className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                                />
                              </div>
                            </td>
                          </>
                        )}
                        
                        {/* True/False Options */}
                        {(questionType === 'true-false') && (
                          <td className="border border-gray-300 px-3 py-2">
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={question.optionA}
                                onChange={(e) => handleQuestionChange(question.id, 'optionA', e.target.value)}
                                placeholder="True"
                                readOnly
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 min-h-[36px]"
                              />
                              <input
                                type="text"
                                value={question.optionB}
                                onChange={(e) => handleQuestionChange(question.id, 'optionB', e.target.value)}
                                placeholder="False"
                                readOnly
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 min-h-[36px]"
                              />
                            </div>
                          </td>
                        )}
                        
                        {/* Short Answer Expected Answer */}
                        {(questionType === 'short-answer') && (
                          <td className="border border-gray-300 px-3 py-2">
                            <textarea
                              value={question.shortAnswer || ''}
                              onChange={(e) => handleQuestionChange(question.id, 'shortAnswer', e.target.value)}
                              placeholder="Enter expected answer here"
                              required
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[60px] resize-vertical"
                            />
                          </td>
                        )}
                        
                        {/* Correct Answer */}
                        <td className="border border-gray-300 px-3 py-2">
                          {questionType === 'short-answer' ? (
                            <input
                              type="text"
                              value={question.shortAnswer || ''}
                              readOnly
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 min-h-[36px]"
                              placeholder="Same as expected answer"
                            />
                          ) : (
                            <select
                              value={question.correctAnswer}
                              onChange={(e) => handleQuestionChange(question.id, 'correctAnswer', e.target.value)}
                              required
                              className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:border-primary-500 min-h-[36px]"
                            >
                              <option value="">Select Answer</option>
                              {question.optionA && (
                                <option value={question.optionA}>A: {question.optionA}</option>
                              )}
                              {question.optionB && (
                                <option value={question.optionB}>B: {question.optionB}</option>
                              )}
                              {question.optionC && questionType !== 'true-false' && (
                                <option value={question.optionC}>C: {question.optionC}</option>
                              )}
                              {question.optionD && questionType !== 'true-false' && (
                                <option value={question.optionD}>D: {question.optionD}</option>
                              )}
                            </select>
                          )}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {formData.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(question.id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
                              title="Remove Question"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Link
              to="/elearning/quizzes"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300 min-h-[44px] flex items-center justify-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
            >
              <i className="fas fa-save mr-2"></i>
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateQuiz;
