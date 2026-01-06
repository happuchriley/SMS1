import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';

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
  [key: string]: any;
}

interface StaffStats {
  total: number;
  active: number;
  inactive: number;
  filtered: number;
}

const StaffListAll: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [allStaff, setAllStaff] = useState<StaffData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { showViewModal, showEditModal, showDeleteModal, toast } = useModal();

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

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStaff = filteredStaff.slice(startIndex, endIndex);

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

  return (
    <Layout>
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Staff</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span>Staff</span>
              <span>/</span>
              <span>All Staff</span>
            </div>
          </div>
          <Link 
            to="/staff/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Staff</span>
          </Link>
        </div>

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

      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
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

      <div className="card-modern overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern w-full">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Name</th>
                <th>Position</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 bg-white">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-5xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading staff...</div>
                    </div>
                  </td>
                </tr>
              ) : currentStaff.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500 bg-white">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-5xl mb-4 text-slate-300"></i>
                      <div className="text-lg font-semibold">No staff found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                currentStaff.map((staff, index) => (
                  <tr key={staff.id} className="">
                    <td className="font-semibold text-slate-800">{staff.staffId || staff.id}</td>
                    <td className="font-medium text-slate-900">{getStaffName(staff)}</td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                        {staff.position || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary-100 text-primary-700">
                        {staff.department || 'N/A'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        staff.status === 'active' 
                          ? 'badge-success' 
                          : 'badge-danger'
                      }`}>
                        {staff.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(staff)}
                          className="p-2 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors duration-150"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleEdit(staff)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors duration-150"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(staff)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-150"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStaff.length)} of {filteredStaff.length}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffListAll;

