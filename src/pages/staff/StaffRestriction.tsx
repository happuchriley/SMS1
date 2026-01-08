import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';
import staffRestrictionService from '../../services/staffRestrictionService';
import staffService from '../../services/staffService';

interface StaffRestriction {
  id: string;
  staffId: string;
  restrictionType: string;
  reason: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  notes?: string;
}

interface StaffInfo {
  id?: string;
  staffId?: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  [key: string]: any;
}

const StaffRestriction: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [restrictions, setRestrictions] = useState<StaffRestriction[]>([]);
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingRestriction, setEditingRestriction] = useState<StaffRestriction | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formData, setFormData] = useState<Partial<StaffRestriction>>({
    staffId: '',
    restrictionType: '',
    reason: '',
    startDate: '',
    endDate: '',
    status: 'active',
    notes: ''
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [restrictionsData, staffData] = await Promise.all([
        staffRestrictionService.getAll(),
        staffService.getAll()
      ]);
      // Map restrictions to ensure status has default value
      const mappedRestrictions: StaffRestriction[] = restrictionsData.map(item => ({
        ...item,
        status: item.status ?? 'active'
      }));
      setRestrictions(mappedRestrictions);
      // Map staff data to ensure id is present
      const mappedStaff: StaffInfo[] = staffData.map((staff: any) => ({
        id: staff.id || staff.staffId || '',
        staffId: staff.staffId,
        firstName: staff.firstName || '',
        surname: staff.surname || '',
        otherNames: staff.otherNames
      }));
      setStaffList(mappedStaff);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load restrictions');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showForm) {
      const scrollY = window.scrollY;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      return () => {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [showForm]);

  const getStaffName = (staffId: string): string => {
    const staff = staffList.find(s => (s.id && s.id === staffId) || (s.staffId && s.staffId === staffId));
    if (!staff) return 'Unknown';
    return `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim();
  };

  const getStaffId = (staffId: string): string => {
    const staff = staffList.find(s => (s.id && s.id === staffId) || (s.staffId && s.staffId === staffId));
    return staff?.staffId || staff?.id || 'N/A';
  };

  const handleAdd = (): void => {
    setEditingRestriction(null);
    setFormData({
      staffId: '',
      restrictionType: '',
      reason: '',
      startDate: '',
      endDate: '',
      status: 'active',
      notes: ''
    });
    setShowForm(true);
  };

  const handleEdit = (restriction: StaffRestriction): void => {
    setEditingRestriction(restriction);
    setFormData({
      staffId: restriction.staffId,
      restrictionType: restriction.restrictionType,
      reason: restriction.reason,
      startDate: restriction.startDate || '',
      endDate: restriction.endDate || '',
      status: restriction.status,
      notes: restriction.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Restriction',
      message: 'Are you sure you want to delete this restriction?',
      itemName: 'restriction',
      onConfirm: async () => {
        try {
          await staffRestrictionService.delete(id);
          toast.showSuccess('Restriction deleted successfully');
          loadData();
        } catch (error) {
          console.error('Error deleting restriction:', error);
          toast.showError('Failed to delete restriction');
        }
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.staffId || !formData.restrictionType || !formData.reason) {
      toast.showError('Please fill in all required fields');
      return;
    }

    try {
      if (editingRestriction) {
        await staffRestrictionService.update(editingRestriction.id, formData);
        toast.showSuccess('Restriction updated successfully');
      } else {
        await staffRestrictionService.create(formData as StaffRestriction);
        toast.showSuccess('Restriction created successfully');
      }
      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving restriction:', error);
      toast.showError(error.message || 'Failed to save restriction');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const filteredRestrictions = restrictions.filter(restriction => {
    const staffName = getStaffName(restriction.staffId).toLowerCase();
    const matchesSearch = !searchTerm || 
      staffName.includes(searchTerm.toLowerCase()) ||
      restriction.restrictionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      restriction.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || restriction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const restrictionTypes = [
    'Limited Access',
    'No Access',
    'Read Only',
    'Temporary Suspension',
    'Other'
  ];

  return (
    <Layout>
      <div className="mb-5 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Staff Restriction</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/staff/menu" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Staff</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Staff Restriction</span>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-colors duration-150 shadow-md hover:shadow-lg"
          >
            <i className="fas fa-plus"></i>
            <span>Add Restriction</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card-modern mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by staff name, restriction type, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-modern w-full"
            />
          </div>
          <div className="sm:w-48">
            <div className="relative select-dropdown-wrapper">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="select-dropdown input-modern w-full"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {editingRestriction ? 'Edit Restriction' : 'Add Restriction'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Staff <span className="text-red-500">*</span>
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="staffId"
                      value={formData.staffId || ''}
                      onChange={handleChange}
                      required
                      className="select-dropdown input-modern w-full"
                    >
                      <option value="">Select Staff</option>
                      {staffList.map(staff => (
                        <option key={staff.id} value={staff.id}>
                          {staff.staffId || staff.id} - {staff.firstName} {staff.surname} {staff.otherNames || ''}
                        </option>
                      ))}
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Restriction Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="restrictionType"
                      value={formData.restrictionType || ''}
                      onChange={handleChange}
                      required
                      className="select-dropdown input-modern w-full"
                    >
                      <option value="">Select Type</option>
                      {restrictionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason || ''}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="input-modern w-full"
                    placeholder="Enter reason for restriction"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate || ''}
                    onChange={handleChange}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate || ''}
                    onChange={handleChange}
                    className="input-modern w-full"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Status</label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="status"
                      value={formData.status || 'active'}
                      onChange={handleChange}
                      className="select-dropdown input-modern w-full"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <div className="select-dropdown-arrow">
                      <div className="select-dropdown-arrow-icon">
                        <i className="fas fa-chevron-down"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    rows={3}
                    className="input-modern w-full"
                    placeholder="Additional notes (optional)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
                >
                  {editingRestriction ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card-modern overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
            <p className="text-gray-600">Loading restrictions...</p>
          </div>
        ) : filteredRestrictions.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-inbox text-5xl text-gray-300 mb-4"></i>
            <p className="text-gray-600">No restrictions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Staff ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Restriction Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRestrictions.map((restriction) => (
                  <tr key={restriction.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{getStaffId(restriction.staffId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{getStaffName(restriction.staffId)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{restriction.restrictionType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{restriction.reason}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        (restriction.status || 'active') === 'active' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {restriction.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(restriction)}
                          className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                        >
                          <i className="fas fa-edit mr-1"></i>Edit
                        </button>
                        <button
                          onClick={() => handleDelete(restriction.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                        >
                          <i className="fas fa-trash mr-1"></i>Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StaffRestriction;
