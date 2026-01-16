import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
  email?: string;
  contact?: string;
  gender?: string;
  status?: string;
  employmentDate?: string;
  password?: string;
  [key: string]: any;
}

interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  filtered: number;
}

const StaffListAll: React.FC = () => {
  const { showViewModal, showEditModal, showDeleteModal, toast } = useModal();
  const navigate = useNavigate();
  const [allStaff, setAllStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const loadStaff = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const staff = await staffService.getAll();
      setAllStaff(staff);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.showError('Failed to load staff');
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

  const getStaffName = (staff: StaffData): string => {
    return `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim() || 'N/A';
  };

  const uniqueDepartments = useMemo(() => {
    const departmentSet = new Set<string>();
    allStaff.forEach(s => {
      if (s.department && typeof s.department === 'string') {
        departmentSet.add(s.department);
      }
    });
    return Array.from(departmentSet).sort();
  }, [allStaff]);

  const filteredStaff = useMemo(() => {
    return allStaff.filter(staff => {
      const fullName = getStaffName(staff).toLowerCase();
      const staffId = (staff.staffId || staff.id || '').toLowerCase();
      const position = (staff.position || '').toLowerCase();
      
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        staffId.includes(searchTerm.toLowerCase()) ||
        position.includes(searchTerm.toLowerCase()) ||
        (staff.email && staff.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = !selectedDepartment || staff.department === selectedDepartment;
      const statusDisplay = staff.status === 'active' ? 'Active' : 'Inactive';
      const matchesStatus = !selectedStatus || statusDisplay === selectedStatus;
      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [searchTerm, selectedDepartment, selectedStatus, allStaff]);

  // Pagination
  const totalPages = Math.ceil(filteredStaff.length / entriesPerPage);
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredStaff.slice(start, end);
  }, [filteredStaff, currentPage, entriesPerPage]);

  const stats = useMemo<StaffStats>(() => {
    return {
      total: allStaff.length,
      active: allStaff.filter(s => s.status === 'active').length,
      inactive: allStaff.filter(s => s.status === 'inactive').length,
      filtered: filteredStaff.length,
    };
  }, [allStaff, filteredStaff]);

  const handleView = (staff: StaffData): void => {
    const fields = [
      { label: 'Staff ID', key: 'staffId', accessor: (s: StaffData) => s.staffId || s.id },
      { label: 'Full Name', accessor: getStaffName },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Gender', key: 'gender' },
      { label: 'Email', key: 'email' },
      { label: 'Contact', key: 'contact' },
      { label: 'Password', key: 'password' },
      { label: 'Status', key: 'status', format: (val: string) => val === 'active' ? 'Active' : 'Inactive' },
      { label: 'Employment Date', key: 'employmentDate' }
    ];
    
    showViewModal({
      title: 'Staff Details',
      data: staff,
      fields
    });
  };

  const handleEdit = (staff: StaffData): void => {
    showEditModal({
      title: 'Edit Staff',
      data: staff,
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'surname', label: 'Surname', type: 'text', required: true },
        { name: 'otherNames', label: 'Other Names', type: 'text' },
        { name: 'position', label: 'Position', type: 'text' },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'contact', label: 'Contact', type: 'text' }
      ],
      onSave: async (data: Partial<StaffData>) => {
        try {
          await staffService.update(staff.id!, data);
          toast.showSuccess('Staff updated successfully');
          await loadStaff();
        } catch (error: any) {
          toast.showError(error.message || 'Failed to update staff');
          throw error;
        }
      }
    });
  };

  const handleDelete = (staff: StaffData): void => {
    showDeleteModal({
      title: 'Delete Staff',
      message: 'Are you sure you want to delete this staff member? This action cannot be undone.',
      itemName: getStaffName(staff),
      onConfirm: async () => {
        try {
          await staffService.delete(staff.id!);
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
    const staff = allStaff.find(s => s.id === staffId);
    if (!staff) return;

    switch (action) {
      case 'view':
        handleView(staff);
        break;
      case 'edit':
        handleEdit(staff);
        break;
      case 'delete':
        handleDelete(staff);
        break;
      case 'view-profile':
        navigate(`/profile`);
        break;
      default:
        break;
    }
  };

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filteredStaff.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'staffId', label: 'Staff ID' },
      { key: 'name', label: 'Name' },
      { key: 'position', label: 'Position' },
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status' }
    ];

    const exportData = filteredStaff.map(s => ({
      staffId: s.staffId || s.id,
      name: getStaffName(s),
      position: s.position || 'N/A',
      department: s.department || 'N/A',
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
        exportToExcel(exportData, `staff-all-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `staff-all-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('staff-table');
        if (printContent) {
          exportToPDF(printContent, `staff-all-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Staff</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/staff/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Staff</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">All Staff</span>
            </div>
          </div>
          <Link 
            to="/staff/add"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Staff</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1">Total Staff</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1">Inactive</div>
            <div className="text-2xl font-bold text-gray-900">{stats.inactive}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1">Showing</div>
            <div className="text-2xl font-bold text-gray-900">{stats.filtered}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
          />
          <select
            value={selectedDepartment}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
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
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Department</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Password</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading staff...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedStaff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No staff found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((staff, index) => (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 relative">
                      <div ref={actionMenuRef}>
                        <button
                          onClick={() => setOpenActionMenu(openActionMenu === staff.id ? null : staff.id || null)}
                          className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                        >
                          <i className="fas fa-cog"></i>
                          <i className="fas fa-chevron-right text-xs"></i>
                        </button>
                        {openActionMenu === staff.id && staff.id && (
                          <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                            <button
                              onClick={() => handleActionClick(staff.id!, 'view')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-eye text-green-500"></i>
                              View Details
                            </button>
                            <button
                              onClick={() => handleActionClick(staff.id!, 'edit')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-edit text-blue-500"></i>
                              Edit Staff
                            </button>
                            <button
                              onClick={() => handleActionClick(staff.id!, 'view-profile')}
                              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              <i className="fas fa-user text-purple-500"></i>
                              View Profile
                            </button>
                            <button
                              onClick={() => handleActionClick(staff.id!, 'delete')}
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
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{staff.staffId || staff.id}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{getStaffName(staff)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{staff.position || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{staff.department || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{staff.password || 'N/A'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        staff.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.status === 'active' ? 'Active' : 'Inactive'}
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
            Showing {filteredStaff.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredStaff.length)} of {filteredStaff.length} entries
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

export default StaffListAll;
