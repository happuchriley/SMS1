import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ParentsList = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Parents List</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Parents List</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Parents List</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Parent Name</th><th>Student(s)</th><th>Contact</th><th>Email</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>John Parent</td><td>John Doe</td><td>+233 123 456 789</td><td>parent@email.com</td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ParentsList;

