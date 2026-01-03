import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const SharedDocuments = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Sample shared documents data
  const sharedDocuments = [
    { id: 1, title: 'School Policy Document', category: 'Administrative', fileName: 'school_policy.pdf', fileSize: '3.5 MB', sharedBy: 'Admin', sharedDate: '2024-01-10', downloads: 45, accessLevel: 'Staff Only' },
    { id: 2, title: 'Academic Calendar 2024', category: 'Academic', fileName: 'academic_calendar_2024.pdf', fileSize: '1.2 MB', sharedBy: 'Principal', sharedDate: '2024-01-05', downloads: 120, accessLevel: 'Public' },
    { id: 3, title: 'Financial Report Template', category: 'Financial', fileName: 'financial_template.xlsx', fileSize: '0.8 MB', sharedBy: 'Finance Office', sharedDate: '2024-01-08', downloads: 28, accessLevel: 'Staff Only' },
    { id: 4, title: 'Student Handbook', category: 'Academic', fileName: 'student_handbook.pdf', fileSize: '5.2 MB', sharedBy: 'Academic Office', sharedDate: '2024-01-12', downloads: 89, accessLevel: 'Public' },
  ];

  const categories = ['All Categories', 'Academic', 'Administrative', 'Financial', 'Personal', 'Other'];

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All Categories') return sharedDocuments;
    return sharedDocuments.filter(doc => doc.category === selectedCategory);
  }, [selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleDownload = (doc) => {
    alert(`Downloading ${doc.fileName}...`);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'fa-file-pdf text-red-600';
    if (['doc', 'docx'].includes(extension)) return 'fa-file-word text-blue-600';
    if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel text-green-600';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'fa-file-image text-purple-600';
    return 'fa-file text-gray-600';
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shared Documents</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/documents" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">My Documents</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Shared Documents</span>
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {paginatedDocuments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No shared documents available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          {paginatedDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <i className={`fas ${getFileIcon(doc.fileName)} text-3xl`}></i>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.accessLevel === 'Staff Only' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {doc.accessLevel}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                <div className="space-y-1 mb-4 text-xs text-gray-600">
                  <p><i className="fas fa-folder mr-1"></i>{doc.category}</p>
                  <p><i className="fas fa-file mr-1"></i>{doc.fileName}</p>
                  <p><i className="fas fa-hdd mr-1"></i>{doc.fileSize}</p>
                  <p><i className="fas fa-user mr-1"></i>Shared by: {doc.sharedBy}</p>
                  <p><i className="fas fa-calendar-alt mr-1"></i>{new Date(doc.sharedDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    <i className="fas fa-download mr-1"></i>{doc.downloads} downloads
                  </span>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <i className="fas fa-download mr-1"></i>Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
};

export default SharedDocuments;
