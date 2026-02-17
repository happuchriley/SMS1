import React, { useState, useEffect, useCallback, FormEvent, ChangeEvent } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';
import { getAccessibleClasses } from '../../utils/classRestriction';

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  courses: string[];
}

interface Subject {
  id: string;
  name: string;
  code?: string;
}

const PopulateCourseClass: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    courses: []
  });
  const [showAddCourseModal, setShowAddCourseModal] = useState<boolean>(false);
  const [newCourseData, setNewCourseData] = useState({ name: '', code: '' });
  const [isCreatingCourse, setIsCreatingCourse] = useState<boolean>(false);
  
  // Check if user is administrator or staff (teacher)
  const userType = sessionStorage.getItem('userType') || '';
  const canCreateCourse = userType === 'administrator' || userType === 'staff';

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const [classes, setClasses] = useState<string[]>([]);

  const loadClasses = useCallback(async () => {
    try {
      const accessibleClasses = await getAccessibleClasses();
      setClasses(accessibleClasses);
    } catch (error) {
      // Error loading classes
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);
  const defaultCourses: string[] = [
    'English Language', 
    'Mathematics', 
    'Science', 
    'Social Studies', 
    'Religious Studies', 
    'French', 
    'Ghanaian Language', 
    'ICT',
    'Creative Arts', 
    'Physical Education', 
    'RME', 
    'Home Economics',
    'Agricultural Science', 
    'Basic Design & Technology'
  ];

  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const loadCourses = useCallback(async () => {
    try {
      const subjects = await setupService.getAllSubjects() as Subject[];
      setAvailableCourses(subjects.map(s => s.name));
    } catch (error) {
      console.error('Error loading courses:', error);
      // Fallback to default courses
      setAvailableCourses(defaultCourses);
    }
  }, [defaultCourses]);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCourseToggle = (course: string) => {
    setSelectedCourses(prev => {
      if (prev.includes(course)) {
        return prev.filter(c => c !== course);
      } else {
        return [...prev, course];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCourses.length === availableCourses.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses([...availableCourses]);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || selectedCourses.length === 0) {
      toast.showError('Please fill in all required fields and select at least one course.');
      return;
    }
    
    setLoading(true);
    try {
      // Get subject IDs for selected courses
      const subjects = await setupService.getAllSubjects() as Subject[];
      for (const courseName of selectedCourses) {
        const subject = subjects.find(s => s.name === courseName);
        if (subject) {
          await academicService.assignCourseToClass({
            className: formData.class,
            courseId: subject.id,
            courseName: subject.name,
            academicYear: formData.academicYear,
            term: formData.term
          });
        }
      }
      toast.showSuccess('Courses populated successfully for the selected class!');
      setFormData({ academicYear: '', term: '', class: '', courses: [] });
      setSelectedCourses([]);
    } catch (error) {
      console.error('Error populating courses:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to populate courses';
      toast.showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ academicYear: '', term: '', class: '', courses: [] });
    setSelectedCourses([]);
  };

  const handleAddCourse = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCourseData.name || !newCourseData.code) {
      toast.showError('Course name and code are required.');
      return;
    }

    setIsCreatingCourse(true);
    try {
      await setupService.createSubject({
        name: newCourseData.name,
        code: newCourseData.code
      });
      toast.showSuccess('Course created successfully!');
      setShowAddCourseModal(false);
      setNewCourseData({ name: '', code: '' });
      // Reload courses to include the new one
      await loadCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create course';
      toast.showError(errorMessage);
    } finally {
      setIsCreatingCourse(false);
    }
  };

  // Use availableCourses instead of allCourses for display
  const displayCourses = availableCourses.length > 0 ? availableCourses : defaultCourses;

  return (
    <Layout>
      <div className="mb-4 sm:mb-5 md:mb-6 lg:mb-8">
        <div className="flex flex-col gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Populate Course - Class
            </h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link 
                to="/" 
                className="text-gray-600 no-underline hover:text-primary-500 transition-colors"
              >
                Home
              </Link>
              <span>/</span>
              <Link 
                to="/reports" 
                className="text-gray-600 no-underline hover:text-primary-500 transition-colors"
              >
                Reports & Assessment
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Populate Course - Class</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 lg:p-8 shadow-md border border-gray-200">
        <div className="mb-4 sm:mb-5 md:mb-6">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Assign Courses to Class
          </h2>
          <p className="text-xs sm:text-sm text-gray-600">
            Select academic year, term, class, and courses to assign.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5 md:mb-6">
            {/* Academic Year */}
            <div>
              <label 
                htmlFor="academicYear"
                className="block mb-2 font-semibold text-gray-900 text-xs sm:text-sm"
              >
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-gray-200 rounded-md text-xs sm:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label 
                htmlFor="term"
                className="block mb-2 font-semibold text-gray-900 text-xs sm:text-sm"
              >
                Term <span className="text-red-500">*</span>
              </label>
              <select
                id="term"
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-gray-200 rounded-md text-xs sm:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label 
                htmlFor="class"
                className="block mb-2 font-semibold text-gray-900 text-xs sm:text-sm"
              >
                Class <span className="text-red-500">*</span>
              </label>
              <select
                id="class"
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 sm:px-4 sm:py-2.5 border-2 border-gray-200 rounded-md text-xs sm:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Courses Selection */}
          <div className="mb-4 sm:mb-5 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <label 
                htmlFor="courses"
                className="block font-semibold text-gray-900 text-xs sm:text-sm"
              >
                Select Courses <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {canCreateCourse && (
                  <button
                    type="button"
                    onClick={() => setShowAddCourseModal(true)}
                    className="text-xs sm:text-sm text-white bg-primary-500 hover:bg-primary-600 font-medium transition-colors px-3 py-1.5 rounded-md flex items-center gap-1.5"
                  >
                    <i className="fas fa-plus"></i>
                    <span>Add Course</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs sm:text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                >
                  {selectedCourses.length === displayCourses.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>
            <div className="border-2 border-gray-200 rounded-md p-3 sm:p-4 max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-3">
                {displayCourses.map(course => (
                  <label
                    key={course}
                    htmlFor={`course-${course}`}
                    className="flex items-center p-2 sm:p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      id={`course-${course}`}
                      type="checkbox"
                      checked={selectedCourses.includes(course)}
                      onChange={() => handleCourseToggle(course)}
                      className="mr-2 sm:mr-3 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-xs sm:text-sm text-gray-700 break-words">{course}</span>
                  </label>
                ))}
              </div>
            </div>
            {selectedCourses.length > 0 && (
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                {selectedCourses.length} course{selectedCourses.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-save"></i>
              <span>{loading ? 'Populating...' : 'Populate Courses'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Add Course Modal */}
      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Add New Course</h2>
                <button
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setNewCourseData({ name: '', code: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  type="button"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleAddCourse} className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCourseData.name}
                    onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })}
                    placeholder="e.g., English Language"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Course Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newCourseData.code}
                    onChange={(e) => setNewCourseData({ ...newCourseData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., ENG"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCourseModal(false);
                      setNewCourseData({ name: '', code: '' });
                    }}
                    disabled={isCreatingCourse}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingCourse}
                    className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-plus"></i>
                    <span>{isCreatingCourse ? 'Creating...' : 'Create Course'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PopulateCourseClass;

