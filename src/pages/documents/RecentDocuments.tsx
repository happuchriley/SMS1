import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface Document {
  id: number;
  title: string;
  category: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  uploadTime: string;
  uploadedBy: string;
}

const RecentDocuments: React.FC = () => {
  const [documents] = useState<Document[]>([
    { id: 1, title: 'Monthly Report - January', category: 'Administrative', fileName: 'report_jan2024.pdf', fileSize: '1.2 MB', uploadDate: '2024-01-31', uploadTime: '14:30', uploadedBy: 'Admin' },
    { id: 2, title: 'Student Attendance Record', category: 'Academic', fileName: 'attendance_jan2024.xlsx', fileSize: '0.8 MB', uploadDate: '2024-01-30', uploadTime: '10:15', uploadedBy: 'Teacher' },
    { id: 3, title: 'Fee Payment Receipt', category: 'Financial', fileName: 'receipt_2024.pdf', fileSize: '0.5 MB', uploadDate: '2024-01-29', uploadTime: '16:45', uploadedBy: 'Accountant' },
    { id: 4, title: 'Meeting Minutes', category: 'Administrative', fileName: 'minutes_jan2024.pdf', fileSize: '0.9 MB', uploadDate: '2024-01-28', uploadTime: '09:20', uploadedBy: 'Secretary' },
    { id: 5, title: 'Exam Results - Term 1', category: 'Academic', fileName: 'results_term1.xlsx', fileSize: '2.1 MB', uploadDate: '2024-01-27', uploadTime: '13:00', uploadedBy: 'Admin' },
  ]);

  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const filteredDocuments = useMemo(() => {
    const now = new Date();
    return documents.filter(doc => {
      const docDate = new Date(doc.uploadDate);
      switch (filter) {
        case 'today':
          return docDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return docDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return docDate >= monthAgo;
        default:
          return true;
      }
    });
  }, [documents, filter]);

  const getFileIcon = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Recent Documents</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/documents" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">My Documents</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Recent Documents</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('today')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'today' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setFilter('week')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'week' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
          <button
            onClick={() => setFilter('month')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              filter === 'month' 
                ? 'bg-primary-500 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-clock text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No recent documents found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Document</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">File Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Uploaded By</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Date & Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <i className={`fas ${getFileIcon(doc.fileName)} text-2xl mr-3`}></i>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.title}</div>
                          <div className="text-xs text-gray-500">{doc.fileName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{doc.fileSize}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{doc.uploadedBy}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{new Date(doc.uploadDate).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">{doc.uploadTime}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <i className="fas fa-download"></i>
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RecentDocuments;

