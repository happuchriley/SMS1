import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ClassList = () => {
  return (
    <Layout>
      <div className="page-header">
        <h1>Get Class List</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Get Class List</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><h3>Class List</h3></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Class</th><th>Number of Students</th><th>Action</th></tr></thead>
            <tbody>
              <tr><td>Basic 1</td><td>30 Students</td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
              <tr><td>Basic 2</td><td>25 Students</td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
              <tr><td>Basic 3</td><td>24 Students</td><td><button className="btn btn-sm btn-outline">View</button></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ClassList;

