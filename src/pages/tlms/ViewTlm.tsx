import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link, useParams } from 'react-router-dom';
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
  fileSize?: number;
  description?: string;
  categoryId?: string;
  category?: string;
  uploadedBy?: string;
}

const ViewTlm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useModal();
  const [tlm, setTlm] = useState<TlmItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [relatedTlms, setRelatedTlms] = useState<TlmItem[]>([]);

  const loadTlm = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const tlmData = await tlmsService.getById(id);
      const allCategories = await tlmsService.getAllCategories();
      const category = allCategories.find(cat => cat.id === tlmData.categoryId);
      
      setTlm({
        ...tlmData,
        category: category?.name || 'Uncategorized'
      });
      
      // Load related TLMs from same category
      if (tlmData.categoryId) {
        const related = await tlmsService.getByCategory(tlmData.categoryId);
        setRelatedTlms(related.filter(t => t.id !== id).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading TLM:', error);
      toast.showError('Failed to load TLM');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadTlm();
  }, [loadTlm]);

  const handleDownload = async (): Promise<void> => {
    if (!tlm) return;
    try {
      await tlmsService.downloadTlm(tlm.id);
      toast.showSuccess('Download started');
      await loadTlm();
    } catch (error: any) {
      console.error('Error downloading TLM:', error);
      toast.showError(error.message || 'Failed to download TLM');
    }
  };

  const getFileIcon = (fileName?: string): string => {
    if (!fileName) return 'fa-file text-gray-600';
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    if (['pdf'].includes(extension)) return 'fa-file-pdf text-red-600';
    if (['doc', 'docx'].includes(extension)) return 'fa-file-word text-blue-600';
    if (['ppt', 'pptx'].includes(extension)) return 'fa-file-powerpoint text-orange-600';
    if (['xls', 'xlsx'].includes(extension)) return 'fa-file-excel text-green-600';
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'fa-file-image text-purple-600';
    return 'fa-file text-gray-600';
  };

  if (loading) {
    return (
      <Layout>
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading TLM...</p>
        </div>
      </Layout>
    );
  }

  if (!tlm) {
    return (
      <Layout>
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-exclamation-triangle text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">TLM not found.</p>
          <Link
            to="/tlms/library"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            Back to Library
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">{tlm.title}</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <Link to="/tlms/library" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Library</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{tlm.title}</span>
            </div>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            <i className="fas fa-download mr-2"></i>Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-5 md:p-6">
            <div className="flex items-start gap-4 mb-6">
              <i className={`fas ${getFileIcon(tlm.fileName)} text-4xl`}></i>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{tlm.title}</h2>
                <div className="flex flex-wrap gap-2">
                  {tlm.category && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {tlm.category}
                    </span>
                  )}
                  {tlm.subject && (
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                      {tlm.subject}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {tlm.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-sm text-gray-600">{tlm.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-500 mb-1">File Name</p>
                <p className="text-sm font-medium text-gray-900">{tlm.fileName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">File Size</p>
                <p className="text-sm font-medium text-gray-900">
                  {tlm.fileSize ? `${(tlm.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Upload Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {tlm.uploadDate ? new Date(tlm.uploadDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Downloads</p>
                <p className="text-sm font-medium text-gray-900">{tlm.downloads || 0}</p>
              </div>
              {tlm.uploadedBy && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Uploaded By</p>
                  <p className="text-sm font-medium text-gray-900">{tlm.uploadedBy}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Related Materials</h3>
            {relatedTlms.length === 0 ? (
              <p className="text-sm text-gray-500">No related materials found.</p>
            ) : (
              <div className="space-y-3">
                {relatedTlms.map(related => (
                  <Link
                    key={related.id}
                    to={`/tlms/view/${related.id}`}
                    className="block p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors duration-100"
                  >
                    <p className="text-sm font-medium text-gray-900 mb-1">{related.title}</p>
                    <p className="text-xs text-gray-500">{related.category || 'Uncategorized'}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewTlm;

