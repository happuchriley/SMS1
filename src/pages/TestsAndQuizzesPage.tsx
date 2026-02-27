import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { exportToExcel, exportToPDF, type ExportColumn } from '@/utils/exportUtils'
import './TestsAndQuizzesPage.css'

const PER_PAGE_OPTIONS = [10, 25, 50]

type TabId = 'trial-quiz' | 'assessment-quiz' | 'lesson-notes' | 'syllabus' | 'create-new'

const TABS = [
  { id: 'trial-quiz' as TabId, label: 'Trial Quiz', icon: TrialQuizIcon },
  { id: 'assessment-quiz' as TabId, label: 'Assessment Quiz', icon: AssessmentQuizIcon },
  { id: 'lesson-notes' as TabId, label: 'Lesson Notes', icon: LessonNotesIcon },
  { id: 'syllabus' as TabId, label: 'Syllabus', icon: SyllabusIcon },
  { id: 'create-new' as TabId, label: 'Create New Quiz', icon: CreateNewIcon },
] as const

const QUIZ_TABLE_COLUMNS = [
  'No.',
  'Class',
  'Subject',
  'Topic',
  'Description',
  'Quiz.Type',
  'No.Of.Questions',
  'No.Of.Submissions',
  'Status',
  'Date.Created',
  'Submission.Date',
  'Attachment',
] as const


const LESSON_NOTES_TABLE_COLUMNS = [
  'No.',
  'Class',
  'Subject',
  'Topic',
  'Description',
  'Submission Date',
  'Date Created',
  'Attachment',
] as const

const SYLLABUS_TABLE_COLUMNS = [
  'No.',
  'Class',
  'Subject',
  'Term',
  'Date Created',
  'Attachment',
] as const

const QUIZ_EXPORT_COLUMNS: ExportColumn[] = QUIZ_TABLE_COLUMNS.map((label, i) => ({
  id: `col${i}`,
  label,
}))
const LESSON_NOTES_EXPORT_COLUMNS: ExportColumn[] = LESSON_NOTES_TABLE_COLUMNS.map((label, i) => ({
  id: `col${i}`,
  label,
}))
const SYLLABUS_EXPORT_COLUMNS: ExportColumn[] = SYLLABUS_TABLE_COLUMNS.map((label, i) => ({
  id: `col${i}`,
  label,
}))

type QuizQuestionRow = {
  id: number
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  correctAnswers: string
  correctAnswerText: string
  leftItem: string
  rightItem: string
  scenario: string
  outcomeA: string
  outcomeB: string
}

const QUIZ_TYPE_OPTIONS = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)', description: 'Pick one from four options.' },
  { value: 'multi-response', label: 'Multi-Response', description: 'Select all that apply.' },
  { value: 'fill-in', label: 'Fill-in-the-Blank', description: 'Tests precise recall.' },
  { value: 'matching', label: 'Matching/Sequence', description: 'Pairs or correct order.' },
  { value: 'scenario', label: 'Scenario-Based', description: 'Answers lead to different outcomes.' },
] as const

const CORRECT_OPTIONS = ['A', 'B', 'C', 'D']

const emptyQuestionRow = (id: number): QuizQuestionRow => ({
  id,
  question: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: '',
  correctAnswers: '',
  correctAnswerText: '',
  leftItem: '',
  rightItem: '',
  scenario: '',
  outcomeA: '',
  outcomeB: '',
})

