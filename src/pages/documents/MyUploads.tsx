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
  status?: string;
  [key: string]: any;
}

const MyUploads: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

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
          category: category?.name || 'Uncategorized',
          status: doc.status || 'completed'
        };
      });
      
      setDocuments(docsWithCategories);
    } catch (error) {
      console.error('Error loading uploads:', error);
      toast.showError('Failed to load uploads');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const categories: string[] = ['All Categories', 'Academic', 'Administrative', 'Financial', 'Personal', 'Other'];

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = 
        doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [documents, searchTerm, selectedCategory]);

  const handleDelete = (id: string): void => {
    const doc = documents.find(d => d.id === id);
    showDeleteModal({
      title: 'Delete Upload',
      message: `Are you sure you want to delete "${doc?.title}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await documentsService.deleteDocument(id);
          toast.showSuccess('Upload deleted successfully');
          loadDocuments();
        } catch (error: any) {
          console.error('Error deleting upload:', error);
          toast.showError(error.message || 'Failed to delete upload');
        }
      }
    });
  };

  const handleDownload = async (doc: Document): Promise<void> => {
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Uploads</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/documents" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">My Documents</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My Uploads</span>
            </div>
          </div>
          <Link
            to="/documents/upload"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-upload mr-2"></i>Upload New
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or filename..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p className="text-gray-500">Loading uploads...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-cloud-upload-alt text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No uploads found.</p>
          <Link
            to="/documents/upload"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-upload mr-2"></i>Upload Your First Document
          </Link>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Upload Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center">
                        <i className={`fas ${getFileIcon(doc.fileName || '')} text-2xl mr-3`}></i>
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
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doc.fileSize ? `${(doc.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                        doc.status === 'uploading' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                        title="Download"
                      >
                        <i className="fas fa-download"></i>
                      </button>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
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

export default MyUploads;

