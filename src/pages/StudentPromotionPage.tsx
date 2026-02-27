import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { getPromotionRows, type PromotionRow } from '@/data/adminMock'
import { exportToExcel, exportToPDF, printPage, type ExportColumn } from '@/utils/exportUtils'
import './StudentPromotionPage.css'

const PER_PAGE_OPTIONS = [10, 25, 50]

const COLUMNS: ExportColumn[] = [
  { id: 'no', label: 'No.' },
  { id: 'image', label: 'Image' },
  { id: 'studentId', label: 'StudID' },
  { id: 'studentName', label: 'Student.Name' },
  { id: 'dateOfBirth', label: 'Date.Of.Birth' },
  { id: 'contact', label: 'Contact' },
  { id: 'entryClass', label: 'Entry.Class' },
  { id: 'currentClass', label: 'Current.Class' },
  { id: 'promoteTo', label: 'Promote.To' },
  { id: 'action', label: 'Action' },
]

const PROMOTE_OPTIONS = ['Basic 1', 'Basic 2', 'Basic 3', 'KG 1', 'KG 2', 'JHS 1', 'JHS 2', 'JHS 3']

function matchRow(row: PromotionRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    row.studentId.toLowerCase().includes(q) ||
    row.studentName.toLowerCase().includes(q) ||
    row.contact.toLowerCase().includes(q) ||
    row.entryClass.toLowerCase().includes(q) ||
    row.currentClass.toLowerCase().includes(q)
  )
}

export default function StudentPromotionPage() {
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
  const [promoteToValues, setPromoteToValues] = useState<Record<string, string>>({})

  const allRows = useMemo(() => getPromotionRows(className, 25), [className])
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return allRows
    return allRows.filter((row) => matchRow(row, searchQuery))
  }, [allRows, searchQuery])

  const totalRows = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRows / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const paginatedRows = filteredRows.slice(start, start + perPage)

  const getPromoteTo = (row: PromotionRow) =>
    promoteToValues[row.studentId] ?? row.promoteTo

  const setPromoteTo = (studentId: string, value: string) => {
    setPromoteToValues((prev) => ({ ...prev, [studentId]: value }))
  }

  const handleSave = (row: PromotionRow) => {
    const to = getPromoteTo(row)
    showFeedback(`Promotion saved for ${row.studentName} → ${to}.`)
  }

  const exportRows: Record<string, unknown>[] = filteredRows.map((r) => ({
    ...r,
    promoteTo: getPromoteTo(r),
  }))
  const handleExportExcel = () => {
    exportToExcel(COLUMNS, exportRows, `promotion-${className}.xlsx`, 'Promotion', columnVisibility)
    showFeedback('Excel file downloaded.')
  }
  const handleExportPDF = () => {
    exportToPDF(COLUMNS, exportRows, `promotion-${className}.pdf`, `Student Promotions - ${className}`, columnVisibility)
    showFeedback('PDF file downloaded.')
  }
  const handlePrint = () => {
    printPage()
    showFeedback('Print dialog opened.')
  }

  return (
    <div className="promotion-page">
      <header className="promotion-header">
        <div className="promotion-heading">
          <h1 className="promotion-title">Student Promotions ({className})</h1>
          <nav className="promotion-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin/students/list">Students List</Link>
          </nav>
          <GoBack to="/admin" label="Go back to Dashboard" className="promotion-goback" />
        </div>
      </header>

      <div className="promotion-card">
        <div className="promotion-toolbar">
          <div className="promotion-toolbar-left">
            <label className="promotion-entries-label">
              <span className="promotion-entries-text">Show</span>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setPage(1)
                }}
                className="promotion-entries-select"
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
          <div className="promotion-toolbar-right">
            <div className="promotion-export-btns">
              <button type="button" className="promotion-export-btn" onClick={handleExportExcel}>
                Excel
              </button>
              <button type="button" className="promotion-export-btn" onClick={handleExportPDF}>
                PDF
              </button>
              <button type="button" className="promotion-export-btn" onClick={handlePrint}>
                Print
              </button>
            </div>
            <div className="promotion-visibility-wrap">
              <button
                type="button"
                className="promotion-visibility-btn"
                onClick={() => setVisibilityOpen((o) => !o)}
                aria-expanded={visibilityOpen ? 'true' : 'false'}
              >
                Column visibility
              </button>
              {visibilityOpen && (
                <div className="promotion-visibility-dropdown">
                  {COLUMNS.map((col) => (
                    <label key={col.id} className="promotion-visibility-item">
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
                    className="promotion-visibility-close"
                    onClick={() => setVisibilityOpen(false)}
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
            <label className="promotion-search-label">
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

        <div className="promotion-table-wrap">
          <table className="promotion-table" role="grid">
            <thead>
              <tr className="promotion-thead-row">
                {COLUMNS.filter((c) => columnVisibility[c.id]).map((col) => (
                  <th key={col.id} scope="col" className="promotion-th">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => (
                <tr
                  key={row.studentId}
                  className={`promotion-tbody-tr ${idx % 2 === 1 ? 'promotion-tbody-tr--alt' : ''}`}
                >
                  {columnVisibility.no && (
                    <td className="promotion-td">{start + idx + 1}</td>
                  )}
                  {columnVisibility.image && (
                    <td className="promotion-td">
                      <div className="promotion-avatar" aria-hidden>
                        <PersonIcon />
                      </div>
                    </td>
                  )}
                  {columnVisibility.studentId && (
                    <td className="promotion-td">{row.studentId}</td>
                  )}
                  {columnVisibility.studentName && (
                    <td className="promotion-td">{row.studentName}</td>
                  )}
                  {columnVisibility.dateOfBirth && (
                    <td className="promotion-td">{row.dateOfBirth}</td>
                  )}
                  {columnVisibility.contact && (
                    <td className="promotion-td">{row.contact}</td>
                  )}
                  {columnVisibility.entryClass && (
                    <td className="promotion-td">{row.entryClass}</td>
                  )}
                  {columnVisibility.currentClass && (
                    <td className="promotion-td">{row.currentClass}</td>
                  )}
                  {columnVisibility.promoteTo && (
                    <td className="promotion-td">
                      <select
                        value={getPromoteTo(row)}
                        onChange={(e) => setPromoteTo(row.studentId, e.target.value)}
                        className="promotion-select"
                        aria-label={`Promote ${row.studentName} to`}
                      >
                        {PROMOTE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>
                  )}
                  {columnVisibility.action && (
                    <td className="promotion-td">
                      <button
                        type="button"
                        className="promotion-save-btn"
                        onClick={() => handleSave(row)}
                      >
                        Save
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="promotion-footer">
          <div className="promotion-info">
            Showing {totalRows === 0 ? 0 : start + 1} to{' '}
            {Math.min(start + perPage, totalRows)} of {totalRows} entries
          </div>
          <div className="promotion-pagination">
            <button
              type="button"
              className="promotion-page-btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                className={`promotion-page-btn promotion-page-btn--num ${
                  p === currentPage ? 'promotion-page-btn--current' : ''
                }`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="promotion-page-btn"
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

function PersonIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  )
}
