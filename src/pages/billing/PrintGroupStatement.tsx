import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';
import { getAccessibleClasses } from '../../utils/classRestriction';

interface StudentItem {
  id: string;
  name: string;
  class: string;
  balance: number;
  status: string;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
  statementType: string;
}

const PrintGroupStatement: React.FC = () => {
  const { toast } = useModal();
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: '',
    statementType: 'all'
  });

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const [classes, setClasses] = useState<string[]>([]);

  const loadClasses = useCallback(async () => {
    try {
      const accessibleClasses = await getAccessibleClasses();
      setClasses(accessibleClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  // Sample students with statements
  const allStudents: StudentItem[] = [
    { id: 'STU001', name: 'John Doe', class: 'Basic 1', balance: 600, status: 'Outstanding' },
    { id: 'STU002', name: 'Jane Smith', class: 'Basic 1', balance: 700, status: 'Outstanding' },
    { id: 'STU003', name: 'Michael Johnson', class: 'Basic 1', balance: 0, status: 'Cleared' },
    { id: 'STU004', name: 'Emily Brown', class: 'Basic 1', balance: 500, status: 'Outstanding' },
    { id: 'STU005', name: 'David Wilson', class: 'Basic 1', balance: 0, status: 'Cleared' },
  ];

  // Filter students by selected class
  const filteredStudents = useMemo<StudentItem[]>(() => {
    if (!formData.class) return [];
    let students = allStudents.filter(s => s.class === formData.class);
    
    if (formData.statementType === 'outstanding') {
      students = students.filter(s => s.balance > 0);
    } else if (formData.statementType === 'cleared') {
      students = students.filter(s => s.balance === 0);
    }
    
    return students;
  }, [formData.class, formData.statementType]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'class' || e.target.name === 'statementType') {
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
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handlePrint = (): void => {
    const studentsToPrint = selectedStudents.length > 0 
      ? filteredStudents.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (studentsToPrint.length === 0) {
      toast.showError('No students selected for printing.');
      return;
    }

    window.print();
  };

  const handlePreview = (): void => {
    const studentsToPreview = selectedStudents.length > 0 
      ? filteredStudents.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (studentsToPreview.length === 0) {
      toast.showError('No students selected for preview.');
      return;
    }

    toast.showSuccess(`Preview would show statements for ${studentsToPreview.length} student(s).`);
  };

  const handleExport = (): void => {
    const studentsToExport = selectedStudents.length > 0 
      ? filteredStudents.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (studentsToExport.length === 0) {
      toast.showError('No students selected for export.');
      return;
    }

    toast.showSuccess(`Exporting statements for ${studentsToExport.length} student(s) to PDF.`);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Print Group Statement</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Print Group Statement</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Select Statements to Print</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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
              Statement Type
            </label>
            <select
              name="statementType"
              value={formData.statementType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All Students</option>
              <option value="outstanding">Outstanding Only</option>
              <option value="cleared">Cleared Only</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
          {filteredStudents.length > 0 ? (
            <>
              <button
                type="button"
                onClick={handlePreview}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
              >
                <i className="fas fa-eye mr-2"></i>Preview
              </button>
              <button
                type="button"
                onClick={handleExport}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
              >
                <i className="fas fa-download mr-2"></i>Export PDF
              </button>
              <button
                type="button"
                onClick={handlePrint}
                disabled={filteredStudents.length === 0}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-print mr-2"></i>Print Statements
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!formData.academicYear || !formData.term || !formData.class) {
                  toast.showError('Please fill in all required fields (Academic Year, Term, and Class).');
                } else if (filteredStudents.length === 0) {
                  toast.showError('No students found matching the selected criteria.');
                } else {
                  handlePrint();
                }
              }}
              disabled={!formData.academicYear || !formData.term || !formData.class}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-search mr-2"></i>Search & Print Statements
            </button>
          )}
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Students ({filteredStudents.length})
            </h2>
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
            >
              {selectedStudents.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase w-12">
                    <input
                      type="checkbox"
                      checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Student Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Balance (GHS)</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map(student => (
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
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{student.balance.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        student.status === 'Cleared' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedStudents.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-primary-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>{selectedStudents.length}</strong> student(s) selected for printing statements
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default PrintGroupStatement;

