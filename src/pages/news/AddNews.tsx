import React, { useState } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import newsService from '../../services/newsService';
import { useModal } from '../../components/ModalProvider';

interface FormData {
  title: string;
  category: string;
  content: string;
  publishDate: string;
  status: string;
  targetAudience: string;
}

const AddNews: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useModal();
  const [, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    category: '',
    content: '',
    publishDate: '',
    status: 'draft',
    targetAudience: 'all'
  });

  const categories: string[] = ['General', 'Academic', 'Sports', 'Events', 'Announcements', 'Other'];
  const targetAudiences: string[] = ['All', 'Students', 'Parents', 'Staff', 'Students & Parents'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.content) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await newsService.createNews({
        ...formData,
        publishDate: formData.publishDate || new Date().toISOString().split('T')[0]
      });
      toast.showSuccess('News/Notice added successfully!');
      navigate('/news/manage');
    } catch (error: any) {
      console.error('Error adding news:', error);
      toast.showError(error.message || 'Failed to add news');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({
      title: '',
      category: '',
      content: '',
      publishDate: '',
      status: 'draft',
      targetAudience: 'all'
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Add News/Notice</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/news" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">News/Notices</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Add News/Notice</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Create News/Notice</h2>
          <p className="text-sm text-gray-600">Add new news or notice to publish.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter news/notice title"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Target Audience
              </label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {targetAudiences.map(audience => (
                  <option key={audience} value={audience.toLowerCase().replace(/\s+/g, '-')}>{audience}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Publish Date
              </label>
              <input
                type="datetime-local"
                name="publishDate"
                value={formData.publishDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={10}
                required
                placeholder="Enter news/notice content..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-vertical"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClear}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Clear
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              {formData.status === 'published' ? 'Publish' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AddNews;

