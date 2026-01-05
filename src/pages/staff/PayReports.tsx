import React from 'react';
import Layout from '../../components/Layout';

const PayReports: React.FC = () => {
  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Pay Reports</h1>
        <div className="text-sm text-gray-600 mt-2">
          <span>Home</span>
          <span className="mx-1">/</span>
          <span>Pay Reports</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <p className="text-gray-600">Payroll Reports (Payslips, Bank Schedule, GRA, SSNIT etc.)</p>
        {/* Add your pay reports interface here */}
      </div>
    </Layout>
  );
};

export default PayReports;

