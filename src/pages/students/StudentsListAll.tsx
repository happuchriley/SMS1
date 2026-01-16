import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface StudentData {
  id?: string;
  studentId?: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  class?: string;
  gender?: string;
  email?: string;
  contact?: string;
  address?: string;
  parent?: string;
  parentName?: string;
  status?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  password?: string;
  image?: string;
  [key: string]: any;
}

const StudentsListAll: React.FC = () => {
  const { toast } = useModal();
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Global search term
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadStudents = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const students = await studentsService.getAll();
      setAllStudents(students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getStudentName = (student: StudentData): string => {
    return `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim() || 'N/A';
  };

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return allStudents;
    const term = searchTerm.toLowerCase();
    return allStudents.filter(student => {
      const studentId = (student.studentId || student.id || '').toLowerCase();
      const name = getStudentName(student).toLowerCase();
      const password = (student.password || '').toLowerCase();
      const gender = (student.gender || '').toLowerCase();
      
      return (
        studentId.includes(term) ||
        name.includes(term) ||
        password.includes(term) ||
        gender.includes(term)
      );
    });
  }, [allStudents, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredStudents.slice(start, end);
  }, [filteredStudents, currentPage, entriesPerPage]);


  const handleActionClick = (studentId: string, action: string): void => {
    setOpenActionMenu(null);
    
    switch (action) {
      case 'view-profile':
        navigate(`/students/${studentId}`);
        break;
      case 'edit-detail':
        navigate(`/students/edit/${studentId}`);
        break;
      case 'view-bill':
        navigate(`/billing/view-bill?student=${studentId}`);
        break;
      case 'view-statement':
        navigate(`/billing/view-statement?student=${studentId}`);
        break;
      case 'view-academic-report':
        navigate(`/reports/student-academic-report?student=${studentId}`);
        break;
      default:
        break;
    }
  };

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filteredStudents.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'studentId', label: 'Student ID' },
      { key: 'name', label: 'Student Name' },
      { key: 'gender', label: 'Gender' },
      { key: 'class', label: 'Class' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredStudents.map(s => ({
      studentId: s.studentId || s.id,
      name: getStudentName(s),
      gender: s.gender || 'N/A',
      class: s.class || 'N/A',
      status: s.status === 'active' ? 'Active' : 'Inactive'
    }));

    switch (format) {
      case 'copy':
        const text = exportData.map(row => 
          Object.values(row).join('\t')
        ).join('\n');
        navigator.clipboard.writeText(text);
        toast.showSuccess('Data copied to clipboard');
        break;
      case 'excel':
        exportToExcel(exportData, `students-all-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `students-all-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('student-table');
        if (printContent) {
          exportToPDF(printContent, `students-all-${new Date().toISOString().split('T')[0]}.pdf`);
          toast.showSuccess('Data exported to PDF');
        }
        break;
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Students</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/students/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Students</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">All Students</span>
            </div>
          </div>
          <Link 
            to="/students/add"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Student</span>
          </Link>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        {/* Table Controls */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700">Show</label>
            <select
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <label className="text-sm text-gray-700">entries</label>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleExport('copy')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Copy"
            >
              Copy
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Excel"
            >
              Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="CSV"
            >
              CSV
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="PDF"
            >
              PDF
            </button>
            <button
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              title="Column visibility"
            >
              Column visibility
            </button>
          </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search..."
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-primary-500 w-48"
              />
            </div>
        </div>

        {/* Table */}
        <div id="student-table" className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Image</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Password</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Class</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading students...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No students found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStudents.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 relative">
                      <div ref={actionMenuRef}>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === student.id ? null : student.id || null)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <i className="fas fa-cog"></i>
                          <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                        {openActionMenu === student.id && student.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                            <button
                              onClick={() => handleActionClick(student.id!, 'view-profile')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-user text-green-500"></i>
                              View Profile
                            </button>
                            <button
                              onClick={() => handleActionClick(student.id!, 'edit-detail')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-edit text-blue-500"></i>
                              Edit Detail
                            </button>
                            <button
                              onClick={() => handleActionClick(student.id!, 'view-bill')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-th text-purple-500"></i>
                              View Bill
                            </button>
                            <button
                              onClick={() => handleActionClick(student.id!, 'view-statement')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-list text-indigo-500"></i>
                              View Statement
                            </button>
                            <button
                              onClick={() => handleActionClick(student.id!, 'view-academic-report')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-file-alt text-orange-500"></i>
                              View Academic Report
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3">
                      {student.image ? (
                        <img src={student.image} alt={getStudentName(student)} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-gray-500"></i>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.studentId || student.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.password || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{getStudentName(student)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.gender || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.class || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {filteredStudents.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredStudents.length)} of {filteredStudents.length} entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentsListAll;
