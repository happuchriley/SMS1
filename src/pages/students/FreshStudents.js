import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const FreshStudents = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Fresh Students</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Fresh Students</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Fresh Students</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Student ID</th><th>Name</th><th>Class</th><th>Admission Date</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>STU001</td><td>New Student</td><td>Basic 1</td><td>2024-01-15</td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default FreshStudents;

