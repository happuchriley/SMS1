import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

const SchoolDetails = () => {
  const { toast } = useModal();
  const [, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    schoolName: 'Excelz International School',
    schoolCode: 'EIS001',
    address: '',
    city: '',
    region: '',
    country: 'Ghana',
    postalCode: '',
    phone: '',
    email: '',
    website: '',
    schoolType: 'Private',
    establishedYear: '',
    schoolLogo: null,
    motto: '',
    vision: '',
    mission: '',
    principalName: '',
    principalPhone: '',
    principalEmail: ''
  });

  const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong Ahafo'];
  const schoolTypes = ['Private', 'Public', 'International', 'Mission'];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'schoolLogo') {
      setFormData({
        ...formData,
        schoolLogo: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const loadSchoolInfo = useCallback(async () => {
    try {
      const info = await setupService.getSchoolInfo();
      if (info) {
        setFormData(prev => ({ ...info, ...prev }));
      }
    } catch (error) {
      console.error('Error loading school info:', error);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setupService.updateSchoolInfo(formData);
      toast.showSuccess('School details updated successfully!');
    } catch (error) {
      console.error('Error updating school details:', error);
      toast.showError(error.message || 'Failed to update school details');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">School Details</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">School Details</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">School Information</h2>
          <p className="text-sm text-gray-600">Manage your school's basic information and details.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Basic Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    School Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    School Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="schoolCode"
                    value={formData.schoolCode}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    School Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="schoolType"
                    value={formData.schoolType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    {schoolTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Established Year</label>
                  <input
                    type="number"
                    name="establishedYear"
                    value={formData.establishedYear}
                    onChange={handleChange}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  >
                    <option value="">Select Region</option>
                    {regions.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* School Values */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">School Values</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Motto</label>
                  <input
                    type="text"
                    name="motto"
                    value={formData.motto}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Vision</label>
                  <textarea
                    name="vision"
                    value={formData.vision}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-none"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Mission</label>
                  <textarea
                    name="mission"
                    value={formData.mission}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Principal Information */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Principal Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Principal Name</label>
                  <input
                    type="text"
                    name="principalName"
                    value={formData.principalName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Principal Phone</label>
                  <input
                    type="tel"
                    name="principalPhone"
                    value={formData.principalPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Principal Email</label>
                  <input
                    type="email"
                    name="principalEmail"
                    value={formData.principalEmail}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>
            </div>

            {/* School Logo */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">School Logo</h3>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Upload Logo</label>
                <input
                  type="file"
                  name="schoolLogo"
                  onChange={handleChange}
                  accept="image/*"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                />
                <p className="mt-1 text-xs text-gray-500">Recommended size: 200x200px, Max size: 2MB</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <i className="fas fa-save mr-2"></i>
              Save School Details
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SchoolDetails;
