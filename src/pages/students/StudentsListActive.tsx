import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  admissionDate?: string;
  password?: string;
  [key: string]: any;
}

const StudentsListActive: React.FC = () => {
  const { showViewModal, toast } = useModal();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const loadStudents = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const activeStudents = await studentsService.getActive();
      setStudents(activeStudents);
    } catch (error) {
      console.error('Error loading active students:', error);
      toast.showError('Failed to load active students');
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

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(student => {
      const fullName = getStudentName(student).toLowerCase();
      const studentId = (student.studentId || student.id || '').toLowerCase();
      return fullName.includes(term) || studentId.includes(term);
    });
  }, [students, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredStudents.slice(start, end);
  }, [filteredStudents, currentPage, entriesPerPage]);

  const handleView = (student: StudentData): void => {
    const fields = [
      { label: 'Student ID', accessor: (s: StudentData) => s.studentId || s.id },
      { label: 'Full Name', accessor: getStudentName },
      { label: 'Class', key: 'class' },
      { label: 'Gender', key: 'gender' },
      { label: 'Email', key: 'email' },
      { label: 'Contact', key: 'contact' },
      { label: 'Admission Date', key: 'admissionDate' }
    ];
    
    showViewModal({
      title: 'Student Details',
      data: student,
      fields
    });
  };

  const handleActionClick = (studentId: string, action: string): void => {
    setOpenActionMenu(null);
    const student = students.find(s => s.id === studentId);
    if (!student) return;

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
      case 'view':
        handleView(student);
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
      { key: 'class', label: 'Class' },
      { key: 'gender', label: 'Gender' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredStudents.map(s => ({
      studentId: s.studentId || s.id,
      name: getStudentName(s),
      class: s.class || 'N/A',
      gender: s.gender || 'N/A',
      status: 'Active'
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
        exportToExcel(exportData, `students-active-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `students-active-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('student-table');
        if (printContent) {
          exportToPDF(printContent, `students-active-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Active Students</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/students/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Students</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Active Students</span>
            </div>
          </div>
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Gender</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading students...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No active students found</div>
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
                              onClick={() => handleActionClick(student.id!, 'view')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-eye text-green-500"></i>
                              View Details
                            </button>
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
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.studentId || student.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{getStudentName(student)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.class || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{student.gender || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    </td>
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

export default StudentsListActive;
