import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const StudentsListAll = () => {
  const students = [
    { id: 'STU001', name: 'John Doe', class: 'Basic 1', status: 'Active' },
    { id: 'STU002', name: 'Jane Smith', class: 'Basic 2', status: 'Active' }
  ];

  return (
    <Layout>
      <div className="page-header">
        <h1>Students List (All)</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Students List (All)</span>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>All Students</h3>
          <Link to="/students/add" className="btn btn-primary">
            <i className="fas fa-plus"></i> Add New Student
          </Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Class</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  <td>{student.class}</td>
                  <td><span className="badge badge-success">{student.status}</span></td>
                  <td><button className="btn btn-sm btn-outline">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default StudentsListAll;

