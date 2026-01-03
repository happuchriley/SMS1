import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import PhotoUploadArea from '../../components/PhotoUploadArea';
import DateInput from '../../components/DateInput';
import staffService from '../../services/staffService';
import { useModal } from '../../components/ModalProvider';

const AddStaff = () => {
  const [activeTab, setActiveTab] = useState('basic-info');
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    staffId: 'Excelz Int. School/STF/0023',
    title: '',
    firstName: '',
    surname: '',
    otherNames: '',
    gender: '',
    dateOfBirth: '',
    address: '',
    qualification: '',
    contact: '',
    email: '',
    national: 'Ghana',
    countryOfResidence: 'Ghana',
    homeTown: '',
    currentCity: '',
    religion: '',
    category: '',
    photo: null
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({...formData, photo: file});
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (file, preview) => {
    if (file && preview) {
      setFormData({...formData, photo: file});
      setPhotoPreview(preview);
    } else {
      setFormData({...formData, photo: null});
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.surname) {
      toast.showError('First name and surname are required');
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert photo to base64 if present
      let photoData = null;
      if (formData.photo) {
        photoData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(formData.photo);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
      }

      // Prepare staff data
      const staffData = {
        ...formData,
        photo: photoData,
        employmentDate: formData.employmentDate || new Date().toISOString().split('T')[0],
        status: 'active'
      };

      await staffService.create(staffData);
      toast.showSuccess('Staff registered successfully!');
      
      // Reset form
      handleClear();
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/staff/all');
      }, 1000);
    } catch (error) {
      console.error('Error creating staff:', error);
      toast.showError(error.message || 'Failed to register staff. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      staffId: 'Excelz Int. School/STF/0023',
      title: '',
      firstName: '',
      surname: '',
      otherNames: '',
      gender: '',
      dateOfBirth: '',
      employmentDate: '',
      address: '',
      qualification: '',
      contact: '',
      email: '',
      national: 'Ghana',
      countryOfResidence: 'Ghana',
      homeTown: '',
      currentCity: '',
      religion: '',
      category: '',
      photo: null
    });
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Tab navigation handlers
  const handleNext = () => {
    const tabs = ['basic-info', 'next-of-kin', 'admin-info'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    const tabs = ['basic-info', 'next-of-kin', 'admin-info'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isLastTab = activeTab === 'admin-info';
  const isFirstTab = activeTab === 'basic-info';

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Add New Staff</h1>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
            <span>/</span>
            <span>Add New Staff</span>
          </div>
        </div>
        <Link 
          to="/staff/all" 
          className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-2 no-underline hover:-translate-y-0.5 hover:shadow-lg"
        >
          <i className="fas fa-users"></i> Staff List
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b-2 border-gray-200 mb-5">
        <button 
          className={`px-6 py-3.5 bg-transparent border-none border-b-3 border-transparent cursor-pointer text-sm font-semibold text-gray-600 transition-all duration-300 -mb-0.5 relative ${
            activeTab === 'basic-info' ? 'text-primary' : ''
          }`}
          onClick={() => setActiveTab('basic-info')}
        >
          Basic Information
          {activeTab === 'basic-info' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
          )}
        </button>
        <button 
          className={`px-6 py-3.5 bg-transparent border-none border-b-3 border-transparent cursor-pointer text-sm font-semibold text-gray-600 transition-all duration-300 -mb-0.5 relative ${
            activeTab === 'next-of-kin' ? 'text-primary' : ''
          }`}
          onClick={() => setActiveTab('next-of-kin')}
        >
          Next of Kin Info
          {activeTab === 'next-of-kin' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
          )}
        </button>
        <button 
          className={`px-6 py-3.5 bg-transparent border-none border-b-3 border-transparent cursor-pointer text-sm font-semibold text-gray-600 transition-all duration-300 -mb-0.5 relative ${
            activeTab === 'admin-info' ? 'text-primary' : ''
          }`}
          onClick={() => setActiveTab('admin-info')}
        >
          Admin Info
          {activeTab === 'admin-info' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
          )}
        </button>
      </div>

      {/* Basic Info Tab */}
      {activeTab === 'basic-info' && (
        <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Staff ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-gray-50 cursor-not-allowed" 
                  value={formData.staffId} 
                  readOnly 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Staff Title <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Staff Title *</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Miss</option>
                  <option>Dr.</option>
                  <option>Prof.</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Surname <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Surname *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Other Name(s) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="otherNames"
                  value={formData.otherNames}
                  onChange={handleChange}
                  placeholder="Other Name(s) *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Gender *</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <DateInput
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  placeholder="YYYY-MM-DD"
                  required
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Staff Address" 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Staff Qualification <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                >
                  <option value="">Staff Qualification *</option>
                  <option>B.Ed</option>
                  <option>M.Ed</option>
                  <option>Ph.D</option>
                  <option>Diploma</option>
                  <option>Certificate</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Contact <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Staff Contact *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Staff Email" 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">National</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="national"
                  value={formData.national}
                  onChange={handleChange}
                >
                  <option>Ghana</option>
                  <option>Nigeria</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Country of Residence</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="countryOfResidence"
                  value={formData.countryOfResidence}
                  onChange={handleChange}
                >
                  <option>Ghana</option>
                  <option>Nigeria</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Home Town <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="homeTown"
                  value={formData.homeTown}
                  onChange={handleChange}
                  required
                >
                  <option value="">Home Town *</option>
                  <option>Accra</option>
                  <option>Kumasi</option>
                  <option>Tamale</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Current City <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="currentCity"
                  value={formData.currentCity}
                  onChange={handleChange}
                  placeholder="Current City *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Religion</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="religion"
                  value={formData.religion}
                  onChange={handleChange}
                >
                  <option value="">Religion</option>
                  <option>Christianity</option>
                  <option>Islam</option>
                  <option>Other</option>
                </select>
                <div className="mt-5">
                  <label className="block mb-2 font-semibold text-gray-900 text-sm">Photo</label>
                  <PhotoUploadArea
                    onImageSelect={handleImageSelect}
                    currentPreview={photoPreview}
                  />
                  {/* Hidden file input for backward compatibility */}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Staff Category <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Staff Category *</option>
                  <option>Teacher</option>
                  <option>Administrator</option>
                  <option>Support Staff</option>
                  <option>Security</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!isFirstTab && (
                  <button 
                    type="button"
                    onClick={handlePrevious}
                    className="px-5 py-2.5 bg-transparent border-2 border-gray-300 text-gray-700 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400"
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => navigate('/staff/all')}
                  className="px-5 py-2.5 bg-transparent border-2 border-gray-200 text-gray-900 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <i className="fas fa-times"></i> Close
                </button>
                <button 
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2.5 bg-gray-200 text-gray-900 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:bg-gray-300"
                >
                  <i className="fas fa-redo"></i> Clear All
                </button>
              </div>
              <button 
                type={isLastTab ? "submit" : "button"}
                onClick={isLastTab ? undefined : handleNext}
                form={isLastTab ? undefined : undefined}
                disabled={isLastTab && isSubmitting}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastTab ? (
                  <>
                    <i className="fas fa-check"></i> Submit
                  </>
                ) : (
                  <>
                    Next <i className="fas fa-chevron-right"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Next of Kin Info Tab */}
      {activeTab === 'next-of-kin' && (
        <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Next of Kin Info</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Next of Kin Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  placeholder="Name *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Relationship <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  required
                >
                  <option value="">Select Relationship</option>
                  <option>Spouse</option>
                  <option>Parent</option>
                  <option>Sibling</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Contact <span className="text-red-500">*</span>
                </label>
                <input 
                  type="tel" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  placeholder="Contact *" 
                  required 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  placeholder="Email" 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Address</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  placeholder="Address" 
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {!isFirstTab && (
                  <button 
                    type="button"
                    onClick={handlePrevious}
                    className="px-5 py-2.5 bg-transparent border-2 border-gray-300 text-gray-700 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:bg-gray-50 hover:border-gray-400"
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => navigate('/staff/all')}
                  className="px-5 py-2.5 bg-transparent border-2 border-gray-200 text-gray-900 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:bg-gray-50"
                >
                  <i className="fas fa-times"></i> Close
                </button>
                <button 
                  type="button"
                  onClick={handleClear}
                  className="px-5 py-2.5 bg-gray-200 text-gray-900 rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:bg-gray-300"
                >
                  <i className="fas fa-redo"></i> Clear All
                </button>
              </div>
              <button 
                type={isLastTab ? "submit" : "button"}
                onClick={isLastTab ? undefined : handleNext}
                form={isLastTab ? undefined : undefined}
                disabled={isLastTab && isSubmitting}
                className="px-6 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLastTab ? (
                  <>
                    <i className="fas fa-check"></i> Submit
                  </>
                ) : (
                  <>
                    Next <i className="fas fa-chevron-right"></i>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Info Tab */}
      {activeTab === 'admin-info' && (
        <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Admin Info</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Department <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  required
                >
                  <option value="">Select Department</option>
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                  <option>Social Studies</option>
                  <option>Administration</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Employment Date</label>
                <DateInput
                  name="employmentDate"
                  value={formData.employmentDate || ''}
                  onChange={handleChange}
                  placeholder="YYYY-MM-DD"
                  className="text-sm"
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Status</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>On Leave</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-save"></i> {isSubmitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default AddStaff;
