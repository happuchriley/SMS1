import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import elearningService from '../../services/elearningService';
import { useModal } from '../../components/ModalProvider';

interface Assignment {
  id: string;
  title: string;
  courseId: string;
  course?: string;
  courseTitle?: string;
  dueDate?: string;
  status?: string;
  submissions?: number;
  total?: number;
  description?: string;
}

const Assignments: React.FC = () => {
  const { toast, showDeleteModal } = useModal();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [courses, setCourses] = useState<Array<{ id: string; title: string }>>([]);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      const allAssignments = await elearningService.getAllAssignments();
      const allCourses = await elearningService.getAllCourses();
      
      // Map course IDs to course names and get enrollment counts
      const assignmentsWithCourses = await Promise.all(allAssignments.map(async (assignment) => {
        const course = allCourses.find(c => c.id === assignment.courseId);
        const enrollments = await elearningService.getEnrollmentsByCourse(assignment.courseId);
        
        // Determine status based on due date
        let status = 'active';
        if (assignment.dueDate) {
          const dueDate = new Date(assignment.dueDate);
          const now = new Date();
          if (dueDate < now) {
            status = 'completed';
          }
        }
        
        return {
          ...assignment,
          course: course?.title || 'Unknown Course',
          courseTitle: course?.title || 'Unknown Course',
          status,
          total: enrollments.length,
          submissions: 0 // This would need to be tracked separately
        };
      }));
      
      setAssignments(assignmentsWithCourses);
      setCourses(allCourses);
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.showError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assignment.course && assignment.course.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, filterStatus]);

  const handleDelete = (id: string): void => {
    showDeleteModal({
      title: 'Delete Assignment',
      message: 'Are you sure you want to delete this assignment? This action cannot be undone.',
      itemName: assignments.find(a => a.id === id)?.title || 'this assignment',
      onConfirm: async () => {
        try {
          await elearningService.deleteAssignment(id);
          toast.showSuccess('Assignment deleted successfully');
          await loadAssignments();
        } catch (error: any) {
          console.error('Error deleting assignment:', error);
          toast.showError(error.message || 'Failed to delete assignment');
        }
      }
    });
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Assignments</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Assignments</span>
            </div>
          </div>
          <Link
            to="/elearning/assignments/create"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-100"
          >
            <i className="fas fa-plus mr-2"></i>Create Assignment
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <p className="text-gray-500">Loading assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-tasks text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No assignments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Course</th>
                  <th>Due Date</th>
                  <th>Submissions</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map(assignment => {
                  const submissionPercent = assignment.total && assignment.total > 0 
                    ? ((assignment.submissions || 0) / assignment.total) * 100 
                    : 0;
                  return (
                    <tr key={assignment.id}>
                      <td className="font-medium">{assignment.title}</td>
                      <td className="whitespace-nowrap">{assignment.course || 'N/A'}</td>
                      <td className="whitespace-nowrap">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="whitespace-nowrap">
                        <div className="text-sm">
                          {assignment.submissions || 0} / {assignment.total || 0}
                        </div>
                        {assignment.total && assignment.total > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className="bg-primary-500 h-2 rounded-full transition-all duration-100" 
                              style={{ width: `${submissionPercent}%` }}
                            ></div>
                          </div>
                        )}
                      </td>
                      <td className="whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status || 'active'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/elearning/assignments/view/${assignment.id}`}
                          className="text-primary-600 hover:text-primary-900 mr-3 transition-colors duration-100"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          onClick={() => handleDelete(assignment.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-100"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Assignments;

