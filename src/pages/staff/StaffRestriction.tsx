import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';
import staffRestrictionService from '../../services/staffRestrictionService';
import staffService from '../../services/staffService';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/printExport';

interface StaffInfo {
  id?: string;
  staffId?: string;
  firstName: string;
  surname: string;
  otherNames?: string;
  [key: string]: any;
}

interface FeatureAccess {
  feature: string;
  label: string;
  icon: string;
  allowed: boolean;
}

interface StaffRestrictionData {
  id?: string;
  staffId: string;
  features: string[]; // Array of allowed feature names
  notes?: string;
  lastUpdated?: string;
}

const StaffRestriction: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [staffList, setStaffList] = useState<StaffInfo[]>([]);
  const [restrictions, setRestrictions] = useState<StaffRestrictionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [editingRestriction, setEditingRestriction] = useState<StaffRestrictionData | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [formFeatures, setFormFeatures] = useState<Record<string, boolean>>({});

  // Define all available features/modules
  const allFeatures: FeatureAccess[] = [
    { feature: 'students', label: 'Students Management', icon: 'fa-user-graduate', allowed: false },
    { feature: 'staff', label: 'Staff Management', icon: 'fa-users', allowed: false },
    { feature: 'reports', label: 'Reports', icon: 'fa-chart-bar', allowed: false },
    { feature: 'billing', label: 'Billing', icon: 'fa-file-invoice-dollar', allowed: false },
    { feature: 'fee-collection', label: 'Fee Collection', icon: 'fa-money-bill-wave', allowed: false },
    { feature: 'payroll', label: 'Payroll', icon: 'fa-money-check-alt', allowed: false },
    { feature: 'finance', label: 'Finance', icon: 'fa-wallet', allowed: false },
    { feature: 'financial-reports', label: 'Financial Reports', icon: 'fa-chart-line', allowed: false },
    { feature: 'reminders', label: 'Reminders', icon: 'fa-bell', allowed: false },
    { feature: 'setup', label: 'Setup', icon: 'fa-cog', allowed: false },
    { feature: 'tlms', label: 'TLMS', icon: 'fa-book', allowed: false },
    { feature: 'elearning', label: 'E-Learning', icon: 'fa-laptop', allowed: false },
    { feature: 'news', label: 'News', icon: 'fa-newspaper', allowed: false },
    { feature: 'documents', label: 'Documents', icon: 'fa-folder', allowed: false },
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [restrictionsData, staffData] = await Promise.all([
        staffRestrictionService.getAll(),
        staffService.getAll()
      ]);
      
      // Map restrictions
      const mappedRestrictions: StaffRestrictionData[] = restrictionsData.map((item: any) => ({
        id: item.id,
        staffId: item.staffId,
        features: item.features || [],
        notes: item.notes || '',
        lastUpdated: item.lastUpdated || item.updatedAt || ''
      }));
      setRestrictions(mappedRestrictions);
      
      // Map staff data
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

  const getStaffName = (staffId: string): string => {
    const staff = staffList.find(s => (s.id && s.id === staffId) || (s.staffId && s.staffId === staffId));
    if (!staff) return 'Unknown';
    return `${staff.firstName || ''} ${staff.surname || ''} ${staff.otherNames || ''}`.trim();
  };

  const getStaffId = (staffId: string): string => {
    const staff = staffList.find(s => (s.id && s.id === staffId) || (s.staffId && s.staffId === staffId));
    return staff?.staffId || staff?.id || 'N/A';
  };

  const getRestrictionForStaff = (staffId: string): StaffRestrictionData | null => {
    return restrictions.find(r => r.staffId === staffId) || null;
  };

  const handleAdd = (): void => {
    setEditingRestriction(null);
    setSelectedStaff('');
    setFormFeatures({});
    setShowForm(true);
  };

  const handleEdit = (restriction: StaffRestrictionData): void => {
    setEditingRestriction(restriction);
    setSelectedStaff(restriction.staffId);
    // Initialize form features based on restriction
    const featuresMap: Record<string, boolean> = {};
    allFeatures.forEach(f => {
      featuresMap[f.feature] = restriction.features.includes(f.feature);
    });
    setFormFeatures(featuresMap);
    setShowForm(true);
  };

  const handleDelete = (id: string): void => {
    const restriction = restrictions.find(r => r.id === id);
    if (!restriction) return;
    
    showDeleteModal({
      title: 'Delete Restriction',
      message: 'Are you sure you want to delete this restriction?',
      itemName: getStaffName(restriction.staffId),
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

  const handleFeatureToggle = (feature: string): void => {
    setFormFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature]
    }));
  };

  const handleStaffSelect = (staffId: string): void => {
    setSelectedStaff(staffId);
    // Load existing restriction if any
    const existing = getRestrictionForStaff(staffId);
    if (existing) {
      setEditingRestriction(existing);
      const featuresMap: Record<string, boolean> = {};
      allFeatures.forEach(f => {
        featuresMap[f.feature] = existing.features.includes(f.feature);
      });
      setFormFeatures(featuresMap);
    } else {
      setEditingRestriction(null);
      // Default: all features allowed
      const featuresMap: Record<string, boolean> = {};
      allFeatures.forEach(f => {
        featuresMap[f.feature] = true;
      });
      setFormFeatures(featuresMap);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedStaff) {
      toast.showError('Please select a staff member');
      return;
    }

    try {
      const allowedFeatures = allFeatures
        .filter(f => formFeatures[f.feature])
        .map(f => f.feature);

      const restrictionData: StaffRestrictionData = {
        staffId: selectedStaff,
        features: allowedFeatures,
        notes: '',
        lastUpdated: new Date().toISOString()
      };

      if (editingRestriction && editingRestriction.id) {
        await staffRestrictionService.update(editingRestriction.id, restrictionData);
        toast.showSuccess('Restriction updated successfully');
      } else {
        await staffRestrictionService.create(restrictionData as any);
        toast.showSuccess('Restriction created successfully');
      }
      setShowForm(false);
      loadData();
    } catch (error: any) {
      console.error('Error saving restriction:', error);
      toast.showError(error.message || 'Failed to save restriction');
    }
  };

  const filteredRestrictions = useMemo(() => {
    if (!searchTerm) return restrictions;
    const term = searchTerm.toLowerCase();
    return restrictions.filter(restriction => {
      const staffName = getStaffName(restriction.staffId).toLowerCase();
      const staffId = getStaffId(restriction.staffId).toLowerCase();
      return staffName.includes(term) || staffId.includes(term);
    });
  }, [restrictions, searchTerm, staffList]);

  // Pagination
  const totalPages = Math.ceil(filteredRestrictions.length / entriesPerPage);
  const paginatedRestrictions = useMemo(() => {
    const start = (currentPage - 1) * entriesPerPage;
    const end = start + entriesPerPage;
    return filteredRestrictions.slice(start, end);
  }, [filteredRestrictions, currentPage, entriesPerPage]);

  const handleActionClick = (restrictionId: string, action: string): void => {
    setOpenActionMenu(null);
    const restriction = restrictions.find(r => r.id === restrictionId);
    if (!restriction) return;

    switch (action) {
      case 'edit':
        handleEdit(restriction);
        break;
      case 'delete':
        if (restriction.id) {
          handleDelete(restriction.id);
        }
        break;
      case 'view':
        toast.showInfo(`Viewing restrictions for ${getStaffName(restriction.staffId)}`);
        break;
      default:
        break;
    }
  };

  const handleExport = (format: 'copy' | 'excel' | 'csv' | 'pdf'): void => {
    if (filteredRestrictions.length === 0) {
      toast.showError('No data to export');
      return;
    }

    const columns = [
      { key: 'staffId', label: 'Staff ID' },
      { key: 'name', label: 'Staff Name' },
      { key: 'features', label: 'Allowed Features' },
      { key: 'count', label: 'Feature Count' }
    ];

    const exportData = filteredRestrictions.map(r => ({
      staffId: getStaffId(r.staffId),
      name: getStaffName(r.staffId),
      features: r.features.join(', ') || 'None',
      count: r.features.length
    }));

    switch (format) {
      case 'copy':
        const text = exportData.map(row => Object.values(row).join('\t')).join('\n');
        navigator.clipboard.writeText(text);
        toast.showSuccess('Data copied to clipboard');
        break;
      case 'excel':
        exportToExcel(exportData, `staff-restrictions-${new Date().toISOString().split('T')[0]}.xlsx`, columns);
        toast.showSuccess('Data exported to Excel');
        break;
      case 'csv':
        exportToCSV(exportData, `staff-restrictions-${new Date().toISOString().split('T')[0]}.csv`, columns);
        toast.showSuccess('Data exported to CSV');
        break;
      case 'pdf':
        const printContent = document.getElementById('restriction-table');
        if (printContent) {
          exportToPDF(printContent, `staff-restrictions-${new Date().toISOString().split('T')[0]}.pdf`);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Staff Restriction</h1>
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
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300 flex items-center gap-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Restriction</span>
          </button>
        </div>
      </div>

      {/* Form Section - Full Page Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {editingRestriction ? 'Edit Staff Restriction' : 'Add Staff Restriction'}
            </h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <i className="fas fa-times text-xl"></i>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Staff Selection */}
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Select Staff <span className="text-red-500">*</span>
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    value={selectedStaff}
                    onChange={(e) => handleStaffSelect(e.target.value)}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select Staff Member</option>
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

              {/* Feature Access Controls */}
              {selectedStaff && (
                <div>
                  <label className="block mb-4 font-semibold text-gray-900 text-sm">
                    Feature Access Control <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-4">
                    Select the features/modules this staff member should have access to. Unchecked features will be restricted.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allFeatures.map((feature) => (
                      <div
                        key={feature.feature}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formFeatures[feature.feature]
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => handleFeatureToggle(feature.feature)}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={formFeatures[feature.feature] || false}
                            onChange={() => handleFeatureToggle(feature.feature)}
                            className="w-5 h-5 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <i className={`fas ${feature.icon} text-primary-500`}></i>
                              <span className="font-semibold text-gray-900 text-sm">{feature.label}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedStaff}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingRestriction ? 'Update Restriction' : 'Save Restriction'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

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
        <div id="restriction-table" className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Action</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Staff.ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Staff.Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Allowed Features</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">Feature Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-spinner fa-spin text-4xl mb-4 text-primary-500"></i>
                      <div className="text-lg font-semibold">Loading restrictions...</div>
                    </div>
                  </td>
                </tr>
              ) : paginatedRestrictions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <i className="fas fa-inbox text-4xl mb-4 text-gray-300"></i>
                      <div className="text-lg font-semibold">No restrictions found</div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRestrictions.map((restriction, index) => {
                  return (
                    <tr key={restriction.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 relative">
                        <div ref={actionMenuRef}>
                          <button
                            onClick={() => setOpenActionMenu(openActionMenu === restriction.id ? null : restriction.id || null)}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center gap-1"
                          >
                            <i className="fas fa-cog"></i>
                            <i className="fas fa-chevron-right text-xs"></i>
                          </button>
                          {openActionMenu === restriction.id && restriction.id && (
                            <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 min-w-[200px]">
                              <button
                                onClick={() => handleActionClick(restriction.id!, 'view')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-eye text-green-500"></i>
                                View Details
                              </button>
                              <button
                                onClick={() => handleActionClick(restriction.id!, 'edit')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-edit text-blue-500"></i>
                                Edit Restriction
                              </button>
                              <button
                                onClick={() => handleActionClick(restriction.id!, 'delete')}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <i className="fas fa-trash text-red-500"></i>
                                Delete Restriction
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{(currentPage - 1) * entriesPerPage + index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{getStaffId(restriction.staffId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{getStaffName(restriction.staffId)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {restriction.features.length > 0 ? (
                            restriction.features.map(f => {
                              const feature = allFeatures.find(af => af.feature === f);
                              return feature ? (
                                <span key={f} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                                  <i className={`fas ${feature.icon}`}></i>
                                  {feature.label}
                                </span>
                              ) : null;
                            })
                          ) : (
                            <span className="text-gray-500 italic">No features allowed</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold">{restriction.features.length}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700">
            Showing {filteredRestrictions.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredRestrictions.length)} of {filteredRestrictions.length} entries
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

export default StaffRestriction;
