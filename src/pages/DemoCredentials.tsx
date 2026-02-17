import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../components/ModalProvider';
import { 
  setAllDemoPasswords, 
  getQuickDemoCredentials, 
  ADMIN_CREDENTIALS,
  DemoCredential 
} from '../utils/demoCredentials';
import demoDataService from '../services/demoDataService';
import apiService from '../services/api';

const DemoCredentials: React.FC = () => {
  const { toast } = useModal();
  const [loading, setLoading] = useState<boolean>(false);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [hasData, setHasData] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<{
    staff: DemoCredential[];
    students: DemoCredential[];
  }>({ staff: [], students: [] });

  useEffect(() => {
    checkDataAndLoad();
  }, []);

  const checkDataAndLoad = async () => {
    try {
      const hasStudents = await apiService.hasData('students');
      const hasStaff = await apiService.hasData('staff');
      setHasData(hasStudents || hasStaff);
      
      if (hasStudents || hasStaff) {
        await loadCredentials();
      }
    } catch (error) {
      // Error checking data
    }
  };

  const loadCredentials = async () => {
    try {
      const creds = await getQuickDemoCredentials();
      setCredentials(creds);
    } catch (error) {
      // Error loading credentials
    }
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      await demoDataService.seedAll();
      toast.showSuccess('Demo data seeded successfully!');
      setHasData(true);
      await loadCredentials();
    } catch (error: any) {
      console.error('Error seeding data:', error);
      toast.showError(error.message || 'Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    try {
      const result = await setAllDemoPasswords();
      toast.showSuccess(`Generated passwords for ${result.staff.length} staff and ${result.students.length} students`);
      await loadCredentials();
    } catch (error: any) {
      console.error('Error generating passwords:', error);
      toast.showError(error.message || 'Failed to generate passwords');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.showSuccess('Copied to clipboard!');
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Demo Login Credentials</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Demo Credentials</span>
            </div>
          </div>
          <div className="flex gap-3">
            {!hasData && (
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                <i className="fas fa-seedling mr-2"></i>
                {seeding ? 'Seeding...' : 'Seed Demo Data'}
              </button>
            )}
            <button
              onClick={handleGenerateAll}
              disabled={loading || !hasData}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              <i className="fas fa-key mr-2"></i>
              {loading ? 'Generating...' : 'Generate All Passwords'}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Setup Alert */}
        {!hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-exclamation-triangle text-yellow-600 text-2xl mt-1"></i>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  No Demo Data Found
                </h3>
                <p className="text-sm text-yellow-800 mb-4">
                  You need to seed demo data first before you can generate login credentials. 
                  This will create sample students and staff that you can use to test the system.
                </p>
                <button
                  onClick={handleSeedData}
                  disabled={seeding}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-yellow-600 rounded-md hover:bg-yellow-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  <i className="fas fa-seedling mr-2"></i>
                  {seeding ? 'Seeding Data...' : 'Seed Demo Data Now'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Administrator Credentials */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-user-shield text-primary-500"></i>
            Administrator Login
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Username</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono">
                    {ADMIN_CREDENTIALS.username}
                  </code>
                  <button
                    onClick={() => copyToClipboard(ADMIN_CREDENTIALS.username)}
                    className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Copy username"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono">
                    {ADMIN_CREDENTIALS.password}
                  </code>
                  <button
                    onClick={() => copyToClipboard(ADMIN_CREDENTIALS.password)}
                    className="px-3 py-2 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    title="Copy password"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">User Type</label>
                <span className="inline-block px-3 py-2 bg-primary-100 text-primary-800 rounded text-sm font-semibold">
                  {ADMIN_CREDENTIALS.userType}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Role</label>
                <span className="inline-block px-3 py-2 bg-gray-100 text-gray-800 rounded text-sm">
                  {ADMIN_CREDENTIALS.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Staff Credentials */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-user-tie text-blue-500"></i>
            Staff Login Credentials (First 5)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Password</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!hasData ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <i className="fas fa-info-circle text-2xl text-gray-400"></i>
                        <p>Seed demo data first to see staff credentials.</p>
                      </div>
                    </td>
                  </tr>
                ) : credentials.staff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No staff found. Click "Generate All Passwords" to create demo credentials.
                    </td>
                  </tr>
                ) : (
                  credentials.staff.map((staff, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{staff.name}</td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{staff.username}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{staff.password}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{staff.role}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(`${staff.username} / ${staff.password}`)}
                          className="px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          title="Copy credentials"
                        >
                          <i className="fas fa-copy mr-1"></i>
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Credentials */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <i className="fas fa-user-graduate text-green-500"></i>
            Student Login Credentials (First 5)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">No.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Password</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {!hasData ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center gap-2">
                        <i className="fas fa-info-circle text-2xl text-gray-400"></i>
                        <p>Seed demo data first to see student credentials.</p>
                      </div>
                    </td>
                  </tr>
                ) : credentials.students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      No students found. Click "Generate All Passwords" to create demo credentials.
                    </td>
                  </tr>
                ) : (
                  credentials.students.map((student, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.name}</td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{student.username}</code>
                      </td>
                      <td className="px-4 py-3">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{student.password}</code>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{student.role}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => copyToClipboard(`${student.username} / ${student.password}`)}
                          className="px-3 py-1 text-xs font-semibold text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          title="Copy credentials"
                        >
                          <i className="fas fa-copy mr-1"></i>
                          Copy
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <i className="fas fa-info-circle"></i>
            How to Use Demo Credentials
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <i className="fas fa-check-circle text-blue-600 mt-1"></i>
              <span><strong>Administrator:</strong> Use username "DTeye" and password "12345" to log in as administrator.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check-circle text-blue-600 mt-1"></i>
              <span><strong>Step 1:</strong> If you see "No Demo Data Found", click "Seed Demo Data" to create sample students and staff.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check-circle text-blue-600 mt-1"></i>
              <span><strong>Step 2:</strong> Click "Generate All Passwords" to set passwords for all staff and students. Passwords follow the pattern: STAFF001, STAFF002, STU001, STU002, etc.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check-circle text-blue-600 mt-1"></i>
              <span><strong>Step 3:</strong> Use the credentials shown in the tables below to log in. Staff usernames are their Staff ID, and student usernames are their Student ID.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check-circle text-blue-600 mt-1"></i>
              <span><strong>Login:</strong> Go to the login page and select the appropriate user type (Administrator, Staff, or Student), then enter the username and password.</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check-circle text-blue-600 mt-1"></i>
              <span><strong>Note:</strong> Staff usernames are their Staff ID (e.g., STAFF0001), and student usernames are their Student ID (e.g., STU001).</span>
            </li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default DemoCredentials;
