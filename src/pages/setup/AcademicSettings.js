import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

const AcademicSettings = () => {
  const { toast } = useModal();
  const [, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentAcademicYear: '2024/2025',
    currentTerm: '1st Term',
    termStartDate: '2024-01-08',
    termEndDate: '2024-04-05',
    nextTermStartDate: '2024-04-22',
    gradingSystem: 'percentage',
    passingGrade: '50',
    maxClassSize: '30',
    enablePromotion: true,
    enableAutomaticPromotion: false
  });

  const academicYears = ['2023/2024', '2024/2025', '2025/2026'];
  const terms = ['1st Term', '2nd Term', '3rd Term'];
  const gradingSystems = ['Percentage', 'Letter Grade', 'GPA'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const loadSettings = useCallback(async () => {
    try {
      const settings = await setupService.getAcademicSettings();
      if (settings) {
        setFormData(prev => ({ ...settings, ...prev }));
      }
    } catch (error) {
      console.error('Error loading academic settings:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setupService.updateAcademicSettings(formData);
      toast.showSuccess('Academic settings updated successfully!');
    } catch (error) {
      console.error('Error updating academic settings:', error);
      toast.showError(error.message || 'Failed to update academic settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Academic Settings</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Academic Settings</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Configure Academic Settings</h2>
          <p className="text-sm text-gray-600">Set up academic year, terms, grading system, and other academic parameters.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Academic Year & Term */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Academic Year & Term</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Current Academic Year <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currentAcademicYear"
                    value={formData.currentAcademicYear}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {academicYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Current Term <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="currentTerm"
                    value={formData.currentTerm}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {terms.map(term => (
                      <option key={term} value={term}>{term}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Term Dates */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Term Dates</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Term Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="termStartDate"
                    value={formData.termStartDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Term End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="termEndDate"
                    value={formData.termEndDate}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Next Term Start Date
                  </label>
                  <input
                    type="date"
                    name="nextTermStartDate"
                    value={formData.nextTermStartDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* Grading System */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Grading System</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Grading System <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gradingSystem"
                    value={formData.gradingSystem}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {gradingSystems.map(system => (
                      <option key={system} value={system.toLowerCase().replace(/\s+/g, '-')}>{system}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Passing Grade (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="passingGrade"
                    value={formData.passingGrade}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Maximum Class Size
                  </label>
                  <input
                    type="number"
                    name="maxClassSize"
                    value={formData.maxClassSize}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* Promotion Settings */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Promotion Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enablePromotion"
                    checked={formData.enablePromotion}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3"
                  />
                  <span className="text-sm text-gray-900 font-medium">Enable Student Promotion</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableAutomaticPromotion"
                    checked={formData.enableAutomaticPromotion}
                    onChange={handleChange}
                    disabled={!formData.enablePromotion}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500 mr-3 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-900 font-medium">Enable Automatic Promotion</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default AcademicSettings;


