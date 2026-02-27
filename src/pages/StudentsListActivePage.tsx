import { useState, useMemo, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useRegisteredStudents } from '@/contexts/RegisteredStudentsContext'
import { studentsListAll, type StudentRow } from '@/data/adminMock'
import { exportToCSV, exportToExcel, exportToPDF, copyTableToClipboard, type ExportColumn } from '@/utils/exportUtils'
import './StudentsListAllPage.css'

const PER_PAGE_OPTIONS = [10, 25, 50, 100]

function buildMockRows(): StudentRow[] {
  const base = studentsListAll
  const rows: StudentRow[] = []
  for (let i = 0; i < 335; i++) {
    const b = base[i % base.length]!
    rows.push({
      ...b,
      no: i + 1,
      studentId: `BOAK${String(i + 1).padStart(4, '0')}`,
    })
  }
  return rows
}

function mergeRegisteredWithMock(registered: StudentRow[], mockRows: StudentRow[]): StudentRow[] {
  const registeredWithNo = registered.map((r, i) => ({ ...r, no: i + 1 }))
  const offset = registeredWithNo.length
  const mockWithOffset = mockRows.map((r, i) => ({ ...r, no: offset + i + 1 }))
  return [...registeredWithNo, ...mockWithOffset]
}

const MOCK_ROWS = buildMockRows()

const COLUMNS: ExportColumn[] = [
  { id: 'action', label: 'Action' },
  { id: 'no', label: 'No.' },
  { id: 'image', label: 'Image' },
  { id: 'studentId', label: 'Student ID' },
  { id: 'password', label: 'Password' },
  { id: 'studentName', label: 'Student Name' },
  { id: 'gender', label: 'Gender' },
  { id: 'dateOfBirth', label: 'Date Of Birth' },
  { id: 'contact', label: 'Contact' },
  { id: 'national', label: 'National' },
  { id: 'entryClass', label: 'Entry Class' },
  { id: 'currentClass', label: 'Current Class' },
  { id: 'status', label: 'Status' },
  { id: 'adminDate', label: 'Admin Date' },
]

function matchStudent(row: StudentRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    row.studentId.toLowerCase().includes(q) ||
    row.studentName.toLowerCase().includes(q) ||
    (row.password && row.password.toLowerCase().includes(q)) ||
    row.contact.toLowerCase().includes(q) ||
    row.entryClass.toLowerCase().includes(q) ||
    row.currentClass.toLowerCase().includes(q) ||
    row.national.toLowerCase().includes(q) ||
    row.status.toLowerCase().includes(q)
  )
}

