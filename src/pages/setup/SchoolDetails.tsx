import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import setupService from '../../services/setupService';
import { useModal } from '../../components/ModalProvider';

interface SchoolDetailsFormData {
  // Business/Institution Info
  institutionNameFull: string;
  institutionNameShort: string;
  smsName: string;
  address: string;
  contact: string;
  gpsAddress: string;
  location: string;
  googleMapAddress: string;
  emailAddress: string;
  facebookLink: string;
  instagramLink: string;
  twitterLink: string;
  loginBackground: File | null;
  loginBackgroundUrl?: string;
  logo: File | null;
  logoUrl?: string;
  // School Details (existing)
  schoolName: string;
  schoolCode: string;
  city: string;
  region: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  website: string;
  schoolType: string;
  establishedYear: string;
  schoolLogo: File | null;
  schoolLogoUrl?: string;
  schoolImage: File | null;
  schoolImageUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  motto: string;
  vision: string;
  mission: string;
  principalName: string;
  principalPhone: string;
  principalEmail: string;
  registrationNumber: string;
  // Current Period
  currentAcademicYear: string;
  academicYearStart: string;
  academicYearEnd: string;
  term: string;
  nextResumptionDate?: string;
  // Other Info
  currency: string;
  timezone: string;
  language: string;
}

