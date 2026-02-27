import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { getClassListRows, type ClassListRow } from '@/data/adminMock'
import { exportToExcel, exportToPDF, printPage, type ExportColumn } from '@/utils/exportUtils'
import './ClassListPage.css'

const PER_PAGE_OPTIONS = [10, 25, 50]

const COLUMNS: ExportColumn[] = [
  { id: 'action', label: 'Action' },
  { id: 'no', label: 'No.' },
  { id: 'image', label: 'Image' },
  { id: 'studentId', label: 'StudentID' },
  { id: 'studentName', label: 'Student.Name' },
  { id: 'gender', label: 'Gender' },
  { id: 'dateOfBirth', label: 'Date.Of.Birth' },
  { id: 'contact', label: 'Contact' },
  { id: 'national', label: 'National' },
  { id: 'class', label: 'Class' },
  { id: 'status', label: 'Status' },
  { id: 'adminDate', label: 'Admin.Date' },
]

function matchRow(row: ClassListRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    row.studentId.toLowerCase().includes(q) ||
    row.studentName.toLowerCase().includes(q) ||
    row.contact.toLowerCase().includes(q) ||
    row.gender.toLowerCase().includes(q) ||
    row.national.toLowerCase().includes(q) ||
    row.status.toLowerCase().includes(q)
  )
}

