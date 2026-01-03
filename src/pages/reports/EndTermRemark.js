import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import academicService from '../../services/academicService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const EndTermRemark = () => {
  const { toast } = useModal();
  const [, setLoading] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [formData, setFormData] = useState({
    academicYear: '',
    term: '',
    class: ''
  });

  const [remarks, setRemarks] = useState([]);

  // Sample data
  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  // Predefined remark templates
  const remarkTemplates = [
    'Has shown significant improvement this term.',
    'Maintains excellent academic performance.',
    'Needs to put more effort in studies.',
    'Shows great potential but needs consistency.',
    'Very active and participative in class.',
    'Well-behaved and respectful.',
    'Needs improvement in attendance.',
    'Shows leadership qualities.',
    'Good team player.',
    'Requires more attention to homework.',
  ];

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (!formData.class) return [];
    return allStudents
      .filter(s => s.class === formData.class)
      .map(s => ({
        id: s.id,
        name: `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim(),
        class: s.class
      }));
  }, [formData.class, allStudents]);

  // Initialize remarks when class changes
  React.useEffect(() => {
    if (formData.class && filteredStudents.length > 0) {
      const initialRemarks = filteredStudents.map(student => ({
        studentId: student.id,
        studentName: student.name,
        remark: ''
      }));
      setRemarks(initialRemarks);
    } else {
      setRemarks([]);
    }
  }, [formData.class, filteredStudents]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRemarkChange = (studentId, value) => {
    setRemarks(prev => prev.map(remark => {
      if (remark.studentId === studentId) {
        return { ...remark, remark: value };
      }
      return remark;
    }));
  };

  const handleInsertTemplate = (studentId, template) => {
    setRemarks(prev => prev.map(r => {
      if (r.studentId === studentId) {
        return { ...r, remark: r.remark ? r.remark + ' ' + template : template };
      }
      return r;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.academicYear || !formData.term || !formData.class) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    const incompleteRemarks = remarks.filter(r => !r.remark || r.remark.trim() === '');
    if (incompleteRemarks.length > 0) {
      if (!window.confirm(`Some students do not have remarks. Do you want to proceed with ${remarks.length - incompleteRemarks.length} remarks?`)) {
        return;
      }
    }

    setLoading(true);
    try {
      const remarksData = remarks
        .filter(r => r.remark && r.remark.trim() !== '')
        .map(r => ({
          studentId: r.studentId,
          remark: r.remark,
          academicYear: formData.academicYear,
          term: formData.term,
          class: formData.class
        }));

      await academicService.submitBulkRemarks(remarksData);
      toast.showSuccess('End of term remarks saved successfully!');
      handleClear();
    } catch (error) {
      console.error('Error submitting remarks:', error);
      toast.showError(error.message || 'Failed to save remarks');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({ academicYear: '', term: '', class: '' });
    setRemarks([]);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">End of Term Remark</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">End of Term Remark</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Select Class and Term</h2>
          <p className="text-sm text-gray-600">Select the academic year, term, and class to enter end of term remarks.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
        </div>
      </div>

      {/* Remarks Entry */}
      {remarks.length > 0 && (
        <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
          <div className="mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Enter Remarks</h2>
            <p className="text-sm text-gray-600">Enter end of term remarks for each student.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6 mb-6">
              {remarks.map((item, index) => (
                <div key={item.studentId} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-3">
                    <label className="block mb-1 text-sm font-semibold text-gray-900">
                      {item.studentName} ({item.studentId})
                    </label>
                    <textarea
                      value={item.remark}
                      onChange={(e) => handleRemarkChange(item.studentId, e.target.value)}
                      rows="3"
                      placeholder="Enter end of term remark for this student..."
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
                    />
                  </div>
                  
                  {/* Quick Templates */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-500 mr-2">Quick insert:</span>
                    {remarkTemplates.slice(0, 3).map((template, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleInsertTemplate(item.studentId, template)}
                        className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        {template.length > 30 ? template.substring(0, 30) + '...' : template}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

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
                Save Remarks
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default EndTermRemark;
