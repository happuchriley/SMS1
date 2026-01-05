import React, { useState, useMemo } from 'react';
import Layout from '../../components/Layout';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  category: string;
  content: string;
  author: string;
  date: string;
  views: number;
  priority: 'high' | 'medium' | 'low';
}

const NewsPage: React.FC = () => {
  const [news] = useState<NewsItem[]>([
    { id: 1, title: 'School Reopening Announcement', category: 'Announcement', content: 'We are pleased to announce that school will reopen on February 1st, 2024. All students are expected to resume classes...', author: 'Principal', date: '2024-01-25', views: 234, priority: 'high' },
    { id: 2, title: 'Annual Sports Day Registration', category: 'Event', content: 'Registration for the Annual Sports Day is now open. All students are encouraged to participate...', author: 'Sports Coordinator', date: '2024-01-28', views: 156, priority: 'medium' },
    { id: 3, title: 'Parent-Teacher Meeting Schedule', category: 'Meeting', content: 'The next Parent-Teacher Meeting is scheduled for February 15th, 2024. Parents are requested to attend...', author: 'Academic Coordinator', date: '2024-02-01', views: 189, priority: 'high' },
    { id: 4, title: 'Library Hours Extended', category: 'General', content: 'The school library will now be open from 8:00 AM to 6:00 PM on weekdays...', author: 'Librarian', date: '2024-02-03', views: 98, priority: 'low' },
  ]);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const categories: string[] = ['All Categories', 'Announcement', 'Event', 'Meeting', 'General', 'Other'];

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [news, searchTerm, filterCategory]);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="mb-5 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">News Page</h1>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-gray-600 text-xs sm:text-sm">
              <Link to="/" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">Home</Link>
              <span>/</span>
              <Link to="/news" className="text-gray-600 no-underline hover:text-primary-500 transition-colors">News/Notice</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">News Page</span>
            </div>
          </div>
          <Link
            to="/news/add"
            className="px-4 py-2 bg-primary-500 text-white rounded-md text-sm font-semibold hover:bg-primary-700 transition-all duration-300"
          >
            <i className="fas fa-plus mr-2"></i>Add News
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4 sm:p-5 md:p-6 shadow-md border border-gray-200 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 w-full sm:max-w-md">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 pl-10 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
              />
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="w-full sm:max-w-xs">
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)]"
            >
              {categories.map(cat => (
                <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* News List */}
      {filteredNews.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 text-center">
          <i className="fas fa-newspaper text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 mb-4">No news found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNews.map(item => (
            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-5 sm:p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.content}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span><i className="fas fa-user mr-1"></i>{item.author}</span>
                    <span><i className="fas fa-calendar mr-1"></i>{new Date(item.date).toLocaleDateString()}</span>
                    <span><i className="fas fa-eye mr-1"></i>{item.views} views</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-700 transition-colors">
                  <i className="fas fa-eye mr-1"></i>Read More
                </button>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                  <i className="fas fa-edit"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default NewsPage;

