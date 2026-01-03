import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const DownloadTlm = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Sample TLM data
  const tlms = [
    { id: 1, title: 'Mathematics Worksheets - Basic 1', subject: 'Mathematics', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', fileName: 'math_worksheets_basic1.pdf', fileSize: '2.5 MB', downloads: 45 },
    { id: 2, title: 'English Reading Materials', subject: 'English', class: 'Basic 2', term: '1st Term', academicYear: '2024/2025', fileName: 'english_reading.pdf', fileSize: '1.8 MB', downloads: 32 },
    { id: 3, title: 'Science Experiment Guide', subject: 'Science', class: 'Basic 3', term: '2nd Term', academicYear: '2024/2025', fileName: 'science_experiments.pdf', fileSize: '3.2 MB', downloads: 28 },
    { id: 4, title: 'Social Studies Notes', subject: 'Social Studies', class: 'Basic 4', term: '1st Term', academicYear: '2024/2025', fileName: 'social_studies_notes.pdf', fileSize: '1.5 MB', downloads: 22 },
  ];

  const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];
  const classes = ['All Classes', 'Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const terms = ['All Terms', '1st Term', '2nd Term', '3rd Term'];

  // Filter TLMs
  const filteredTlms = useMemo(() => {
    return tlms.filter(tlm => {
      const matchesSearch = tlm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tlm.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = !selectedSubject || selectedSubject === 'All Subjects' || tlm.subject === selectedSubject;
      const matchesClass = !selectedClass || selectedClass === 'All Classes' || tlm.class === selectedClass;
      const matchesTerm = !selectedTerm || selectedTerm === 'All Terms' || tlm.term === selectedTerm;
      return matchesSearch && matchesSubject && matchesClass && matchesTerm;
    });
  }, [searchTerm, selectedSubject, selectedClass, selectedTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredTlms.length / itemsPerPage);
  const paginatedTlms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTlms.slice(start, start + itemsPerPage);
  }, [filteredTlms, currentPage, itemsPerPage]);

  const handleDownload = (tlm) => {
    alert(`Downloading ${tlm.fileName}...`);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedClass('');
    setSelectedTerm('');
    setCurrentPage(1);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'fa-file-pdf text-red-600';
    if (['doc', 'docx'].includes(extension)) return 'fa-file-word text-blue-600';
    if (['ppt', 'pptx'].includes(extension)) return 'fa-file-powerpoint text-orange-600';
    if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel text-green-600';
    return 'fa-file text-gray-600';
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Download TLMs</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Download TLMs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
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

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Term</label>
            <select
              value={selectedTerm}
              onChange={(e) => {
                setSelectedTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {terms.map(term => (
                <option key={term} value={term === 'All Terms' ? '' : term}>{term}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedSubject || selectedClass || selectedTerm) && (
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

      {/* TLM Cards */}
      {paginatedTlms.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-book text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No TLMs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mb-4 sm:mb-5">
          {paginatedTlms.map(tlm => (
            <div key={tlm.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <i className={`fas ${getFileIcon(tlm.fileName)} text-3xl`}></i>
                  <span className="text-xs text-gray-500">{tlm.fileSize}</span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{tlm.title}</h3>
                <div className="space-y-1 mb-3 text-xs text-gray-600">
                  <p><i className="fas fa-book mr-1"></i>{tlm.subject}</p>
                  <p><i className="fas fa-graduation-cap mr-1"></i>{tlm.class}</p>
                  <p><i className="fas fa-calendar mr-1"></i>{tlm.term}</p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    <i className="fas fa-download mr-1"></i>{tlm.downloads}
                  </span>
                  <button
                    onClick={() => handleDownload(tlm)}
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

export default DownloadTlm;


