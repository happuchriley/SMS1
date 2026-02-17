import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import staffService from '../services/staffService';
import studentsService from '../services/studentsService';
import { useModal } from '../components/ModalProvider';
import PhotoUploadArea from '../components/PhotoUploadArea';

interface UserInfo {
  firstName?: string;
  surname?: string;
  otherNames?: string;
  username?: string;
  email?: string;
  level?: string;
  status?: string;
  dateRegistered?: string;
  staffId?: string;
  studentId?: string;
  id?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const Profile: React.FC = () => {
  const { toast } = useModal();
  const username = sessionStorage.getItem('username') || 'Admin';
  const userType = sessionStorage.getItem('userType') || 'administrator';
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [showAccountSettings, setShowAccountSettings] = useState<boolean>(false);
  const [accountSettingsAction, setAccountSettingsAction] = useState<'image' | 'password' | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [passwordFormData, setPasswordFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingImage, setSavingImage] = useState<boolean>(false);
  const [changingPassword, setChangingPassword] = useState<boolean>(false);

  // Load profile image from storage
  useEffect(() => {
    const storedImage = localStorage.getItem(`profile_image_${username}`);
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, [username]);

  const loadUserInfo = useCallback(async () => {
    try {
      setLoading(true);
      if (userType === 'administrator' || userType === 'staff') {
        // Try to find staff member by username
        const allStaff = await staffService.getAll();
        const currentStaff = allStaff.find(s => 
          s.staffId === username || 
          s.email === username ||
          `${s.firstName} ${s.surname}` === username ||
          `${s.firstName} ${s.surname} ${s.otherNames || ''}`.trim() === username
        );
        
        if (currentStaff) {
          setUserInfo({
            ...currentStaff,
            firstName: currentStaff.firstName || '',
            surname: currentStaff.surname || '',
            otherNames: currentStaff.otherNames || '',
            username: currentStaff.staffId || username,
            email: currentStaff.email || '',
            level: userType === 'administrator' ? 'admin' : 'staff',
            status: currentStaff.status || 'active',
            dateRegistered: currentStaff.employmentDate || '15-Jul-2018 10:30'
          });
        } else {
          // Default admin info
          setUserInfo({
            firstName: username.split(' ')[0] || '',
            surname: username.split(' ')[1] || '',
            username: username,
            level: userType === 'administrator' ? 'admin' : 'staff',
            status: 'active',
            dateRegistered: '15-Jul-2018 10:30'
          });
        }
      } else if (userType === 'student') {
        const allStudents = await studentsService.getAll();
        const currentStudent = allStudents.find(s => 
          s.studentId === username || 
          s.email === username ||
          `${s.firstName} ${s.surname}` === username
        );
        
        if (currentStudent) {
          setUserInfo({
            ...currentStudent,
            firstName: currentStudent.firstName || '',
            surname: currentStudent.surname || '',
            otherNames: currentStudent.otherNames || '',
            username: currentStudent.studentId || username,
            email: currentStudent.email || '',
            level: 'student',
            status: currentStudent.status || 'active',
            dateRegistered: currentStudent.admissionDate || '15-Jul-2018 10:30'
          });
        }
      }
    } catch (error) {
      console.error('Error loading user info:', error);
      // Set default info
      setUserInfo({
        firstName: username.split(' ')[0] || '',
        surname: username.split(' ')[1] || '',
        username: username,
        level: userType,
        status: 'active'
      });
    } finally {
      setLoading(false);
    }
  }, [username, userType]);

  useEffect(() => {
    loadUserInfo();
  }, [loadUserInfo]);

  const handleImageSelect = (file: File | null, preview: string | null): void => {
    setProfileImageFile(file);
    setProfileImage(preview);
  };

  const handleSaveImage = async (): Promise<void> => {
    if (!profileImageFile && !profileImage) {
      toast.showError('Please select an image to upload');
      return;
    }

    setSavingImage(true);
    try {
      // Store image in localStorage (in a real app, you would upload to a server)
      if (profileImage) {
        localStorage.setItem(`profile_image_${username}`, profileImage);
        toast.showSuccess('Profile image updated successfully!');
        setAccountSettingsAction(null);
        setProfileImageFile(null);
      }
    } catch (error: any) {
      console.error('Error saving image:', error);
      toast.showError(error.message || 'Failed to save profile image');
    } finally {
      setSavingImage(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPasswordFormData({
      ...passwordFormData,
      [name]: value
    });
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!passwordFormData.currentPassword || !passwordFormData.newPassword || !passwordFormData.confirmPassword) {
      toast.showError('Please fill in all password fields');
      return;
    }

    if (passwordFormData.newPassword.length < 8) {
      toast.showError('New password must be at least 8 characters long');
      return;
    }

    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      toast.showError('New passwords do not match');
      return;
    }

    setChangingPassword(true);
    try {
      // In a real app, verify current password with backend
      // For now, we'll just store the new password
      const storedPassword = localStorage.getItem(`password_${username}`);
      
      // If a password exists, verify current password
      if (storedPassword && storedPassword !== passwordFormData.currentPassword) {
        toast.showError('Current password is incorrect');
        setChangingPassword(false);
        return;
      }

      // Store new password (in a real app, this would be sent to the backend)
      localStorage.setItem(`password_${username}`, passwordFormData.newPassword);
      
      toast.showSuccess('Password changed successfully!');
      setPasswordFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setAccountSettingsAction(null);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.showError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const fullName = `${userInfo.firstName || ''} ${userInfo.surname || ''} ${userInfo.otherNames || ''}`.trim() || username;
  const displayUsername = userInfo.username || username;
  const levelText = userType === 'administrator' ? 'ADMIN' : userType === 'staff' ? 'STAFF' : 'STUDENT';
  const statusText = userInfo.status === 'active' ? 'active' : 'inactive';
  const canUploadImage = userType === 'administrator' || userType === 'staff';

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              {userType === 'administrator' ? 'Admin' : userType === 'staff' ? 'Staff' : 'Student'} Profile - {fullName} ({displayUsername}) - {statusText}
            </h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{fullName}'s Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Profile Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            {/* Large User Icon */}
            <div className="flex justify-center mb-6">
              {profileImage ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <img 
                    src={profileImage} 
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-6xl text-gray-400"></i>
                </div>
              )}
            </div>

            {/* Name - Bold */}
            <div className="text-center mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{fullName}</h2>
            </div>

            {/* Username - Blue */}
            <div className="text-center mb-2">
              <p className="text-base text-primary-500 font-medium">{displayUsername.toUpperCase()}</p>
            </div>

            {/* Level */}
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 font-medium">LEVEL: {levelText}</p>
            </div>

            {/* Navigation Buttons - Small Rectangular */}
            {(userType === 'administrator' || userType === 'staff') && (
              <div className="space-y-2 mb-6">
                <Link
                  to="/staff/all"
                  className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
                >
                  <i className="fas fa-user mr-2"></i>
                  STAFFS
                </Link>
                <Link
                  to="/students/all"
                  className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                >
                  <i className="fas fa-users mr-2"></i>
                  STUDENTS
                </Link>
                <Link
                  to="/news/page"
                  className="flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors"
                >
                  <i className="fas fa-newspaper mr-2"></i>
                  NEWS
                </Link>
              </div>
            )}

            {/* Account Settings - Red Text */}
            <div className="text-center pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowAccountSettings(true);
                  setAccountSettingsAction('image');
                }}
                className="block w-full px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors mb-2"
              >
                Image/Password
              </button>
              <button
                onClick={() => {
                  setShowAccountSettings(true);
                  setAccountSettingsAction(null);
                }}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                Account Settings
              </button>
            </div>
          </div>
        </div>

        {/* Right Information Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
              About {fullName} ({displayUsername}) - {statusText}
            </h2>

            {/* Information Table - Two Column Layout */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">Basic Information</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-200 bg-gray-50">Info</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">First Name</span>
                        <span className="text-sm text-gray-900">{userInfo.firstName || ''}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Other Name</span>
                        <span className="text-sm text-gray-900">{userInfo.otherNames || userInfo.surname || 'Teye'}</span>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="px-4 py-3">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">User Name</span>
                        <span className="text-sm text-gray-900">{displayUsername}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="mb-2">
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Email</span>
                        <span className="text-sm text-gray-900">{userInfo.email || `${displayUsername}@gmail.com`}</span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Level</span>
                        <span className="text-sm text-gray-900">{userInfo.level || userType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-sm font-semibold text-gray-700 block mb-1">Date Registered</span>
                        <span className="text-sm text-gray-900">{userInfo.dateRegistered || '15-Jul-2018 10:30'}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                <button
                  onClick={() => {
                    setShowAccountSettings(false);
                    setAccountSettingsAction(null);
                    setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setProfileImageFile(null);
                    if (!profileImage || !localStorage.getItem(`profile_image_${username}`)) {
                      setProfileImage(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              {/* Action Selection */}
              {!accountSettingsAction && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">Select an action you want to take:</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {/* Profile Image Upload Option - Admin/Staff Only */}
                    {canUploadImage && (
                      <button
                        onClick={() => setAccountSettingsAction('image')}
                        className="w-full px-6 py-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                            <i className="fas fa-image text-primary-600 text-xl"></i>
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">Upload Profile Image</h3>
                            <p className="text-sm text-gray-500">Change your profile picture</p>
                          </div>
                        </div>
                        <i className="fas fa-chevron-right text-gray-400 group-hover:text-primary-500 transition-colors"></i>
                      </button>
                    )}

                    {/* Change Password Option - All Roles */}
                    <button
                      onClick={() => setAccountSettingsAction('password')}
                      className="w-full px-6 py-4 text-left border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                          <i className="fas fa-lock text-primary-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
                          <p className="text-sm text-gray-500">Update your account password</p>
                        </div>
                      </div>
                      <i className="fas fa-chevron-right text-gray-400 group-hover:text-primary-500 transition-colors"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Profile Image Upload Form */}
              {accountSettingsAction === 'image' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setAccountSettingsAction(null)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">Upload Profile Image</h3>
                  </div>
                  <PhotoUploadArea
                    onImageSelect={handleImageSelect}
                    currentPreview={profileImage || undefined}
                    label="Upload Profile Image"
                    required={false}
                  />
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setAccountSettingsAction(null);
                        setProfileImageFile(null);
                        if (!profileImage || !localStorage.getItem(`profile_image_${username}`)) {
                          setProfileImage(null);
                        }
                      }}
                      className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveImage}
                      disabled={savingImage || (!profileImageFile && !profileImage)}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingImage ? 'Saving...' : 'Save Image'}
                    </button>
                  </div>
                </div>
              )}

              {/* Password Change Form */}
              {accountSettingsAction === 'password' && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => {
                        setAccountSettingsAction(null);
                        setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <i className="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  </div>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        Current Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordFormData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordFormData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                      />
                      <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long</p>
                    </div>

                    <div>
                      <label className="block mb-2 font-semibold text-gray-900 text-sm">
                        Confirm New Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordFormData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountSettingsAction(null);
                          setPasswordFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        }}
                        className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-all duration-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {changingPassword ? 'Changing...' : 'Change Password'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Profile;
