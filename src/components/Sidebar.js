import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ collapsed, open = false, toggleSidebar, currentPath, isMobile = false }) => {
  const [expandedMenus, setExpandedMenus] = useState({
    students: currentPath.startsWith('/students'),
    staff: currentPath.startsWith('/staff'),
    reports: currentPath.startsWith('/reports'),
    billing: currentPath.startsWith('/billing'),
    feeCollection: currentPath.startsWith('/fee-collection'),
    payroll: currentPath.startsWith('/payroll'),
    finance: currentPath.startsWith('/finance'),
    financialReports: currentPath.startsWith('/financial-reports'),
    reminders: currentPath.startsWith('/reminders'),
    news: currentPath.startsWith('/news'),
    tlms: currentPath.startsWith('/tlms'),
    elearning: currentPath.startsWith('/elearning'),
    setup: currentPath.startsWith('/setup'),
    documents: currentPath.startsWith('/documents')
  });
  
  // Update expanded menus when path changes
  useEffect(() => {
    setExpandedMenus({
      students: currentPath.startsWith('/students'),
      staff: currentPath.startsWith('/staff'),
      reports: currentPath.startsWith('/reports'),
      billing: currentPath.startsWith('/billing'),
      feeCollection: currentPath.startsWith('/fee-collection'),
      payroll: currentPath.startsWith('/payroll'),
      finance: currentPath.startsWith('/finance'),
      financialReports: currentPath.startsWith('/financial-reports'),
      reminders: currentPath.startsWith('/reminders'),
      news: currentPath.startsWith('/news'),
      tlms: currentPath.startsWith('/tlms'),
      elearning: currentPath.startsWith('/elearning'),
      setup: currentPath.startsWith('/setup'),
      documents: currentPath.startsWith('/documents')
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

  const isActive = (path) => {
    if (path === currentPath) return true;
    // Also check if currentPath starts with the path for nested routes
    if (currentPath.startsWith(path) && path !== '/') return true;
    return false;
  };

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

        {/* Reports & Assessment */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.reports ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('reports')}
          >
            <div className="flex items-center">
              <i className="fas fa-chart-pie mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Reports & Assmnt.</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.reports ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.reports ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/reports/populate-course-class" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/populate-course-class') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Populate Course - Class
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports/populate-course-student" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/populate-course-student') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Populate Course - Student
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports/enter-academic-result" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/enter-academic-result') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Enter Academic Result
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports/student-promotion" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/student-promotion') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Student Promotion
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports/end-term-remark" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/end-term-remark') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  End of Term Remark
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports/footnote" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/footnote') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Reports Footnote
                </Link>
              </li>
              <li>
                <Link 
                  to="/reports/print-group-report" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reports/print-group-report') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Print Group Report
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Billing */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.billing ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('billing')}
          >
            <div className="flex items-center">
              <i className="fas fa-file-invoice-dollar mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Billing</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.billing ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.billing ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/billing/create-single" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/create-single') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Create Single Bill
                </Link>
              </li>
              <li>
                <Link 
                  to="/billing/create-group" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/create-group') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Create Group Bill
                </Link>
              </li>
              <li>
                <Link 
                  to="/billing/scholarship-list" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/scholarship-list') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Scholarship List
                </Link>
              </li>
              <li>
                <Link 
                  to="/billing/debtors-report" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/debtors-report') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Debtors Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/billing/creditors-report" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/creditors-report') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Creditors Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/billing/print-group-bill" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/print-group-bill') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Print Group Bill
                </Link>
              </li>
              <li>
                <Link 
                  to="/billing/print-group-statement" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/billing/print-group-statement') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Print Group Statement
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Fee Collection */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.feeCollection ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('feeCollection')}
          >
            <div className="flex items-center">
              <i className="fas fa-wallet mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Fee Collection</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.feeCollection ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.feeCollection ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/fee-collection/record-single" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/record-single') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Record Single Payment
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/record-all" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/record-all') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Record All Payments
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/manage-other-fees" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/manage-other-fees') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Manage Other Fees
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/record-other-fee" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/record-other-fee') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Record Other Fee
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/receive-other-fee" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/receive-other-fee') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Receive Other Fee
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/debtors-report" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/debtors-report') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Debtors Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/creditors-report" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/creditors-report') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Creditors Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/print-group-bill" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/print-group-bill') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Print Group Bill
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee-collection/print-group-statement" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/fee-collection/print-group-statement') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Print Group Statement
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Payroll */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.payroll ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('payroll')}
          >
            <div className="flex items-center">
              <i className="fas fa-coins mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Payroll</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.payroll ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.payroll ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/payroll/overview" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/payroll/overview') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Payroll Overview
                </Link>
              </li>
              <li>
                <Link 
                  to="/payroll/generate-payslip" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/payroll/generate-payslip') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Generate Payslip
                </Link>
              </li>
              <li>
                <Link 
                  to="/payroll/schedule" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/payroll/schedule') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Payroll Schedule
                </Link>
              </li>
              <li>
                <Link 
                  to="/payroll/bank-schedule" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/payroll/bank-schedule') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Bank Schedule
                </Link>
              </li>
              <li>
                <Link 
                  to="/payroll/tax-reports" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/payroll/tax-reports') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Tax Reports
                </Link>
              </li>
              <li>
                <Link 
                  to="/payroll/advances" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/payroll/advances') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Salary Advances
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Finance Entries */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.finance ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('finance')}
          >
            <div className="flex items-center">
              <i className="fas fa-calculator mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Finance Entries</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.finance ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.finance ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/finance/debtor-entry" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/debtor-entry') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Debtor Entry
                </Link>
              </li>
              <li>
                <Link 
                  to="/finance/creditor-entry" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/creditor-entry') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Creditor Entry
                </Link>
              </li>
              <li>
                <Link 
                  to="/finance/income-entry" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/income-entry') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Income Entry
                </Link>
              </li>
              <li>
                <Link 
                  to="/finance/expense-entry" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/expense-entry') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Expense Entry
                </Link>
              </li>
              <li>
                <Link 
                  to="/finance/general-journal" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/general-journal') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  General Journal
                </Link>
              </li>
              <li>
                <Link 
                  to="/finance/general-ledger" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/general-ledger') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  General Ledger
                </Link>
              </li>
              <li>
                <Link 
                  to="/finance/fixed-asset" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/finance/fixed-asset') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Fixed Asset
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Financial Reports */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.financialReports ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('financialReports')}
          >
            <div className="flex items-center">
              <i className="fas fa-chart-line mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">Financial Reports</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.financialReports ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.financialReports ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/financial-reports/fee-collection" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/fee-collection') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Fee Collection Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/other-fee-all" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/other-fee-all') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Other Fee - All
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/other-fee-range" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/other-fee-range') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Other Fee - Range
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/expenditure" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/expenditure') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Expenditure Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/debtors" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/debtors') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Debtors Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/creditors" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/creditors') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Creditors Report
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/generate-ledger" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/generate-ledger') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Generate Ledger
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/trial-balance" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/trial-balance') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Trial Balance
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/income-statement" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/income-statement') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Income Statement
                </Link>
              </li>
              <li>
                <Link 
                  to="/financial-reports/chart-of-accounts" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/financial-reports/chart-of-accounts') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Chart of Accounts
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* SMS/Email Reminders */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.reminders ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('reminders')}
          >
            <div className="flex items-center">
              <i className="fas fa-envelope-open-text mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">SMS/Email Reminder</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.reminders ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.reminders ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/reminders/bill-reminder" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reminders/bill-reminder') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Bill Reminder
                </Link>
              </li>
              <li>
                <Link 
                  to="/reminders/payment-notification" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reminders/payment-notification') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Payment Notification
                </Link>
              </li>
              <li>
                <Link 
                  to="/reminders/application-details" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reminders/application-details') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Application Details
                </Link>
              </li>
              <li>
                <Link 
                  to="/reminders/event-reminder" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reminders/event-reminder') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Event Reminder
                </Link>
              </li>
              <li>
                <Link 
                  to="/reminders/staff-reminder" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/reminders/staff-reminder') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Staff Reminder
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* News/Notices */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.news ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('news')}
          >
            <div className="flex items-center">
              <i className="fas fa-bullhorn mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">News/Notices</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.news ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.news ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/news/add" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/news/add') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Add News
                </Link>
              </li>
              <li>
                <Link 
                  to="/news/page" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/news/page') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  News Page
                </Link>
              </li>
              <li>
                <Link 
                  to="/news/academic-calendar" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/news/academic-calendar') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Academic Calendar
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* TLMs */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.tlms ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('tlms')}
          >
            <div className="flex items-center">
              <i className="fas fa-book-open mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">TLMs</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.tlms ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.tlms ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/tlms/library" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/tlms/library') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  TLMs Library
                </Link>
              </li>
              <li>
                <Link 
                  to="/tlms/upload" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/tlms/upload') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Upload TLMs
                </Link>
              </li>
              <li>
                <Link 
                  to="/tlms/categories" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/tlms/categories') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  TLMs Categories
                </Link>
              </li>
              <li>
                <Link 
                  to="/tlms/my-materials" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/tlms/my-materials') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  My TLMs
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* E-Learning */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.elearning ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('elearning')}
          >
            <div className="flex items-center">
              <i className="fas fa-graduation-cap mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">E-Learning</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.elearning ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.elearning ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/elearning/courses" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/elearning/courses') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link 
                  to="/elearning/assignments" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/elearning/assignments') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Assignments
                </Link>
              </li>
              <li>
                <Link 
                  to="/elearning/quizzes" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/elearning/quizzes') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Quizzes
                </Link>
              </li>
              <li>
                <Link 
                  to="/elearning/progress" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/elearning/progress') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Students Progress
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* School Setup */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.setup ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('setup')}
          >
            <div className="flex items-center">
              <i className="fas fa-sliders-h mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">School Setup</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.setup ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.setup ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/setup/school-details" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/setup/school-details') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  School Details
                </Link>
              </li>
              <li>
                <Link 
                  to="/setup/item-setup" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/setup/item-setup') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Item Setup
                </Link>
              </li>
              <li>
                <Link 
                  to="/setup/class-list" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/setup/class-list') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Class List
                </Link>
              </li>
              <li>
                <Link 
                  to="/setup/subject-course" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/setup/subject-course') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Subject/Course
                </Link>
              </li>
              <li>
                <Link 
                  to="/setup/bill-item" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/setup/bill-item') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Bill Item
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* My Documents */}
        <li className="my-1">
          <button
            type="button"
            className={`w-full flex items-center justify-between px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline font-inherit text-inherit hover:bg-white/10 hover:text-white mx-2 ${
              expandedMenus.documents ? 'bg-primary/20 text-white border-l-3 border-primary font-semibold' : ''
            } ${collapsed ? 'justify-center px-3 mx-2' : ''}`}
            onClick={() => toggleSubmenu('documents')}
          >
            <div className="flex items-center">
              <i className="fas fa-archive mr-3 w-5 text-center text-sm"></i>
              {!collapsed && <span className="text-sm font-medium">My Documents</span>}
            </div>
            {!collapsed && (
              <i className={`fas fa-chevron-right text-xs transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                expandedMenus.documents ? 'rotate-90' : ''
              }`}></i>
            )}
          </button>
          {!collapsed && (
            <ul className={`list-none ${expandedMenus.documents ? 'block' : 'hidden'} py-2 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`}>
              <li>
                <Link 
                  to="/documents/my-uploads" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/documents/my-uploads') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  My Uploads
                </Link>
              </li>
              <li>
                <Link 
                  to="/documents/shared" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/documents/shared') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Shared Documents
                </Link>
              </li>
              <li>
                <Link 
                  to="/documents/categories" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/documents/categories') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Document Categories
                </Link>
              </li>
              <li>
                <Link 
                  to="/documents/recent" 
                  className={`block px-5 py-2 pl-10 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/70 text-sm flex items-center gap-2 hover:bg-white/5 hover:text-white/90 mx-2 ${
                    isActive('/documents/recent') ? 'bg-white/10 text-white border-l-2 border-secondary pl-[38px] font-medium' : ''
                  }`}
                  onClick={handleLinkClick}
                >
                  Recent Documents
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* My Account */}
        <li className="my-1">
          <Link 
            to="/profile" 
            className={`flex items-center px-5 py-2.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] text-white/90 no-underline hover:bg-white/10 hover:text-white mx-2 ${
              collapsed ? 'justify-center px-3 mx-2' : ''
            } ${isActive('/profile') ? 'bg-white/10 text-white border-l-2 border-primary' : ''}`}
            onClick={handleLinkClick}
          >
            <i className="fas fa-user-cog mr-3 w-5 text-center text-sm"></i>
            {!collapsed && <span className="text-sm font-medium">My Account</span>}
          </Link>
        </li>

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
