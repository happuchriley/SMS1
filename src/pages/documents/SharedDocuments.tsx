import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import documentsService from '../../services/documentsService';
import { useModal } from '../../components/ModalProvider';

interface SharedDocument {
  id: string;
  title: string;
  categoryId?: string;
  category?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy?: string;
  createdAt?: string;
  downloads?: number;
  isShared?: boolean;
  [key: string]: any;
}

const SharedDocuments: React.FC = () => {
  const { toast } = useModal();
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const sharedDocs = await documentsService.getSharedDocuments();
      const categories = await documentsService.getAllCategories();
      
      const docsWithCategories = sharedDocs.map(doc => {
        const category = categories.find(cat => cat.id === doc.categoryId);
        return {
          ...doc,
          category: category?.name || 'Uncategorized'
        };
      });
      
      setDocuments(docsWithCategories);
    } catch (error) {
      console.error('Error loading shared documents:', error);
      toast.showError('Failed to load shared documents');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const categories: string[] = ['All Categories', 'Academic', 'Administrative', 'Financial', 'Personal', 'Other'];

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'All Categories') return documents;
    return documents.filter(doc => doc.category === selectedCategory);
  }, [documents, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleDownload = async (doc: SharedDocument): Promise<void> => {
    try {
      await documentsService.downloadDocument(doc.id);
      toast.showSuccess(`Downloading ${doc.fileName || doc.title}...`);
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.showError(error.message || 'Failed to download document');
    }
  };

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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Shared Documents</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
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
            className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-gray-500">Loading shared documents...</p>
        </div>
      ) : paginatedDocuments.length === 0 ? (
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
                  <i className={`fas ${getFileIcon(doc.fileName || '')} text-3xl`}></i>
                  {doc.isShared && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Shared
                    </span>
                  )}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                <div className="space-y-1 mb-4 text-xs text-gray-600">
                  <p><i className="fas fa-folder mr-1"></i>{doc.category}</p>
                  {doc.fileName && <p><i className="fas fa-file mr-1"></i>{doc.fileName}</p>}
                  {doc.fileSize && <p><i className="fas fa-hdd mr-1"></i>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                  {doc.uploadedBy && <p><i className="fas fa-user mr-1"></i>Shared by: {doc.uploadedBy}</p>}
                  {doc.createdAt && <p><i className="fas fa-calendar-alt mr-1"></i>{new Date(doc.createdAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    <i className="fas fa-download mr-1"></i>{doc.downloads || 0} downloads
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

