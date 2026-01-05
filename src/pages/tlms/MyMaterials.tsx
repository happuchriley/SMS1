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
  uploadDate?: string;
  downloads?: number;
  status?: string;
}

const MyMaterials: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  const loadMaterials = useCallback(async () => {
    try {
      setLoading(true);
      const username = sessionStorage.getItem('username');
      const myMaterials = await tlmsService.getMyMaterials(username);
      const allCategories = await tlmsService.getAllCategories();
      
      const materialsWithCategories = myMaterials.map(material => {
        const category = allCategories.find(cat => cat.id === material.categoryId);
        return {
          ...material,
          category: category?.name || 'Uncategorized'
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
        (material.subject && material.subject.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || material.categoryId === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [materials, searchTerm, filterCategory]);

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Material',
      message: 'Are you sure you want to delete this material? This action cannot be undone.',
      itemName: materials.find(m => m.id === id)?.title || 'this material',
      onConfirm: async () => {
        try {
          await tlmsService.deleteTlm(id);
          toast.showSuccess('Material deleted successfully');
          await loadMaterials();
        } catch (error: any) {
          console.error('Error deleting material:', error);
          toast.showError(error.message || 'Failed to delete material');
        }
      }
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My TLMs</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">My TLMs</span>
            </div>
          </div>
          <Link
            to="/tlms/upload"
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
                placeholder="Search materials..."
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
        </div>
      </div>

      {/* Materials Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading materials...</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-user-book text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No materials found.</p>
          <Link
            to="/tlms/upload"
            className="inline-block px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            <i className="fas fa-upload mr-2"></i>Upload Your First Material
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-striped">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Category</th>
                  <th>Subject</th>
                  <th>File Size</th>
                  <th>Downloads</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMaterials.map(material => (
                  <tr key={material.id}>
                    <td>
                      <div className="text-sm font-medium">{material.title}</div>
                      <div className="text-xs text-gray-500">{material.level || 'N/A'}</div>
                    </td>
                    <td className="whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {material.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-sm">{material.subject || 'N/A'}</td>
                    <td className="whitespace-nowrap text-sm">
                      {material.fileSize ? `${(material.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap text-sm">{material.downloads || 0}</td>
                    <td className="whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        material.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {material.status || 'active'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/tlms/view/${material.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-3 transition-colors duration-100"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-100"
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

export default MyMaterials;

