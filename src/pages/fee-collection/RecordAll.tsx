import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import billingService from '../../services/billingService';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';
import { getAccessibleClasses, filterStudentsByAccessibleClasses } from '../../utils/classRestriction';

interface StudentTableItem {
  id: string;
  studentId: string;
  name: string;
  gender: string;
  class: string;
  image?: string;
  bill: number;
  payment: number;
  balance: number;
  status: string;
}

interface FormData {
  academicYear: string;
  term: string;
  class: string;
}

const RecordAll: React.FC = () => {
  const { toast } = useModal();
  const navigate = useNavigate();
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState<FormData>({
    academicYear: '',
    term: '',
    class: ''
  });

  const [studentData, setStudentData] = useState<StudentTableItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Sample data
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const [classes, setClasses] = useState<string[]>([]);

  const loadStudents = useCallback(async () => {
    try {
      const students = await studentsService.getAll();
      // Filter students by accessible classes
      const filteredStudents = await filterStudentsByAccessibleClasses(students);
      setAllStudents(filteredStudents);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.showError('Failed to load students');
    }
  }, [toast]);

  const loadClasses = useCallback(async () => {
    try {
      const accessibleClasses = await getAccessibleClasses();
      setClasses(accessibleClasses);
    } catch (error) {
      console.error('Error loading classes:', error);
      toast.showError('Failed to load classes');
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Load student billing data
  useEffect(() => {
    const loadStudentBillingData = async () => {
      if (!formData.class || !formData.academicYear || !formData.term) {
        setStudentData([]);
        return;
      }

      try {
        const filteredStudents = allStudents.filter(s => s.class === formData.class);
        const data = await Promise.all(
          filteredStudents.map(async (student) => {
            try {
              const bills = await billingService.getBillsByStudent(student.id);
              const filteredBills = bills.filter((b: any) => 
                b.academicYear === formData.academicYear && b.term === formData.term
              );

              let totalBill = 0;
              let totalPaid = 0;

              for (const bill of filteredBills) {
                totalBill += parseFloat(String(bill.total || 0));
                const paid = await billingService.getTotalPaidForBill(bill.id);
                totalPaid += paid;
              }

              const balance = totalBill - totalPaid;

              return {
                id: student.id,
                studentId: student.studentId || student.id,
                name: `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim(),
                gender: student.gender || 'N/A',
                class: student.class,
                image: student.profileImage,
                bill: totalBill,
                payment: totalPaid,
                balance: Math.max(0, balance),
                status: balance > 0 ? 'Outstanding' : 'Cleared'
              };
            } catch (error) {
              console.error(`Error loading data for student ${student.id}:`, error);
              return {
                id: student.id,
                studentId: student.studentId || student.id,
                name: `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim(),
                gender: student.gender || 'N/A',
                class: student.class,
                image: student.profileImage,
                bill: 0,
                payment: 0,
                balance: 0,
                status: 'Active'
              };
            }
          })
        );
        setStudentData(data);
      } catch (error) {
        console.error('Error loading student billing data:', error);
        toast.showError('Failed to load student billing data');
      }
    };

    loadStudentBillingData();
  }, [formData, allStudents, toast]);

  // Filter students by search term
  const filteredStudents = useMemo(() => {
    if (!searchTerm) return studentData;
    const term = searchTerm.toLowerCase();
    return studentData.filter(s =>
      s.studentId.toLowerCase().includes(term) ||
      s.name.toLowerCase().includes(term) ||
      s.class.toLowerCase().includes(term)
    );
  }, [studentData, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / entriesPerPage);
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredStudents.slice(start, end);
  }, [filteredStudents, currentPage, entriesPerPage]);

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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setCurrentPage(1);
  };

  const handleActionClick = (studentId: string, action: string): void => {
    setOpenActionMenu(null);
    
    switch (action) {
      case 'record-receipt':
        navigate(`/fee-collection/record-all?student=${studentId}&year=${formData.academicYear}&term=${formData.term}`);
        break;
      case 'create-bill':
        navigate(`/billing/create-single?student=${studentId}`);
        break;
      case 'view-profile':
        navigate(`/students/${studentId}`);
        break;
      case 'view-bill':
        navigate(`/billing/view-bill?student=${studentId}`);
        break;
      case 'view-statement':
        navigate(`/billing/view-statement?student=${studentId}`);
        break;
      case 'edit-bill':
        navigate(`/billing/edit-bill?student=${studentId}`);
        break;
      case 'edit-payment':
        navigate(`/fee-collection/edit-payment?student=${studentId}`);
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
      { key: 'bill', label: 'Bill' },
      { key: 'payment', label: 'Payment' },
      { key: 'balance', label: 'Balance' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredStudents.map(s => ({
      studentId: s.studentId,
      name: s.name,
      gender: s.gender,
      class: s.class,
      bill: s.bill.toFixed(2),
      payment: s.payment.toFixed(2),
      balance: s.balance.toFixed(2),
      status: s.status
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
        exportToExcel(exportData, `fee-receipt-group-${formData.class || 'all'}-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `fee-receipt-group-${formData.class || 'all'}-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('student-table');
        if (printContent) {
          exportToPDF(printContent, `fee-receipt-group-${formData.class || 'all'}-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Select a student for fee receipt</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Select Student</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Term <span className="text-red-500">*</span>
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">
              Class <span className="text-red-500">*</span>
            </label>
            <div className="relative select-dropdown-wrapper">
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
              <div className="select-dropdown-arrow">
                <div className="select-dropdown-arrow-icon">
                  <i className="fas fa-chevron-down"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      {formData.academicYear && formData.term && formData.class && (
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student.Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Bill</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      No students found
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map((student, index) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 relative">
                        <div ref={actionMenuRef}>
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === student.id ? null : student.id)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <i className="fas fa-cog"></i>
                            <i className="fas fa-chevron-right text-xs"></i>
                          </button>
                          {openActionMenu === student.id && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                              <button
                                onClick={() => handleActionClick(student.id, 'record-receipt')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-file-invoice text-blue-500"></i>
                                Record Fee Receipt
                              </button>
                              <button
                                onClick={() => handleActionClick(student.id, 'create-bill')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-coins text-yellow-500"></i>
                                Create Bill
                              </button>
                              <button
                                onClick={() => handleActionClick(student.id, 'view-profile')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-user text-green-500"></i>
                                View Profile
                              </button>
                              <button
                                onClick={() => handleActionClick(student.id, 'view-bill')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-th text-purple-500"></i>
                                View Bill
                              </button>
                              <button
                                onClick={() => handleActionClick(student.id, 'view-statement')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-list text-indigo-500"></i>
                                View Statement
                              </button>
                              <button
                                onClick={() => handleActionClick(student.id, 'edit-bill')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-credit-card text-red-500"></i>
                                Edit/Del Bill
                              </button>
                              <button
                                onClick={() => handleActionClick(student.id, 'edit-payment')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-money-bill-wave text-green-600"></i>
                                Edit/Del Payment
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3">
                        {student.image ? (
                          <img src={student.image} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-gray-500"></i>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.studentId}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.gender}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.class}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.bill.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{student.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Cleared' ? 'bg-green-100 text-green-800' :
                          student.status === 'Outstanding' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {student.status}
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
      )}
    </Layout>
  );
};

export default RecordAll;
