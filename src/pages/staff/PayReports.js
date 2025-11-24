import React from 'react';
import Layout from '../../components/Layout';

const PayReports = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pay Reports</h1>
        <div className="text-sm text-gray-500 mt-2">
          <span>Home</span>
          <span className="mx-1">/</span>
          <span>Pay Reports</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Payroll Reports (Payslips, Bank Schedule, GRA, SSNIT etc.)</p>
        {/* Add your pay reports interface here */}
      </div>
    </Layout>
  );
};

export default PayReports;

