import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

const ViewNews = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Sample news data
  const news = [
    { id: 1, title: 'Parent-Teacher Meeting', category: 'General', targetAudience: 'Parents', publishDate: '2024-01-15', status: 'Published', content: 'There will be a parent-teacher meeting on Saturday, January 20, 2024 at 9:00 AM. All parents are encouraged to attend.' },
    { id: 2, title: 'Sports Day Announcement', category: 'Sports', targetAudience: 'All', publishDate: '2024-01-20', status: 'Published', content: 'Our annual sports day will be held on February 15, 2024. All students are expected to participate.' },
    { id: 3, title: 'Examination Schedule', category: 'Academic', targetAudience: 'Students', publishDate: '2024-01-25', status: 'Published', content: 'The examination schedule for the second term is now available. Please check the notice board or download from the portal.' },
    { id: 4, title: 'Library Closure', category: 'Announcements', targetAudience: 'All', publishDate: '2024-01-28', status: 'Published', content: 'The school library will be closed for maintenance from February 1-3, 2024. Apologies for any inconvenience.' },
  ];

  const categories = ['All Categories', 'General', 'Academic', 'Sports', 'Events', 'Announcements'];

  // Filter published news
  const filteredNews = useMemo(() => {
    let filtered = news.filter(item => item.status === 'Published');
    if (selectedCategory && selectedCategory !== 'All Categories') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    return filtered;
  }, [selectedCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPage, itemsPerPage]);

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">News & Notices</h1>
            <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">News & Notices</span>
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border-2 border-gray-200 rounded-md text-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* News Cards */}
      {paginatedNews.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500">No news/notices available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-4 sm:mb-5">
          {paginatedNews.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between mb-3">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-primary-100 text-primary-800">
                    {item.category}
                  </span>
                  <span className="text-xs text-gray-500">{new Date(item.publishDate).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{item.content}</p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500">
                    <i className="fas fa-users mr-1"></i>{item.targetAudience}
                  </span>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Read More <i className="fas fa-arrow-right ml-1"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 sm:mt-5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </Layout>
  );
};

export default ViewNews;


