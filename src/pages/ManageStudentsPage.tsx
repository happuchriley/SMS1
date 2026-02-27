import { Link } from 'react-router-dom'
import { studentStats } from '@/data/adminMock'
import './ManageStudentsPage.css'

const STUDENT_MENU_CARDS = [
  {
    id: 'add',
    title: 'Add new student',
    description: 'Add or register new Students.',
    href: '/admin/students/add',
    icon: 'add',
    isRoute: true,
  },
  {
    id: 'all',
    title: 'All Students',
    description: 'View All students.',
    href: '/admin/students/list',
    icon: 'group',
    isRoute: true,
  },
  {
    id: 'active',
    title: 'Active Students',
    description: 'View Active Students.',
    href: '/admin/students/list/active',
    icon: 'active',
    isRoute: true,
  },
  {
    id: 'inactive',
    title: 'Inactive Students',
    description: 'View Inactive Students.',
    href: '/admin/students/list/inactive',
    icon: 'inactive',
    isRoute: true,
  },
  {
    id: 'new',
    title: 'New Students',
    description: 'View New Students.',
    href: '/admin/students/list/fresh',
    icon: 'new',
    isRoute: true,
  },
  {
    id: 'parents',
    title: 'Parents List',
    description: 'Parents/Guardians List.',
    href: '/admin/students/parents',
    icon: 'parents',
    isRoute: true,
  },
] as const

export default function ManageStudentsPage() {
  return (
    <div className="manage-students-page">
      <header className="manage-students-header">
        <div className="manage-students-heading">
          <h1 className="manage-students-title">Dashboard - Students</h1>
          <nav className="manage-students-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin/students">Dashboard</Link>
          </nav>
        </div>
      </header>

      <section className="manage-students-stats" aria-label="Student statistics">
        <div className="manage-students-stat-card manage-students-stat-card--total">
          <span className="manage-students-stat-card__value">{studentStats.total}</span>
          <span className="manage-students-stat-card__label">Total Students</span>
        </div>
        <div className="manage-students-stat-card manage-students-stat-card--active">
          <span className="manage-students-stat-card__value">{studentStats.active}</span>
          <span className="manage-students-stat-card__label">Active Students</span>
        </div>
        <div className="manage-students-stat-card manage-students-stat-card--inactive">
          <span className="manage-students-stat-card__value">{studentStats.inactive}</span>
          <span className="manage-students-stat-card__label">Inactive Students</span>
        </div>
        <div className="manage-students-stat-card manage-students-stat-card--new">
          <span className="manage-students-stat-card__value">{studentStats.new}</span>
          <span className="manage-students-stat-card__label">New Students (Current Term)</span>
        </div>
      </section>

      <section className="manage-students-cards" aria-label="Student management actions">
        {STUDENT_MENU_CARDS.map((card) =>
          card.isRoute ? (
            <Link
              key={card.id}
              to={card.href}
              className="manage-students-card"
            >
              <span className={`manage-students-card__icon manage-students-card__icon--${card.icon}`}>
                <CardIcon type={card.icon} />
              </span>
              <h2 className="manage-students-card__title">{card.title}</h2>
              <p className="manage-students-card__desc">{card.description}</p>
            </Link>
          ) : (
          <a
            key={card.id}
            href={card.href}
            className="manage-students-card"
          >
            <span className={`manage-students-card__icon manage-students-card__icon--${card.icon}`}>
              <CardIcon type={card.icon} />
            </span>
            <h2 className="manage-students-card__title">{card.title}</h2>
            <p className="manage-students-card__desc">{card.description}</p>
          </a>
          )
        )}
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
    case 'parents':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
          <path d="M12 11v6M9 14h6" />
        </svg>
      )
    default:
      return null
  }
}
