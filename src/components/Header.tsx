import React, { useState, useRef, useEffect, ChangeEvent, MouseEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useResponsive } from '../hooks/useResponsive';

interface HeaderProps {
  toggleSidebar: () => void;
}

interface MenuItem {
  name: string;
  path: string;
  action?: () => void;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const username = sessionStorage.getItem('username') || 'AD';
  const initials = username.substring(0, 2).toUpperCase();
  const { isMobile } = useResponsive();
  const navigate = useNavigate();
  const location = useLocation();
  const [showGoToMenu, setShowGoToMenu] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [clickedButton, setClickedButton] = useState<string | null>(null);
  const goToMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  
  // Check if we're on messages or notifications page
  const isMessagesPage = location.pathname === '/messages';
  const isNotificationsPage = location.pathname === '/notifications';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | Event): void => {
      const target = event.target as HTMLElement;
      if (target.closest('a[href]')) {
        return;
      }
      
      if (goToMenuRef.current && !goToMenuRef.current.contains(target)) {
        setShowGoToMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };

    if (showGoToMenu || showProfileMenu) {
      document.addEventListener('click', handleClickOutside as EventListener, true);
      return () => document.removeEventListener('click', handleClickOutside as EventListener, true);
    }
  }, [showGoToMenu, showProfileMenu]);


  const handleLogout = (): void => {
    sessionStorage.clear();
    navigate('/login');
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Manage Student',
      items: [
        { name: 'Add New Student', path: '/students/add' },
        { name: 'Student List (All)', path: '/students/all' },
        { name: 'Student List (Active)', path: '/students/active' },
        { name: 'Fresh Student', path: '/students/fresh' },
        { name: 'Student List (Inactive)', path: '/students/inactive' },
        { name: 'Get Class List', path: '/students/classes' },
        { name: 'Parent List', path: '/students/parents' }
      ]
    },
    {
      title: 'Manage Staff',
      items: [
        { name: 'Add New Staff', path: '/staff/add' },
        { name: 'Staff List (All)', path: '/staff/all' },
        { name: 'Staff List (Active)', path: '/staff/active' },
        { name: 'Staff List (New)', path: '/staff/new' },
        { name: 'Staff List (Inactive)', path: '/staff/inactive' },
        { name: 'Staff Restriction', path: '/staff/restriction' }
      ]
    },
    {
      title: 'Reports & Assessment',
      items: [
        { name: 'Populate Course - Class', path: '/reports/populate-course-class' },
        { name: 'Populate Course - Student', path: '/reports/populate-course-student' },
        { name: 'Enter Academic Result', path: '/reports/enter-academic-result' },
        { name: 'Student Promotion', path: '/reports/student-promotion' },
        { name: 'End of Term Remark', path: '/reports/end-term-remark' },
        { name: 'Reports Footnote', path: '/reports/footnote' },
        { name: 'Print Group Report', path: '/reports/print-group-report' }
      ]
    },
    {
      title: 'Billing',
      items: [
        { name: 'Create Single Bill', path: '/billing/create-single' },
        { name: 'Create Group Bill', path: '/billing/create-group' },
        { name: 'Scholarship List', path: '/billing/scholarship-list' },
        { name: 'Debtors Report', path: '/billing/debtors-report' },
        { name: 'Creditors Report', path: '/billing/creditors-report' },
        { name: 'Print Group Bill', path: '/billing/print-group-bill' },
        { name: 'Print Group Statement', path: '/billing/print-group-statement' }
      ]
    },
    {
      title: 'Fee Collection',
      items: [
        { name: 'Record Sch Fees (Single View)', path: '/fee-collection/record-single' },
        { name: 'Record Sch Fees (All)', path: '/fee-collection/record-all' },
        { name: 'Manage Other Fee List', path: '/fee-collection/manage-other-fees' },
        { name: 'Record Other Fee', path: '/fee-collection/record-other-fee' },
        { name: 'Receive Other Fee', path: '/fee-collection/receive-other-fee' },
        { name: 'Debtors Report', path: '/fee-collection/debtors-report' },
        { name: 'Creditors Report', path: '/fee-collection/creditors-report' },
        { name: 'Print Group Bill', path: '/fee-collection/print-group-bill' },
        { name: 'Print Group Statement', path: '/fee-collection/print-group-statement' }
      ]
    },
    {
      title: 'Payroll',
      items: [
        { name: 'Setup Salary Structure', path: '/staff/salary-structure' },
        { name: 'Pay Report', path: '/staff/pay-reports' }
      ]
    },
    {
      title: 'Finance Entries',
      items: [
        { name: 'Debtor Entry', path: '/finance/debtor-entry' },
        { name: 'Creditor Entry', path: '/finance/creditor-entry' },
        { name: 'Income Entry', path: '/finance/income-entry' },
        { name: 'Expense Entry', path: '/finance/expense-entry' },
        { name: 'General Journal', path: '/finance/general-journal' },
        { name: 'General Ledger', path: '/finance/general-ledger' },
        { name: 'Fixed Asset', path: '/finance/fixed-asset' }
      ]
    },
    {
      title: 'Financial Reports',
      items: [
        { name: 'Fee Collection Report', path: '/financial-reports/fee-collection' },
        { name: 'Other Fee Report All', path: '/financial-reports/other-fee-all' },
        { name: 'Other Fee Report Range', path: '/financial-reports/other-fee-range' },
        { name: 'Expenditure Report', path: '/financial-reports/expenditure' },
        { name: 'Debtors Report', path: '/financial-reports/debtors' },
        { name: 'Creditors Report', path: '/financial-reports/creditors' },
        { name: 'Generate Ledger', path: '/financial-reports/generate-ledger' },
        { name: 'Trial Balance', path: '/financial-reports/trial-balance' },
        { name: 'Income Statement', path: '/financial-reports/income-statement' },
        { name: 'Chart of Accounts', path: '/financial-reports/chart-of-accounts' }
      ]
    },
    {
      title: 'SMS/Email Reminder',
      items: [
        { name: 'Send Bill Reminder', path: '/reminders/bill-reminder' },
        { name: 'Payment Notification', path: '/reminders/payment-notification' },
        { name: 'Send Application Details', path: '/reminders/application-details' },
        { name: 'Send Event Reminder', path: '/reminders/event-reminder' },
        { name: 'Send Staff Reminder', path: '/reminders/staff-reminder' }
      ]
    },
    {
      title: 'News/Notice',
      items: [
        { name: 'Add/Upload News', path: '/news/add' },
        { name: 'News Page', path: '/news/page' },
        { name: 'Academic Calendar', path: '/news/academic-calendar' }
      ]
    },
    {
      title: 'School Setup',
      items: [
        { name: 'School Details', path: '/setup/school-details' },
        { name: 'Item Setup', path: '/setup/item-setup' },
        { name: 'Stage/Class List', path: '/setup/class-list' },
        { name: 'Subject/Course', path: '/setup/subject-course' },
        { name: 'Bill Item', path: '/setup/bill-item' }
      ]
    },
    {
      title: 'My Account',
      items: [
        { name: 'My Profile', path: '/profile' },
        { name: 'Logout', path: '/login', action: handleLogout }
      ]
    }
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md h-14 sm:h-16 px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between shadow-sm sticky top-0 z-[100] border-b border-slate-200 w-full flex-shrink-0" style={{ position: 'sticky' }}>
      <div className="flex items-center gap-3 sm:gap-4 md:gap-5">
        {isMobile && (
          <button
            className="block bg-transparent border-none text-xl sm:text-2xl cursor-pointer text-slate-900 p-1.5 sm:p-2 rounded transition-all duration-200 ease-in-out touch-manipulation hover:bg-blue-50 active:scale-[0.97] active:opacity-80 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            onClick={toggleSidebar}
            type="button"
          >
            <i className="fas fa-bars transition-transform duration-200"></i>
          </button>
        )}
        <div className="hidden md:flex items-center gap-3 lg:gap-5">
          <Link to="/" className="text-slate-900 no-underline text-sm font-medium hover:text-primary-600 transition-colors">
            Home
          </Link>
          <a 
            href="#school" 
            className="text-slate-900 no-underline text-sm font-medium hover:text-primary-600 transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            Excelz International School
          </a>
          <div className="relative" ref={goToMenuRef}>
            <button
              onClick={() => setShowGoToMenu(!showGoToMenu)}
              className="px-2.5 py-1.5 text-sm border border-slate-200 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex items-center gap-1 hover:bg-blue-50 hover:border-primary-300"
              type="button"
            >
              Go To <i className="fas fa-chevron-down text-xs"></i>
            </button>
            {showGoToMenu && (
              <div 
                className="absolute top-full left-0 mt-2 w-[300px] max-h-[600px] overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl z-50"
                onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
              >
                {menuSections.map((section, idx) => (
                  <div key={idx} className="border-b border-gray-100 last:border-b-0">
                    <div className="px-4 py-2 bg-slate-50 font-semibold text-xs text-slate-700 uppercase">
                      {section.title}
                    </div>
                    {section.items.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        to={item.path}
                        onClick={(e) => {
                          setShowGoToMenu(false);
                          if (item.action) {
                            e.preventDefault();
                            item.action();
                          }
                        }}
                        className="block px-4 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-primary-600 transition-colors cursor-pointer"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        {/* Search Bar - Always visible on desktop, hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 transition-all duration-200 min-w-[200px] max-w-[300px]">
          <i className="fas fa-search text-slate-400 text-sm"></i>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-700 flex-1 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              type="button"
              aria-label="Clear search"
            >
              <i className="fas fa-times text-xs"></i>
            </button>
          )}
        </div>
        <Link
          to="/messages"
          onClick={() => setClickedButton('messages')}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer relative transition-all duration-200 ease-in-out border min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] ${
            isMessagesPage || clickedButton === 'messages'
              ? 'bg-primary-100 border-primary-400 text-primary-600 shadow-md ring-2 ring-primary-200'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm hover:text-primary-500 hover:border-primary-300'
          } active:scale-[0.97] active:opacity-80`}
          aria-label="Messages"
        >
          <i className="fas fa-comments text-sm sm:text-base transition-transform duration-200"></i>
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold">0</span>
        </Link>
        <Link
          to="/notifications"
          onClick={() => setClickedButton('notifications')}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer relative transition-all duration-200 ease-in-out border min-w-[36px] min-h-[36px] sm:min-w-[40px] sm:min-h-[40px] ${
            isNotificationsPage || clickedButton === 'notifications'
              ? 'bg-primary-100 border-primary-400 text-primary-600 shadow-md ring-2 ring-primary-200'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-sm hover:text-primary-500 hover:border-primary-300'
          } active:scale-[0.97] active:opacity-80`}
          aria-label="Notifications"
        >
          <i className="fas fa-bell text-sm sm:text-base transition-transform duration-200"></i>
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full px-1 sm:px-1.5 py-0.5 text-[9px] sm:text-[10px] font-semibold">0</span>
        </Link>
        <div className="relative" ref={profileMenuRef}>
          <div 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all duration-200 ease-in-out hover:bg-blue-50 active:scale-[0.98] active:opacity-80"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold text-[10px] sm:text-xs">
              {initials}
            </div>
            <i className="fas fa-chevron-down text-[10px] sm:text-xs hidden sm:block"></i>
          </div>
          {showProfileMenu && (
            <div 
              className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl z-50"
              onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <i className="fas fa-user mr-2"></i> My Profile
              </Link>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  handleLogout();
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
