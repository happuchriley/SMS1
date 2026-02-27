import { useState } from 'react'
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom'
import { useFeedback } from '@/contexts/FeedbackContext'
import { RegisteredStudentsProvider } from '@/contexts/RegisteredStudentsContext'
import { StudentAccountOverridesProvider } from '@/contexts/StudentAccountOverridesContext'
import './AdminLayout.css'

const MANAGE_STUDENTS_SUBMENU = [
  { label: 'Menu', href: '/admin/students' },
  { label: 'Add New Student', href: '/admin/students/add' },
  { label: 'Students List (All)', href: '/admin/students/list' },
  { label: 'Students List (Active)', href: '/admin/students/list/active' },
  { label: 'Fresh Students', href: '/admin/students/list/fresh' },
  { label: 'Students List (Inactive)', href: '/admin/students/list/inactive' },
  { label: 'Get Class List', href: '/admin/students/class-list' },
  { label: 'Parents List', href: '/admin/students/parents' },
] as const

const MANAGE_STAFF_SUBMENU = [
  { label: 'Menu', href: '/admin/staff' },
  { label: 'Add New Staff', href: '/admin/staff/add' },
  { label: 'Staff List (All)', href: '/admin/staff/list' },
  { label: 'Staff List (Active)', href: '/admin/staff/list/active' },
  { label: 'Staff List (New)', href: '/admin/staff/list/new' },
  { label: 'Staff List (Inactive)', href: '/admin/staff/list/inactive' },
  { label: 'Staff Restriction', href: '/admin/staff/restriction' },
] as const

