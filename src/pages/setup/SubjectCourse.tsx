import React, { useState, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface SubjectFormData {
  nameFull: string;
  nameShort: string;
  category: string;
  classStage: string;
  status: string;
}

const SubjectCourse: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [classes, setClasses] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<SubjectFormData>({
    nameFull: '',
    nameShort: '',
    category: '',
    classStage: '',
    status: ''
  });

  const statusOptions: string[] = ['Active', 'Inactive'];

  const loadClasses = useCallback(async () => {
    try {
      const allClasses = await setupService.getAllClasses();
      setClasses(allClasses.map((c: any) => c.name || c.className).filter(Boolean));
    } catch (error) {
      console.error('Error loading classes:', error);
      // Fallback to default classes
      setClasses(['Nursery 1', 'Nursery 2', 'Basic 1', 'Basic 2', 'Basic 3', 'Basic 4', 'Basic 5', 'Basic 6', 'JHS 1', 'JHS 2', 'JHS 3']);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleReset = (): void => {
    setFormData({
      nameFull: '',
      nameShort: '',
      category: '',
      classStage: '',
      status: ''
    });
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.nameFull || !formData.nameShort || !formData.category || !formData.classStage || !formData.status) {
      toast.showError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await setupService.createSubject({
        name: formData.nameFull,
        code: formData.nameShort
      });
      toast.showSuccess('Subject/Course created successfully!');
      handleReset();
    } catch (error: any) {
      console.error('Error saving subject:', error);
      toast.showError(error.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Setup Page
            </h1>
            <p className="text-sm text-gray-600">(Stages/Classes/Subjects/Courses/Bill Items/Bills)</p>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm mt-2">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Setup Page (Stages/Classes/Subjects/Courses/Bill Items/Bills)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-5 md:p-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-3 sm:gap-4 mb-6 border-b border-gray-200 pb-4">
          <Link
            to="/setup/item-setup"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            New Class/Stage
          </Link>
          <button
            className="px-4 py-2 text-sm font-medium bg-primary-100 text-primary-700 border-2 border-primary-500 rounded-md"
          >
            Create New Subject/Course
          </button>
          <Link
            to="/setup/bill-item"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            Setup New Bill
          </Link>
          <Link
            to="/setup/item-setup"
            className="px-4 py-2 text-sm font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 transition-all duration-300 rounded-md"
          >
            New Account Code
          </Link>
        </div>

        {/* Subject/Course Form */}
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Subject Name (Full) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameFull"
                  value={formData.nameFull}
                  onChange={handleChange}
                  placeholder="Enter subject name full"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Subject Name (Short) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nameShort"
                  value={formData.nameShort}
                  onChange={handleChange}
                  placeholder="Enter subject name short"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Enter subject cate"
                  required
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Class/Stage <span className="text-red-500">*</span>
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="classStage"
                    value={formData.classStage}
                    onChange={handleChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select Class/St</option>
                    {classes.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  <div className="select-dropdown-arrow">
                    <div className="select-dropdown-arrow-icon">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="relative select-dropdown-wrapper">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                  >
                    <option value="">Select Status</option>
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <div className="select-dropdown-arrow">
                    <div className="select-dropdown-arrow-icon">
                      <i className="fas fa-chevron-down"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-md hover:bg-red-600 transition-all duration-300 flex items-center gap-2"
              >
                <i className="fas fa-redo"></i>
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-save"></i>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SubjectCourse;
