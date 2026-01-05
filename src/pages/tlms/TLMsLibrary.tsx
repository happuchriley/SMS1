import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import tlmsService from '../../services/tlmsService';
import { useModal } from '../../components/ModalProvider';

interface Material {
  id: string;
  title: string;
  categoryId?: string;
  category?: string;
  subject?: string;
  level?: string;
  fileSize?: number;
  fileName?: string;
  downloads?: number;
  uploadDate?: string;
  uploadedBy?: string;
  author?: string;
  description?: string;
  tags?: string[];
  status?: string;
}

const TLMsLibrary: React.FC = () => {
  const { toast } = useModal();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const subjects: string[] = ['All Subjects', 'Mathematics', 'English', 'Science', 'ICT', 'Social Studies', 'Other'];

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const allMaterials = await tlmsService.getAll();
      const allCategories = await tlmsService.getAllCategories();
      
      // Map category IDs to names
      const materialsWithCategories = allMaterials.map(material => {
        const category = allCategories.find(cat => cat.id === material.categoryId);
        return {
          ...material,
          category: category?.name || 'Uncategorized',
          author: material.uploadedBy || 'Unknown',
          uploadDate: material.uploadDate || new Date().toISOString()
        };
      });
      
      setMaterials(materialsWithCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading materials:', error);
      toast.showError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(material => {
      const matchesSearch = 
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (material.author && material.author.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (material.description && material.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (material.tags && material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesCategory = filterCategory === 'all' || material.categoryId === filterCategory;
      const matchesSubject = filterSubject === 'all' || material.subject === filterSubject;
      return matchesSearch && matchesCategory && matchesSubject;
    });
  }, [materials, searchTerm, filterCategory, filterSubject]);

  const handleDownload = async (id: string) => {
    try {
      await tlmsService.downloadTlm(id);
      toast.showSuccess('Download started');
      await loadMaterials(); // Refresh to update download count
    } catch (error: any) {
      console.error('Error downloading material:', error);
      toast.showError(error.message || 'Failed to download material');
    }
  };

  const getFileIcon = (category: string): string => {
    switch (category) {
      case 'Videos': return 'fa-video text-red-600';
      case 'Textbooks': return 'fa-book text-blue-600';
      case 'Guides': return 'fa-book-open text-green-600';
      case 'Manuals': return 'fa-file-alt text-purple-600';
      case 'Worksheets': return 'fa-file-pdf text-yellow-600';
      default: return 'fa-file text-gray-600';
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">TLMs Library</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">TLMs Library</span>
            </div>
          </div>
          <Link
            to="/tlms/upload"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-upload mr-2"></i>Upload Material
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {subjects.map(subj => (
                <option key={subj} value={subj === 'All Subjects' ? 'all' : subj}>{subj}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-book text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No materials found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredMaterials.map(material => (
            <div key={material.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <i className={`fas ${getFileIcon(material.category || 'Other')} text-3xl`}></i>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {material.category || 'Uncategorized'}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{material.title}</h3>
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-book mr-2"></i>Subject:</span>
                    <span className="font-medium">{material.subject}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-layer-group mr-2"></i>Level:</span>
                    <span className="font-medium">{material.level}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-user mr-2"></i>Author:</span>
                    <span className="font-medium">{material.author}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-hdd mr-2"></i>Size:</span>
                    <span className="font-medium">
                      {material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span><i className="fas fa-download mr-2"></i>Downloads:</span>
                    <span className="font-medium">{material.downloads || 0}</span>
                  </div>
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleDownload(material.id)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors duration-100"
                  >
                    <i className="fas fa-download mr-1"></i>Download
                  </button>
                  <Link
                    to={`/tlms/view/${material.id}`}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-100"
                  >
                    <i className="fas fa-eye"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default TLMsLibrary;

