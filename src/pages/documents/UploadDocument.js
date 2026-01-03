import React, { useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import documentsService from '../../services/documentsService';
import { useModal } from '../../components/ModalProvider';

const UploadDocument = () => {
  const navigate = useNavigate();
  const { toast } = useModal();
  const [, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    documentTitle: '',
    documentCategory: '',
    description: '',
    file: null,
    accessLevel: 'private'
  });

  const accessLevels = ['Private', 'Staff Only', 'Public'];

  const loadCategories = useCallback(async () => {
    try {
      const cats = await documentsService.getAllCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.name === 'file') {
      setFormData({
        ...formData,
        file: e.target.files[0]
      });
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.documentTitle || !formData.documentCategory || !formData.file) {
      toast.showError('Please fill in all required fields and upload a file.');
      return;
    }

    setLoading(true);
    try {
      await documentsService.uploadDocument({
        title: formData.documentTitle,
        categoryId: formData.documentCategory,
        description: formData.description || '',
        file: formData.file,
        isShared: formData.accessLevel === 'Public' || formData.accessLevel === 'Staff Only',
        accessLevel: formData.accessLevel
      });
      toast.showSuccess('Document uploaded successfully!');
      handleClear();
      navigate('/documents/my-documents');
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.showError(error.message || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      documentTitle: '',
      documentCategory: '',
      description: '',
      file: null,
      accessLevel: 'private'
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Upload Document</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/documents" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">My Documents</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Upload Document</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Upload New Document</h2>
          <p className="text-sm text-gray-600">Upload and manage your personal documents.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="documentTitle"
                value={formData.documentTitle}
                onChange={handleChange}
                placeholder="Enter document title"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="documentCategory"
                value={formData.documentCategory}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Access Level
              </label>
              <select
                name="accessLevel"
                value={formData.accessLevel}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                {accessLevels.map(level => (
                  <option key={level} value={level.toLowerCase().replace(/\s+/g, '-')}>{level}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Upload File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  name="file"
                  onChange={handleChange}
                  required
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600">
                    {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, XLS, Images (Max 10MB)</p>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Enter document description..."
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
              <i className="fas fa-upload mr-2"></i>
              Upload Document
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UploadDocument;


