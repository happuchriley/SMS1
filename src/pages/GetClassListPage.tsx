import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { getFilteredClassStatistics } from '@/data/adminMock'
import './GetClassListPage.css'

const ACTION_ITEMS = [
  { id: 'class-list', label: 'Class List', icon: ClassListIcon },
  { id: 'attendants', label: 'Attendants', icon: AttendantsIcon },
  { id: 'assignment', label: 'Assignment/Notes', icon: AssignmentIcon },
  { id: 'media', label: 'Media Library', icon: MediaLibraryIcon },
  { id: 'promotion', label: 'Student Promotion', icon: PromotionIcon },
  { id: 'tests', label: 'Tests and Quizzes', icon: TestsIcon },
] as const

export default function GetClassListPage() {
  const [openActionClassId, setOpenActionClassId] = useState<string | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  const classRows = getFilteredClassStatistics('')

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
    <div className="get-class-list-page">
      <header className="get-class-list-header">
        <div className="get-class-list-heading">
          <h1 className="get-class-list-title">Class List</h1>
          <nav className="get-class-list-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <span>Class List</span>
          </nav>
          <GoBack to="/admin/students" label="Go back to Dashboard" className="get-class-list-goback" />
        </div>
      </header>

      <div className="get-class-list-card">
        <p className="get-class-list-select-hint">Select Single</p>
        <div className="get-class-list-table-wrap">
          <table className="get-class-list-table" role="grid">
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Class Name</th>
                <th scope="col">No. On Roll</th>
                <th scope="col">Action</th>
              </tr>
            </thead>
            <tbody>
              {classRows.map((row, index) => (
                <tr key={row.id}>
                  <td>{index + 1}</td>
                  <td>{row.name}</td>
                  <td>
                    <Link
                      to={`/admin/class-list?class=${encodeURIComponent(row.name)}`}
                      className="get-class-list-roll-link"
                    >
                      {row.onRoll} Students
                    </Link>
                  </td>
                  <td className="get-class-list-td-action">
                    <div
                      className="get-class-list-action-wrap"
                      ref={openActionClassId === row.id ? actionMenuRef : undefined}
                    >
                      <button
                        type="button"
                        className="get-class-list-action-btn"
                        aria-expanded={openActionClassId === row.id ? 'true' : 'false'}
                        aria-haspopup="true"
                        aria-label={`Actions for ${row.name}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenActionClassId((prev) => (prev === row.id ? null : row.id))
                        }}
                      >
                        Action <ActionChevronIcon />
                      </button>
                      {openActionClassId === row.id && (
                        <div
                          className="get-class-list-action-menu"
                          role="menu"
                          aria-label={`Actions for ${row.name}`}
                        >
                          {ACTION_ITEMS.map((item) => {
                            const Icon = item.icon
                            if (item.id === 'class-list') {
                              return (
                                <Link
                                  key={item.id}
                                  to={`/admin/class-list?class=${encodeURIComponent(row.name)}`}
                                  role="menuitem"
                                  className="get-class-list-action-menu-item"
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
                                  className="get-class-list-action-menu-item"
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
                                  className="get-class-list-action-menu-item"
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
                                  className="get-class-list-action-menu-item"
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
                                  className="get-class-list-action-menu-item"
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
                                  className="get-class-list-action-menu-item"
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