export default function AdminLayout() {
  const { showFeedback } = useFeedback()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [manageStudentsExpanded, setManageStudentsExpanded] = useState(true)
  const [manageStaffExpanded, setManageStaffExpanded] = useState(true)
  const location = useLocation()
  const ariaExpanded = sidebarOpen ? 'true' : 'false'
  const ariaOverlayHidden = sidebarOpen ? 'false' : 'true'

  const isStudentsSubitemActive = (href: string) => {
    const path = href.split('#')[0]
    if (location.pathname !== path) return false
    const hash = href.includes('#') ? href.split('#')[1] : ''
    const currentHash = location.hash.slice(1)
    if (!hash) return !currentHash
    return currentHash === hash
  }

  const isStaffSubitemActive = (href: string) => {
    const path = href.split('#')[0]
    return location.pathname === path
  }

  return (
    <div className="admin-layout">
      <header className="admin-header">
        <div className="admin-header-left">
          <button
            type="button"
            className="admin-menu-btn"
            aria-label="Toggle menu"
            aria-expanded={ariaExpanded}
            onClick={() => setSidebarOpen((o) => !o)}
          >
            <MenuIcon />
          </button>
          <div className="admin-logo" aria-hidden>EIS</div>
          <span className="admin-school-name">Excelz Int. School</span>
        </div>
        <nav className="admin-header-nav">
          <a href="#home">Home</a>
          <a href="#profile">Profile</a>
          <select className="admin-header-select" aria-label="School">
            <option>Excelz International School</option>
          </select>
          <select className="admin-header-select" aria-label="Go to">
            <option>Go To</option>
          </select>
        </nav>
        <div className="admin-header-icons">
          <button type="button" className="admin-icon-btn" aria-label="Search" onClick={() => showFeedback('Search opened.', 'info')}>
            <SearchIcon />
          </button>
          <button type="button" className="admin-icon-btn" aria-label="Notifications" onClick={() => showFeedback('Notifications.', 'info')}>
            <BellIcon />
          </button>
          <button type="button" className="admin-icon-btn" aria-label="Chat" onClick={() => showFeedback('Chat opened.', 'info')}>
            <ChatIcon />
          </button>
          <button type="button" className="admin-icon-btn" aria-label="Settings" onClick={() => showFeedback('Settings opened.', 'info')}>
            <SettingsIcon />
          </button>
          <button type="button" className="admin-icon-btn" aria-label="Full screen" onClick={() => showFeedback('Full screen.', 'info')}>
            <FullscreenIcon />
          </button>
          <button type="button" className="admin-icon-btn" aria-label="Menu" onClick={() => showFeedback('Menu.', 'info')}>
            <GridIcon />
          </button>
        </div>
      </header>
      <div
        className={`admin-sidebar-overlay ${sidebarOpen ? 'admin-sidebar-overlay--visible' : ''}`}
        aria-hidden={ariaOverlayHidden}
        onClick={() => setSidebarOpen(false)}
      />
      <div className="admin-body">
        <aside
          className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}
          aria-label="Main navigation"
        >
          <div className="admin-user">
            <div className="admin-avatar">D</div>
            <span className="admin-username">DTeye</span>
            <span className="admin-role">Administrator</span>
          </div>
          <nav
            className="admin-sidebar-nav"
            onClick={(e) => {
              if ((e.target as HTMLElement).closest('a')) setSidebarOpen(false)
            }}
          >
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `admin-nav-item ${isActive ? 'admin-nav-item--active' : ''}`
              }
            >
              <DashboardIcon /> <span>Dashboard</span> <ChevronIcon />
            </NavLink>

            <span className="admin-nav-group-label">People</span>
            <div className="admin-nav-group">
              <button
                type="button"
                className={`admin-nav-item admin-nav-item--parent ${manageStudentsExpanded ? 'admin-nav-item--expanded' : ''}`}
                onClick={() => setManageStudentsExpanded((e) => !e)}
                aria-expanded={manageStudentsExpanded}
                aria-controls="manage-students-submenu"
              >
                <PeopleIcon /> <span>Manage Students</span>
                <span className={`admin-nav-chevron ${!manageStudentsExpanded ? 'admin-nav-chevron--closed' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              <ul
                id="manage-students-submenu"
                className="admin-nav-submenu"
                role="group"
                aria-label="Manage Students"
                hidden={!manageStudentsExpanded}
              >
                {MANAGE_STUDENTS_SUBMENU.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`admin-nav-subitem ${isStudentsSubitemActive(item.href) ? 'admin-nav-subitem--active' : ''}`}
                    >
                      <CircleIcon /> <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="admin-nav-group">
              <button
                type="button"
                className={`admin-nav-item admin-nav-item--parent ${manageStaffExpanded ? 'admin-nav-item--expanded' : ''}`}
                onClick={() => setManageStaffExpanded((e) => !e)}
                aria-expanded={manageStaffExpanded}
                aria-controls="manage-staff-submenu"
              >
                <PeopleIcon /> <span>Manage Staff</span>
                <span className={`admin-nav-chevron ${!manageStaffExpanded ? 'admin-nav-chevron--closed' : ''}`}>
                  <ChevronDownIcon />
                </span>
              </button>
              <ul
                id="manage-staff-submenu"
                className="admin-nav-submenu"
                role="group"
                aria-label="Manage Staff"
                hidden={!manageStaffExpanded}
              >
                {MANAGE_STAFF_SUBMENU.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className={`admin-nav-subitem ${isStaffSubitemActive(item.href) ? 'admin-nav-subitem--active' : ''}`}
                    >
                      <CircleIcon /> <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <span className="admin-nav-group-label">Finance</span>
            <a href="#billing" className="admin-nav-item">
              <ReceiptIcon /> <span>Billing</span> <ChevronIcon />
            </a>
            <a href="#fee-collection" className="admin-nav-item">
              <CoinsIcon /> <span>Fee Collection</span> <ChevronIcon />
            </a>
            <a href="#payroll" className="admin-nav-item">
              <MoneyIcon /> <span>Payroll</span> <ChevronIcon />
            </a>
            <a href="#finance-entries" className="admin-nav-item">
              <LedgerIcon /> <span>Finance Entries</span> <ChevronIcon />
            </a>
            <a href="#financial-reports" className="admin-nav-item">
              <ChartIcon /> <span>Financial Reports</span> <ChevronIcon />
            </a>

            <span className="admin-nav-group-label">Operations</span>
            <a href="#reports" className="admin-nav-item">
              <ChartIcon /> <span>Reports &amp; Assmnt.</span> <ChevronIcon />
            </a>
            <a href="#inventory" className="admin-nav-item">
              <TruckIcon /> <span>Inventory</span> <ChevronIcon />
            </a>

            <span className="admin-nav-group-label">Communications</span>
            <a href="#sms-reminder" className="admin-nav-item">
              <BellIcon /> <span>SMS/Email Reminder</span> <ChevronIcon />
            </a>
            <a href="#news" className="admin-nav-item">
              <NewspaperIcon /> <span>News/Notices</span> <ChevronIcon />
            </a>

            <span className="admin-nav-group-label">Learning</span>
            <a href="#tlms" className="admin-nav-item">
              <BookIcon /> <span>TLMs</span> <ChevronIcon />
            </a>
            <a href="#e-learning" className="admin-nav-item">
              <MonitorIcon /> <span>E-Learning</span> <ChevronIcon />
            </a>

            <span className="admin-nav-group-label">Settings</span>
            <a href="#school-setup" className="admin-nav-item">
              <GearIcon /> <span>School Setup</span> <ChevronIcon />
            </a>
            <a href="#documents" className="admin-nav-item">
              <DocumentIcon /> <span>My Documents</span> <ChevronIcon />
            </a>
            <a href="#account" className="admin-nav-item">
              <UserIcon /> <span>My Account</span> <ChevronIcon />
            </a>
          </nav>
        </aside>
        <main className="admin-main">
          <RegisteredStudentsProvider>
            <StudentAccountOverridesProvider>
              <Outlet />
            </StudentAccountOverridesProvider>
          </RegisteredStudentsProvider>
        </main>
      </div>
    </div>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}
function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}
function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function FullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
    </svg>
  )
}
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}
function ReceiptIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  )
}
function CoinsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="8" cy="8" r="6" />
      <path d="M18.09 10.37A6 6 0 1 1 10.34 18" />
      <path d="M7 6h1v4" />
      <path d="m14.09 10.37 2.83-2.83" />
    </svg>
  )
}
function TruckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18h2" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    </svg>
  )
}
function MoneyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}
function LedgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  )
}
function NewspaperIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
      <path d="M18 14h-8" />
      <path d="M15 18h-5" />
      <path d="M10 12h8" />
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h8" />
    </svg>
  )
}
function MonitorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}
function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function CircleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
