import React from 'react';
import Layout from '../../components/Layout';

const SetupSalaryStructure = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Setup Salary Structure</h1>
        <div className="text-sm text-gray-500 mt-2">
          <span>Home</span>
          <span className="mx-1">/</span>
          <span>Setup Salary Structure</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Setup Salary Structure - Group</p>
        {/* Add your salary structure setup form here */}
      </div>
    </Layout>
  );
};

export default SetupSalaryStructure;

