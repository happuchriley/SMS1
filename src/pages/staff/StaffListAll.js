import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';

const StaffListAll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [allStaff, setAllStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showViewModal, showEditModal, showDeleteModal, toast } = useModal();

  const loadStaff = useCallback(async () => {
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

  const getStaffName = (staff) => {
    return `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim() || 'N/A';
  };

  const uniqueDepartments = useMemo(() => {
    return [...new Set(allStaff.map(s => s.department).filter(Boolean))].sort();
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

  const stats = useMemo(() => {
    return {
      total: allStaff.length,
      active: allStaff.filter(s => s.status === 'active').length,
      inactive: allStaff.filter(s => s.status === 'inactive').length,
      filtered: filteredStaff.length,
    };
  }, [allStaff, filteredStaff]);

  const handleView = (staff) => {
    const fields = [
      { label: 'Staff ID', key: 'staffId', accessor: (s) => s.staffId || s.id },
      { label: 'Full Name', accessor: getStaffName },
      { label: 'Position', key: 'position' },
      { label: 'Department', key: 'department' },
      { label: 'Gender', key: 'gender' },
      { label: 'Email', key: 'email' },
      { label: 'Contact', key: 'contact' },
      { label: 'Status', key: 'status', format: (val) => val === 'active' ? 'Active' : 'Inactive' },
      { label: 'Employment Date', key: 'employmentDate' }
    ];
    
    showViewModal({
      title: 'Staff Details',
      data: staff,
      fields
    });
  };

  const handleEdit = (staff) => {
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
      onSave: async (data) => {
        try {
          await staffService.update(staff.id, data);
          toast.showSuccess('Staff updated successfully');
          await loadStaff();
        } catch (error) {
          toast.showError(error.message || 'Failed to update staff');
          throw error;
        }
      }
    });
  };

  const handleDelete = (staff) => {
    showDeleteModal({
      title: 'Delete Staff',
      message: 'Are you sure you want to delete this staff member? This action cannot be undone.',
      itemName: getStaffName(staff),
      onConfirm: async () => {
        try {
          await staffService.delete(staff.id);
          toast.showSuccess('Staff deleted successfully');
          await loadStaff();
        } catch (error) {
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
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500">Home</Link>
              <span>/</span>
              <span>Staff</span>
              <span>/</span>
              <span>All Staff</span>
            </div>
          </div>
          <Link 
            to="/staff/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700"
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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md"
          />
          <select
            value={selectedDepartment}
            onChange={(e) => {
              setSelectedDepartment(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md"
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="p-3 text-left text-white text-xs uppercase">Staff ID</th>
                <th className="p-3 text-left text-white text-xs uppercase">Name</th>
                <th className="p-3 text-left text-white text-xs uppercase">Position</th>
                <th className="p-3 text-left text-white text-xs uppercase">Department</th>
                <th className="p-3 text-left text-white text-xs uppercase">Status</th>
                <th className="p-3 text-left text-white text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <i className="fas fa-spinner fa-spin text-4xl mb-3"></i>
                    <div>Loading staff...</div>
                  </td>
                </tr>
              ) : currentStaff.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3"></i>
                    <div>No staff found</div>
                  </td>
                </tr>
              ) : (
                currentStaff.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm">{staff.staffId || staff.id}</td>
                    <td className="p-3 text-sm">{getStaffName(staff)}</td>
                    <td className="p-3 text-sm">{staff.position || 'N/A'}</td>
                    <td className="p-3 text-sm">{staff.department || 'N/A'}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        staff.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {staff.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(staff)}
                          className="p-2 text-primary-500 hover:bg-primary-50 rounded"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleEdit(staff)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(staff)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded"
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
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
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
