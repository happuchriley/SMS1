import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import tlmsService from '../../services/tlmsService';
import { useModal } from '../../components/ModalProvider';

interface Category {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  materialCount?: number;
}

interface FormData {
  name: string;
  description: string;
  active: boolean;
}

const TLMsCategories: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    active: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const cats = await tlmsService.getAllCategories();
      // Get material count for each category
      const catsWithCount = await Promise.all(cats.map(async (cat) => {
        const materials = await tlmsService.getByCategory(cat.id);
        return { ...cat, materialCount: materials.length };
      }));
      setCategories(catsWithCount);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.showError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await tlmsService.updateCategory(editingCategory.id, formData);
        toast.showSuccess('Category updated successfully');
      } else {
        await tlmsService.createCategory(formData);
        toast.showSuccess('Category created successfully');
      }
      await loadCategories();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving category:', error);
      toast.showError(error.message || 'Failed to save category');
    }
  };

  const handleEdit = (category: Category): void => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      active: category.active !== false
    });
    setShowModal(true);
  };

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Category',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      itemName: categories.find(c => c.id === id)?.name || 'this category',
      onConfirm: async () => {
        try {
          await tlmsService.deleteCategory(id);
          toast.showSuccess('Category deleted successfully');
          await loadCategories();
        } catch (error: any) {
          console.error('Error deleting category:', error);
          toast.showError(error.message || 'Failed to delete category');
        }
      }
    });
  };

  const handleCloseModal = (): void => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '', active: true });
  };

  const handleAddNew = (): void => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', active: true });
    setShowModal(true);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">TLMs Categories</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">TLMs Categories</span>
            </div>
          </div>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Add Category
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading categories...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {categories.map(category => (
            <div key={category.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <i className="fas fa-folder text-primary-500 text-3xl"></i>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.materialCount || 0} materials</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  category.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {category.active !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{category.description || 'No description'}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="flex-1 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>Edit
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-none"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                    />
                    <span className="text-sm text-gray-900 font-medium">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300"
                  >
                    {editingCategory ? 'Update' : 'Add'} Category
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default TLMsCategories;

