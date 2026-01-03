import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const Assignments = () => {
  const [assignments] = useState([
    { id: 1, title: 'Mathematics Homework - Chapter 5', course: 'Mathematics Fundamentals', dueDate: '2024-02-15', status: 'active', submissions: 18, total: 25 },
    { id: 2, title: 'English Essay Writing', course: 'English Language', dueDate: '2024-02-20', status: 'active', submissions: 22, total: 28 },
    { id: 3, title: 'Science Project', course: 'Integrated Science', dueDate: '2024-02-18', status: 'active', submissions: 15, total: 32 },
    { id: 4, title: 'ICT Practical Task', course: 'Information Technology', dueDate: '2024-02-12', status: 'completed', submissions: 20, total: 20 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredAssignments = useMemo(() => {
    return assignments.filter(assignment => {
      const matchesSearch = 
        assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.course.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || assignment.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchTerm, filterStatus]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Assignments</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/elearning" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">E-Learning</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Assignments</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300">
            <i className="fas fa-plus mr-2"></i>Create Assignment
          </button>
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
      {filteredAssignments.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-tasks text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No assignments found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary-500">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Assignment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Submissions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAssignments.map(assignment => (
                  <tr key={assignment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">{assignment.course}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {assignment.submissions} / {assignment.total}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary-500 h-2 rounded-full" 
                          style={{ width: `${(assignment.submissions / assignment.total) * 100}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        assignment.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Assignments;
