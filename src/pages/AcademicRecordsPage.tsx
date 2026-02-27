import { useMemo } from 'react'
import { Link, useParams, useSearchParams, useLocation } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useRegisteredStudents } from '@/contexts/RegisteredStudentsContext'
import { getStudentProfile, studentRowToProfile } from '@/data/adminMock'
import { printPage } from '@/utils/exportUtils'
import './AcademicRecordsPage.css'

const VIEWS = [
  { id: 'results', label: 'Results' },
  { id: 'bill', label: 'Bill' },
  { id: 'statements', label: 'Statements' },
] as const

type ViewId = (typeof VIEWS)[number]['id']

const VIEW_TITLES: Record<ViewId, string> = {
  results: 'Academic Report',
  bill: 'Student Bills',
  statements: 'Statement',
}

export default function AcademicRecordsPage() {
  const { studentId } = useParams<{ studentId: string }>()
  const location = useLocation()
  const fromList = (location.state as { from?: string } | null)?.from
  const listBackTo =
    fromList === 'students-active'
      ? '/admin/students/list/active'
      : fromList === 'students-fresh'
        ? '/admin/students/list/fresh'
        : fromList === 'students-inactive'
          ? '/admin/students/list/inactive'
          : '/admin/students/list'
  const listBackLabel =
    fromList === 'students-active'
      ? 'Go back to Active Students'
      : fromList === 'students-fresh'
        ? 'Go back to Fresh Students'
        : fromList === 'students-inactive'
          ? 'Go back to Inactive Students'
          : 'Go back to Students List'
  const [searchParams] = useSearchParams()
  const viewParam = searchParams.get('view') as ViewId | null
  const activeView: ViewId =
    viewParam && VIEWS.some((v) => v.id === viewParam) ? viewParam : 'results'

  const { registeredStudents } = useRegisteredStudents()
  const profile = useMemo(() => {
    if (!studentId) return null
    const registered = registeredStudents.find((r) => r.studentId === studentId)
    if (registered) return studentRowToProfile(registered)
    return getStudentProfile(studentId)
  }, [studentId, registeredStudents])

  if (!studentId || !profile) {
    return (
      <div className="academic-records-page">
        <p className="academic-records-empty">Student not found.</p>
        <Link to={listBackTo}>Back to Students List</Link>
      </div>
    )
  }

  const handlePrint = () => printPage()

  const pageTitle = `${VIEW_TITLES[activeView]} - ${profile.fullName} - ${profile.status}`

  return (
    <div className="academic-records-page">
      <div className="academic-records-header">
        <div className="academic-records-title-row">
          <h1 className="academic-records-title">
            {pageTitle}
          </h1>
          <nav className="academic-records-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to={listBackTo}>Students List</Link>
          </nav>
        </div>
        <GoBack to={listBackTo} label={listBackLabel}
          className="academic-records-goback"
        />
      </div>

      <div className="academic-records-content">
        <div className="academic-records-content-inner">
          <button
            type="button"
            className="academic-records-print-btn"
            onClick={handlePrint}
            aria-label="Print"
          >
            <PrintIcon />
            Print
          </button>
          <p className="academic-records-no-record">No record found</p>
        </div>
      </div>
    </div>
  )
}

function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <path d="M6 14h12v8H6z" />
    </svg>
  )
}
