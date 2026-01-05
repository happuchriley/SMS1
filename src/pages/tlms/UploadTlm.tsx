import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import tlmsService from '../../services/tlmsService';
import { useModal } from '../../components/ModalProvider';

interface Category {
  id: string;
  name: string;
  [key: string]: any;
}

interface FormData {
  title: string;
  subject: string;
  class: string;
  term: string;
  academicYear: string;
  file: File | null;
  description: string;
  category?: string;
}

const UploadTlm: React.FC = () => {
  const { toast } = useModal();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    subject: '',
    class: '',
    term: '',
    academicYear: '',
    file: null,
    description: '',
    category: ''
  });

  const subjects: string[] = ['Mathematics', 'English', 'Science', 'Social Studies', 'French', 'ICT', 'Religious Studies'];
  const classes: string[] = ['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3'];
  const terms: string[] = ['1st Term', '2nd Term', '3rd Term'];
  const academicYears: string[] = ['2023/2024', '2024/2025', '2025/2026'];

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    if (e.target.name === 'file' && e.target instanceof HTMLInputElement && e.target.files) {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.title || !formData.subject || !formData.class || !formData.term || !formData.academicYear || !formData.file) {
      toast.showError('Please fill in all required fields and upload a file.');
      return;
    }

    setLoading(true);
    try {
      await tlmsService.uploadTlm({
        title: formData.title,
        subject: formData.subject,
        class: formData.class,
        term: formData.term,
        academicYear: formData.academicYear,
        description: formData.description || '',
        file: formData.file,
        categoryId: formData.category || undefined
      });
      toast.showSuccess('TLM uploaded successfully!');
      handleClear();
    } catch (error: any) {
      console.error('Error uploading TLM:', error);
      toast.showError(error.message || 'Failed to upload TLM');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = (): void => {
    setFormData({
      title: '',
      subject: '',
      class: '',
      term: '',
      academicYear: '',
      file: null,
      description: '',
      category: ''
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Upload TLM</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/tlms" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">TLMs</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Upload TLM</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Upload Teaching and Learning Material</h2>
          <p className="text-sm text-gray-600">Upload teaching and learning materials for teachers and students.</p>
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
                placeholder="Enter TLM title"
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
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
                {subjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                name="class"
                value={formData.class}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Term <span className="text-red-500">*</span>
              </label>
              <select
                name="term"
                value={formData.term}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Term</option>
                {terms.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-900 text-sm">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              >
                <option value="">Select Academic Year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
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
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
                  <p className="text-sm text-gray-600">
                    {formData.file ? formData.file.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, PPT, XLS, Images (Max 10MB)</p>
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
                rows={4}
                placeholder="Enter description of the TLM..."
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
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="fas fa-upload mr-2"></i>
              Upload TLM
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default UploadTlm;

