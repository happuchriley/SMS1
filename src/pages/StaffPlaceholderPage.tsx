import { Link, useLocation } from 'react-router-dom'
import './StaffPlaceholderPage.css'

const STAFF_PAGE_TITLES: Record<string, string> = {
  '/admin/staff/add': 'Add New Staff',
  '/admin/staff/list': 'Staff List (All)',
  '/admin/staff/list/active': 'Staff List (Active)',
  '/admin/staff/list/new': 'Staff List (New)',
  '/admin/staff/list/inactive': 'Staff List (Inactive)',
  '/admin/staff/restriction': 'Staff Restriction',
}

export default function StaffPlaceholderPage() {
  const location = useLocation()
  const pathname = location.pathname
  const title = STAFF_PAGE_TITLES[pathname] ?? 'Staff'

  return (
    <div className="staff-placeholder-page">
      <header className="staff-placeholder-header">
        <h1 className="staff-placeholder-title">{title}</h1>
        <nav className="staff-placeholder-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin">Home</Link>
          {' / '}
          <Link to="/admin/staff">Dashboard</Link>
          {' / '}
          <span>{title}</span>
        </nav>
      </header>
      <div className="staff-placeholder-card">
        <p className="staff-placeholder-message">This section is coming soon.</p>
        <Link to="/admin/staff" className="staff-placeholder-back">
          Back to Staff Dashboard
        </Link>
      </div>
    </div>
  )
}