export default function ClassListPage() {
  const [searchParams] = useSearchParams()
  const { showFeedback } = useFeedback()
  const className = searchParams.get('class') || 'Basic 2'

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    COLUMNS.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
  )
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [openActionId, setOpenActionId] = useState<string | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  const allRows = useMemo(() => getClassListRows(className, 25), [className])
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return allRows
    return allRows.filter((row) => matchRow(row, searchQuery))
  }, [allRows, searchQuery])

  const totalRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const paginatedRows = filteredRows.slice(start, start + perPage)

  useEffect(() => {
    if (!openActionId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current?.contains(e.target as Node)) return
      setOpenActionId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openActionId])

  const ACTION_ITEMS = [
    { id: 'profile', label: 'View Profile', icon: ProfileIcon },
    { id: 'edit', label: 'Edit Details', icon: PencilIcon },
    { id: 'bill', label: 'View Bill', icon: BillIcon },
    { id: 'statement', label: 'View Statement', icon: StatementIcon },
    { id: 'report', label: 'View Academic Report', icon: ReportIcon },
  ] as const

  const exportRows = filteredRows as unknown as Record<string, unknown>[]
  const handleExportExcel = () => {
    exportToExcel(COLUMNS, exportRows, `class-list-${className}.xlsx`, 'Class List', columnVisibility)
    showFeedback('Excel file downloaded.')
  }
  const handleExportPDF = () => {
    exportToPDF(COLUMNS, exportRows, `class-list-${className}.pdf`, `Class List - ${className}`, columnVisibility)
    showFeedback('PDF file downloaded.')
  }

  return (
    <div className="class-list-page">
      <header className="class-list-header">
        <div className="class-list-heading">
          <h1 className="class-list-title">Staff Class List - ({className})</h1>
          <nav className="class-list-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin">Staff List</Link>
          </nav>
          <GoBack to="/admin" label="Go back to Dashboard" className="class-list-goback" />
        </div>
      </header>

      <div className="class-list-card">
        <div className="class-list-toolbar">
          <div className="class-list-toolbar-left">
            <label className="class-list-entries-label">
              <span className="class-list-entries-text">Show</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="class-list-entries-select"
                aria-label="Entries per page"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              entries
            </label>
          </div>
          <div className="class-list-toolbar-right">
            <div className="class-list-export-btns">
              <button type="button" className="class-list-export-btn" onClick={handleExportExcel}>
                Excel
              </button>
              <button type="button" className="class-list-export-btn" onClick={handleExportPDF}>
                PDF
              </button>
              <button type="button" className="class-list-export-btn" onClick={() => { printPage(); showFeedback('Print dialog opened.'); }}>
                Print
              </button>
            </div>
            <div className="class-list-visibility-wrap">
              <button
                type="button"
                className="class-list-visibility-btn"
                onClick={() => setVisibilityOpen((o) => !o)}
                aria-expanded={visibilityOpen ? 'true' : 'false'}
              >
                Column visibility
              </button>
              {visibilityOpen && (
                <div className="class-list-visibility-dropdown">
                  {COLUMNS.map((col) => (
                    <label key={col.id} className="class-list-visibility-item">
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.id]}
                        onChange={() =>
                          setColumnVisibility((prev) => ({ ...prev, [col.id]: !prev[col.id] }))
                        }
                      />
                      {col.label}
                    </label>
                  ))}
                  <button
                    type="button"
                    className="class-list-visibility-close"
                    onClick={() => setVisibilityOpen(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
            <label className="class-list-search-label">
              Search:
              <input
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                aria-label="Search table"
              />
            </label>
          </div>
        </div>

        <div className="class-list-table-wrap">
          <table className="class-list-table" role="grid">
            <thead>
              <tr className="class-list-thead-row">
                {COLUMNS.filter((c) => columnVisibility[c.id]).map((col) => (
                  <th key={col.id} scope="col" className="class-list-th">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => (
                <tr
                  key={row.studentId}
                  className={`class-list-tbody-tr ${idx % 2 === 1 ? 'class-list-tbody-tr--alt' : ''}`}
                >
                  {columnVisibility.action && (
                    <td className="class-list-td class-list-td-action">
                      <div
                        className="class-list-action-wrap"
                        ref={openActionId === row.studentId ? actionMenuRef : undefined}
                      >
                        <button
                          type="button"
                          className="class-list-action-btn"
                          aria-expanded={openActionId === row.studentId ? 'true' : 'false'}
                          aria-haspopup="true"
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenActionId((prev) =>
                              prev === row.studentId ? null : row.studentId
                            )
                          }}
                        >
                          Action <ActionChevronIcon />
                        </button>
                        {openActionId === row.studentId && (
                          <div className="class-list-action-menu" role="menu">
                            {ACTION_ITEMS.map((item) => {
                              const Icon = item.icon
                              if (item.id === 'profile') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/students/profile/${row.studentId}`}
                                    role="menuitem"
                                    className="class-list-action-menu-item"
                                    onClick={() => setOpenActionId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'edit') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/students/profile/${row.studentId}/edit`}
                                    role="menuitem"
                                    className="class-list-action-menu-item"
                                    onClick={() => setOpenActionId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'bill') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/students/profile/${row.studentId}/records?view=bill`}
                                    role="menuitem"
                                    className="class-list-action-menu-item"
                                    onClick={() => setOpenActionId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'statement') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/students/profile/${row.studentId}/records?view=statements`}
                                    role="menuitem"
                                    className="class-list-action-menu-item"
                                    onClick={() => setOpenActionId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              if (item.id === 'report') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/students/profile/${row.studentId}/records?view=results`}
                                    role="menuitem"
                                    className="class-list-action-menu-item"
                                    onClick={() => setOpenActionId(null)}
                                  >
                                    <Icon />
                                    <span>{item.label}</span>
                                  </Link>
                                )
                              }
                              const fallback = item as { id: string; label: string }
                              return (
                                <button
                                  key={fallback.id}
                                  type="button"
                                  role="menuitem"
                                  className="class-list-action-menu-item"
                                  onClick={() => setOpenActionId(null)}
                                >
                                  <Icon />
                                  <span>{fallback.label}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                  )}
                  {columnVisibility.no && (
                    <td className="class-list-td">{start + idx + 1}</td>
                  )}
                  {columnVisibility.image && (
                    <td className="class-list-td">
                      <div className="class-list-avatar" aria-hidden>
                        <PersonIcon />
                      </div>
                    </td>
                  )}
                  {columnVisibility.studentId && (
                    <td className="class-list-td">{row.studentId}</td>
                  )}
                  {columnVisibility.studentName && (
                    <td className="class-list-td">{row.studentName}</td>
                  )}
                  {columnVisibility.gender && (
                    <td className="class-list-td">{row.gender}</td>
                  )}
                  {columnVisibility.dateOfBirth && (
                    <td className="class-list-td">{row.dateOfBirth}</td>
                  )}
                  {columnVisibility.contact && (
                    <td className="class-list-td">{row.contact}</td>
                  )}
                  {columnVisibility.national && (
                    <td className="class-list-td">{row.national}</td>
                  )}
                  {columnVisibility.class && (
                    <td className="class-list-td">{row.class}</td>
                  )}
                  {columnVisibility.status && (
                    <td className="class-list-td">
                      <span className="class-list-status">{row.status}</span>
                    </td>
                  )}
                  {columnVisibility.adminDate && (
                    <td className="class-list-td">{row.adminDate}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="class-list-footer">
          <div className="class-list-info">
            Showing {totalRows === 0 ? 0 : start + 1} to {Math.min(start + perPage, totalRows)} of{' '}
            {totalRows} entries
          </div>
          <div className="class-list-pagination">
            <button
              type="button"
              className="class-list-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`class-list-page-btn class-list-page-btn--num ${
                  currentPage === p ? 'class-list-page-btn--active' : ''
                }`}
                onClick={() => setPage(p)}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="class-list-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </button>
          </div>
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

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

function ProfileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}

function BillIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function StatementIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
      <path d="M12 11h4M12 16h4M8 11h.01M8 16h.01" />
    </svg>
  )
}

function ReportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="M18 17V9M13 17V5M8 17v-3" />
    </svg>
  )
}
