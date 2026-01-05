import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ClassList: React.FC = () => {
  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Get Class List</h1>
        <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
          <span>/</span>
          <span>Get Class List</span>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Class List</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="table-striped">
            <thead>
              <tr>
                <th>Class</th>
                <th>Number of Students</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic 1</td>
                <td>30 Students</td>
                <td>
                  <button className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-100">
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td>Basic 2</td>
                <td>25 Students</td>
                <td>
                  <button className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-100">
                    View
                  </button>
                </td>
              </tr>
              <tr>
                <td>Basic 3</td>
                <td>24 Students</td>
                <td>
                  <button className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100 transition-colors duration-100">
                    View
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

export default ClassList;

