import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface DownloadHistoryItem {
  id: number;
  documentName: string;
  fileName: string;
  category: string;
  downloadDate: string;
  fileSize: string;
}

const DownloadHistory: React.FC = () => {
  const { toast } = useModal();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Sample download history data
  const downloadHistory: DownloadHistoryItem[] = [
    { id: 1, documentName: 'Academic Transcript 2023', fileName: 'transcript_2023.pdf', category: 'Academic', downloadDate: '2024-01-20 10:30 AM', fileSize: '2.5 MB' },
    { id: 2, documentName: 'School Fee Receipt - January', fileName: 'receipt_jan2024.pdf', category: 'Financial', downloadDate: '2024-01-19 02:15 PM', fileSize: '0.5 MB' },
    { id: 3, documentName: 'Academic Calendar 2024', fileName: 'academic_calendar_2024.pdf', category: 'Academic', downloadDate: '2024-01-18 09:45 AM', fileSize: '1.2 MB' },
    { id: 4, documentName: 'School Policy Document', fileName: 'school_policy.pdf', category: 'Administrative', downloadDate: '2024-01-17 11:20 AM', fileSize: '3.5 MB' },
    { id: 5, documentName: 'Student Handbook', fileName: 'student_handbook.pdf', category: 'Academic', downloadDate: '2024-01-16 03:30 PM', fileSize: '5.2 MB' },
  ];

  // Filter history
  const filteredHistory = useMemo(() => {
    return downloadHistory.filter(item => {
      const matchesSearch = 
        item.documentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesDate = true;
      if (dateFrom && item.downloadDate.split(' ')[0] < dateFrom) matchesDate = false;
      if (dateTo && item.downloadDate.split(' ')[0] > dateTo) matchesDate = false;
      
      return matchesSearch && matchesDate;
    });
  }, [searchTerm, dateFrom, dateTo]);

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredHistory.slice(start, start + itemsPerPage);
  }, [filteredHistory, currentPage, itemsPerPage]);

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleExport = (): void => {
    toast.showSuccess('Exporting download history...');
  };

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension)) return 'fa-file-pdf text-red-600';
    if (['doc', 'docx'].includes(extension)) return 'fa-file-word text-blue-600';
    if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel text-green-600';
    return 'fa-file text-gray-600';
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Download History</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/documents" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">My Documents</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Download History</span>
            </div>
          </div>
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
                placeholder="Search by document name or filename..."
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
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Date From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            />
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Date To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-200">
          {(searchTerm || dateFrom || dateTo) && (
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

      {/* History Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Document Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">File Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Download Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No download history found.
                  </td>
                </tr>
              ) : (
                paginatedHistory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <i className={`fas ${getFileIcon(item.fileName)} text-lg`}></i>
                        <span className="text-sm text-gray-900 font-medium">{item.documentName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.fileName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.fileSize}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.downloadDate}</td>
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
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredHistory.length)} of {filteredHistory.length} downloads
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

export default DownloadHistory;

