import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import tlmsService from '../../services/tlmsService';
import { useModal } from '../../components/ModalProvider';

interface TlmItem {
  id: string;
  title: string;
  subject?: string;
  class?: string;
  term?: string;
  academicYear?: string;
  fileName?: string;
  uploadDate?: string;
  downloads?: number;
  status?: string;
  categoryId?: string;
  category?: string;
  fileSize?: number;
}

const ManageTlm: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [tlms, setTlms] = useState<TlmItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  const subjects: string[] = ['All Subjects', 'Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];

  // Filter TLMs
  const filteredTlms = useMemo(() => {
    return tlms.filter(tlm => {
      const matchesSearch = tlm.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (tlm.fileName && tlm.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSubject = !selectedSubject || selectedSubject === 'All Subjects' || tlm.subject === selectedSubject;
      const matchesCategory = !selectedCategory || tlm.categoryId === selectedCategory;
      return matchesSearch && matchesSubject && matchesCategory;
    });
  }, [tlms, searchTerm, selectedSubject, selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredTlms.length / itemsPerPage);
  const paginatedTlms = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTlms.slice(start, start + itemsPerPage);
  }, [filteredTlms, currentPage, itemsPerPage]);

  const loadTlms = useCallback(async () => {
    try {
      setLoading(true);
      const allTlms = await tlmsService.getAll();
      const allCategories = await tlmsService.getAllCategories();
      
      const tlmsWithCategories = allTlms.map(tlm => {
        const category = allCategories.find(cat => cat.id === tlm.categoryId);
        return {
          ...tlm,
          category: category?.name || 'Uncategorized',
          status: tlm.status || 'active'
        };
      });
      
      setTlms(tlmsWithCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading TLMs:', error);
      toast.showError('Failed to load TLMs');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadTlms();
  }, [loadTlms]);

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete TLM',
      message: 'Are you sure you want to delete this TLM? This action cannot be undone.',
      itemName: tlms.find(t => t.id === id)?.title || 'this TLM',
      onConfirm: async () => {
        try {
          await tlmsService.deleteTlm(id);
          toast.showSuccess('TLM deleted successfully');
          await loadTlms();
        } catch (error: any) {
          console.error('Error deleting TLM:', error);
          toast.showError(error.message || 'Failed to delete TLM');
        }
      }
    });
  };

  const handleToggleStatus = async (id: string): Promise<void> => {
    try {
      await tlmsService.toggleStatus(id);
      toast.showSuccess('TLM status updated');
      await loadTlms();
    } catch (error: any) {
      console.error('Error toggling TLM status:', error);
      toast.showError(error.message || 'Failed to update TLM status');
    }
  };

  const handleDownload = async (id: string): Promise<void> => {
    try {
      await tlmsService.downloadTlm(id);
      toast.showSuccess('Download started');
      await loadTlms();
    } catch (error: any) {
      console.error('Error downloading TLM:', error);
      toast.showError(error.message || 'Failed to download TLM');
    }
  };


  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage TLMs</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
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
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
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
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>

        {(searchTerm || selectedSubject || selectedCategory) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSubject('');
                setSelectedCategory('');
                setCurrentPage(1);
              }}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-100"
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
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    Loading TLMs...
                  </td>
                </tr>
              ) : paginatedTlms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                    No TLMs found.
                  </td>
                </tr>
              ) : (
                paginatedTlms.map(tlm => {
                  const status = tlm.status === 'active' ? 'Active' : 'Inactive';
                  return (
                    <tr key={tlm.id} className="hover:bg-gray-50 transition-colors duration-75">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{tlm.title}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tlm.subject || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tlm.class || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tlm.term || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tlm.fileName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {tlm.uploadDate ? new Date(tlm.uploadDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{tlm.downloads || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/tlms/view/${tlm.id}`}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-100"
                            title="View"
                          >
                            <i className="fas fa-eye"></i>
                          </Link>
                          <button
                            onClick={() => handleDownload(tlm.id)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-100"
                            title="Download"
                          >
                            <i className="fas fa-download"></i>
                          </button>
                          <button
                            onClick={() => handleToggleStatus(tlm.id)}
                            className={`text-sm font-medium transition-colors duration-100 ${
                              status === 'Active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                            }`}
                            title={status === 'Active' ? 'Deactivate' : 'Activate'}
                          >
                            <i className={`fas fa-${status === 'Active' ? 'ban' : 'check'}`}></i>
                          </button>
                          <button
                            onClick={() => handleDelete(tlm.id)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition-colors duration-100"
                            title="Delete"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

