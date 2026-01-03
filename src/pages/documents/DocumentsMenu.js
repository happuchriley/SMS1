import React from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const DocumentsMenu = () => {
  const menuCards = [
    {
      title: 'My Uploads',
      subtitle: 'View my uploaded documents',
      icon: 'fa-cloud-upload-alt',
      path: '/documents/my-uploads',
      color: 'border-blue-500'
    },
    {
      title: 'Shared Documents',
      subtitle: 'View shared documents',
      icon: 'fa-share-alt',
      path: '/documents/shared',
      color: 'border-green-500'
    },
    {
      title: 'Document Categories',
      subtitle: 'Manage document categories',
      icon: 'fa-folder-open',
      path: '/documents/categories',
      color: 'border-purple-500'
    },
    {
      title: 'Recent Documents',
      subtitle: 'View recently accessed documents',
      icon: 'fa-clock',
      path: '/documents/recent',
      color: 'border-orange-500'
    }
  ];

  return (
    <Layout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">My Documents</h1>
        <div className="flex items-center gap-2 text-gray-600 text-sm">
          <Link to="/" className="text-gray-600 no-underline hover:text-primary">Home</Link>
          <span>/</span>
          <span>My Documents</span>
        </div>
      </div>

      {/* Documents Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {menuCards.map((card, index) => (
          <Link
            key={index}
            to={card.path}
            className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 border-2 ${card.color} transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
                <i className={`fas ${card.icon} text-2xl text-gray-700`}></i>
              </div>
              <h3 className="text-lg font-semibold text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-gray-600">{card.subtitle}</p>
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  );
};

export default DocumentsMenu;


