import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import studentsService from '../../services/studentsService';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface StudentItem {
  id: string;
  name: string;
  class: string;
  studentId: string;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  student: string;
  courses: string[];
}

const PopulateCourseStudent: React.FC = () => {
  const { toast } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    student: '',
    courses: []
  });

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Record<string, string[]>>({});

  const loadData = useCallback(async () => {
    try {
      const [students, subjects] = await Promise.all([
        studentsService.getAll(),
        setupService.getAllSubjects()
      ]);
      setAllStudents(students);
      
      // Build available courses by class from subjects
      const coursesByClass: Record<string, string[]> = {};
      subjects.forEach((subject: any) => {
        const subjectClasses = subject.classes || [];
        subjectClasses.forEach((className: string) => {
          if (!coursesByClass[className]) {
            coursesByClass[className] = [];
          }
          coursesByClass[className].push(subject.name);
        });
      });
      setAvailableCourses(coursesByClass);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter students by selected class
  const filteredStudents = useMemo<StudentItem[]>(() => {
    if (!formData.class) return [];
    return allStudents
      .filter(s => s.class === formData.class)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        class: s.class,
        studentId: s.studentId || s.id
      }));
  }, [formData.class, allStudents]);

  // Get courses for selected class
  const coursesForClass = useMemo<string[]>(() => {
    return formData.class ? (availableCourses[formData.class] || []) : [];
  }, [formData.class, availableCourses]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
      // Reset student and courses when class changes
      ...(name === 'class' && { student: '', courses: [] })
    });
    if (name === 'class') {
      setSelectedCourses([]);
    }
  };

  const handleCourseToggle = (course: string): void => {
    setSelectedCourses(prev => {
      if (prev.includes(course)) {
        return prev.filter(c => c !== course);
      } else {
        return [...prev, course];
      }
    });
  };

  const handleSelectAll = (): void => {
    if (selectedCourses.length === coursesForClass.length) {
      setSelectedCourses([]);
    } else {
      setSelectedCourses([...coursesForClass]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || !formData.student || selectedCourses.length === 0) {
      toast.showError('Please fill in all required fields and select at least one course.');
      return;
    }
    
    setLoading(true);
    try {
      // Get subject IDs for selected courses
      const subjects = await setupService.getAllSubjects();
      for (const courseName of selectedCourses) {
        const subject = subjects.find((s: any) => s.name === courseName);
        if (subject) {
          await academicService.assignCourseToStudent({
            studentId: formData.student,
            courseId: subject.id,
            courseName: subject.name,
            academicYear: formData.academicYear,
            term: formData.term
          });
        }
      }
      toast.showSuccess('Courses populated successfully for the selected student!');
      handleClear();
    } catch (error: any) {
      console.error('Error populating courses:', error);
      toast.showError(error.message || 'Failed to populate courses');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ academicYear: '', term: '', class: '', student: '', courses: [] });
    setSelectedCourses([]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Populate Course - Student</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Populate Course - Student</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Assign Courses to Student</h2>
          <p className="text-sm text-gray-600">Select academic year, term, class, student, and courses to assign.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            {/* Academic Year */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Student */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                name="student"
                value={formData.student}
                onChange={handleChange}
                required
                disabled={!formData.class}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">{formData.class ? 'Select Student' : 'Select Class First'}</option>
                {filteredStudents.map(student => (
                  <option key={student.id} value={student.id}>{student.id} - {student.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Courses Selection */}
          {formData.class && coursesForClass.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block font-semibold text-gray-900 text-sm">
                  Select Courses <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  {selectedCourses.length === coursesForClass.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border-2 border-gray-200 rounded-md p-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {coursesForClass.map(course => (
                    <label
                      key={course}
                      className="flex items-center p-3 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCourses.includes(course)}
                        onChange={() => handleCourseToggle(course)}
                        className="mr-3 w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{course}</span>
                    </label>
                  ))}
                </div>
              </div>
              {selectedCourses.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {selectedCourses.length} course(s) selected
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              Populate Courses
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default PopulateCourseStudent;

