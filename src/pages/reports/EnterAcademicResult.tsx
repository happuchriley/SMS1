import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

interface StudentItem {
  id: string;
  name: string;
  class: string;
}

interface ResultItem {
  studentId: string;
  studentName: string;
  score: string;
  grade: string;
  remark: string;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  subject: string;
  examType: string;
}

const EnterAcademicResult: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    subject: '',
    examType: ''
  });

  const [results, setResults] = useState<ResultItem[]>([]);

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const classes: string[] = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const subjects: string[] = ['English Language', 'Mathematics', 'Science', 'Social Studies', 'Religious Studies'];
  const examTypes: string[] = ['Mid-Term Exam', 'End of Term Exam', 'Continuous Assessment'];

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Filter students by selected class
  const filteredStudents = useMemo<StudentItem[]>(() => {
    if (!formData.class) return [];
    return allStudents
      .filter(s => s.class === formData.class)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        class: s.class
      }));
  }, [formData.class, allStudents]);

  // Initialize results when class, subject, or exam type changes
  useEffect(() => {
    if (formData.class && formData.subject && formData.examType && filteredStudents.length > 0) {
      const initialResults = filteredStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        score: '',
        grade: '',
        remark: ''
      }));
      setResults(initialResults);
    } else {
      setResults([]);
    }
  }, [formData.class, formData.subject, formData.examType, filteredStudents]);

  // Calculate grade from score
  const calculateGrade = (score: string): string => {
    const numScore = parseFloat(score);
    if (isNaN(numScore)) return '';
    if (numScore >= 80) return 'A+';
    if (numScore >= 75) return 'A';
    if (numScore >= 70) return 'B+';
    if (numScore >= 65) return 'B';
    if (numScore >= 60) return 'C+';
    if (numScore >= 55) return 'C';
    if (numScore >= 50) return 'D';
    if (numScore >= 45) return 'E';
    return 'F';
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleResultChange = (studentId: string, field: string, value: string): void => {
    setResults(prev => prev.map(result => {
      if (result.studentId === studentId) {
        const updated = { ...result, [field]: value };
        if (field === 'score') {
          updated.grade = calculateGrade(value);
        }
        return updated;
      }
      return result;
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class || !formData.subject || !formData.examType) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    const incompleteResults = results.filter(r => !r.score || r.score === '');
    if (incompleteResults.length > 0) {
      showDeleteModal({
        title: 'Incomplete Results',
        message: `Some students do not have scores entered. Do you want to proceed with ${results.length - incompleteResults.length} results?`,
        onConfirm: async () => {
          await proceedWithSubmit();
        }
      });
      return;
    }

    await proceedWithSubmit();
  };

  const proceedWithSubmit = async (): Promise<void> => {

    setLoading(true);
    try {
      const resultsData = results
        .filter(r => r.score && r.score !== '')
        .map(r => ({
          studentId: r.studentId,
          subject: formData.subject,
          examType: formData.examType,
          score: parseFloat(r.score),
          grade: r.grade,
          remark: r.remark || '',
          academicYear: formData.academicYear,
          term: formData.term,
          class: formData.class
        }));

      await academicService.submitBulkResults(resultsData);
      toast.showSuccess('Academic results entered successfully!');
      handleClear();
    } catch (error: any) {
      console.error('Error submitting results:', error);
      toast.showError(error.message || 'Failed to submit academic results');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({ academicYear: '', term: '', class: '', subject: '', examType: '' });
    setResults([]);
  };

  const handleBulkFill = (): void => {
    const score = prompt('Enter default score for all students:');
    if (score !== null && score !== '') {
      setResults(prev => prev.map(result => ({
        ...result,
        score: score,
        grade: calculateGrade(score)
      })));
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Enter Academic Result</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Enter Academic Result</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Result Entry Information</h2>
          <p className="text-sm text-gray-600">Select the academic year, term, class, subject, and exam type.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
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

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Exam Type <span className="text-red-500">*</span>
              </label>
              <select
                name="examType"
                value={formData.examType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Exam Type</option>
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </div>

      {/* Results Table */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Enter Scores</h2>
            <button
              type="button"
              onClick={handleBulkFill}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
            >
              <i className="fas fa-fill mr-2"></i>Bulk Fill
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Score (0-100)</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result) => (
                    <tr key={result.studentId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{result.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{result.studentName}</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={result.score}
                          onChange={(e) => handleResultChange(result.studentId, 'score', e.target.value)}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                          required
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{result.grade || '-'}</td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={result.remark}
                          onChange={(e) => handleResultChange(result.studentId, 'remark', e.target.value)}
                          placeholder="Optional"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
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
                Save Results
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default EnterAcademicResult;