function getTodayFormatted(): string {
  const d = new Date()
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export default function TestsAndQuizzesPage() {
  const [searchParams] = useSearchParams()
  const { showFeedback } = useFeedback()
  const className = searchParams.get('class') || 'Basic 2'

  const [activeTab, setActiveTab] = useState<TabId>('trial-quiz')
  const [perPage, setPerPage] = useState(10)
  const [searchQuery, setSearchQuery] = useState('')

  const totalRows = 0

  /* Create New Quiz form state */
  const [course, setCourse] = useState('')
  const [topic, setTopic] = useState('')
  const [quizType, setQuizType] = useState('')
  const [quizStatus, setQuizStatus] = useState('')
  const [submissionDate, setSubmissionDate] = useState('')
  const [quizFor, setQuizFor] = useState('')
  const [durationHrs, setDurationHrs] = useState('')
  const [durationMin, setDurationMin] = useState('')
  const [durationSec, setDurationSec] = useState('')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [instructions, setInstructions] = useState('')
  const [questionRows, setQuestionRows] = useState<QuizQuestionRow[]>([emptyQuestionRow(1)])
  const [nextQuestionId, setNextQuestionId] = useState(2)

  const dateCreated = getTodayFormatted()

  const resetQuestionRowsForType = () => {
    setQuestionRows([emptyQuestionRow(1)])
    setNextQuestionId(2)
  }

  const clearAllQuizForm = () => {
    setCourse('')
    setTopic('')
    setQuizType('')
    setQuizStatus('')
    setSubmissionDate('')
    setQuizFor('')
    setDurationHrs('')
    setDurationMin('')
    setDurationSec('')
    setUploadFile(null)
    setInstructions('')
    setQuestionRows([emptyQuestionRow(1)])
    setNextQuestionId(2)
  }

  const addQuestionRow = () => {
    setQuestionRows((prev) => [...prev, emptyQuestionRow(nextQuestionId)])
    setNextQuestionId((id) => id + 1)
    showFeedback('Question row added.')
  }

  const removeQuestionRow = (id: number) => {
    setQuestionRows((prev) => {
      if (prev.length <= 1) return prev
      queueMicrotask(() => showFeedback('Question row removed.'))
      return prev.filter((r) => r.id !== id)
    })
  }

  const updateQuestionRow = (id: number, updates: Partial<QuizQuestionRow>) => {
    setQuestionRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)))
  }

  const handlePostQuiz = () => {
    clearAllQuizForm()
    showFeedback('Quiz posted successfully.')
  }

  const emptyExportRows: Record<string, unknown>[] = []
  const handleExportExcel = (cols: ExportColumn[], name: string, sheet: string) => {
    exportToExcel(cols, emptyExportRows, `${name}.xlsx`, sheet, undefined)
    showFeedback('Excel file downloaded.')
  }
  const handleExportPDF = (cols: ExportColumn[], name: string, title: string) => {
    exportToPDF(cols, emptyExportRows, `${name}.pdf`, title, undefined)
    showFeedback('PDF file downloaded.')
  }

  return (
    <div className="tests-quizzes-page">
      <header className="tests-quizzes-header">
        <div className="tests-quizzes-heading">
          <h1 className="tests-quizzes-title">Tests and Quizzes - {className}</h1>
          <nav className="tests-quizzes-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin">Staff List</Link>
          </nav>
          <GoBack to="/admin" label="Go back to Dashboard" className="tests-quizzes-goback" />
        </div>
      </header>

      <div className="tests-quizzes-tabs" role="tablist">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id ? 'true' : 'false'}
              className={`tests-quizzes-tab ${activeTab === tab.id ? 'tests-quizzes-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="tests-quizzes-content">
        {activeTab === 'trial-quiz' && (
          <section className="tests-quizzes-section" aria-labelledby="trial-quiz-heading">
            <h2 id="trial-quiz-heading" className="tests-quizzes-section-title">
              Trial Quiz
            </h2>
            <div className="tests-quizzes-card">
              <div className="tests-quizzes-toolbar">
                <div className="tests-quizzes-toolbar-left">
                  <label className="tests-quizzes-entries-label">
                    Show
                    <select
                      value={perPage}
                      onChange={(e) => setPerPage(Number(e.target.value))}
                      className="tests-quizzes-entries-select"
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
                <div className="tests-quizzes-toolbar-right">
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportExcel(QUIZ_EXPORT_COLUMNS, `quizzes-${className}`, 'Trial Quiz')}>
                    Excel
                  </button>
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportPDF(QUIZ_EXPORT_COLUMNS, `quizzes-${className}.pdf`, `Quizzes - ${className}`)}>
                    PDF
                  </button>
                  <label className="tests-quizzes-search-label">
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
              <div className="tests-quizzes-table-wrap">
                <table className="tests-quizzes-table" role="grid">
                  <thead>
                    <tr className="tests-quizzes-thead-row">
                      {QUIZ_TABLE_COLUMNS.map((col) => (
                        <th key={col} scope="col" className="tests-quizzes-th">
                          {col}
                          <span className="tests-quizzes-sort-icon" aria-hidden>
                            <SortIcon />
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={QUIZ_TABLE_COLUMNS.length} className="tests-quizzes-td tests-quizzes-td--empty">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tests-quizzes-footer">
                <div className="tests-quizzes-info">
                  Showing {totalRows} to {totalRows} of {totalRows} entries
                </div>
                <div className="tests-quizzes-pagination">
                  <button type="button" className="tests-quizzes-page-btn" disabled>
                    Previous
                  </button>
                  <button type="button" className="tests-quizzes-page-btn" disabled>
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'assessment-quiz' && (
          <section className="tests-quizzes-section" aria-labelledby="assessment-quiz-heading">
            <h2 id="assessment-quiz-heading" className="tests-quizzes-section-title">
              Assessment Quiz
            </h2>
            <div className="tests-quizzes-card">
              <div className="tests-quizzes-toolbar">
                <div className="tests-quizzes-toolbar-left">
                  <label className="tests-quizzes-entries-label">
                    Show
                    <select className="tests-quizzes-entries-select" aria-label="Entries per page">
                      {PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    entries
                  </label>
                </div>
                <div className="tests-quizzes-toolbar-right">
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportExcel(QUIZ_EXPORT_COLUMNS, `assessment-${className}`, 'Assessment Quiz')}>Excel</button>
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportPDF(QUIZ_EXPORT_COLUMNS, `assessment-${className}.pdf`, `Assessment - ${className}`)}>PDF</button>
                  <label className="tests-quizzes-search-label">
                    Search:
                    <input type="search" placeholder="Search…" aria-label="Search table" />
                  </label>
                </div>
              </div>
              <div className="tests-quizzes-table-wrap">
                <table className="tests-quizzes-table" role="grid">
                  <thead>
                    <tr className="tests-quizzes-thead-row">
                      {QUIZ_TABLE_COLUMNS.map((col) => (
                        <th key={col} scope="col" className="tests-quizzes-th">
                          {col}
                          <span className="tests-quizzes-sort-icon" aria-hidden><SortIcon /></span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={QUIZ_TABLE_COLUMNS.length} className="tests-quizzes-td tests-quizzes-td--empty">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tests-quizzes-footer">
                <div className="tests-quizzes-info">Showing 0 to 0 of 0 entries</div>
                <div className="tests-quizzes-pagination">
                  <button type="button" className="tests-quizzes-page-btn" disabled>Previous</button>
                  <button type="button" className="tests-quizzes-page-btn" disabled>Next</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'lesson-notes' && (
          <section className="tests-quizzes-section" aria-labelledby="lesson-notes-heading">
            <h2 id="lesson-notes-heading" className="tests-quizzes-section-title">
              Lesson Notes
            </h2>
            <div className="tests-quizzes-card">
              <div className="tests-quizzes-toolbar">
                <div className="tests-quizzes-toolbar-left">
                  <label className="tests-quizzes-entries-label">
                    Show
                    <select className="tests-quizzes-entries-select" aria-label="Entries per page">
                      {PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    entries
                  </label>
                </div>
                <div className="tests-quizzes-toolbar-right">
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportExcel(LESSON_NOTES_EXPORT_COLUMNS, `lesson-notes-${className}`, 'Lesson Notes')}>Excel</button>
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportPDF(LESSON_NOTES_EXPORT_COLUMNS, `lesson-notes-${className}.pdf`, `Lesson Notes - ${className}`)}>PDF</button>
                  <label className="tests-quizzes-search-label">
                    Search:
                    <input type="search" placeholder="Search…" aria-label="Search table" />
                  </label>
                </div>
              </div>
              <div className="tests-quizzes-table-wrap">
                <table className="tests-quizzes-table" role="grid">
                  <thead>
                    <tr className="tests-quizzes-thead-row">
                      {LESSON_NOTES_TABLE_COLUMNS.map((col) => (
                        <th key={col} scope="col" className="tests-quizzes-th">
                          {col}
                          <span className="tests-quizzes-sort-icon" aria-hidden><SortIcon /></span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={LESSON_NOTES_TABLE_COLUMNS.length} className="tests-quizzes-td tests-quizzes-td--empty">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tests-quizzes-footer">
                <div className="tests-quizzes-info">Showing 0 to 0 of 0 entries</div>
                <div className="tests-quizzes-pagination">
                  <button type="button" className="tests-quizzes-page-btn" disabled>Previous</button>
                  <button type="button" className="tests-quizzes-page-btn" disabled>Next</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'syllabus' && (
          <section className="tests-quizzes-section" aria-labelledby="syllabus-heading">
            <h2 id="syllabus-heading" className="tests-quizzes-section-title">
              Syllabus
            </h2>
            <div className="tests-quizzes-card">
              <div className="tests-quizzes-toolbar">
                <div className="tests-quizzes-toolbar-left">
                  <label className="tests-quizzes-entries-label">
                    Show
                    <select className="tests-quizzes-entries-select" aria-label="Entries per page">
                      {PER_PAGE_OPTIONS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                    entries
                  </label>
                </div>
                <div className="tests-quizzes-toolbar-right">
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportExcel(SYLLABUS_EXPORT_COLUMNS, `syllabus-${className}`, 'Syllabus')}>Excel</button>
                  <button type="button" className="tests-quizzes-export-btn" onClick={() => handleExportPDF(SYLLABUS_EXPORT_COLUMNS, `syllabus-${className}.pdf`, `Syllabus - ${className}`)}>PDF</button>
                  <label className="tests-quizzes-search-label">
                    Search:
                    <input type="search" placeholder="Search…" aria-label="Search table" />
                  </label>
                </div>
              </div>
              <div className="tests-quizzes-table-wrap">
                <table className="tests-quizzes-table" role="grid">
                  <thead>
                    <tr className="tests-quizzes-thead-row">
                      {SYLLABUS_TABLE_COLUMNS.map((col) => (
                        <th key={col} scope="col" className="tests-quizzes-th">
                          {col}
                          <span className="tests-quizzes-sort-icon" aria-hidden><SortIcon /></span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={SYLLABUS_TABLE_COLUMNS.length} className="tests-quizzes-td tests-quizzes-td--empty">
                        No data available in table
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="tests-quizzes-footer">
                <div className="tests-quizzes-info">Showing 0 to 0 of 0 entries</div>
                <div className="tests-quizzes-pagination">
                  <button type="button" className="tests-quizzes-page-btn" disabled>Previous</button>
                  <button type="button" className="tests-quizzes-page-btn" disabled>Next</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'create-new' && (
          <section className="tests-quizzes-section create-quiz-section" aria-labelledby="create-quiz-form-heading">
            <h2 id="create-quiz-form-heading" className="create-quiz-form-title">
              Create Test/Quiz
            </h2>
            <p className="create-quiz-required-notice">
              Fields marked with (*) cannot be blank
            </p>

            <form
              className="create-quiz-form"
              onSubmit={(e) => { e.preventDefault(); handlePostQuiz(); }}
            >
              <div className="create-quiz-block">
                <h3 className="create-quiz-block-title">Quiz details</h3>
                <div className="create-quiz-fields">
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Course <span className="create-quiz-required">*</span></span>
                    <select
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="create-quiz-input create-quiz-select"
                      aria-required
                    >
                      <option value="">Select Subject/Course Here</option>
                      <option value="math">Mathematics</option>
                      <option value="english">English</option>
                      <option value="science">Science</option>
                    </select>
                  </label>
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Topic <span className="create-quiz-required">*</span></span>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Enter assignment title/topic here"
                      className="create-quiz-input"
                      aria-required
                    />
                  </label>
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Quiz Type <span className="create-quiz-required">*</span></span>
                    <select
                      value={quizType}
                      onChange={(e) => {
                        setQuizType(e.target.value)
                        resetQuestionRowsForType()
                      }}
                      className="create-quiz-input create-quiz-select"
                      aria-required
                    >
                      <option value="">Select Quiz Type here</option>
                      {QUIZ_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Quiz Status <span className="create-quiz-required">*</span></span>
                    <select
                      value={quizStatus}
                      onChange={(e) => setQuizStatus(e.target.value)}
                      className="create-quiz-input create-quiz-select"
                      aria-required
                    >
                      <option value="">Select Quiz status here</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </label>
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Date Created <span className="create-quiz-required">*</span></span>
                    <input
                      type="text"
                      value={dateCreated}
                      readOnly
                      className="create-quiz-input create-quiz-input--readonly"
                      aria-readonly
                    />
                  </label>
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Submission Date <span className="create-quiz-required">*</span></span>
                    <input
                      type="date"
                      value={submissionDate}
                      onChange={(e) => setSubmissionDate(e.target.value)}
                      className="create-quiz-input"
                      aria-required
                    />
                  </label>
                  <label className="create-quiz-field">
                    <span className="create-quiz-label">Quiz for Assessment/Trial <span className="create-quiz-required">*</span></span>
                    <select
                      value={quizFor}
                      onChange={(e) => setQuizFor(e.target.value)}
                      className="create-quiz-input create-quiz-select"
                      aria-required
                    >
                      <option value="">Select option here</option>
                      <option value="trial">Trial</option>
                      <option value="assessment">Assessment</option>
                    </select>
                  </label>
                  <div className="create-quiz-field create-quiz-duration">
                    <span className="create-quiz-label">Test Duration (Hrs/Min/Sec) <span className="create-quiz-required">*</span></span>
                    <div className="create-quiz-duration-inputs">
                      <div className="create-quiz-duration-group">
                        <span className="create-quiz-duration-label">Hrs</span>
                        <input
                          type="number"
                          min={0}
                          max={23}
                          value={durationHrs}
                          onChange={(e) => setDurationHrs(e.target.value)}
                          placeholder="0"
                          className="create-quiz-input create-quiz-duration-input"
                          aria-label="Hours"
                        />
                      </div>
                      <div className="create-quiz-duration-group">
                        <span className="create-quiz-duration-label">Min</span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={durationMin}
                          onChange={(e) => setDurationMin(e.target.value)}
                          placeholder="0"
                          className="create-quiz-input create-quiz-duration-input"
                          aria-label="Minutes"
                        />
                      </div>
                      <div className="create-quiz-duration-group">
                        <span className="create-quiz-duration-label">Sec</span>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={durationSec}
                          onChange={(e) => setDurationSec(e.target.value)}
                          placeholder="0"
                          className="create-quiz-input create-quiz-duration-input"
                          aria-label="Seconds"
                        />
                      </div>
                    </div>
                  </div>
                  <label className="create-quiz-field create-quiz-field--full">
                    <span className="create-quiz-label">Upload Document</span>
                    <input
                      type="file"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      className="create-quiz-file"
                      aria-label="Upload document"
                    />
                    <span className="create-quiz-file-label">{uploadFile ? uploadFile.name : 'No file chosen'}</span>
                  </label>
                  <label className="create-quiz-field create-quiz-field--full">
                    <span className="create-quiz-label">Enter Quiz Instructions <span className="create-quiz-required">*</span></span>
                    <textarea
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Enter instructions for the quiz…"
                      className="create-quiz-textarea"
                      rows={4}
                      aria-required
                    />
                  </label>
                </div>
              </div>

              <div className="create-quiz-block">
                <h3 className="create-quiz-block-title">Quiz questions</h3>
                {quizType && (
                  <p className="create-quiz-type-hint">
                    {QUIZ_TYPE_OPTIONS.find((o) => o.value === quizType)?.description}
                  </p>
                )}
                <div className="create-quiz-questions-wrap">
                  {!quizType ? (
                    <p className="create-quiz-select-type-msg">Select a quiz type above to add questions.</p>
                  ) : (
                    <>
                      <div className="create-quiz-questions-scroll">
                        {quizType === 'mcq' && (
                          <table className="create-quiz-questions-table" role="grid">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Question</th>
                                <th scope="col">Enter Option A and B</th>
                                <th scope="col">Enter Option C and D</th>
                                <th scope="col">Correct Answer</th>
                                <th scope="col" className="create-quiz-th-action" aria-label="Delete row" />
                              </tr>
                            </thead>
                            <tbody>
                              {questionRows.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <input type="text" value={row.question} onChange={(e) => updateQuestionRow(row.id, { question: e.target.value })} placeholder="Enter Question here" className="create-quiz-input create-quiz-question-input" aria-label={`Question ${index + 1}`} />
                                  </td>
                                  <td>
                                    <div className="create-quiz-options-cell">
                                      <input type="text" value={row.optionA} onChange={(e) => updateQuestionRow(row.id, { optionA: e.target.value })} placeholder="Option A here" className="create-quiz-input" aria-label={`Option A ${index + 1}`} />
                                      <input type="text" value={row.optionB} onChange={(e) => updateQuestionRow(row.id, { optionB: e.target.value })} placeholder="Option B here" className="create-quiz-input" aria-label={`Option B ${index + 1}`} />
                                    </div>
                                  </td>
                                  <td>
                                    <div className="create-quiz-options-cell">
                                      <input type="text" value={row.optionC} onChange={(e) => updateQuestionRow(row.id, { optionC: e.target.value })} placeholder="Option C here" className="create-quiz-input" aria-label={`Option C ${index + 1}`} />
                                      <input type="text" value={row.optionD} onChange={(e) => updateQuestionRow(row.id, { optionD: e.target.value })} placeholder="Option D here" className="create-quiz-input" aria-label={`Option D ${index + 1}`} />
                                    </div>
                                  </td>
                                  <td>
                                    <select value={row.correctAnswer} onChange={(e) => updateQuestionRow(row.id, { correctAnswer: e.target.value })} className="create-quiz-input create-quiz-select create-quiz-correct-select" aria-label={`Correct answer ${index + 1}`}>
                                      <option value="">Select Answer</option>
                                      {CORRECT_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                  </td>
                                  <td className="create-quiz-td-action">
                                    <button type="button" className="create-quiz-del-row-btn" onClick={() => removeQuestionRow(row.id)} aria-label={`Delete row ${index + 1}`}>Delete Row</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {quizType === 'multi-response' && (
                          <table className="create-quiz-questions-table" role="grid">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Question</th>
                                <th scope="col">Option A</th>
                                <th scope="col">Option B</th>
                                <th scope="col">Option C</th>
                                <th scope="col">Option D</th>
                                <th scope="col">Correct Answers (e.g. A, C, D)</th>
                                <th scope="col" className="create-quiz-th-action" aria-label="Delete row" />
                              </tr>
                            </thead>
                            <tbody>
                              {questionRows.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <input type="text" value={row.question} onChange={(e) => updateQuestionRow(row.id, { question: e.target.value })} placeholder="Enter question" className="create-quiz-input create-quiz-question-input" aria-label={`Question ${index + 1}`} />
                                  </td>
                                  <td><input type="text" value={row.optionA} onChange={(e) => updateQuestionRow(row.id, { optionA: e.target.value })} placeholder="A" className="create-quiz-input" aria-label={`Option A ${index + 1}`} /></td>
                                  <td><input type="text" value={row.optionB} onChange={(e) => updateQuestionRow(row.id, { optionB: e.target.value })} placeholder="B" className="create-quiz-input" aria-label={`Option B ${index + 1}`} /></td>
                                  <td><input type="text" value={row.optionC} onChange={(e) => updateQuestionRow(row.id, { optionC: e.target.value })} placeholder="C" className="create-quiz-input" aria-label={`Option C ${index + 1}`} /></td>
                                  <td><input type="text" value={row.optionD} onChange={(e) => updateQuestionRow(row.id, { optionD: e.target.value })} placeholder="D" className="create-quiz-input" aria-label={`Option D ${index + 1}`} /></td>
                                  <td>
                                    <input type="text" value={row.correctAnswers} onChange={(e) => updateQuestionRow(row.id, { correctAnswers: e.target.value })} placeholder="A, C, D" className="create-quiz-input" aria-label={`Correct answers ${index + 1}`} />
                                  </td>
                                  <td className="create-quiz-td-action">
                                    <button type="button" className="create-quiz-del-row-btn" onClick={() => removeQuestionRow(row.id)} aria-label={`Delete row ${index + 1}`}>Delete Row</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {quizType === 'fill-in' && (
                          <table className="create-quiz-questions-table" role="grid">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Question (use _____ for blank)</th>
                                <th scope="col">Correct Answer</th>
                                <th scope="col" className="create-quiz-th-action" aria-label="Delete row" />
                              </tr>
                            </thead>
                            <tbody>
                              {questionRows.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <input type="text" value={row.question} onChange={(e) => updateQuestionRow(row.id, { question: e.target.value })} placeholder="The capital of Ghana is _____." className="create-quiz-input create-quiz-question-input" aria-label={`Question ${index + 1}`} />
                                  </td>
                                  <td>
                                    <input type="text" value={row.correctAnswerText} onChange={(e) => updateQuestionRow(row.id, { correctAnswerText: e.target.value })} placeholder="Accra" className="create-quiz-input" aria-label={`Correct answer ${index + 1}`} />
                                  </td>
                                  <td className="create-quiz-td-action">
                                    <button type="button" className="create-quiz-del-row-btn" onClick={() => removeQuestionRow(row.id)} aria-label={`Delete row ${index + 1}`}>Delete Row</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {quizType === 'matching' && (
                          <table className="create-quiz-questions-table" role="grid">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Left Item</th>
                                <th scope="col">Right Item (correct match)</th>
                                <th scope="col" className="create-quiz-th-action" aria-label="Delete row" />
                              </tr>
                            </thead>
                            <tbody>
                              {questionRows.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <input type="text" value={row.leftItem} onChange={(e) => updateQuestionRow(row.id, { leftItem: e.target.value })} placeholder="e.g. Apple" className="create-quiz-input create-quiz-question-input" aria-label={`Left item ${index + 1}`} />
                                  </td>
                                  <td>
                                    <input type="text" value={row.rightItem} onChange={(e) => updateQuestionRow(row.id, { rightItem: e.target.value })} placeholder="e.g. Red" className="create-quiz-input create-quiz-question-input" aria-label={`Right item ${index + 1}`} />
                                  </td>
                                  <td className="create-quiz-td-action">
                                    <button type="button" className="create-quiz-del-row-btn" onClick={() => removeQuestionRow(row.id)} aria-label={`Delete row ${index + 1}`}>Delete Row</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                        {quizType === 'scenario' && (
                          <table className="create-quiz-questions-table" role="grid">
                            <thead>
                              <tr>
                                <th scope="col">#</th>
                                <th scope="col">Scenario</th>
                                <th scope="col">Option A</th>
                                <th scope="col">Outcome A</th>
                                <th scope="col">Option B</th>
                                <th scope="col">Outcome B</th>
                                <th scope="col" className="create-quiz-th-action" aria-label="Delete row" />
                              </tr>
                            </thead>
                            <tbody>
                              {questionRows.map((row, index) => (
                                <tr key={row.id}>
                                  <td>{index + 1}</td>
                                  <td>
                                    <input type="text" value={row.scenario} onChange={(e) => updateQuestionRow(row.id, { scenario: e.target.value })} placeholder="Scenario text" className="create-quiz-input create-quiz-question-input" aria-label={`Scenario ${index + 1}`} />
                                  </td>
                                  <td><input type="text" value={row.optionA} onChange={(e) => updateQuestionRow(row.id, { optionA: e.target.value })} placeholder="Choice A" className="create-quiz-input" aria-label={`Option A ${index + 1}`} /></td>
                                  <td><input type="text" value={row.outcomeA} onChange={(e) => updateQuestionRow(row.id, { outcomeA: e.target.value })} placeholder="Outcome if A" className="create-quiz-input" aria-label={`Outcome A ${index + 1}`} /></td>
                                  <td><input type="text" value={row.optionB} onChange={(e) => updateQuestionRow(row.id, { optionB: e.target.value })} placeholder="Choice B" className="create-quiz-input" aria-label={`Option B ${index + 1}`} /></td>
                                  <td><input type="text" value={row.outcomeB} onChange={(e) => updateQuestionRow(row.id, { outcomeB: e.target.value })} placeholder="Outcome if B" className="create-quiz-input" aria-label={`Outcome B ${index + 1}`} /></td>
                                  <td className="create-quiz-td-action">
                                    <button type="button" className="create-quiz-del-row-btn" onClick={() => removeQuestionRow(row.id)} aria-label={`Delete row ${index + 1}`}>Delete Row</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                      <button type="button" className="create-quiz-add-row-btn" onClick={addQuestionRow}>
                        Add Row
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="create-quiz-actions">
                <button
                  type="button"
                  className="create-quiz-btn create-quiz-btn--clear"
                  onClick={() => { clearAllQuizForm(); showFeedback('Form cleared.'); }}
                >
                  Clear All
                </button>
                <button type="submit" className="create-quiz-btn create-quiz-btn--post">
                  Post Quiz
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}

function SortIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M7 15l5-5 5 5M7 9l5 5 5-5" />
    </svg>
  )
}

function TrialQuizIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function AssessmentQuizIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
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

function CreateNewIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 18v-6M9 15h6" />
    </svg>
  )
}
