import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface StaffData {
  id?: string;
  staffId?: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  position?: string;
  department?: string;
  employmentDate?: string;
  password?: string;
  [key: string]: any;
}

const StaffListNew: React.FC = () => {
  const { showViewModal, showEditModal, showDeleteModal, toast } = useModal();
  const navigate = useNavigate();
  const [staff, setStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const loadStaff = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const newStaff = await staffService.getNew();
      setStaff(newStaff);
    } catch (error) {
      console.error('Error loading new staff:', error);
      toast.showError('Failed to load new staff');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

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

  const getStaffName = (s: StaffData): string => `${s.firstName || ''} ${s.surname || ''} ${s.otherNames || ''}`.trim() || 'N/A';

  const filtered = useMemo(() => {
    if (!searchTerm) return staff;
    const term = searchTerm.toLowerCase();
    return staff.filter(s => getStaffName(s).toLowerCase().includes(term) || (s.staffId || s.id || '').toLowerCase().includes(term));
  }, [staff, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / entriesPerPage);
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filtered.slice(start, end);
  }, [filtered, currentPage, entriesPerPage]);

  const handleView = (s: StaffData): void => {
    const fields = [
      { label: 'Staff ID', key: 'staffId', accessor: (staff: StaffData) => staff.staffId || staff.id },
      { label: 'Full Name', accessor: getStaffName },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Employment Date', key: 'employmentDate' },
      { label: 'Password', key: 'password' }
    ];
    showViewModal({ title: 'Staff Details', data: s, fields });
  };

  const handleEdit = (s: StaffData): void => {
    showEditModal({
      title: 'Edit Staff',
      data: s,
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'surname', label: 'Surname', type: 'text', required: true },
        { name: 'position', label: 'Position', type: 'text' },
        { name: 'department', label: 'Department', type: 'text' }
      ],
      onSave: async (data: Partial<StaffData>) => {
        try {
          await staffService.update(s.id!, data);
          toast.showSuccess('Staff updated successfully');
          await loadStaff();
        } catch (error: any) {
          toast.showError(error.message || 'Failed to update staff');
          throw error;
        }
      }
    });
  };

  const handleDelete = (s: StaffData): void => {
    showDeleteModal({
      title: 'Delete Staff',
      message: 'Are you sure you want to delete this staff member?',
      itemName: getStaffName(s),
      onConfirm: async () => {
        try {
          await staffService.delete(s.id!);
          toast.showSuccess('Staff deleted successfully');
          await loadStaff();
        } catch (error: any) {
          toast.showError(error.message || 'Failed to delete staff');
        }
      }
    });
  };

  const handleActionClick = (staffId: string, action: string): void => {
    setOpenActionMenu(null);
    const s = staff.find(st => st.id === staffId);
    if (!s) return;

    switch (action) {
      case 'view':
        handleView(s);
        break;
      case 'edit':
        handleEdit(s);
        break;
      case 'delete':
        handleDelete(s);
        break;
      case 'view-profile':
        navigate(`/profile`);
        break;
      default:
        break;
    }
  };

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filtered.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'staffId', label: 'Staff ID' },
      { key: 'name', label: 'Name' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'employmentDate', label: 'Employment Date' }
    ];

    const exportData = filtered.map(s => ({
      staffId: s.staffId || s.id,
      name: getStaffName(s),
      position: s.position || 'N/A',
      department: s.department || 'N/A',
      employmentDate: s.employmentDate || 'N/A'
    }));

    switch (format) {
      case 'copy':
        const text = exportData.map(row => Object.values(row).join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        toast.showSuccess('Data copied to clipboard');
        break;
      case 'excel':
        exportToExcel(exportData, `staff-new-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `staff-new-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('staff-table');
        if (printContent) {
          exportToPDF(printContent, `staff-new-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">New Staff</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/staff/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Staff</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">New Staff</span>
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
        <div id="staff-table" className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Staff.ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Position</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Employment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading staff...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No new staff found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((s, index) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 relative">
                      <div ref={actionMenuRef}>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === s.id ? null : s.id || null)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <i className="fas fa-cog"></i>
                          <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                        {openActionMenu === s.id && s.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                            <button
                              onClick={() => handleActionClick(s.id!, 'view')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-eye text-green-500"></i>
                              View Details
                            </button>
                            <button
                              onClick={() => handleActionClick(s.id!, 'edit')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-edit text-blue-500"></i>
                              Edit Staff
                            </button>
                            <button
                              onClick={() => handleActionClick(s.id!, 'view-profile')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-user text-purple-500"></i>
                              View Profile
                            </button>
                            <button
                              onClick={() => handleActionClick(s.id!, 'delete')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-trash text-red-500"></i>
                              Delete Staff
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{s.staffId || s.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{getStaffName(s)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.position || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{s.employmentDate || 'N/A'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filtered.length)} of {filtered.length} entries
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

export default StaffListNew;
