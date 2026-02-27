import { Link } from 'react-router-dom'
import { staffStats } from '@/data/adminMock'
import { useFeedback } from '@/contexts/FeedbackContext'
import './ManageStaffPage.css'

const STAFF_MENU_CARDS = [
  {
    id: 'add',
    title: 'Add new Staff',
    description: 'Add or register new Staff.',
    href: '#staff-add',
    icon: 'add',
  },
  {
    id: 'all',
    title: 'All Staffs',
    description: 'View All Staffs.',
    href: '#staff-list',
    icon: 'group',
  },
  {
    id: 'active',
    title: 'Active Staffs',
    description: 'View Active Staffs.',
    href: '#staff-active',
    icon: 'active',
  },
  {
    id: 'inactive',
    title: 'Inactive Staffs',
    description: 'View Inactive Staffs.',
    href: '#staff-inactive',
    icon: 'inactive',
  },
  {
    id: 'new',
    title: 'New Staffs',
    description: 'View New Staffs.',
    href: '#staff-new',
    icon: 'new',
  },
  {
    id: 'restriction',
    title: 'Staff Restriction',
    description: 'Manage Staff Restriction.',
    href: '#staff-restriction',
    icon: 'restriction',
  },
  {
    id: 'salary',
    title: 'Setup Salary Structure',
    description: 'Setup Salary Structure - Group.',
    href: '#staff-salary',
    icon: 'salary',
  },
  {
    id: 'pay-reports',
    title: 'Pay Reports',
    description: 'Payroll Reports (Payslips, Bank Schedule, GRA, SSNIT etc.).',
    href: '#staff-pay-reports',
    icon: 'pay-reports',
  },
] as const

export default function ManageStaffPage() {
  const { showFeedback } = useFeedback()

  const handleCardClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (id === 'add') showFeedback('Add new staff – coming soon.', 'info')
    else if (id === 'all') showFeedback('All staffs list – coming soon.', 'info')
    else if (id === 'active') showFeedback('Active staffs – coming soon.', 'info')
    else if (id === 'inactive') showFeedback('Inactive staffs – coming soon.', 'info')
    else if (id === 'new') showFeedback('New staffs – coming soon.', 'info')
    else if (id === 'restriction') showFeedback('Staff restriction – coming soon.', 'info')
    else if (id === 'salary') showFeedback('Setup salary structure – coming soon.', 'info')
    else if (id === 'pay-reports') showFeedback('Pay reports – coming soon.', 'info')
    e.preventDefault()
  }

  return (
    <div className="manage-staff-page">
      <header className="manage-staff-header">
        <div className="manage-staff-heading">
          <h1 className="manage-staff-title">Dashboard - Staffs</h1>
          <nav className="manage-staff-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin/staff">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="manage-staff-stats" aria-label="Staff statistics">
        <div className="manage-staff-stat-card manage-staff-stat-card--total">
          <span className="manage-staff-stat-card__value">{staffStats.total}</span>
          <span className="manage-staff-stat-card__label">Total Staffs</span>
        </div>
        <div className="manage-staff-stat-card manage-staff-stat-card--active">
          <span className="manage-staff-stat-card__value">{staffStats.active}</span>
          <span className="manage-staff-stat-card__label">Active Staffs</span>
        </div>
        <div className="manage-staff-stat-card manage-staff-stat-card--inactive">
          <span className="manage-staff-stat-card__value">{staffStats.inactive}</span>
          <span className="manage-staff-stat-card__label">Inactive Staffs</span>
        </div>
        <div className="manage-staff-stat-card manage-staff-stat-card--new">
          <span className="manage-staff-stat-card__value">{staffStats.new}</span>
          <span className="manage-staff-stat-card__label">New Staffs (Current Term)</span>
        </div>
      </section>

      <section className="manage-staff-cards" aria-label="Staff management actions">
        {STAFF_MENU_CARDS.map((card) => (
          <a
            key={card.id}
            href={card.href}
            className="manage-staff-card"
            onClick={(e) => handleCardClick(e, card.id)}
          >
            <span className={`manage-staff-card__icon manage-staff-card__icon--${card.icon}`}>
              <CardIcon type={card.icon} />
            </span>
            <h2 className="manage-staff-card__title">{card.title}</h2>
            <p className="manage-staff-card__desc">{card.description}</p>
          </a>
        ))}
      </section>
    </div>
  )
}

function CardIcon({ type }: { type: string }) {
  switch (type) {
    case 'add':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="8" r="5" />
          <path d="M3 21v-2a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v2" />
          <path d="M16 11h6M19 8v6" />
        </svg>
      )
    case 'group':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'active':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    case 'inactive':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <line x1="22" y1="22" x2="16" y2="16" />
          <line x1="16" y1="22" x2="22" y2="16" />
        </svg>
      )
    case 'new':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 4v4M20 6h4" />
        </svg>
      )
    case 'restriction':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          <circle cx="18" cy="18" r="2" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'salary':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" />
        </svg>
      )
    case 'pay-reports':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </svg>
      )
    default:
      return null
  }
}
