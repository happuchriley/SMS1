import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { exportToExcel, exportToPDF, type ExportColumn } from '@/utils/exportUtils'
import './TeachingLearningMaterialsPage.css'

const PER_PAGE_OPTIONS = [10, 25, 50]
type TabId = 'assignment' | 'lesson-notes' | 'syllabus'

const TABS = [
  { id: 'assignment' as TabId, label: 'Assignment', icon: AssignmentTabIcon },
  { id: 'lesson-notes' as TabId, label: 'Lesson Notes', icon: LessonNotesIcon },
  { id: 'syllabus' as TabId, label: 'Syllabus', icon: SyllabusIcon },
] as const

export default function TeachingLearningMaterialsPage() {
  const [searchParams] = useSearchParams()
  const { showFeedback } = useFeedback()
  const className = searchParams.get('class') || 'Basic 2'

  const [activeTab, setActiveTab] = useState<TabId>('assignment')
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const assignmentRows: unknown[] = []
  const totalRows = assignmentRows.length
  const start = 0

  const TLM_ASSIGNMENT_COLUMNS: ExportColumn[] = [
    { id: 'no', label: 'No.' },
    { id: 'class', label: 'Class' },
    { id: 'subject', label: 'Subject' },
    { id: 'topic', label: 'Topic' },
    { id: 'description', label: 'Description' },
    { id: 'submissionDate', label: 'Submission Date' },
    { id: 'dateCreated', label: 'Date Created' },
    { id: 'attachment', label: 'Attachment' },
  ]
  const TLM_LESSON_COLUMNS: ExportColumn[] = [
    { id: 'no', label: 'No.' },
    { id: 'class', label: 'Class' },
    { id: 'subject', label: 'Subject' },
    { id: 'topic', label: 'Topic' },
    { id: 'dateCreated', label: 'Date Created' },
    { id: 'attachment', label: 'Attachment' },
  ]
  const TLM_SYLLABUS_COLUMNS: ExportColumn[] = [
    { id: 'no', label: 'No.' },
    { id: 'class', label: 'Class' },
    { id: 'subject', label: 'Subject' },
    { id: 'term', label: 'Term' },
    { id: 'dateCreated', label: 'Date Created' },
    { id: 'attachment', label: 'Attachment' },
  ]
  const emptyRows: Record<string, unknown>[] = []
  const handleExportExcel = (cols: ExportColumn[], name: string, sheet: string) => {
    exportToExcel(cols, emptyRows, `${name}.xlsx`, sheet, undefined)
    showFeedback('Excel file downloaded.')
  }
  const handleExportPDF = (cols: ExportColumn[], name: string, title: string) => {
    exportToPDF(cols, emptyRows, `${name}.pdf`, title, undefined)
    showFeedback('PDF file downloaded.')
  }

  return (
    <div className="tlm-page">
      <header className="tlm-header">
        <div className="tlm-heading">
          <h1 className="tlm-title">Teaching, Learning Materials - {className}</h1>
          <nav className="tlm-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin">Staff List</Link>
          </nav>
          <GoBack to="/admin" label="Go back to Dashboard" className="tlm-goback" />
        </div>
        <Link
          to={`/admin/tlm/upload?class=${encodeURIComponent(className)}`}
          className="tlm-upload-btn"
        >
          Upload New
        </Link>
      </header>

      <div className="tlm-tabs" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id ? 'true' : 'false'}
              className={`tlm-tab ${activeTab === tab.id ? 'tlm-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="tlm-content">
        {activeTab === 'assignment' && (
          <section className="tlm-section" aria-labelledby="assignment-heading">
            <h2 id="assignment-heading" className="tlm-section-title">
              Assignments
            </h2>
            <div className="tlm-card">
              <div className="tlm-toolbar">
                <div className="tlm-toolbar-left">
                  <label className="tlm-entries-label">
                    Show
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                      className="tlm-entries-select"
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
                <div className="tlm-toolbar-right">
                  <button type="button" className="tlm-export-btn" onClick={() => handleExportExcel(TLM_ASSIGNMENT_COLUMNS, 'tlm-assignments', 'Assignments')}>
                    Excel
                  </button>
                  <button type="button" className="tlm-export-btn" onClick={() => handleExportPDF(TLM_ASSIGNMENT_COLUMNS, 'tlm-assignments.pdf', 'TLM - Assignments')}>
                    PDF
                  </button>
                  <label className="tlm-search-label">
                    Search:
                    <input
                      type="search"
                      placeholder="Search…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      aria-label="Search table"
                    />
                  </label>
                </div>
              </div>
              <div className="tlm-table-wrap">
                <table className="tlm-table" role="grid">
                  <thead>
                    <tr className="tlm-thead-row">
                      <th scope="col" className="tlm-th">No.</th>
                      <th scope="col" className="tlm-th">Class</th>
                      <th scope="col" className="tlm-th">Subject</th>
                      <th scope="col" className="tlm-th">Topic</th>
                      <th scope="col" className="tlm-th">Description</th>
                      <th scope="col" className="tlm-th">Submission Date</th>
                      <th scope="col" className="tlm-th">Date Created</th>
                      <th scope="col" className="tlm-th">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {totalRows === 0 ? (
                      <tr>
                        <td colSpan={8} className="tlm-td tlm-td--empty">
                          No data available in table
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <div className="tlm-footer">
                <div className="tlm-info">
                  Showing {totalRows === 0 ? 0 : start + 1} to{' '}
                  {Math.min(start + perPage, totalRows)} of {totalRows} entries
                </div>
                <div className="tlm-pagination">
                  <button type="button" className="tlm-page-btn" disabled>
                    Previous
                  </button>
                  <button type="button" className="tlm-page-btn" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'lesson-notes' && (
          <section className="tlm-section" aria-labelledby="lesson-notes-heading">
            <h2 id="lesson-notes-heading" className="tlm-section-title">
              Lesson Notes
            </h2>
            <div className="tlm-card">
              <div className="tlm-toolbar">
                <div className="tlm-toolbar-left">
                  <label className="tlm-entries-label">
                    Show
                    <select className="tlm-entries-select" aria-label="Entries per page">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    entries
                  </label>
                </div>
                <div className="tlm-toolbar-right">
                  <button type="button" className="tlm-export-btn" onClick={() => handleExportExcel(TLM_LESSON_COLUMNS, 'tlm-lesson-notes', 'Lesson Notes')}>Excel</button>
                  <button type="button" className="tlm-export-btn" onClick={() => handleExportPDF(TLM_LESSON_COLUMNS, 'tlm-lesson-notes.pdf', 'TLM - Lesson Notes')}>PDF</button>
                  <label className="tlm-search-label">
                    Search:
                    <input type="search" placeholder="Search…" aria-label="Search table" />
                  </label>
                </div>
              </div>
              <div className="tlm-table-wrap">
                <table className="tlm-table" role="grid">
                  <thead>
                    <tr className="tlm-thead-row">
                      <th scope="col" className="tlm-th">No.</th>
                      <th scope="col" className="tlm-th">Class</th>
                      <th scope="col" className="tlm-th">Subject</th>
                      <th scope="col" className="tlm-th">Topic</th>
                      <th scope="col" className="tlm-th">Date Created</th>
                      <th scope="col" className="tlm-th">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="tlm-td tlm-td--empty">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tlm-footer">
                <div className="tlm-info">Showing 0 to 0 of 0 entries</div>
                <div className="tlm-pagination">
                  <button type="button" className="tlm-page-btn" disabled>Previous</button>
                  <button type="button" className="tlm-page-btn" disabled>Next</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'syllabus' && (
          <section className="tlm-section" aria-labelledby="syllabus-heading">
            <h2 id="syllabus-heading" className="tlm-section-title">
              Syllabus
            </h2>
            <div className="tlm-card">
              <div className="tlm-toolbar">
                <div className="tlm-toolbar-left">
                  <label className="tlm-entries-label">
                    Show
                    <select className="tlm-entries-select" aria-label="Entries per page">
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                    entries
                  </label>
                </div>
                <div className="tlm-toolbar-right">
                  <button type="button" className="tlm-export-btn" onClick={() => handleExportExcel(TLM_SYLLABUS_COLUMNS, 'tlm-syllabus', 'Syllabus')}>Excel</button>
                  <button type="button" className="tlm-export-btn" onClick={() => handleExportPDF(TLM_SYLLABUS_COLUMNS, 'tlm-syllabus.pdf', 'TLM - Syllabus')}>PDF</button>
                  <label className="tlm-search-label">
                    Search:
                    <input type="search" placeholder="Search…" aria-label="Search table" />
                  </label>
                </div>
              </div>
              <div className="tlm-table-wrap">
                <table className="tlm-table" role="grid">
                  <thead>
                    <tr className="tlm-thead-row">
                      <th scope="col" className="tlm-th">No.</th>
                      <th scope="col" className="tlm-th">Class</th>
                      <th scope="col" className="tlm-th">Subject</th>
                      <th scope="col" className="tlm-th">Term</th>
                      <th scope="col" className="tlm-th">Date Created</th>
                      <th scope="col" className="tlm-th">Attachment</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="tlm-td tlm-td--empty">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tlm-footer">
                <div className="tlm-info">Showing 0 to 0 of 0 entries</div>
                <div className="tlm-pagination">
                  <button type="button" className="tlm-page-btn" disabled>Previous</button>
                  <button type="button" className="tlm-page-btn" disabled>Next</button>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function AssignmentTabIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="7" r="2.5" />
      <circle cx="15" cy="7" r="2.5" />
      <circle cx="12" cy="14" r="2.5" />
    </svg>
  )
}

function LessonNotesIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function SyllabusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 15h6M9 19h6" />
    </svg>
  )
}
