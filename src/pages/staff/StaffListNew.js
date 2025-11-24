import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StaffListNew = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Staff List (New)</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Staff List (New)</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>New Staff</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Staff ID</th><th>Name</th><th>Department</th><th>Employment Date</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>STF002</td><td>New Staff Member</td><td>Science</td><td>2024-01-15</td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StaffListNew;

