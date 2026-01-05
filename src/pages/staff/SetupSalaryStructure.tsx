import React from 'react';
import Layout from '../../components/Layout';

const SetupSalaryStructure: React.FC = () => {
  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Setup Salary Structure</h1>
        <div className="text-sm text-gray-600 mt-2">
          <span>Home</span>
          <span className="mx-1">/</span>
          <span>Setup Salary Structure</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <p className="text-gray-600">Setup Salary Structure - Group</p>
        {/* Add your salary structure setup form here */}
      </div>
    </Layout>
  );
};

export default SetupSalaryStructure;

