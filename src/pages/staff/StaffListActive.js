import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StaffListActive = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Staff List (Active)</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Staff List (Active)</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Active Staff</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Staff ID</th><th>Name</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>STF001</td><td>Mr. John Teacher</td><td>Mathematics</td><td><span className="badge badge-success">Active</span></td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StaffListActive;