const SchoolDetails: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<'school' | 'period' | 'other'>('school');
  const [formData, setFormData] = useState<SchoolDetailsFormData>({
    // Business/Institution Info
    institutionNameFull: 'Excelz International School',
    institutionNameShort: 'Excelz Int. School',
    smsName: 'EIS',
    address: 'Est Legon View, Behind Me',
    contact: '(+233) 030',
    gpsAddress: 'GK-0049-',
    location: 'Est Legon View, Behind Me',
    googleMapAddress: 'https://g.co/kgs/oJ7EBDA',
    emailAddress: 'excelzintsch@gmail.com',
    facebookLink: 'https://www.excelzintsch.',
    instagramLink: '',
    twitterLink: '',
    loginBackground: null,
    loginBackgroundUrl: '',
    logo: null,
    logoUrl: '',
    // School Details
    schoolName: 'Excelz International School',
    schoolCode: 'EIS001',
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
    schoolLogoUrl: '',
    schoolImage: null,
    schoolImageUrl: '',
    primaryColor: '#1e40af',
    secondaryColor: '#3b82f6',
    motto: '',
    vision: '',
    mission: '',
    principalName: '',
    principalPhone: '',
    principalEmail: '',
    registrationNumber: '',
    // Current Period
    currentAcademicYear: '2024/2025',
    academicYearStart: '',
    academicYearEnd: '',
    term: 'Term 3',
    nextResumptionDate: '',
    // Other Info
    currency: 'GHS',
    timezone: 'Africa/Accra',
    language: 'en'
  });

  const regions: string[] = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Central', 'Volta', 'Northern', 'Upper East', 'Upper West', 'Brong Ahafo', 'Western North', 'Ahafo', 'Bono', 'Bono East', 'Oti', 'North East', 'Savannah'];
  const schoolTypes: string[] = ['Private', 'Public', 'International', 'Mission'];
  const terms: string[] = ['First Term', 'Second Term', 'Third Term'];
  const currencies: string[] = ['GHS', 'USD', 'EUR', 'GBP'];
  const languages: string[] = ['en', 'fr', 'es', 'ar'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          if (name === 'loginBackground') {
            setFormData({
              ...formData,
              loginBackground: file,
              loginBackgroundUrl: result
            });
          } else if (name === 'logo') {
            setFormData({
              ...formData,
              logo: file,
              logoUrl: result
            });
          } else if (name === 'schoolLogo') {
            setFormData({
              ...formData,
              schoolLogo: file,
              schoolLogoUrl: result
            });
          } else if (name === 'schoolImage') {
            setFormData({
              ...formData,
              schoolImage: file,
              schoolImageUrl: result
            });
          }
        };
        reader.readAsDataURL(file);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Load school info on component mount
  useEffect(() => {
    const loadSchoolInfo = async (): Promise<void> => {
      try {
        const info = await setupService.getSchoolInfo();
        if (info) {
          setFormData(prev => ({ ...info, ...prev }));
        }
      } catch (error) {
        console.error('Error loading school info:', error);
      }
    };
    loadSchoolInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      await setupService.updateSchoolInfo(formData);
      toast.showSuccess('School details updated successfully!');
    } catch (error: any) {
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Update Business Details</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/setup" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">School Setup</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Business Details</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg p-4 sm:p-5 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveSection('school')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'school'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            School Details
          </button>
          <button
            onClick={() => setActiveSection('period')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'period'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Current Period info
          </button>
          <button
            onClick={() => setActiveSection('other')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeSection === 'other'
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Other Info
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200">
        <form onSubmit={handleSubmit}>
          {/* Current Period Info Section */}
          {activeSection === 'period' && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Set Current Academic Year
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="currentAcademicYear"
                      value={formData.currentAcademicYear}
                      onChange={handleChange}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Academic Year</option>
                      <option>2023/2024</option>
                      <option>2024/2025</option>
                      <option>2025/2026</option>
                      <option>2026/2027</option>
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
                    Set Current Academic Term
                  </label>
                  <div className="relative select-dropdown-wrapper">
                    <select
                      name="term"
                      value={formData.term}
                      onChange={handleChange}
                      className="select-dropdown w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] min-h-[44px]"
                    >
                      <option value="">Select Term</option>
                      {terms.map(term => (
                        <option key={term} value={term}>{term}</option>
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
                    Set Current Academic Start Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="academicYearStart"
                      value={formData.academicYearStart}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                    <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Set Current Academic End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="academicYearEnd"
                      value={formData.academicYearEnd}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                    <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Next Resumption Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="nextResumptionDate"
                      value={formData.nextResumptionDate || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                    <i className="fas fa-calendar absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* School Details Section - Business/Institution Info */}
          {activeSection === 'school' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Business/Institution Info</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-6">
                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Name of Institution (Full)
                  </label>
                  <input
                    type="text"
                    name="institutionNameFull"
                    value={formData.institutionNameFull}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Name of Institution (short)
                  </label>
                  <input
                    type="text"
                    name="institutionNameShort"
                    value={formData.institutionNameShort}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    SMS Name
                  </label>
                  <input
                    type="text"
                    name="smsName"
                    value={formData.smsName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Contact
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    GPS Address
                  </label>
                  <input
                    type="text"
                    name="gpsAddress"
                    value={formData.gpsAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Google Map Address
                  </label>
                  <input
                    type="url"
                    name="googleMapAddress"
                    value={formData.googleMapAddress}
                    onChange={handleChange}
                    placeholder="https://g.co/kgs/..."
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Facebook Link
                  </label>
                  <input
                    type="url"
                    name="facebookLink"
                    value={formData.facebookLink}
                    onChange={handleChange}
                    placeholder="Facebook Link"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Instagram Link
                  </label>
                  <input
                    type="url"
                    name="instagramLink"
                    value={formData.instagramLink}
                    onChange={handleChange}
                    placeholder="Instagram Link"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Twitter Link
                  </label>
                  <input
                    type="url"
                    name="twitterLink"
                    value={formData.twitterLink}
                    onChange={handleChange}
                    placeholder="Twitter Link"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>

              {/* File Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Login Background
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                      <i className="fas fa-upload mr-2"></i>
                      Choose File
                      <input
                        type="file"
                        name="loginBackground"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.loginBackground ? formData.loginBackground.name : 'No file chosen'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Logo
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors">
                      <i className="fas fa-upload mr-2"></i>
                      Choose File
                      <input
                        type="file"
                        name="logo"
                        onChange={handleChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      {formData.logo ? formData.logo.name : 'No file chosen'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Images Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Current Crest
                  </label>
                  <div className="border-2 border-gray-200 rounded-md p-4 bg-gray-50 flex items-center justify-center min-h-[200px]">
                    {formData.logoUrl || formData.schoolLogoUrl ? (
                      <img 
                        src={formData.logoUrl || formData.schoolLogoUrl} 
                        alt="Current Crest" 
                        className="max-w-full max-h-[180px] object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <i className="fas fa-image text-4xl mb-2"></i>
                        <p className="text-sm">No logo uploaded</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">
                    Current Background
                  </label>
                  <div className="border-2 border-gray-200 rounded-md p-4 bg-gray-50 flex items-center justify-center min-h-[200px]">
                    {formData.loginBackgroundUrl || formData.schoolImageUrl ? (
                      <img 
                        src={formData.loginBackgroundUrl || formData.schoolImageUrl} 
                        alt="Current Background" 
                        className="max-w-full max-h-[180px] object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <i className="fas fa-image text-4xl mb-2"></i>
                        <p className="text-sm">No background uploaded</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Info Section */}
          {activeSection === 'other' && (
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Other Information</h2>
              <p className="text-sm text-gray-600 mb-6">Configure additional school settings and preferences.</p>
              
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">System Settings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Currency <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      {currencies.map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Timezone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 font-semibold text-gray-900 text-sm">
                      Language <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                    >
                      <option value="en">English</option>
                      <option value="fr">French</option>
                      <option value="es">Spanish</option>
                      <option value="ar">Arabic</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  ...formData,
                  institutionNameFull: 'Excelz International School',
                  institutionNameShort: 'Excelz Int. School',
                  smsName: 'EIS',
                  address: 'Est Legon View, Behind Me',
                  contact: '(+233) 030',
                  gpsAddress: 'GK-0049-',
                  location: 'Est Legon View, Behind Me',
                  googleMapAddress: 'https://g.co/kgs/oJ7EBDA',
                  emailAddress: 'excelzintsch@gmail.com',
                  facebookLink: 'https://www.excelzintsch.',
                  instagramLink: '',
                  twitterLink: '',
                  currentAcademicYear: '2024/2025',
                  term: 'Term 3',
                  academicYearStart: '',
                  academicYearEnd: '',
                  nextResumptionDate: ''
                });
              }}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-green-500 rounded-md hover:bg-green-600 transition-all duration-300 flex items-center gap-2"
            >
              <i className="fas fa-redo"></i>
              Clear All
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
            >
              <i className="fas fa-save"></i>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SchoolDetails;
