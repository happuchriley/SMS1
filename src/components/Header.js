import React from 'react';
import { Link } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';

const Header = ({ toggleSidebar }) => {
  const username = sessionStorage.getItem('username') || 'AD';
  const initials = username.substring(0, 2).toUpperCase();
  const { isMobile } = useResponsive();

  return (
    <header className="bg-white/95 backdrop-blur-md h-16 px-4 md:px-8 flex items-center justify-between shadow-sm sticky top-0 z-[100] border-b border-gray-200 w-full flex-shrink-0">
      <div className="flex items-center gap-5">
        {isMobile && (
          <button
            className="block bg-transparent border-none text-2xl cursor-pointer text-gray-900 p-2 rounded transition-all duration-200 ease-in-out touch-manipulation hover:bg-gray-100 active:scale-[0.97] active:opacity-80"
            aria-label="Toggle menu"
            onClick={toggleSidebar}
            type="button"
          >
            <i className="fas fa-bars transition-transform duration-200"></i>
          </button>
        )}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/" className="text-gray-900 no-underline text-sm font-medium hover:text-primary">
            Home
          </Link>
          <a 
            href="#school" 
            className="text-gray-900 no-underline text-sm font-medium hover:text-primary"
            onClick={(e) => e.preventDefault()}
          >
            Excelz International School
          </a>
          <select 
            className="px-2.5 py-1.5 text-sm border border-gray-200 rounded transition-all duration-300 focus:outline-none focus:border-primary"
            defaultValue=""
          >
            <option value="">Go To</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer relative text-gray-600 transition-all duration-200 ease-in-out border border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm hover:text-primary active:scale-[0.97] active:opacity-80"
          type="button" 
          aria-label="Search"
        >
          <i className="fas fa-search transition-transform duration-200"></i>
        </button>
        <button 
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer relative text-gray-600 transition-all duration-200 ease-in-out border border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm hover:text-primary active:scale-[0.97] active:opacity-80"
          type="button" 
          aria-label="Messages"
        >
          <i className="fas fa-comments transition-transform duration-200"></i>
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-semibold">0</span>
        </button>
        <button 
          className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center cursor-pointer relative text-gray-600 transition-all duration-200 ease-in-out border border-gray-200 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm hover:text-primary active:scale-[0.97] active:opacity-80"
          type="button" 
          aria-label="Notifications"
        >
          <i className="fas fa-bell transition-transform duration-200"></i>
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[10px] font-semibold">0</span>
        </button>
        <div className="flex items-center gap-2.5 cursor-pointer px-2.5 py-1.5 rounded transition-all duration-200 ease-in-out hover:bg-gray-100 active:scale-[0.98] active:opacity-80">
          <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-xs">
            {initials}
          </div>
          <i className="fas fa-chevron-down text-xs"></i>
        </div>
      </div>
    </header>
  );
};

export default Header;

