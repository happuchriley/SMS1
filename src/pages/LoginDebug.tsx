import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import staffService from '../services/staffService';
import studentsService from '../services/studentsService';
import { Link } from 'react-router-dom';
import { setAllDemoPasswords } from '../utils/demoCredentials';
import { useModal } from '../components/ModalProvider';

const LoginDebug: React.FC = () => {
  const { toast } = useModal();
  const [staff, setStaff] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allStaff, allStudents] = await Promise.all([
        staffService.getAll(),
        studentsService.getAll()
      ]);
      setStaff(allStaff);
      setStudents(allStudents);
    } catch (error) {
      // Error loading data
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async (userType: string, username: string, password: string) => {
    try {
      if (userType === 'staff') {
        const allStaff = await staffService.getAll();
        const found = allStaff.find(s => 
          s.staffId === username ||
          s.email === username ||
          `${s.firstName} ${s.surname}`.toLowerCase() === username.toLowerCase()
        );
        
        if (!found) {
          alert(`❌ Staff NOT FOUND\n\nSearched for: "${username}"\n\nAvailable staffIds: ${allStaff.map(s => s.staffId).join(', ')}`);
          return;
        }
        
        if (!found.password) {
          alert(`❌ Staff found but NO PASSWORD SET\n\nStaff: ${found.firstName} ${found.surname}\nStaffId: ${found.staffId}\nPassword field: ${found.password || 'UNDEFINED'}`);
          return;
        }
        
        if (found.password !== password) {
          alert(`❌ PASSWORD MISMATCH\n\nStaff: ${found.firstName} ${found.surname}\nStaffId: ${found.staffId}\nExpected: ${found.password}\nYou entered: ${password}`);
          return;
        }
        
        alert(`✅ LOGIN WOULD SUCCEED\n\nStaff: ${found.firstName} ${found.surname}\nStaffId: ${found.staffId}\nPassword: ${found.password}`);
      } else if (userType === 'student') {
        const allStudents = await studentsService.getAll();
        const found = allStudents.find(s => 
          s.studentId === username ||
          s.id === username ||
          `${s.firstName} ${s.surname}`.toLowerCase() === username.toLowerCase()
        );
        
        if (!found) {
          alert(`❌ Student NOT FOUND\n\nSearched for: "${username}"\n\nAvailable studentIds: ${allStudents.map(s => s.studentId).join(', ')}`);
          return;
        }
        
        if (!found.password) {
          alert(`❌ Student found but NO PASSWORD SET\n\nStudent: ${found.firstName} ${found.surname}\nStudentId: ${found.studentId}\nPassword field: ${found.password || 'UNDEFINED'}`);
          return;
        }
        
        if (found.password !== password) {
          alert(`❌ PASSWORD MISMATCH\n\nStudent: ${found.firstName} ${found.surname}\nStudentId: ${found.studentId}\nExpected: ${found.password}\nYou entered: ${password}`);
          return;
        }
        
        alert(`✅ LOGIN WOULD SUCCEED\n\nStudent: ${found.firstName} ${found.surname}\nStudentId: ${found.studentId}\nPassword: ${found.password}`);
      }
    } catch (error) {
      alert(`Error: ${error}`);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500 mb-4"></i>
          <p>Loading debug data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Debug Tool</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Link to="/" className="text-gray-600 hover:text-primary-500">Home</Link>
          <span>/</span>
          <span>Login Debug</span>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-yellow-900 mb-2">📊 Data Summary</h3>
        <p className="text-sm text-yellow-800">
          <strong>Staff Count:</strong> {staff.length} | 
          <strong> Students Count:</strong> {students.length}
        </p>
        {staff.length === 0 && students.length === 0 && (
          <p className="text-sm text-yellow-800 mt-2">
            ⚠️ No data found! You need to seed demo data first.
          </p>
        )}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Staff Data ({staff.length})</h2>
        {staff.length === 0 ? (
          <p className="text-gray-500">No staff found. Seed demo data first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Staff ID</th>
                  <th className="px-4 py-2 text-left">Password</th>
                  <th className="px-4 py-2 text-left">Has Password?</th>
                  <th className="px-4 py-2 text-left">Test Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.slice(0, 10).map((s, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{s.firstName} {s.surname}</td>
                    <td className="px-4 py-2 font-mono">{s.staffId || 'N/A'}</td>
                    <td className="px-4 py-2 font-mono">{s.password || '❌ NOT SET'}</td>
                    <td className="px-4 py-2">
                      {s.password ? (
                        <span className="text-green-600">✅ Yes</span>
                      ) : (
                        <span className="text-red-600">❌ No</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => testLogin('staff', s.staffId || '', s.password || '')}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        disabled={!s.password}
                      >
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Student Data ({students.length})</h2>
        {students.length === 0 ? (
          <p className="text-gray-500">No students found. Seed demo data first.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Student ID</th>
                  <th className="px-4 py-2 text-left">Password</th>
                  <th className="px-4 py-2 text-left">Has Password?</th>
                  <th className="px-4 py-2 text-left">Test Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {students.slice(0, 10).map((s, i) => (
                  <tr key={i}>
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{s.firstName} {s.surname}</td>
                    <td className="px-4 py-2 font-mono">{s.studentId || 'N/A'}</td>
                    <td className="px-4 py-2 font-mono">{s.password || '❌ NOT SET'}</td>
                    <td className="px-4 py-2">
                      {s.password ? (
                        <span className="text-green-600">✅ Yes</span>
                      ) : (
                        <span className="text-red-600">❌ No</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => testLogin('student', s.studentId || '', s.password || '')}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        disabled={!s.password}
                      >
                        Test
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 How to Use</h3>
        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
          <li>Check if staff/students exist (should be {'>'} 0)</li>
          <li>Check if passwords are set (should show ✅ Yes)</li>
          <li>Click &quot;Test&quot; button to verify login would work</li>
          <li>Use the exact Staff ID / Student ID and Password shown</li>
        </ol>
      </div>
    </Layout>
  );
};

export default LoginDebug;
