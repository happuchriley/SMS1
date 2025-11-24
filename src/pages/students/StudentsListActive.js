import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StudentsListActive = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Students List (Active)</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Students List (Active)</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Active Students</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Student ID</th><th>Name</th><th>Class</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>STU001</td><td>John Doe</td><td>Basic 1</td><td><span className="badge badge-success">Active</span></td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StudentsListActive;

