import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ collapsed, open = false, toggleSidebar, currentPath, isMobile = false }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    students: currentPath.startsWith('/students'),
    staff: currentPath.startsWith('/staff')
  });
  
  // Update expanded menus when path changes
  useEffect(() => {
    setExpandedMenus({
      students: currentPath.startsWith('/students'),
      staff: currentPath.startsWith('/staff')
    });
  }, [currentPath]);
  
  // Close sidebar on mobile when clicking a link
  const handleLinkClick = useCallback(() => {
    if (isMobile && open) {
      setTimeout(() => {
        toggleSidebar();
      }, 300);
    }
  }, [isMobile, open, toggleSidebar]);

  const toggleSubmenu = useCallback((menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  }, []);

  const username = sessionStorage.getItem('username') || 'DTeye';
  const userRole = sessionStorage.getItem('userType') || 'admin';

  const isActive = (path) => currentPath === path;

  const sidebarClasses = `fixed left-0 top-0 w-[280px] h-screen h-[calc(var(--vh,1vh)*100)] bg-[#0f172a] text-white overflow-y-auto overflow-x-hidden z-[1000] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] border-r border-white/5 backdrop-blur-xl ${
    isMobile 
      ? `${open ? 'translate-x-0' : '-translate-x-full'}` 
      : collapsed 
        ? 'w-[72px]' 
        : ''
  }`;

  return (
    <aside className={sidebarClasses} id="sidebar">
      {/* Sidebar Header */}
      <div className={`p-5 border-b border-white/5 flex items-center justify-between gap-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        collapsed ? 'justify-center px-4' : ''
      }`}>
        <div className={`flex items-center gap-3 flex-1 ${collapsed ? 'hidden' : ''}`}>
          <div className="w-10 h-10 bg-primary-500 flex items-center justify-center text-base flex-shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 shadow-lg shadow-primary/20">
            <i className="fas fa-school"></i>
          </div>
          <h2 className="text-base font-semibold text-white">Excelz Int. School</h2>
        </div>
        <button
          className="text-white/70 w-8 h-8 cursor-pointer flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 hover:bg-white/10 hover:text-white"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          type="button"
          aria-label="Toggle Sidebar"
        >
          <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-bars'} text-sm transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`} id="sidebarToggleIcon"></i>
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-4 border-b border-white/5 flex items-center gap-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-white/5 ${
        collapsed ? 'justify-center px-4' : ''
      }`}>
        <div className="w-11 h-11 bg-secondary-500 flex items-center justify-center text-lg text-white flex-shrink-0 shadow-lg shadow-secondary/20">
          <i className="fas fa-user-circle"></i>
        </div>
        <div className={`flex-1 min-w-0 ${collapsed ? 'hidden' : ''}`}>
          <span className="font-semibold text-sm block truncate text-white">{username}</span>
          <span className="text-xs text-white/70 truncate block capitalize">{userRole}</span>
        </div>
      </div>

      {/* Sidebar Menu */}
      <ul className="list-none py-3">
        {/* Manage Students */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.students ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('students')}
          >
            <div className="flex items-center">
              <i className="fas fa-user-graduate mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Manage Students</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.students ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.students ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/students/menu" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/students/menu') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/add" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/add') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Add new student
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/all" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/all') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  All Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/active" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/active') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Active Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/inactive" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/inactive') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Inactive Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/fresh" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/fresh') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  New Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/classes" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/classes') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Get Class List
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/parents" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/students/parents') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Parents List
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Manage Staff */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white  mx-2 ${
              expandedMenus.staff ? 'bg-white/10 text-white border-l-2 border-primary' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('staff')}
          >
            <div className="flex items-center">
              <i className="fas fa-user-tie mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Manage Staff</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.staff ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.staff ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/staff/menu" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/menu') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/add" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/add') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Add new Staff
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/all" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/all') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  All Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/active" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/active') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Active Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/inactive" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/inactive') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Inactive Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/new" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/new') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  New Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/restriction" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/restriction') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Staff Restriction
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/salary-structure" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/salary-structure') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Setup Salary Structure
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/pay-reports" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90  mx-2 ${
                    isActive('/staff/pay-reports') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Pay Reports
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Other Menu Items */}
        {[
          { icon: 'fa-chart-pie', text: 'Reports & Assmnt.', path: '/' },
          { icon: 'fa-file-invoice-dollar', text: 'Billing', path: '/billing' },
          { icon: 'fa-wallet', text: 'Fee Collection', path: '/fee-collection' },
          { icon: 'fa-coins', text: 'Payroll', path: '/' },
          { icon: 'fa-calculator', text: 'Finance Entries', path: '/' },
          { icon: 'fa-chart-line', text: 'Financial Reports', path: '/' },
          { icon: 'fa-envelope-open-text', text: 'SMS/Email Reminder', path: '/' },
          { icon: 'fa-bullhorn', text: 'News/Notices', path: '/' },
          { icon: 'fa-book-open', text: 'TLMs', path: '/' },
          { icon: 'fa-graduation-cap', text: 'E-Learning', path: '/' },
          { icon: 'fa-sliders-h', text: 'School Setup', path: '/' },
          { icon: 'fa-archive', text: 'My Documents', path: '/' },
          { icon: 'fa-user-cog', text: 'My Account', path: '/' },
        ].map((item, index) => (
          <li key={index} className="my-1">
            <Link 
              to={item.path} 
              className={`flex items-center px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline hover:bg-white/10 hover:text-white mx-2 ${
                collapsed ? 'justify-center px-3 mx-2' : ''
              } ${isActive(item.path) ? 'bg-white/10 text-white border-l-2 border-primary' : ''}`}
              onClick={handleLinkClick}
            >
              <i className={`fas ${item.icon} mr-3 w-5 text-center text-sm`}></i>
              {!collapsed && <span className="text-sm font-medium">{item.text}</span>}
            </Link>
          </li>
        ))}

        {/* Logout */}
        <li className="my-1 mt-3 border-t border-white/5 pt-3">
          <button
            type="button"
            className={`w-full text-left flex items-center px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              collapsed ? 'justify-center px-3 mx-2' : ''
            }`}
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/login';
            }}
          >
            <i className="fas fa-sign-out-alt mr-3 w-5 text-center text-sm"></i>
            {!collapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
