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

  const sidebarClasses = `fixed left-0 top-0 w-[260px] h-screen h-[calc(var(--vh,1vh)*100)] bg-gradient-to-b from-[#1a1d29] to-[#1f2330] text-white overflow-y-auto overflow-x-hidden z-[1000] transition-all duration-500 ease-in-out shadow-[2px_0_20px_rgba(0,0,0,0.15)] border-r border-white/10 ${
    isMobile 
      ? `${open ? 'translate-x-0' : '-translate-x-full'}` 
      : collapsed 
        ? 'w-[70px]' 
        : ''
  }`;

  return (
    <aside className={sidebarClasses} id="sidebar">
      {/* Sidebar Header */}
      <div className={`p-6 border-b border-white/10 flex items-center justify-between gap-3 relative bg-white/5 transition-all duration-200 ease-in-out ${
        collapsed ? 'justify-center px-2.5' : ''
      }`}>
        <div className={`flex items-center gap-3 flex-1 ${collapsed ? 'hidden' : ''}`}>
          <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-xl flex-shrink-0 shadow-md transition-all duration-300 hover:scale-110 hover:rotate-6 hover:shadow-lg">
            <i className="fas fa-graduation-cap"></i>
          </div>
          <h2 className="text-base font-semibold text-white">Excelz Int. School</h2>
        </div>
        <button
          className="bg-white/8 border border-white/10 text-white w-9 h-9 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out flex-shrink-0 hover:bg-white/15 hover:border-white/20 hover:scale-[1.03] active:scale-[0.97] active:opacity-80"
          onClick={toggleSidebar}
          title="Toggle Sidebar"
          type="button"
          aria-label="Toggle Sidebar"
        >
          <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-bars'} transition-transform duration-200`} id="sidebarToggleIcon"></i>
        </button>
      </div>

      {/* User Profile */}
      <div className={`p-5 border-b border-white/10 flex items-center gap-3 bg-white/5 transition-all duration-200 ease-in-out hover:bg-white/10 ${
        collapsed ? 'justify-center px-2.5' : ''
      }`}>
        <div className="w-12 h-12 rounded-full gradient-cool flex items-center justify-center text-2xl text-white flex-shrink-0 shadow-md border-2 border-white/10">
          <i className="fas fa-user"></i>
        </div>
        <div className={`flex-1 ${collapsed ? 'hidden' : ''}`}>
          <span className="font-semibold text-sm block mb-1">{username}</span>
          <span className="text-xs text-white/70">{userRole}</span>
        </div>
      </div>

      {/* Sidebar Menu */}
      <ul className="list-none py-2.5">
        {/* Manage Students */}
        <li className="my-0.5">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-3 cursor-pointer transition-all duration-200 ease-in-out text-white no-underline font-inherit text-inherit hover:bg-[#2a2f3f] hover:translate-x-0.5 active:translate-x-0 active:opacity-90 ${
              expandedMenus.students ? 'bg-[#2a2f3f] border-l-[3px] border-primary' : ''
            } ${collapsed ? 'justify-center px-2.5' : ''}`}
            onClick={() => toggleSubmenu('students')}
          >
            <div className="flex items-center">
              <i className="fas fa-users mr-3 w-5 text-center"></i>
              {!collapsed && <span>Manage Students</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-in-out ${
                expandedMenus.students ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none bg-black/20 ${expandedMenus.students ? 'block' : 'hidden'} py-1.5 transition-all duration-300 ease-in-out`}>
              <li>
                <Link 
                  to="/students/menu" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/menu') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/add" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-200 ease-in-out text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 hover:translate-x-1 active:translate-x-0 active:opacity-90 ${
                    isActive('/students/add') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Add new student
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/all" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/all') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  All Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/active" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/active') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Active Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/inactive" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/inactive') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Inactive Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/fresh" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/fresh') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  New Students
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/classes" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/classes') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Get Class List
                </Link>
              </li>
              <li>
                <Link 
                  to="/students/parents" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/students/parents') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Parents List
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Manage Staff */}
        <li className="my-0.5">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-3 cursor-pointer transition-all duration-200 ease-in-out text-white no-underline font-inherit text-inherit hover:bg-[#2a2f3f] hover:translate-x-0.5 active:translate-x-0 active:opacity-90 ${
              expandedMenus.staff ? 'bg-[#2a2f3f] border-l-[3px] border-primary' : ''
            } ${collapsed ? 'justify-center px-2.5' : ''}`}
            onClick={() => toggleSubmenu('staff')}
          >
            <div className="flex items-center">
              <i className="fas fa-chalkboard-teacher mr-3 w-5 text-center"></i>
              {!collapsed && <span>Manage Staff</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-in-out ${
                expandedMenus.staff ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none bg-black/20 ${expandedMenus.staff ? 'block' : 'hidden'} py-1.5 transition-all duration-300 ease-in-out`}>
              <li>
                <Link 
                  to="/staff/menu" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/menu') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Menu
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/add" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-200 ease-in-out text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 hover:translate-x-1 active:translate-x-0 active:opacity-90 ${
                    isActive('/staff/add') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Add new Staff
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/all" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/all') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  All Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/active" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/active') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Active Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/inactive" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/inactive') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Inactive Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/new" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/new') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  New Staffs
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/restriction" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/restriction') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Staff Restriction
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/salary-structure" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/salary-structure') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Setup Salary Structure
                </Link>
              </li>
              <li>
                <Link 
                  to="/staff/pay-reports" 
                  className={`block px-5 py-2.5 pl-12 cursor-pointer transition-all duration-300 text-white/80 text-sm flex items-center gap-2.5 hover:bg-white/10 ${
                    isActive('/staff/pay-reports') ? 'bg-primary/25 text-white border-l-[3px] border-primary pl-[47px] font-semibold' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  <span className="text-[8px] text-white/50 mr-2">○</span>
                  Pay Reports
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Other Menu Items */}
        {[
          { icon: 'fa-chart-bar', text: 'Reports & Assmnt.', path: '/' },
          { icon: 'fa-file-invoice-dollar', text: 'Billing', path: '/' },
          { icon: 'fa-money-bill-wave', text: 'Fee Collection', path: '/' },
          { icon: 'fa-dollar-sign', text: 'Payroll', path: '/' },
          { icon: 'fa-calculator', text: 'Finance Entries', path: '/' },
          { icon: 'fa-chart-line', text: 'Financial Reports', path: '/' },
          { icon: 'fa-bell', text: 'SMS/Email Reminder', path: '/' },
          { icon: 'fa-rss', text: 'News/Notices', path: '/' },
          { icon: 'fa-file-alt', text: 'TLMs', path: '/' },
          { icon: 'fa-laptop', text: 'E-Learning', path: '/' },
          { icon: 'fa-cog', text: 'School Setup', path: '/' },
          { icon: 'fa-folder', text: 'My Documents', path: '/' },
          { icon: 'fa-user-circle', text: 'My Account', path: '/' },
        ].map((item, index) => (
          <li key={index} className="my-0.5">
            <Link 
              to={item.path} 
              className={`flex items-center px-5 py-3 cursor-pointer transition-all duration-200 ease-in-out text-white no-underline hover:bg-[#2a2f3f] hover:translate-x-0.5 active:translate-x-0 active:opacity-90 ${
                collapsed ? 'justify-center px-2.5' : ''
              }`}
              onClick={handleLinkClick}
            >
              <i className={`fas ${item.icon} mr-3 w-5 text-center`}></i>
              {!collapsed && <span>{item.text}</span>}
            </Link>
          </li>
        ))}

        {/* Logout */}
        <li className="my-0.5">
          <button
            type="button"
            className={`w-full text-left flex items-center px-5 py-3 cursor-pointer transition-all duration-200 ease-in-out text-white no-underline font-inherit text-inherit hover:bg-[#2a2f3f] hover:translate-x-0.5 active:translate-x-0 active:opacity-90 ${
              collapsed ? 'justify-center px-2.5' : ''
            }`}
            onClick={() => {
              sessionStorage.clear();
              window.location.href = '/login';
            }}
          >
            <i className="fas fa-sign-out-alt mr-3 w-5 text-center"></i>
            {!collapsed && <span>Logout</span>}
          </button>
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;
