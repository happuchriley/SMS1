import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StudentsListInactive = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Students List (Inactive)</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Students List (Inactive)</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Inactive Students</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Student ID</th><th>Name</th><th>Class</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>STU003</td><td>Inactive Student</td><td>Basic 2</td><td><span className="badge badge-danger">Inactive</span></td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StudentsListInactive;

