import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import documentsService from '../../services/documentsService';
import { useModal } from '../../components/ModalProvider';

interface Document {
  id: string;
  title: string;
  categoryId?: string;
  category?: string;
  fileName?: string;
  fileSize?: number;
  createdAt?: string;
  isShared?: boolean;
  downloads?: number;
  [key: string]: any;
}

const MyDocuments: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(9);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const username = sessionStorage.getItem('username');
      const myDocs = await documentsService.getMyDocuments(username);
      const categories = await documentsService.getAllCategories();
      
      const docsWithCategories = myDocs.map(doc => {
        const category = categories.find(cat => cat.id === doc.categoryId);
        return {
          ...doc,
          category: category?.name || 'Uncategorized'
        };
      });
      
      setDocuments(docsWithCategories);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.showError('Failed to load documents');
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
    return documents.filter(doc => {
      const matchesSearch = 
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleDelete = (id: string): void => {
    const doc = documents.find(d => d.id === id);
    showDeleteModal({
      title: 'Delete Document',
      message: `Are you sure you want to delete "${doc?.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await documentsService.deleteDocument(id);
          toast.showSuccess('Document deleted successfully');
          loadDocuments();
        } catch (error: any) {
          console.error('Error deleting document:', error);
          toast.showError(error.message || 'Failed to delete document');
        }
      }
    });
  };

  const handleDownload = async (doc: Document): Promise<void> => {
    try {
      await documentsService.downloadDocument(doc.id);
      toast.showSuccess(`Downloading ${doc.fileName || doc.title}...`);
      loadDocuments(); // Refresh to update download count
    } catch (error: any) {
      console.error('Error downloading document:', error);
      toast.showError(error.message || 'Failed to download document');
    }
  };

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedCategory('');
    setCurrentPage(1);
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Documents</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/documents" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">My Documents</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My Documents</span>
            </div>
          </div>
          <Link
            to="/documents/upload"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Upload New
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
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
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>
          {(searchTerm || selectedCategory) && (
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                <i className="fas fa-times mr-1.5"></i> Clear
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-gray-500">Loading documents...</p>
        </div>
      ) : paginatedDocuments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-folder-open text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No documents found.</p>
          <Link
            to="/documents/upload"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-upload mr-2"></i>Upload Your First Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          {paginatedDocuments.map(doc => (
            <div key={doc.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <i className={`fas ${getFileIcon(doc.fileName || '')} text-3xl`}></i>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    doc.isShared ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {doc.isShared ? 'Shared' : 'Private'}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{doc.title}</h3>
                <div className="space-y-1 mb-4 text-xs text-gray-600">
                  <p><i className="fas fa-folder mr-1"></i>{doc.category}</p>
                  {doc.fileName && <p><i className="fas fa-file mr-1"></i>{doc.fileName}</p>}
                  {doc.fileSize && <p><i className="fas fa-hdd mr-1"></i>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>}
                  {doc.createdAt && <p><i className="fas fa-calendar-alt mr-1"></i>{new Date(doc.createdAt).toLocaleDateString()}</p>}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    <i className="fas fa-download mr-1"></i>{doc.downloads || 0} downloads
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      title="Download"
                    >
                      <i className="fas fa-download"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
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

export default MyDocuments;

