import React, { useState, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { printPage, exportToCSV } from '../../utils/printExport';

const PrintGroupReport = () => {
  const printRef = useRef(null);
  const [formData, setFormData] = useState({
    academicYear: '',
    term: '',
    class: '',
    reportType: 'all'
  });

  const [selectedStudents, setSelectedStudents] = useState([]);

  // Sample data
  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const classes = ['Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const reportTypes = [
    { value: 'all', label: 'All Students' },
    { value: 'passed', label: 'Passed Students Only' },
    { value: 'failed', label: 'Failed Students Only' },
    { value: 'excellent', label: 'Excellent (A & B grades only)' },
  ];

  // Sample students
  const allStudents = [
    { id: 'STU001', name: 'John Doe', class: 'Basic 1', averageScore: 85, status: 'Active' },
    { id: 'STU002', name: 'Jane Smith', class: 'Basic 1', averageScore: 78, status: 'Active' },
    { id: 'STU003', name: 'Michael Johnson', class: 'Basic 1', averageScore: 45, status: 'Active' },
    { id: 'STU004', name: 'Emily Brown', class: 'Basic 1', averageScore: 92, status: 'Active' },
    { id: 'STU005', name: 'David Wilson', class: 'Basic 1', averageScore: 55, status: 'Active' },
  ];

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (!formData.class) return [];
    let students = allStudents.filter(s => s.class === formData.class);
    
    // Apply report type filter
    if (formData.reportType === 'passed') {
      students = students.filter(s => s.averageScore >= 50);
    } else if (formData.reportType === 'failed') {
      students = students.filter(s => s.averageScore < 50);
    } else if (formData.reportType === 'excellent') {
      students = students.filter(s => s.averageScore >= 75);
    }
    
    return students;
  }, [formData.class, formData.reportType, allStudents]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'class' || e.target.name === 'reportType') {
      setSelectedStudents([]);
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const handlePrint = () => {
    const studentsToPrint = selectedStudents.length > 0 
      ? filteredStudents.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (studentsToPrint.length === 0) {
      alert('No students selected for printing.');
      return;
    }

    const element = printRef.current;
    if (element) {
      printPage(element, {
        title: `Group Report - ${formData.class || 'All Classes'}`,
        styles: `
          .report-header { text-align: center; margin-bottom: 20px; }
          .report-title { font-size: 18pt; font-weight: bold; margin-bottom: 10px; }
          .report-info { font-size: 12pt; color: #666; }
        `
      });
    } else {
      window.print();
    }
  };

  const handlePreview = () => {
    const studentsToPreview = selectedStudents.length > 0 
      ? filteredStudents.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (studentsToPreview.length === 0) {
      alert('No students selected for preview.');
      return;
    }

    // Open in new window for preview
    const element = printRef.current;
    if (element) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Preview - Group Report</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              ${element.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  const handleExport = () => {
    const studentsToExport = selectedStudents.length > 0 
      ? filteredStudents.filter(s => selectedStudents.includes(s.id))
      : filteredStudents;

    if (studentsToExport.length === 0) {
      alert('No students selected for export.');
      return;
    }

    // Export to CSV
    const columns = [
      { key: 'name', label: 'Student Name' },
      { key: 'class', label: 'Class' },
      { key: 'averageScore', label: 'Average Score' },
      { key: 'status', label: 'Status' }
    ];
    
    exportToCSV(studentsToExport, `group-report-${formData.class || 'all'}-${new Date().toISOString().split('T')[0]}.csv`, columns);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Print Group Report</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/reports" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Reports & Assessment</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Print Group Report</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Select Reports to Print</h2>
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
              Report Type
            </label>
            <select
              name="reportType"
              value={formData.reportType}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        {filteredStudents.length > 0 && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 mt-6 border-t border-gray-200">
            <button
              onClick={handlePreview}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
            >
              <i className="fas fa-eye mr-2"></i>Preview
            </button>
            <button
              onClick={handleExport}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300"
            >
              <i className="fas fa-download mr-2"></i>Export PDF
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-print mr-2"></i>Print Reports
            </button>
          </div>
        )}
      </div>

      {/* Students List */}
      {filteredStudents.length > 0 && (
        <div ref={printRef} className="bg-white rounded-lg shadow-md border border-gray-200 print-content">
          <div className="report-header p-4 border-b border-gray-200">
            <div className="report-title">Group Report</div>
            <div className="report-info">
              {formData.academicYear && `Academic Year: ${formData.academicYear}`}
              {formData.term && ` | Term: ${formData.term}`}
              {formData.class && ` | Class: ${formData.class}`}
            </div>
          </div>
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Students ({filteredStudents.length})
            </h2>
            <button
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Average Score</th>
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
                    <td className="px-4 py-3 text-sm text-gray-900">{student.averageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {selectedStudents.length > 0 && (
            <div className="px-4 sm:px-6 py-3 bg-primary-50 border-t border-gray-200">
              <p className="text-sm text-gray-700">
                <strong>{selectedStudents.length}</strong> student(s) selected for printing
              </p>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
};

export default PrintGroupReport;
