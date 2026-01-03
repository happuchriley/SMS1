import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ManageTlm = () => {
  const [tlms, setTlms] = useState([
    { id: 1, title: 'Mathematics Worksheets - Basic 1', subject: 'Mathematics', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', fileName: 'math_worksheets_basic1.pdf', uploadDate: '2024-01-15', downloads: 45, status: 'Active' },
    { id: 2, title: 'English Reading Materials', subject: 'English', class: 'Basic 2', term: '1st Term', academicYear: '2024/2025', fileName: 'english_reading.pdf', uploadDate: '2024-01-16', downloads: 32, status: 'Active' },
    { id: 3, title: 'Science Experiment Guide', subject: 'Science', class: 'Basic 3', term: '1st Term', academicYear: '2024/2025', fileName: 'science_experiments.pdf', uploadDate: '2024-01-17', downloads: 28, status: 'Active' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];
  const classes = ['All Classes', 'Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter TLMs
  const filteredTlms = useMemo(() => {
    return tlms.filter(tlm => {
      const matchesSearch = tlm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tlm.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !selectedSubject || selectedSubject === 'All Subjects' || tlm.subject === selectedSubject;
      const matchesClass = !selectedClass || selectedClass === 'All Classes' || tlm.class === selectedClass;
      return matchesSearch && matchesSubject && matchesClass;
    });
  }, [tlms, searchTerm, selectedSubject, selectedClass]);

  // Pagination
  const totalPages = Math.ceil(filteredTlms.length / itemsPerPage);
  const paginatedTlms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTlms.slice(start, start + itemsPerPage);
  }, [filteredTlms, currentPage, itemsPerPage]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this TLM?')) {
      setTlms(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleToggleStatus = (id) => {
    setTlms(prev => prev.map(t => 
      t.id === id ? { ...t, status: t.status === 'Active' ? 'Inactive' : 'Active' } : t
    ));
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedClass('');
    setCurrentPage(1);
  };

  const handleDownload = (tlm) => {
    alert(`Downloading ${tlm.fileName}...`);
    setTlms(prev => prev.map(t => 
      t.id === tlm.id ? { ...t, downloads: t.downloads + 1 } : t
    ));
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage TLMs</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage TLMs</span>
            </div>
          </div>
          <Link
            to="/tlms/upload"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Upload New
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or filename..."
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
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject === 'All Subjects' ? '' : subject}>{subject}</option>
              ))}
            </select>
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
              {classes.map(cls => (
                <option key={cls} value={cls === 'All Classes' ? '' : cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedSubject || selectedClass) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* TLMs Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Class</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Term</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Upload Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Downloads</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedTlms.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    No TLMs found.
                  </td>
                </tr>
              ) : (
                paginatedTlms.map(tlm => (
                  <tr key={tlm.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{tlm.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tlm.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tlm.class}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tlm.term}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tlm.fileName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(tlm.uploadDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{tlm.downloads}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        tlm.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {tlm.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(tlm)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          title="Download"
                        >
                          <i className="fas fa-download"></i>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(tlm.id)}
                          className={`text-sm font-medium ${
                            tlm.status === 'Active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                          }`}
                          title={tlm.status === 'Active' ? 'Deactivate' : 'Activate'}
                        >
                          <i className={`fas fa-${tlm.status === 'Active' ? 'ban' : 'check'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(tlm.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTlms.length)} of {filteredTlms.length} TLMs
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

export default ManageTlm;