export default function StudentsListActivePage() {
  const { showFeedback } = useFeedback()
  const { registeredStudents } = useRegisteredStudents()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(
    COLUMNS.reduce((acc, c) => ({ ...acc, [c.id]: true }), {})
  )
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const [openActionStudentId, setOpenActionStudentId] = useState<string | null>(null)

  const allRows = useMemo(
    () => mergeRegisteredWithMock(registeredStudents, MOCK_ROWS).filter((r) => r.status === 'Active'),
    [registeredStudents]
  )

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return allRows
    return allRows.filter((row) => matchStudent(row, searchQuery))
  }, [allRows, searchQuery])

  const totalRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const paginatedRows = filteredRows.slice(start, start + perPage)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const toggleColumn = (id: string) => {
    setColumnVisibility((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleActionMenu = (studentId: string) => {
    setOpenActionStudentId((prev) => (prev === studentId ? null : studentId))
  }

  const closeActionMenu = () => setOpenActionStudentId(null)

  const exportRows = filteredRows as unknown as Record<string, unknown>[]
  const handleCopy = () => {
    const text = copyTableToClipboard(COLUMNS, paginatedRows as unknown as Record<string, unknown>[], columnVisibility)
    navigator.clipboard.writeText(text).then(() => showFeedback('Copied to clipboard.'))
  }
  const handleExportExcel = () => {
    exportToExcel(COLUMNS, exportRows, 'students-active-list', 'Students Active', columnVisibility)
    showFeedback('Excel file downloaded.')
  }
  const handleExportCSV = () => {
    exportToCSV(COLUMNS, exportRows, 'students-active-list.csv', columnVisibility)
    showFeedback('CSV file downloaded.')
  }
  const handleExportPDF = () => {
    exportToPDF(COLUMNS, exportRows, 'students-active-list.pdf', 'Students List (Active)', columnVisibility)
    showFeedback('PDF file downloaded.')
  }

  const ACTION_MENU_ITEMS = [
    { id: 'profile', label: 'View Profile', icon: ProfileIcon },
    { id: 'edit', label: 'Edit Details', icon: PencilIcon },
    { id: 'bill', label: 'View Bill', icon: BillIcon },
    { id: 'statement', label: 'View Statement', icon: StatementIcon },
    { id: 'report', label: 'View Academic Report', icon: ReportIcon },
  ] as const

  const actionMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openActionStudentId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current?.contains(e.target as Node)) return
      setOpenActionStudentId(null)
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openActionStudentId])

  return (
    <div className="students-list-all-page">
      <header className="students-list-all-header">
        <div className="students-list-all-heading">
          <h1 className="students-list-all-title">Manage Student - Active</h1>
          <nav className="students-list-all-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin/students/list">Student List</Link>
          </nav>
          <GoBack to="/admin/students" label="Go back to Dashboard" className="students-list-all-goback" />
        </div>
        <Link to="/admin/students/add" className="students-list-all-add-btn">
          <AddPersonIcon /> Add New Student
        </Link>
      </header>

      <div className="students-list-all-card">
        <div className="students-list-all-toolbar">
          <div className="students-list-all-toolbar-left">
            <label className="students-list-all-entries-label">
              <span className="students-list-all-entries-text">Show</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="students-list-all-entries-select"
                aria-label="Entries per page"
              >
                {PER_PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="students-list-all-entries-text"> entries</span>
            </label>
          </div>
          <div className="students-list-all-toolbar-right">
            <label className="students-list-all-search-label">
              <SearchIcon />
              <input
                type="search"
                placeholder="Search…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="students-list-all-search-input"
                aria-label="Search"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="students-list-all-search-clear"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </label>
            <div className="students-list-all-export-btns">
              <button type="button" className="students-list-all-export-btn" onClick={handleCopy}>
                Copy
              </button>
              <button type="button" className="students-list-all-export-btn" onClick={handleExportExcel}>
                Excel
              </button>
              <button type="button" className="students-list-all-export-btn" onClick={handleExportCSV}>
                CSV
              </button>
              <button type="button" className="students-list-all-export-btn" onClick={handleExportPDF}>
                PDF
              </button>
            </div>
            <div className="students-list-all-visibility-wrap">
              <button
                type="button"
                className="students-list-all-visibility-btn"
                onClick={() => setVisibilityOpen((o) => !o)}
                aria-expanded={visibilityOpen ? 'true' : 'false'}
                aria-haspopup="true"
              >
                Column visibility
              </button>
              {visibilityOpen && (
                <div className="students-list-all-visibility-dropdown" aria-label="Toggle columns">
                  {COLUMNS.map((col) => (
                    <label key={col.id} className="students-list-all-visibility-item">
                      <input
                        type="checkbox"
                        checked={columnVisibility[col.id]}
                        onChange={() => toggleColumn(col.id)}
                      />
                      {col.label}
                    </label>
                  ))}
                  <button
                    type="button"
                    className="students-list-all-visibility-close"
                    onClick={() => setVisibilityOpen(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="students-list-all-table-wrap">
          <table className="students-list-all-table" role="grid">
            <thead>
              <tr className="students-list-all-thead-row students-list-all-thead-row--main">
                {COLUMNS.filter((c) => columnVisibility[c.id]).map((col) => (
                  <th key={col.id} scope="col" className="students-list-all-th">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => (
                <tr
                  key={row.studentId}
                  className={`students-list-all-tbody-tr ${idx % 2 === 1 ? 'students-list-all-tbody-tr--alt' : ''}`}
                >
                  {columnVisibility.action && (
                    <td className="students-list-all-td students-list-all-td--action">
                      <div
                        className="students-list-all-action-wrap"
                        ref={openActionStudentId === row.studentId ? actionMenuRef : undefined}
                      >
                        <button
                          type="button"
                          className="students-list-all-action-btn"
                          aria-label={`Actions for ${row.studentName}`}
                          aria-expanded={openActionStudentId === row.studentId ? 'true' : 'false'}
                          aria-haspopup="true"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleActionMenu(row.studentId)
                          }}
                        >
                          Action <ActionChevronIcon />
                        </button>
                        {openActionStudentId === row.studentId && (
                          <div
                            className="students-list-all-action-menu"
                            role="menu"
                            aria-label={`Actions for ${row.studentName}`}
                          >
                            {ACTION_MENU_ITEMS.map((item) => {
                              const Icon = item.icon
                              if (item.id === 'profile') {
                                return (
                                  <Link
                                    key={item.id}
                                    to={`/admin/students/profile/${row.studentId}`}
                                    state={{ from: 'students-active' }}
                                    role="menuitem"
                                    className="students-list-all-action-menu-item"
                                    onClick={() => closeActionMenu()}
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
                                    state={{ from: 'students-active' }}
                                    role="menuitem"
                                    className="students-list-all-action-menu-item"
                                    onClick={() => closeActionMenu()}
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
                                    state={{ from: 'students-active' }}
                                    role="menuitem"
                                    className="students-list-all-action-menu-item"
                                    onClick={() => closeActionMenu()}
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
                                    state={{ from: 'students-active' }}
                                    role="menuitem"
                                    className="students-list-all-action-menu-item"
                                    onClick={() => closeActionMenu()}
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
                                    state={{ from: 'students-active' }}
                                    role="menuitem"
                                    className="students-list-all-action-menu-item"
                                    onClick={() => closeActionMenu()}
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
                                  className="students-list-all-action-menu-item"
                                  onClick={() => closeActionMenu()}
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
                    <td className="students-list-all-td">{start + idx + 1}</td>
                  )}
                  {columnVisibility.image && (
                    <td className="students-list-all-td">
                      <div className="students-list-all-avatar" aria-hidden>
                        <PersonIcon />
                      </div>
                    </td>
                  )}
                  {columnVisibility.studentId && (
                    <td className="students-list-all-td">{row.studentId}</td>
                  )}
                  {columnVisibility.password && (
                    <td className="students-list-all-td">{row.password}</td>
                  )}
                  {columnVisibility.studentName && (
                    <td className="students-list-all-td">{row.studentName}</td>
                  )}
                  {columnVisibility.gender && (
                    <td className="students-list-all-td">{row.gender}</td>
                  )}
                  {columnVisibility.dateOfBirth && (
                    <td className="students-list-all-td">{row.dateOfBirth}</td>
                  )}
                  {columnVisibility.contact && (
                    <td className="students-list-all-td">{row.contact}</td>
                  )}
                  {columnVisibility.national && (
                    <td className="students-list-all-td">{row.national}</td>
                  )}
                  {columnVisibility.entryClass && (
                    <td className="students-list-all-td">{row.entryClass}</td>
                  )}
                  {columnVisibility.currentClass && (
                    <td className="students-list-all-td">{row.currentClass}</td>
                  )}
                  {columnVisibility.status && (
                    <td className="students-list-all-td">
                      <span
                        className={`students-list-all-status students-list-all-status--${row.status === 'Active' ? 'active' : 'left'}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  )}
                  {columnVisibility.adminDate && (
                    <td className="students-list-all-td">{row.adminDate}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="students-list-all-footer">
          <div className="students-list-all-info">
            <span className="students-list-all-info-range">
              Showing {totalRows === 0 ? 0 : start + 1}–{Math.min(start + perPage, totalRows)} of {totalRows} entries
            </span>
            <span className="students-list-all-info-page" aria-live="polite">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          <div className="students-list-all-pagination">
            <button
              type="button"
              className="students-list-all-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              First
            </button>
            <button
              type="button"
              className="students-list-all-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              Previous
            </button>
            <span className="students-list-all-page-nums">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce<number[]>((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1]! > 1) acc.push(-1)
                  acc.push(p)
                  return acc
                }, [])
                .map((p, pi) =>
                  p === -1 ? (
                    <span key={`ellip-${pi}`} className="students-list-all-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`students-list-all-page-btn students-list-all-page-btn--num ${currentPage === p ? 'students-list-all-page-btn--active' : ''}`}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      aria-current={currentPage === p ? 'page' : undefined}
                    >
                      {p}
                    </button>
                  )
                )}
            </span>
            <button
              type="button"
              className="students-list-all-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              Next
            </button>
            <button
              type="button"
              className="students-list-all-page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              aria-label="Last page"
            >
              Last
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

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  )
}

function AddPersonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M16 11h6M19 8v6" />
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
