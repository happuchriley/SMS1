import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StaffRestriction: React.FC = () => {
  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Staff Restriction</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <span>Staff Restriction</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Staff Restrictions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Staff ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Restriction Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Reason</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-900">STF001</td>
                <td className="px-4 py-3 text-sm text-gray-900">Mr. John Teacher</td>
                <td className="px-4 py-3 text-sm text-gray-900">Limited Access</td>
                <td className="px-4 py-3 text-sm text-gray-900">New Employee</td>
                <td className="px-4 py-3 text-sm">
                  <button className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors">
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StaffRestriction;

