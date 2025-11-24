import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StaffRestriction = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Staff Restriction</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Staff Restriction</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Staff Restrictions</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Staff ID</th><th>Name</th><th>Restriction Type</th><th>Reason</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>STF001</td><td>Mr. John Teacher</td><td>Limited Access</td><td>New Employee</td><td><button className="btn btn-sm btn-outline">Edit</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StaffRestriction;

