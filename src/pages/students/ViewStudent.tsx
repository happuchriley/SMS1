import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import studentsService from '../../services/studentsService';
import { useModal } from '../../components/ModalProvider';

const ViewStudent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useModal();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStudent = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const studentData = await studentsService.getById(id);
      setStudent(studentData);
    } catch (error) {
      toast.showError('Failed to load student');
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <i className="fas fa-spinner fa-spin text-4xl text-primary-500"></i>
        </div>
      </Layout>
    );
  }

  if (!student) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student not found</h2>
          <Link to="/students/all" className="text-primary-500 hover:text-primary-700">
            Back to Students List
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Student Profile</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/students/all" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Students</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">View Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Student ID:</span>
                <span className="ml-2 text-sm text-gray-900">{student.studentId || student.id}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Name:</span>
                <span className="ml-2 text-sm text-gray-900">
                  {student.firstName} {student.surname} {student.otherNames || ''}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Gender:</span>
                <span className="ml-2 text-sm text-gray-900">{student.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Class:</span>
                <span className="ml-2 text-sm text-gray-900">{student.class || 'N/A'}</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="ml-2 text-sm text-gray-900">{student.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Contact:</span>
                <span className="ml-2 text-sm text-gray-900">{student.contact || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Address:</span>
                <span className="ml-2 text-sm text-gray-900">{student.address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Parent/Guardian:</span>
                <span className="ml-2 text-sm text-gray-900">{student.parent || student.parentName || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ViewStudent;
