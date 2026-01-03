import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const StudentsListAll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showViewModal, showEditModal, showDeleteModal, toast } = useModal();

  const loadStudents = useCallback(async () => {
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

  // Load students from API
  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Get unique classes for filter
  const uniqueClasses = useMemo(() => {
    return [...new Set(allStudents.map(s => s.class))].sort();
  }, [allStudents]);

  // Helper to get student display name
  const getStudentName = (student) => {
    return `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim() || 'N/A';
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return allStudents.filter(student => {
      const fullName = getStudentName(student).toLowerCase();
      const studentId = (student.studentId || student.id || '').toLowerCase();
      const parent = (student.parent || student.parentName || '').toLowerCase();
      
      const matchesSearch = 
        fullName.includes(searchTerm.toLowerCase()) ||
        studentId.includes(searchTerm.toLowerCase()) ||
        parent.includes(searchTerm.toLowerCase()) ||
        (student.email && student.email.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesClass = !selectedClass || student.class === selectedClass;
      const statusDisplay = student.status === 'active' ? 'Active' : 'Inactive';
      const matchesStatus = !selectedStatus || statusDisplay === selectedStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [searchTerm, selectedClass, selectedStatus, allStudents]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: allStudents.length,
      active: allStudents.filter(s => s.status === 'active').length,
      inactive: allStudents.filter(s => s.status === 'inactive').length,
      filtered: filteredStudents.length,
    };
  }, [allStudents, filteredStudents]);

  // Handle view student
  const handleView = (student) => {
    const fields = [
      { label: 'Student ID', key: 'studentId', accessor: (s) => s.studentId || s.id },
      { label: 'First Name', key: 'firstName' },
      { label: 'Surname', key: 'surname' },
      { label: 'Other Names', key: 'otherNames' },
      { label: 'Full Name', accessor: getStudentName },
      { label: 'Gender', key: 'gender' },
      { label: 'Date of Birth', key: 'dateOfBirth' },
      { label: 'Class', key: 'class' },
      { label: 'Status', key: 'status', format: (val) => val === 'active' ? 'Active' : 'Inactive' },
      { label: 'Email', key: 'email' },
      { label: 'Contact', key: 'contact' },
      { label: 'Address', key: 'address' },
      { label: 'Parent/Guardian', key: 'parent' },
      { label: 'Admission Date', key: 'admissionDate' }
    ];
    
    showViewModal({
      title: 'Student Details',
      data: student,
      fields
    });
  };

  // Handle edit student
  const handleEdit = (student) => {
    // Navigate to edit page - for now, we'll show a modal
    // In a full implementation, you might want a separate edit page
    showEditModal({
      title: 'Edit Student',
      data: student,
      fields: [
        { name: 'firstName', label: 'First Name', type: 'text', required: true },
        { name: 'surname', label: 'Surname', type: 'text', required: true },
        { name: 'otherNames', label: 'Other Names', type: 'text' },
        { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female'], required: true },
        { name: 'class', label: 'Class', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'contact', label: 'Contact', type: 'text' },
        { name: 'address', label: 'Address', type: 'textarea' }
      ],
      onSave: async (data) => {
        try {
          await studentsService.update(student.id, data);
          toast.showSuccess('Student updated successfully');
          await loadStudents();
        } catch (error) {
          toast.showError(error.message || 'Failed to update student');
          throw error;
        }
      }
    });
  };

  // Handle delete student
  const handleDelete = (student) => {
    showDeleteModal({
      title: 'Delete Student',
      message: 'Are you sure you want to delete this student? This action cannot be undone.',
      itemName: getStudentName(student),
      onConfirm: async () => {
        try {
          await studentsService.delete(student.id);
          toast.showSuccess('Student deleted successfully');
          await loadStudents();
        } catch (error) {
          toast.showError(error.message || 'Failed to delete student');
        }
      }
    });
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedStudents(currentStudents.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  // Handle individual select
  const handleSelectStudent = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  // Export function
  const handleExport = () => {
    // In real app, this would export to CSV/Excel
    alert(`Exporting ${filteredStudents.length} students...`);
  };

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Clear filters
  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-4 sm:mb-5 md:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">All Students</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Students</span>
              <span>/</span>
              <span className="text-gray-900 font-medium">All Students</span>
            </div>
          </div>
          <Link 
            to="/students/add"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-primary-500 text-white rounded-md text-sm sm:text-base font-semibold hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 min-h-[44px] sm:min-h-auto"
          >
            <i className="fas fa-plus"></i>
            <span>Add New Student</span>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-blue-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Total Students</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-green-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Active</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.active}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-red-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Inactive</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.inactive}</div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-md border-l-4 border-primary-500">
            <div className="text-xs text-gray-600 mb-1 font-medium">Showing</div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{stats.filtered}</div>
          </div>
        </div>
      </div>

      {/* Filters and Actions Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, ID, or parent..."
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

          {/* Class Filter */}
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
              {uniqueClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {(searchTerm || selectedClass || selectedStatus) && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors min-h-[36px] sm:min-h-auto"
              >
                <i className="fas fa-times mr-1.5"></i> Clear Filters
              </button>
            )}
            {selectedStudents.length > 0 && (
              <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-primary-50 text-primary-700 rounded-md">
                {selectedStudents.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[36px] sm:min-h-auto"
            >
              <i className="fas fa-download mr-1.5"></i> <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors min-h-[36px] sm:min-h-auto"
            >
              <i className="fas fa-print mr-1.5"></i> <span className="hidden sm:inline">Print</span>
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-primary-500 min-h-[36px] sm:min-h-auto"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-primary-500">
              <tr>
                <th className="p-3 sm:p-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.length === currentStudents.length && currentStudents.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                </th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Student ID</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Name</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Class</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Gender</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Parent/Guardian</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Status</th>
                <th className="p-3 sm:p-4 text-left font-bold text-xs text-white uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <i className="fas fa-spinner fa-spin text-4xl mb-3 text-gray-300"></i>
                    <div className="text-lg font-medium">Loading students...</div>
                  </td>
                </tr>
              ) : currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500">
                    <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
                    <div className="text-lg font-medium">No students found</div>
                    <div className="text-sm">Try adjusting your search or filters</div>
                  </td>
                </tr>
              ) : (
                currentStudents.map((student) => (
                  <tr 
                    key={student.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3 sm:p-4">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                    </td>
                    <td className="p-3 sm:p-4 text-sm font-medium text-gray-900">{student.studentId || student.id}</td>
                    <td className="p-3 sm:p-4 text-sm text-gray-900">{getStudentName(student)}</td>
                    <td className="p-3 sm:p-4 text-sm text-gray-600">{student.class || 'N/A'}</td>
                    <td className="p-3 sm:p-4 text-sm text-gray-600">{student.gender || 'N/A'}</td>
                    <td className="p-3 sm:p-4 text-sm text-gray-600">{student.parent || student.parentName || 'N/A'}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleView(student)}
                          className="p-2 text-primary-500 hover:bg-primary-50 rounded transition-colors"
                          title="View"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(student)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
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

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-spinner fa-spin text-4xl mb-3 text-gray-300"></i>
              <div className="text-lg font-medium">Loading students...</div>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
              <div className="text-lg font-medium">No students found</div>
              <div className="text-sm">Try adjusting your search or filters</div>
            </div>
          ) : (
            currentStudents.map((student) => (
              <div key={student.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleSelectStudent(student.id)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <h3 className="font-semibold text-gray-900">{getStudentName(student)}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{student.studentId || student.id}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Class:</span>
                    <span className="ml-1 font-medium text-gray-900">{student.class || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Gender:</span>
                    <span className="ml-1 font-medium text-gray-900">{student.gender || 'N/A'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Parent:</span>
                    <span className="ml-1 font-medium text-gray-900">{student.parent || student.parentName || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleView(student)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-primary-500 bg-primary-50 rounded-md hover:bg-primary-100 text-center transition-colors"
                  >
                    <i className="fas fa-eye mr-1.5"></i> View
                  </button>
                  <button
                    onClick={() => handleEdit(student)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-blue-500 bg-blue-50 rounded-md hover:bg-blue-100 text-center transition-colors"
                  >
                    <i className="fas fa-edit mr-1.5"></i> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(student)}
                    className="px-3 py-2 text-sm font-medium text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-4 sm:px-6 border-t border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{Math.min(endIndex, filteredStudents.length)}</span> of{' '}
                <span className="font-medium">{filteredStudents.length}</span> students
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[36px] sm:min-h-auto"
                >
                  <i className="fas fa-chevron-left"></i>
                  <span className="hidden sm:inline ml-1">Previous</span>
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors min-w-[36px] min-h-[36px] ${
                          currentPage === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[36px] sm:min-h-auto"
                >
                  <span className="hidden sm:inline mr-1">Next</span>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentsListAll;
