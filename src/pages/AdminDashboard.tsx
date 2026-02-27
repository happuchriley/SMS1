import { useState, useEffect, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  classOptions,
  academicYearOptions,
  termOptions,
  feesFilterOptions,
  getFilteredClassStatistics,
  getFilteredStudentStats,
  getFilteredStaffStats,
  getFilteredFinancialSummary,
} from '@/data/adminMock'
import './AdminDashboard.css'

const DASHBOARD_ACTION_ITEMS = [
  { id: 'class-list', label: 'Class List', icon: ClassListIcon },
  { id: 'attendants', label: 'Attendants', icon: AttendantsIcon },
  { id: 'assignment', label: 'Assignment/Notes', icon: AssignmentIcon },
  { id: 'media', label: 'Media Library', icon: MediaLibraryIcon },
  { id: 'promotion', label: 'Student Promotion', icon: PromotionIcon },
  { id: 'tests', label: 'Tests and Quizzes', icon: TestsIcon },
] as const

export default function AdminDashboard() {
  const [academicYear, setAcademicYear] = useState('')
  const [term, setTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [fees, setFees] = useState('')
  const [openActionClassId, setOpenActionClassId] = useState<string | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  const studentStatsFiltered = useMemo(
    () => getFilteredStudentStats(academicYear, term, selectedClass, fees),
    [academicYear, term, selectedClass, fees]
  )
  const staffStatsFiltered = useMemo(
    () => getFilteredStaffStats(academicYear, term, selectedClass, fees),
    [academicYear, term, selectedClass, fees]
  )
  const classStatisticsFiltered = useMemo(
    () => getFilteredClassStatistics(selectedClass),
    [selectedClass]
  )
  const financialSummaryFiltered = useMemo(
    () => getFilteredFinancialSummary(academicYear, term, fees),
    [academicYear, term, fees]
  )

  useEffect(() => {
    if (!openActionClassId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current?.contains(e.target as Node)) return
      setOpenActionClassId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openActionClassId])

  return (
    <div className="admin-dashboard">
      <header className="admin-dashboard-header">
        <nav className="admin-breadcrumb" aria-label="Breadcrumb">
          <Link to="/admin">Home</Link>
          {' / '}
          Dashboard
        </nav>
        <div className="admin-dashboard-heading">
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <p className="admin-dashboard-welcome">Welcome back. Here’s an overview of your school.</p>
        </div>
      </header>

      <section className="admin-filters" aria-label="Filters">
        <label className="admin-filters-label">Quick filters</label>
        <div className="admin-filters-row">
          <label className="admin-filter-group">
            <span className="admin-filter-label">Academic Year</span>
            <select
              className="admin-dropdown"
              aria-label="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            >
              <option value="">Select year</option>
              {academicYearOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-filter-group">
            <span className="admin-filter-label">Term</span>
            <select
              className="admin-dropdown"
              aria-label="Term"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            >
              <option value="">Select term</option>
              {termOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-filter-group">
            <span className="admin-filter-label">Class</span>
            <select
              className="admin-dropdown admin-dropdown--wide"
              aria-label="Class"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">Select class</option>
              {classOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
          <label className="admin-filter-group">
            <span className="admin-filter-label">Fees</span>
            <select
              className="admin-dropdown"
              aria-label="Fees"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
            >
              <option value="">Select fees</option>
              {feesFilterOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="admin-kpi-row" aria-label="Key metrics">
        <div className="admin-kpi-card admin-kpi-card--students">
          <span className="admin-kpi-card__label">Total Students</span>
          <span className="admin-kpi-card__value">{studentStatsFiltered.total}</span>
          <span className="admin-kpi-card__meta">Active: {studentStatsFiltered.active}</span>
        </div>
        <div className="admin-kpi-card admin-kpi-card--staff">
          <span className="admin-kpi-card__label">Total Staff</span>
          <span className="admin-kpi-card__value">{staffStatsFiltered.total}</span>
          <span className="admin-kpi-card__meta">Active: {staffStatsFiltered.active}</span>
        </div>
        <div className="admin-kpi-card admin-kpi-card--inactive">
          <span className="admin-kpi-card__label">Inactive Students</span>
          <span className="admin-kpi-card__value">{studentStatsFiltered.inactive}</span>
        </div>
        <div className="admin-kpi-card admin-kpi-card--new">
          <span className="admin-kpi-card__label">New This Term</span>
          <span className="admin-kpi-card__value">{studentStatsFiltered.new + staffStatsFiltered.new}</span>
        </div>
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-financial" aria-labelledby="financial-heading">
          <h2 id="financial-heading" className="admin-section-title">
            Financial Summary
          </h2>
          <div className="admin-financial-cards">
            {financialSummaryFiltered.map((item) => (
              <div
                key={item.label}
                className={`admin-financial-card admin-financial-card--${item.variant}`}
              >
                <span className="admin-financial-card__label">{item.label}</span>
                <span className="admin-financial-card__amount">GHC {item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-class-stats" aria-labelledby="class-heading">
          <h2 id="class-heading" className="admin-section-title">
            Class Statistics
          </h2>
          <div className="admin-table-scroll">
            <div className="admin-table-wrap">
              <table className="admin-table">
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>No. on roll</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {classStatisticsFiltered.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>
                      <a href="#students" className="admin-table-link">
                        {row.onRoll} Students
                      </a>
                    </td>
                    <td className="admin-table-td-action">
                      <div
                        className="admin-action-wrap"
                        ref={openActionClassId === row.id ? actionMenuRef : undefined}
                      >
                        <button
                          type="button"
                          className="admin-action-btn"
                          aria-expanded={openActionClassId === row.id ? 'true' : 'false'}
                          aria-haspopup="true"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenActionClassId((prev) => (prev === row.id ? null : row.id))
                          }}
                        >
                          Action <ActionChevronIcon />
                        </button>
                        {openActionClassId === row.id && (
                          <div className="admin-action-menu" role="menu" aria-label={`Actions for ${row.name}`}>
                            {DASHBOARD_ACTION_ITEMS.map((item) => {
                              const Icon = item.icon
                              if (item.id === 'class-list') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/class-list?class=${encodeURIComponent(row.name)}`}
                                    role="menuitem"
                                    className="admin-action-menu-item"
                                    onClick={() => setOpenActionClassId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'attendants') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/attendance?class=${encodeURIComponent(row.name)}`}
                                    role="menuitem"
                                    className="admin-action-menu-item"
                                    onClick={() => setOpenActionClassId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'assignment') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/tlm?class=${encodeURIComponent(row.name)}`}
                                    role="menuitem"
                                    className="admin-action-menu-item"
                                    onClick={() => setOpenActionClassId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'media') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/media-library?class=${encodeURIComponent(row.name)}`}
                                    role="menuitem"
                                    className="admin-action-menu-item"
                                    onClick={() => setOpenActionClassId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'promotion') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/promotion?class=${encodeURIComponent(row.name)}`}
                                    role="menuitem"
                                    className="admin-action-menu-item"
                                    onClick={() => setOpenActionClassId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'tests') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/tests-quizzes?class=${encodeURIComponent(row.name)}`}
                                    role="menuitem"
                                    className="admin-action-menu-item"
                                    onClick={() => setOpenActionClassId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              return null
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ActionChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function ClassListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="7" r="2.5" />
      <circle cx="15" cy="7" r="2.5" />
      <circle cx="12" cy="14" r="2.5" />
    </svg>
  )
}

function AttendantsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function AssignmentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function MediaLibraryIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
    </svg>
  )
}

function PromotionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 20v-8l8 4 10-6v14" />
      <path d="M3 12l8 4 10-6" />
    </svg>
  )
}

function TestsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14" />
      <path d="M4 15h16M8 11h8M8 7h4" />
    </svg>
  )
}
