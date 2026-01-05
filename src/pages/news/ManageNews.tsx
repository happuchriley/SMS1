import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';
import { useModal } from '../../components/ModalProvider';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  targetAudience: string;
  publishDate: string;
  status: string;
  content: string;
}

const ManageNews: React.FC = () => {
  const { showDeleteModal } = useModal();
  const [news, setNews] = useState<NewsItem[]>([
    { id: 1, title: 'Parent-Teacher Meeting', category: 'General', targetAudience: 'Parents', publishDate: '2024-01-15', status: 'Published', content: 'There will be a parent-teacher meeting...' },
    { id: 2, title: 'Sports Day Announcement', category: 'Sports', targetAudience: 'All', publishDate: '2024-01-20', status: 'Draft', content: 'Sports day is coming up...' },
    { id: 3, title: 'Examination Schedule', category: 'Academic', targetAudience: 'Students', publishDate: '2024-01-25', status: 'Published', content: 'The examination schedule is now available...' },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const categories: string[] = ['All Categories', 'General', 'Academic', 'Sports', 'Events', 'Announcements', 'Other'];

  // Filter news
  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || selectedCategory === 'All Categories' || item.category === selectedCategory;
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [news, searchTerm, selectedCategory, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  const paginatedNews = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(start, start + itemsPerPage);
  }, [filteredNews, currentPage, itemsPerPage]);

  const handleDelete = (id: number): void => {
    const newsItem = news.find(n => n.id === id);
    showDeleteModal({
      title: 'Delete News/Notice',
      message: `Are you sure you want to delete "${newsItem?.title}"? This action cannot be undone.`,
      onConfirm: () => {
        setNews(prev => prev.filter(n => n.id !== id));
      }
    });
  };

  const handleToggleStatus = (id: number): void => {
    setNews(prev => prev.map(n => 
      n.id === id ? { ...n, status: n.status === 'Published' ? 'Draft' : 'Published' } : n
    ));
  };

  const handleClearFilters = (): void => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Manage News/Notices</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/news" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">News/Notices</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">Manage News/Notices</span>
            </div>
          </div>
          <Link
            to="/news/add"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Add New
          </Link>
        </div>
      </div>

      {/* Filters Card */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or content..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All Categories' ? '' : cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              <option value="">All Status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>
        </div>

        {(searchTerm || selectedCategory || selectedStatus) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <i className="fas fa-times mr-1.5"></i> Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* News List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Target Audience</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Publish Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedNews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No news/notices found.
                  </td>
                </tr>
              ) : (
                paginatedNews.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">{item.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.targetAudience}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{new Date(item.publishDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        item.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`text-sm font-medium ${
                            item.status === 'Published' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'
                          }`}
                          title={item.status === 'Published' ? 'Unpublish' : 'Publish'}
                        >
                          <i className={`fas fa-${item.status === 'Published' ? 'eye-slash' : 'eye'}`}></i>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredNews.length)} of {filteredNews.length} items
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ManageNews;

