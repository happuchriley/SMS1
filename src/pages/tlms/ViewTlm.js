import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ViewTlm = () => {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);

  // Sample TLM data
  const tlms = [
    { id: 1, title: 'Mathematics Worksheets - Basic 1', subject: 'Mathematics', class: 'Basic 1', term: '1st Term', academicYear: '2024/2025', fileName: 'math_worksheets_basic1.pdf', uploadDate: '2024-01-15', downloads: 45, fileSize: '2.5 MB' },
    { id: 2, title: 'English Reading Materials', subject: 'English', class: 'Basic 2', term: '1st Term', academicYear: '2024/2025', fileName: 'english_reading.pdf', uploadDate: '2024-01-16', downloads: 32, fileSize: '1.8 MB' },
    { id: 3, title: 'Science Experiment Guide', subject: 'Science', class: 'Basic 3', term: '1st Term', academicYear: '2024/2025', fileName: 'science_experiments.pdf', uploadDate: '2024-01-17', downloads: 28, fileSize: '3.2 MB' },
    { id: 4, title: 'Social Studies Notes', subject: 'Social Studies', class: 'Basic 4', term: '1st Term', academicYear: '2024/2025', fileName: 'social_studies_notes.pdf', uploadDate: '2024-01-18', downloads: 22, fileSize: '1.5 MB' },
    { id: 5, title: 'French Vocabulary List', subject: 'French', class: 'Basic 5', term: '1st Term', academicYear: '2024/2025', fileName: 'french_vocabulary.pdf', uploadDate: '2024-01-19', downloads: 18, fileSize: '0.9 MB' },
    { id: 6, title: 'ICT Practical Guide', subject: 'ICT', class: 'JHS 1', term: '1st Term', academicYear: '2024/2025', fileName: 'ict_guide.pdf', uploadDate: '2024-01-20', downloads: 35, fileSize: '4.1 MB' },
  ];

  const subjects = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];
  const classes = ['All Classes', 'Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];

  // Filter TLMs
  const filteredTlms = useMemo(() => {
    let filtered = [...tlms];
    if (selectedSubject && selectedSubject !== 'All Subjects') {
      filtered = filtered.filter(t => t.subject === selectedSubject);
    }
    if (selectedClass && selectedClass !== 'All Classes') {
      filtered = filtered.filter(t => t.class === selectedClass);
    }
    return filtered;
  }, [selectedSubject, selectedClass]);

  // Pagination
  const totalPages = Math.ceil(filteredTlms.length / itemsPerPage);
  const paginatedTlms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTlms.slice(start, start + itemsPerPage);
  }, [filteredTlms, currentPage, itemsPerPage]);

  const handleDownload = (tlm) => {
    alert(`Downloading ${tlm.fileName}...`);
  };

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(extension)) return 'fa-file-pdf text-red-600';
    if (['doc', 'docx'].includes(extension)) return 'fa-file-word text-blue-600';
    if (['ppt', 'pptx'].includes(extension)) return 'fa-file-powerpoint text-orange-600';
    if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel text-green-600';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'fa-file-image text-purple-600';
    return 'fa-file text-gray-600';
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">View TLMs</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">View TLMs</span>
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => {
                setSelectedSubject(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject === 'All Subjects' ? '' : subject}>{subject}</option>
              ))}
            </select>
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
            >
              {classes.map(cls => (
                <option key={cls} value={cls === 'All Classes' ? '' : cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TLM Cards */}
      {paginatedTlms.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-book text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No TLMs available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          {paginatedTlms.map(tlm => (
            <div key={tlm.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className={`fas ${getFileIcon(tlm.fileName)} text-2xl`}></i>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                      {tlm.subject}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{tlm.fileSize}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{tlm.title}</h3>
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-gray-600">
                    <i className="fas fa-graduation-cap mr-1"></i>{tlm.class}
                  </p>
                  <p className="text-sm text-gray-600">
                    <i className="fas fa-calendar mr-1"></i>{tlm.term} - {tlm.academicYear}
                  </p>
                  <p className="text-sm text-gray-600">
                    <i className="fas fa-file mr-1"></i>{tlm.fileName}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>
                      <i className="fas fa-download mr-1"></i>{tlm.downloads}
                    </span>
                    <span>
                      <i className="fas fa-calendar-alt mr-1"></i>{new Date(tlm.uploadDate).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDownload(tlm)}
                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors"
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

export default ViewTlm;


