import React, { useState, useRef } from 'react';
import Layout from '../../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import PhotoUploadArea from '../../components/PhotoUploadArea';
import DateInput from '../../components/DateInput';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const AddStudent = () => {
  const [activeTab, setActiveTab] = useState('basic-info');
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);
  const { toast } = useModal();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentId: 'Excelz Int. School',
    existingId: '',
    firstName: '',
    surname: '',
    otherNames: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: '',
    address: '',
    contact: '',
    email: '',
    national: 'Ghana',
    countryOfResidence: 'Ghana',
    homeTown: '',
    currentCity: '',
    religion: '',
    feeType: '',
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

      // Prepare student data
      const studentData = {
        ...formData,
        photo: photoData,
        admissionDate: formData.admissionDate || new Date().toISOString().split('T')[0],
        status: 'active'
      };

      await studentsService.create(studentData);
      toast.showSuccess('Student registered successfully!');
      
      // Reset form
      handleClear();
      
      // Navigate after a short delay
      setTimeout(() => {
        navigate('/students/all');
      }, 1000);
    } catch (error) {
      console.error('Error creating student:', error);
      toast.showError(error.message || 'Failed to register student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFormData({
      studentId: 'Excelz Int. School',
      existingId: '',
      firstName: '',
      surname: '',
      otherNames: '',
      gender: '',
      dateOfBirth: '',
      admissionDate: '',
      bloodGroup: '',
      allergies: '',
      address: '',
      contact: '',
      email: '',
      national: 'Ghana',
      countryOfResidence: 'Ghana',
      homeTown: '',
      currentCity: '',
      religion: '',
      feeType: '',
      photo: null
    });
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Tab navigation handlers
  const handleNext = () => {
    const tabs = ['basic-info', 'guardian-info', 'admin-info'];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
      // Scroll to top of form
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    const tabs = ['basic-info', 'guardian-info', 'admin-info'];
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Add New Student</h1>
          <div className="flex items-center gap-2 text-gray-600 text-sm">
            <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
            <span>/</span>
            <span>Add New Student</span>
          </div>
        </div>
        <Link 
          to="/students/all" 
          className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center gap-2 no-underline hover:-translate-y-0.5 hover:shadow-lg"
        >
          <i className="fas fa-users"></i> Students List
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
          Basic Info
          {activeTab === 'basic-info' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></span>
          )}
        </button>
        <button 
          className={`px-6 py-3.5 bg-transparent border-none border-b-3 border-transparent cursor-pointer text-sm font-semibold text-gray-600 transition-all duration-300 -mb-0.5 relative ${
            activeTab === 'guardian-info' ? 'text-primary' : ''
          }`}
          onClick={() => setActiveTab('guardian-info')}
        >
          Guardian Info
          {activeTab === 'guardian-info' && (
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
            <h3 className="text-lg font-semibold text-gray-900">Basic Info</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Student ID <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-gray-50 cursor-not-allowed" 
                  value={formData.studentId} 
                  readOnly 
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Existing ID</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="existingId" 
                  value={formData.existingId} 
                  onChange={handleChange} 
                  placeholder="Existing Student ID" 
                />
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
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
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
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Blood Group/type</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="bloodGroup" 
                  value={formData.bloodGroup} 
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                  <option>O+</option>
                  <option>O-</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Allergies</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="allergies" 
                  value={formData.allergies} 
                  onChange={handleChange} 
                  placeholder="Allergies if any" 
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
                  placeholder="Student Address" 
                />
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
                  placeholder="Student Contact *" 
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
                  placeholder="Student Email" 
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
                  Home town <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="homeTown" 
                  value={formData.homeTown} 
                  onChange={handleChange} 
                  placeholder="Home Town *" 
                  required 
                />
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
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Fee/Scholarship</label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  name="feeType" 
                  value={formData.feeType} 
                  onChange={handleChange}
                >
                  <option value="">Select fee type</option>
                  <option>Full Fee</option>
                  <option>Scholarship</option>
                  <option>Partial Scholarship</option>
                </select>
              </div>
              <div>
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
                  onClick={() => navigate('/students/all')}
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
                className="px-6 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
              >
                {isLastTab ? (
                  <>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i> Submit
                      </>
                    )}
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

      {/* Guardian Info Tab */}
      {activeTab === 'guardian-info' && (
        <div className="bg-white rounded-lg p-5 md:p-7 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex justify-between items-center mb-5 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Guardian Info</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">
                  Guardian Name <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  placeholder="Guardian Name *" 
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
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Guardian</option>
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
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Occupation</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  placeholder="Occupation" 
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
                  onClick={() => navigate('/students/all')}
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
                className="px-6 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 hover:shadow-lg hover:-translate-y-0.5 w-full sm:w-auto"
              >
                {isLastTab ? (
                  <>
                    {isSubmitting ? (
                      <>
                        <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check mr-2"></i> Submit
                      </>
                    )}
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
                  Class <span className="text-red-500">*</span>
                </label>
                <select 
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5" 
                  required
                >
                  <option value="">Select Class</option>
                  <option>Basic 1</option>
                  <option>Basic 2</option>
                  <option>Basic 3</option>
                  <option>Basic 4</option>
                  <option>Basic 5</option>
                  <option>Basic 6</option>
                  <option>Basic 7</option>
                  <option>Basic 8</option>
                  <option>Basic 9</option>
                  <option>KG 2</option>
                  <option>Nursery 2</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold text-gray-900 text-sm">Admission Date</label>
                <DateInput
                  name="admissionDate"
                  value={formData.admissionDate || ''}
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
                  <option>Graduated</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-primary-500 text-white rounded-md text-sm font-semibold cursor-pointer transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> Save
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};

export default AddStudent;
