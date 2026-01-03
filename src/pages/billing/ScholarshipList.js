import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ScholarshipList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Sample data
  const scholarships = [
    { id: 'SCH001', studentId: 'STU001', studentName: 'John Doe', class: 'Basic 1', type: 'Academic Excellence', amount: 500, percentage: 50, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 'SCH002', studentId: 'STU002', studentName: 'Jane Smith', class: 'Basic 2', type: 'Need-Based', amount: 300, percentage: 30, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 'SCH003', studentId: 'STU003', studentName: 'Michael Johnson', class: 'Basic 3', type: 'Sports', amount: 200, percentage: 20, startDate: '2024-01-01', endDate: '2024-06-30', status: 'Expired' },
    { id: 'SCH004', studentId: 'STU004', studentName: 'Emily Brown', class: 'Basic 1', type: 'Academic Excellence', amount: 600, percentage: 60, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
    { id: 'SCH005', studentId: 'STU005', studentName: 'David Wilson', class: 'Basic 2', type: 'Merit', amount: 400, percentage: 40, startDate: '2024-01-01', endDate: '2024-12-31', status: 'Active' },
  ];

  const classes = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter scholarships
  const filteredScholarships = useMemo(() => {
    return scholarships.filter(sch => {
      const matchesSearch = 
        sch.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sch.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = !selectedClass || sch.class === selectedClass;
      return matchesSearch && matchesClass;
    });
  }, [searchTerm, selectedClass]);

  // Pagination
  const totalPages = Math.ceil(filteredScholarships.length / itemsPerPage);
  const paginatedScholarships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredScholarships.slice(start, start + itemsPerPage);
  }, [filteredScholarships, currentPage, itemsPerPage]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: scholarships.length,
      active: scholarships.filter(s => s.status === 'Active').length,
      expired: scholarships.filter(s => s.status === 'Expired').length,
      totalAmount: scholarships.reduce((sum, s) => sum + s.amount, 0)
    };
  }, []);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    alert('Export functionality will be implemented');
  };

  const handlePrint = () => {
    window.print();
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

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200">
          {(searchTerm || selectedClass) && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 ml-auto">
            <button
              onClick={handleExport}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-download mr-1.5"></i> <span className="hidden sm:inline">Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <i className="fas fa-print mr-1.5"></i> <span className="hidden sm:inline">Print</span>
            </button>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:border-primary-500"
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Scholarship ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Amount (GHS)</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Period</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedScholarships.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No scholarships found.
                  </td>
                </tr>
              ) : (
                paginatedScholarships.map(scholarship => (
                  <tr key={scholarship.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{scholarship.id}</td>
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
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredScholarships.length)} of {filteredScholarships.length} scholarships
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ScholarshipList;
