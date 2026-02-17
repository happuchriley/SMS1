import React, { useState, useMemo, useRef, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface ScholarshipItem {
  id: string;
  studentId: string;
  studentName: string;
  class: string;
  type: string;
  amount: number;
  percentage: number;
  startDate: string;
  endDate: string;
  status: string;
}

interface Stats {
  total: number;
  active: number;
  expired: number;
  totalAmount: number;
}

const ScholarshipList: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Sample data
  const scholarships: ScholarshipItem[] = useMemo(() => [
    { id: 'SCH001', studentId: 'STU001', studentName: 'John Doe', class: 'Basic 1', type: 'Academic Excellence', amount: 500, percentage: 50, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 'SCH002', studentId: 'STU002', studentName: 'Jane Smith', class: 'Basic 2', type: 'Need-Based', amount: 300, percentage: 30, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 'SCH003', studentId: 'STU003', studentName: 'Michael Johnson', class: 'Basic 3', type: 'Sports', amount: 200, percentage: 20, startDate: '2024-01-01', endDate: '2024-06-30', status: 'Expired' },
    { id: 'SCH004', studentId: 'STU004', studentName: 'Emily Brown', class: 'Basic 1', type: 'Academic Excellence', amount: 600, percentage: 60, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 'SCH005', studentId: 'STU005', studentName: 'David Wilson', class: 'Basic 2', type: 'Merit', amount: 400, percentage: 40, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
  ], []);

  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

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

  // Filter scholarships
  const filteredScholarships = useMemo<ScholarshipItem[]>(() => {
    return scholarships.filter(sch => {
      const matchesSearch = 
        sch.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = !selectedClass || sch.class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [searchTerm, selectedClass, scholarships]);

  // Pagination
  const totalPages = Math.ceil(filteredScholarships.length / entriesPerPage);
  const paginatedScholarships = useMemo<ScholarshipItem[]>(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredScholarships.slice(start, end);
  }, [filteredScholarships, currentPage, entriesPerPage]);

  // Statistics
  const stats = useMemo<Stats>(() => {
    return {
      total: scholarships.length,
      active: scholarships.filter(s => s.status === 'Active').length,
      expired: scholarships.filter(s => s.status === 'Expired').length,
      totalAmount: scholarships.reduce((sum, s) => sum + s.amount, 0)
    };
  }, [scholarships]);

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedClass('');
    setCurrentPage(1);
  };

  const handleEdit = (scholarship: ScholarshipItem): void => {
    toast.showInfo('Edit functionality will be implemented');
  };

  const handleDelete = (scholarship: ScholarshipItem): void => {
    showDeleteModal({
      title: 'Delete Scholarship',
      message: 'Are you sure you want to delete this scholarship?',
      itemName: `${scholarship.studentName} - ${scholarship.type}`,
      onConfirm: async () => {
        toast.showSuccess('Scholarship deleted successfully');
      }
    });
  };

  const handleActionClick = (scholarshipId: string, action: string): void => {
    setOpenActionMenu(null);
    const scholarship = scholarships.find(s => s.id === scholarshipId);
    if (!scholarship) return;

    switch (action) {
      case 'edit':
        handleEdit(scholarship);
        break;
      case 'delete':
        handleDelete(scholarship);
        break;
      case 'view':
        toast.showInfo(`Viewing scholarship: ${scholarship.id}`);
        break;
      default:
        break;
    }
  };

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filteredScholarships.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'id', label: 'Scholarship ID' },
      { key: 'studentName', label: 'Student Name' },
      { key: 'studentId', label: 'Student ID' },
      { key: 'class', label: 'Class' },
      { key: 'type', label: 'Type' },
      { key: 'amount', label: 'Amount' },
      { key: 'percentage', label: 'Percentage' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredScholarships.map(s => ({
      id: s.id,
      studentName: s.studentName,
      studentId: s.studentId,
      class: s.class,
      type: s.type,
      amount: s.amount,
      percentage: `${s.percentage}%`,
      status: s.status
    }));

    switch (format) {
      case 'copy':
        const text = exportData.map(row => Object.values(row).join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        toast.showSuccess('Data copied to clipboard');
        break;
      case 'excel':
        exportToExcel(exportData, `scholarships-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `scholarships-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('scholarship-table');
        if (printContent) {
          exportToPDF(printContent, `scholarships-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Scholarship List</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/billing" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Billing</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Scholarship List</span>
            </div>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Add Scholarship
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Scholarships</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Active</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Expired</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.expired}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Amount (GHS)</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.totalAmount.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, ID, or scholarship type..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Classes</option>
              {classes.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedClass) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          </div>
        )}
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
        <div id="scholarship-table" className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Scholarship.ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedScholarships.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No scholarships found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedScholarships.map((scholarship, index) => (
                  <tr key={scholarship.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 relative">
                      <div ref={actionMenuRef}>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === scholarship.id ? null : scholarship.id)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <i className="fas fa-cog"></i>
                          <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                        {openActionMenu === scholarship.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                            <button
                              onClick={() => handleActionClick(scholarship.id, 'view')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-eye text-green-500"></i>
                              View Details
                            </button>
                            <button
                              onClick={() => handleActionClick(scholarship.id, 'edit')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-edit text-blue-500"></i>
                              Edit Scholarship
                            </button>
                            <button
                              onClick={() => handleActionClick(scholarship.id, 'delete')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-trash text-red-500"></i>
                              Delete Scholarship
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{scholarship.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{scholarship.studentName}</div>
                        <div className="text-gray-500 text-xs">{scholarship.studentId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{scholarship.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{scholarship.type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{scholarship.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{scholarship.percentage}%</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(scholarship.startDate).toLocaleDateString()} - {new Date(scholarship.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        scholarship.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {scholarship.status}
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
            Showing {filteredScholarships.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredScholarships.length)} of {filteredScholarships.length} entries
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

export default ScholarshipList;
