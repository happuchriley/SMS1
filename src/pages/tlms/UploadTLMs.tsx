import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import tlmsService from '../../services/tlmsService';
import { useModal } from '../../components/ModalProvider';

interface FormData {
  title: string;
  categoryId: string;
  subject: string;
  level: string;
  description: string;
  file: File | null;
  tags: string;
}

interface Category {
  id: string;
  name: string;
}

const UploadTLMs: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    categoryId: '',
    subject: '',
    level: '',
    description: '',
    file: null,
    tags: ''
  });

  const loadCategories = useCallback(async () => {
    try {
      const cats = await tlmsService.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const subjects: string[] = ['Mathematics', 'English', 'Science', 'ICT', 'Social Studies', 'Other'];
  const levels: string[] = ['All Levels', 'Nursery', 'Primary', 'JHS'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    if (name === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.title || !formData.categoryId || !formData.file) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      await tlmsService.uploadTlm({
        title: formData.title,
        categoryId: formData.categoryId,
        subject: formData.subject || '',
        level: formData.level || '',
        description: formData.description || '',
        file: formData.file,
        tags: tagsArray,
        status: 'active'
      });
      
      toast.showSuccess('TLM uploaded successfully!');
      navigate('/tlms/library');
    } catch (error: any) {
      console.error('Error uploading TLM:', error);
      toast.showError(error.message || 'Failed to upload TLM');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Upload TLMs</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Upload TLMs</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Material Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter material title"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-100 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Subject <span className="text-red-500">*</span>
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Subject</option>
                {subjects.map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Level</option>
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Enter material description"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Upload File <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                name="file"
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <p className="mt-1 text-xs text-gray-500">Max file size: 500MB. Supported formats: PDF, DOC, DOCX, XLS, XLSX, MP4, AVI</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <p className="mt-1 text-xs text-gray-500">Separate tags with commas (e.g., grade1, mathematics, worksheets)</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <Link
              to="/tlms/library"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-100 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-upload mr-2"></i>
              {loading ? 'Uploading...' : 'Upload Material'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UploadTLMs;

