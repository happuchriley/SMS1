import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const StudentsListActive = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { showViewModal, toast } = useModal();

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const activeStudents = await studentsService.getActive();
      setStudents(activeStudents);
    } catch (error) {
      console.error('Error loading active students:', error);
      toast.showError('Failed to load active students');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const getStudentName = (student) => {
    return `${student.firstName || ''} ${student.surname || ''} ${student.otherNames || ''}`.trim() || 'N/A';
  };

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(student => {
      const fullName = getStudentName(student).toLowerCase();
      const studentId = (student.studentId || student.id || '').toLowerCase();
      return fullName.includes(term) || studentId.includes(term);
    });
  }, [students, searchTerm]);

  const handleView = (student) => {
    const fields = [
      { label: 'Student ID', accessor: (s) => s.studentId || s.id },
      { label: 'Full Name', accessor: getStudentName },
      { label: 'Class', key: 'class' },
      { label: 'Gender', key: 'gender' },
      { label: 'Email', key: 'email' },
      { label: 'Contact', key: 'contact' },
      { label: 'Admission Date', key: 'admissionDate' }
    ];
    
    showViewModal({
      title: 'Student Details',
      data: student,
      fields
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Active Students</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>Students</span>
          <span>/</span>
          <span>Active Students</span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 mb-4">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-200 rounded-md"
          />
        </div>
        <div className="text-sm text-gray-600 mb-4">
          Total Active: {filteredStudents.length}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-gray-300 mb-3"></i>
            <div className="text-gray-500">Loading active students...</div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <i className="fas fa-inbox text-4xl mb-3 text-gray-300"></i>
            <div>No active students found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500">
                <tr>
                  <th className="p-3 text-left text-white text-xs uppercase">Student ID</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Name</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Class</th>
                  <th className="p-3 text-left text-white text-xs uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-3 text-sm">{student.studentId || student.id}</td>
                    <td className="p-3 text-sm">{getStudentName(student)}</td>
                    <td className="p-3 text-sm">{student.class || 'N/A'}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleView(student)}
                        className="px-3 py-1 text-sm text-primary-500 hover:bg-primary-50 rounded"
                      >
                        <i className="fas fa-eye mr-1"></i> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentsListActive;
