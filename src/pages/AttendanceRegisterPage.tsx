import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { getClassListRows } from '@/data/adminMock'
import { exportToExcel, exportToPDF, printPage, type ExportColumn } from '@/utils/exportUtils'
import './AttendanceRegisterPage.css'

const PER_PAGE_OPTIONS = [10, 25, 50]
const ATTENDANCE_OPTIONS = ['Present', 'Absent', 'Late', 'Excused'] as const
type AttendanceStatus = (typeof ATTENDANCE_OPTIONS)[number]

export default function AttendanceRegisterPage() {
  const [searchParams] = useSearchParams()
  const { showFeedback } = useFeedback()
  const className = searchParams.get('class') || 'Basic 2'

  const [date, setDate] = useState('2026-02-26')
  const [term, setTerm] = useState('Term 3')
  const [acadYear, setAcadYear] = useState('2024/2025')
  const [attendanceStatus, setAttendanceStatus] = useState<Record<string, AttendanceStatus>>({})
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState(false)
  const [viewRegisterSearched, setViewRegisterSearched] = useState(false)

  const allRows = useMemo(() => getClassListRows(className, 25), [className])
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return allRows
    const q = searchQuery.trim().toLowerCase()
    return allRows.filter(
      (r) =>
        r.studentId.toLowerCase().includes(q) ||
        r.studentName.toLowerCase().includes(q) ||
        r.contact.toLowerCase().includes(q)
    )
  }, [allRows, searchQuery])

  const totalRows = filteredRows.length
  const viewEmpty = viewMode && !viewRegisterSearched
  const displayTotal = viewEmpty ? 0 : totalRows
  const totalPages = Math.max(1, Math.ceil(displayTotal / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const paginatedRows = filteredRows.slice(start, start + perPage)

  const getStatus = (studentId: string): AttendanceStatus =>
    attendanceStatus[studentId] ?? 'Present'

  const setStatus = (studentId: string, value: AttendanceStatus) => {
    setAttendanceStatus((prev) => ({ ...prev, [studentId]: value }))
  }

  const ATTENDANCE_EXPORT_COLUMNS: ExportColumn[] = [
    { id: 'no', label: 'No.' },
    { id: 'studentId', label: 'StudID' },
    { id: 'studentName', label: 'Student.Name' },
    { id: 'gender', label: 'Gender' },
    { id: 'contact', label: 'Contact' },
    { id: 'class', label: 'Class' },
    { id: 'status', label: 'Status' },
  ]
  const exportRows: Record<string, unknown>[] = filteredRows.map((row, i) => ({
    no: i + 1,
    studentId: row.studentId,
    studentName: row.studentName,
    gender: row.gender,
    contact: row.contact,
    class: row.class,
    status: getStatus(row.studentId),
  }))
  const handleExportExcel = () => {
    exportToExcel(ATTENDANCE_EXPORT_COLUMNS, exportRows, `attendance-${className}.xlsx`, 'Attendance', undefined)
    showFeedback('Excel file downloaded.')
  }
  const handleExportPDF = () => {
    exportToPDF(ATTENDANCE_EXPORT_COLUMNS, exportRows, `attendance-${className}.pdf`, `Attendance - ${className}`, undefined)
    showFeedback('PDF file downloaded.')
  }
  const handlePrint = () => {
    printPage()
    showFeedback('Print dialog opened.')
  }

  return (
    <div className="attendance-page">
      <header className="attendance-header">
        <div className="attendance-heading">
          <h1 className="attendance-title">Class Attendance Register ({className})</h1>
          <nav className="attendance-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin/students/list">Students List</Link>
          </nav>
          <GoBack to="/admin" label="Go back to Dashboard" className="attendance-goback" />
        </div>
      </header>

      <div className="attendance-controls">
        <div className="attendance-controls-row">
          <label className="attendance-control-label">
            Date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="attendance-control-input"
              aria-label="Attendance date"
            />
          </label>
          <label className="attendance-control-label">
            Term
            <select
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="attendance-control-select"
              aria-label="Term"
            >
              <option value="Term 1">Term 1</option>
              <option value="Term 2">Term 2</option>
              <option value="Term 3">Term 3</option>
            </select>
          </label>
          <label className="attendance-control-label">
            Acad. Year
            <input
              type="text"
              value={acadYear}
              onChange={(e) => setAcadYear(e.target.value)}
              className="attendance-control-input"
              aria-label="Academic year"
            />
          </label>
          <label className="attendance-control-label">
            Class
            <input
              type="text"
              value={className}
              readOnly
              className="attendance-control-input attendance-control-input--readonly"
              aria-label="Class"
            />
          </label>
          <div className="attendance-control-actions">
            {viewMode ? (
              <>
                <button
                  type="button"
                  className="attendance-btn attendance-btn--search"
                  onClick={() => { setViewRegisterSearched(true); showFeedback('Register loaded.'); }}
                  aria-label="Search register"
                >
                  <SearchIcon /> Search
                </button>
                <button
                  type="button"
                  className="attendance-btn attendance-btn--view"
                  onClick={() => {
                    setViewMode(false)
                    setViewRegisterSearched(false)
                    showFeedback('Recording attendance.')
                  }}
                >
                  Record Attendance
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="attendance-btn attendance-btn--search"
                  aria-label="Search register"
                  title="Load register for date, term and year"
                  onClick={() => showFeedback('Register loaded for selected date, term and year.')}
                >
                  <SearchIcon /> Search
                </button>
                <button type="button" className="attendance-btn attendance-btn--save" onClick={() => showFeedback('Attendance saved successfully.')}>
                  Save
                </button>
                <button
                  type="button"
                  className="attendance-btn attendance-btn--view"
                  onClick={() => { setViewMode(true); showFeedback('Viewing saved register.'); }}
                >
                  View Register
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="attendance-card">
        <div className="attendance-toolbar">
          <div className="attendance-toolbar-left">
            <label className="attendance-entries-label">
              Show
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="attendance-entries-select"
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
          <div className="attendance-toolbar-right">
            <div className="attendance-export-btns">
              <button type="button" className="attendance-export-btn" onClick={handleExportExcel}>Excel</button>
              <button type="button" className="attendance-export-btn" onClick={handleExportPDF}>PDF</button>
              <button type="button" className="attendance-export-btn" onClick={handlePrint}>Print</button>
            </div>
            <label className="attendance-search-label">
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

        <div className="attendance-table-wrap">
          {viewMode ? (
            <table className="attendance-table attendance-table--view" role="grid">
              <thead>
                <tr className="attendance-thead-row attendance-thead-row--main">
                  <th scope="col" className="attendance-th">No.</th>
                  <th scope="col" className="attendance-th">Image</th>
                  <th scope="col" className="attendance-th">StudID</th>
                  <th scope="col" className="attendance-th">Student.Name</th>
                  <th scope="col" className="attendance-th">Year</th>
                  <th scope="col" className="attendance-th">Term</th>
                  <th scope="col" className="attendance-th">Class</th>
                  <th scope="col" className="attendance-th">Date</th>
                  <th scope="col" className="attendance-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {!viewRegisterSearched ? (
                  <tr>
                    <td colSpan={9} className="attendance-td attendance-td--empty">
                      No data available in table
                    </td>
                  </tr>
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="attendance-td attendance-td--empty">
                      No data available in table
                    </td>
                  </tr>
                ) : (
                  filteredRows.slice(start, start + perPage).map((row, idx) => (
                    <tr
                      key={`${row.studentId}-${idx}`}
                      className={`attendance-tbody-tr ${idx % 2 === 1 ? 'attendance-tbody-tr--alt' : ''}`}
                    >
                      <td className="attendance-td">{start + idx + 1}</td>
                      <td className="attendance-td">
                        <div className="attendance-avatar" aria-hidden>
                          <PersonIcon />
                        </div>
                      </td>
                      <td className="attendance-td">{row.studentId}</td>
                      <td className="attendance-td">{row.studentName}</td>
                      <td className="attendance-td">{acadYear.split('/')[0]}</td>
                      <td className="attendance-td">{term}</td>
                      <td className="attendance-td">{row.class}</td>
                      <td className="attendance-td">{date}</td>
                      <td className="attendance-td">{getStatus(row.studentId)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="attendance-table" role="grid">
              <thead>
                <tr className="attendance-thead-row attendance-thead-row--main">
                  <th scope="col" className="attendance-th">No.</th>
                  <th scope="col" className="attendance-th">Image</th>
                  <th scope="col" className="attendance-th">StudID</th>
                  <th scope="col" className="attendance-th">Student.Name</th>
                  <th scope="col" className="attendance-th">Gender</th>
                  <th scope="col" className="attendance-th">Contact</th>
                  <th scope="col" className="attendance-th">Class</th>
                  <th scope="col" className="attendance-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.map((row, idx) => (
                  <tr
                    key={row.studentId}
                    className={`attendance-tbody-tr ${idx % 2 === 1 ? 'attendance-tbody-tr--alt' : ''}`}
                  >
                    <td className="attendance-td">{start + idx + 1}</td>
                    <td className="attendance-td">
                      <div className="attendance-avatar" aria-hidden>
                        <PersonIcon />
                      </div>
                    </td>
                    <td className="attendance-td">{row.studentId}</td>
                    <td className="attendance-td">{row.studentName}</td>
                    <td className="attendance-td">{row.gender}</td>
                    <td className="attendance-td">{row.contact}</td>
                    <td className="attendance-td">{row.class}</td>
                    <td className="attendance-td">
                      <select
                        value={getStatus(row.studentId)}
                        onChange={(e) =>
                          setStatus(row.studentId, e.target.value as AttendanceStatus)
                        }
                        className="attendance-status-select"
                        aria-label={`Attendance status for ${row.studentName}`}
                      >
                        {ATTENDANCE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="attendance-footer">
          <div className="attendance-info">
            Showing {displayTotal === 0 ? 0 : start + 1} to{' '}
            {Math.min(start + perPage, displayTotal)} of {displayTotal} entries
          </div>
          <div className="attendance-pagination">
            <button
              type="button"
              className="attendance-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`attendance-page-btn attendance-page-btn--num ${
                  currentPage === p ? 'attendance-page-btn--active' : ''
                }`}
                onClick={() => setPage(p)}
                aria-current={currentPage === p ? 'page' : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="attendance-page-btn"
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

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
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
