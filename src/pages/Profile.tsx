import React from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  const username = sessionStorage.getItem('username') || 'Admin';
  const userRole = sessionStorage.getItem('userType') || 'Administrator';
  const initials = username.substring(0, 2).toUpperCase();

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Profile</span>
        </div>
      </div>
      <div className="card p-6 sm:p-7 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-primary-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-semibold rounded-full mb-4">
              {initials}
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{username}</h2>
            <p className="text-gray-500 capitalize text-sm sm:text-base">{userRole}</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={username} disabled className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input type="text" value={userRole} disabled className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 capitalize text-sm sm:text-base" />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;

