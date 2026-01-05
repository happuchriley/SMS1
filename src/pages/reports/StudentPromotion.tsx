import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

interface StudentWithScore {
  id: string;
  name: string;
  class: string;
  averageScore: number;
  status: string;
}

interface FormData {
  fromAcademicYear: string;
  toAcademicYear: string;
  fromClass: string;
  toClass: string;
  promotionCriteria: string;
}

const StudentPromotion: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<StudentWithScore[]>([]);
  const [formData, setFormData] = useState<FormData>({
    fromAcademicYear: '',
    toAcademicYear: '',
    fromClass: '',
    toClass: '',
    promotionCriteria: 'all'
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Get next class
  const getNextClass = (currentClass: string): string => {
    const classMap: Record<string, string> = {
      'Nursery 1': 'Nursery 2',
      'Nursery 2': 'Basic 1',
      'Basic 1': 'Basic 2',
      'Basic 2': 'Basic 3',
      'Basic 3': 'Basic 4',
      'Basic 4': 'Basic 5',
      'Basic 5': 'Basic 6',
      'Basic 6': 'JHS 1',
      'JHS 1': 'JHS 2',
      'JHS 2': 'JHS 3',
      'JHS 3': 'Completed'
    };
    return classMap[currentClass] || '';
  };

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      // Calculate average scores from results if available
      const studentsWithScores = await Promise.all(students.map(async (student: any) => {
        try {
          const results = await academicService.getResultsByStudent(student.id);
          const scores = results.map((r: any) => parseFloat(r.score) || 0);
          const averageScore = scores.length > 0 
            ? scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length 
            : 0;
          return {
            ...student,
            name: `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim(),
            averageScore: Math.round(averageScore),
            status: student.status || 'Active'
          };
        } catch (error) {
          return {
            ...student,
            name: `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim(),
            averageScore: 0,
            status: student.status || 'Active'
          };
        }
      }));
      setAllStudents(studentsWithScores);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter students by from class
  const filteredStudents = useMemo<StudentWithScore[]>(() => {
    if (!formData.fromClass) return [];
    return allStudents.filter(s => s.class === formData.fromClass);
  }, [formData.fromClass, allStudents]);

  // Apply promotion criteria
  const eligibleStudents = useMemo<StudentWithScore[]>(() => {
    let eligible = [...filteredStudents];
    
    if (formData.promotionCriteria === 'pass') {
      eligible = eligible.filter(s => s.averageScore >= 50);
    } else if (formData.promotionCriteria === 'excellent') {
      eligible = eligible.filter(s => s.averageScore >= 75);
    }
    
    return eligible;
  }, [filteredStudents, formData.promotionCriteria]);

  // Auto-set to class when from class changes
  useEffect(() => {
    if (formData.fromClass) {
      const nextClass = getNextClass(formData.fromClass);
      setFormData(prev => ({ ...prev, toClass: nextClass }));
    }
  }, [formData.fromClass]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'fromClass') {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId: string): void => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = (): void => {
    if (selectedStudents.length === eligibleStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(eligibleStudents.map(s => s.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.fromAcademicYear || !formData.toAcademicYear || !formData.fromClass || !formData.toClass) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    if (selectedStudents.length === 0) {
      toast.showError('Please select at least one student to promote.');
      return;
    }

    if (formData.toClass === 'Completed') {
      showDeleteModal({
        title: 'Confirm Completion',
        message: 'This class represents completion. Are you sure you want to proceed?',
        onConfirm: async () => {
          await proceedWithPromotion();
        }
      });
      return;
    }

    await proceedWithPromotion();
  };

  const proceedWithPromotion = async (): Promise<void> => {

    setLoading(true);
    try {
      await academicService.promoteStudents({
        fromAcademicYear: formData.fromAcademicYear,
        toAcademicYear: formData.toAcademicYear,
        fromClass: formData.fromClass,
        toClass: formData.toClass,
        studentIds: selectedStudents,
        promotionCriteria: formData.promotionCriteria
      });

      // Update student classes
      for (const studentId of selectedStudents) {
        await studentsService.update(studentId, { class: formData.toClass });
      }

      toast.showSuccess(`${selectedStudents.length} student(s) promoted successfully from ${formData.fromClass} to ${formData.toClass}!`);
      handleClear();
    } catch (error: any) {
      console.error('Error promoting students:', error);
      toast.showError(error.message || 'Failed to promote students');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ fromAcademicYear: '', toAcademicYear: '', fromClass: '', toClass: '', promotionCriteria: 'all' });
    setSelectedStudents([]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Student Promotion</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Student Promotion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Promotion Information</h2>
          <p className="text-sm text-gray-600">Select the academic years and classes for student promotion.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                From Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="fromAcademicYear"
                value={formData.fromAcademicYear}
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

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                To Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="toAcademicYear"
                value={formData.toAcademicYear}
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

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                From Class <span className="text-red-500">*</span>
              </label>
              <select
                name="fromClass"
                value={formData.fromClass}
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

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                To Class <span className="text-red-500">*</span>
              </label>
              <select
                name="toClass"
                value={formData.toClass}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Promotion Criteria
              </label>
              <select
                name="promotionCriteria"
                value={formData.promotionCriteria}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="all">All Students</option>
                <option value="pass">Passed (Score ≥ 50)</option>
                <option value="excellent">Excellent (Score ≥ 75)</option>
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Students List */}
      {eligibleStudents.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Eligible Students ({eligibleStudents.length})
            </h2>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
            >
              {selectedStudents.length === eligibleStudents.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto mb-6">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-12">
                      <input
                        type="checkbox"
                        checked={selectedStudents.length === eligibleStudents.length && eligibleStudents.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Current Class</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Average Score</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {eligibleStudents.map(student => (
                    <tr key={student.id} className={selectedStudents.includes(student.id) ? 'bg-primary-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.class}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.averageScore}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedStudents.length > 0 && (
              <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <strong>{selectedStudents.length}</strong> student(s) selected for promotion from <strong>{formData.fromClass}</strong> to <strong>{formData.toClass}</strong>
                </p>
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
                disabled={selectedStudents.length === 0}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-arrow-up mr-2"></i>
                Promote Students
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default StudentPromotion;

