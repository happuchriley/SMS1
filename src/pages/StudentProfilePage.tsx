import { useState, useMemo } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useRegisteredStudents } from '@/contexts/RegisteredStudentsContext'
import { useStudentAccountOverrides, mergeProfileWithOverrides } from '@/contexts/StudentAccountOverridesContext'
import { getStudentProfile, studentRowToProfile } from '@/data/adminMock'
import './StudentProfilePage.css'

function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (!digits) return ''
  if (digits.startsWith('0')) return '233' + digits.slice(1)
  if (!digits.startsWith('233') && digits.length <= 10) return '233' + digits
  return digits
}

function normalizePhoneForSms(phone: string): string {
  const digits = normalizePhoneForWhatsApp(phone)
  return digits ? '+' + digits : ''
}

const TABS = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'contact', label: 'Contact Details' },
  { id: 'guardian', label: 'Guardian Info' },
  { id: 'admin', label: 'Admin Info' },
  { id: 'notification', label: 'Notification' },
] as const

type TabId = (typeof TABS)[number]['id']

export default function StudentProfilePage() {
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
  const { showFeedback } = useFeedback()
  const { registeredStudents } = useRegisteredStudents()
  const { getProfileOverride, getPasswordOverride } = useStudentAccountOverrides()
  const [activeTab, setActiveTab] = useState<TabId>('basic')

  const baseProfile = useMemo(() => {
    if (!studentId) return null
    const registered = registeredStudents.find((r) => r.studentId === studentId)
    if (registered) return studentRowToProfile(registered)
    return getStudentProfile(studentId)
  }, [studentId, registeredStudents])

  const profileOverride = studentId ? getProfileOverride(studentId) : undefined
  const passwordOverride = studentId ? getPasswordOverride(studentId) : undefined
  const profile = useMemo(() => {
    if (!baseProfile) return null
    return mergeProfileWithOverrides(baseProfile, profileOverride, passwordOverride)
  }, [baseProfile, profileOverride, passwordOverride])

  if (!studentId || !profile) {
    return (
      <div className="student-profile-page">
        <p className="student-profile-empty">Student not found.</p>
        <Link to={listBackTo}>Back to Students List</Link>
      </div>
    )
  }

  const recordsBase = `/admin/students/profile/${studentId}/records`

  const [billAmount, setBillAmount] = useState('0.00')
  const [generalMessage, setGeneralMessage] = useState('')
  const GENERAL_MAX_CHARS = 220

  const phone = (profile.contact.phone || '').trim()
  const phoneForWa = useMemo(() => normalizePhoneForWhatsApp(phone), [phone])
  const phoneForSms = useMemo(() => normalizePhoneForSms(phone), [phone])

  const sendViaWhatsApp = (message: string) => {
    if (!phoneForWa) {
      showFeedback('No phone number on file.', 'error')
      return
    }
    const url = `https://wa.me/${phoneForWa}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
    showFeedback('WhatsApp opened with message.', 'success')
  }

  const sendViaSms = (message: string) => {
    if (!phoneForSms) {
      showFeedback('No phone number on file.', 'error')
      return
    }
    const url = `sms:${phoneForSms}${message ? `?body=${encodeURIComponent(message)}` : ''}`
    window.location.href = url
    showFeedback('SMS app opened with message.', 'success')
  }

  const loginDetailsMessage = `Login details for ${profile.fullName}\nUsername/ID: ${profile.studentId}\nPassword: ${profile.password ?? '—'}`
  const billInfoMessage = `Bill information for ${profile.fullName}\nAmount: ${billAmount}`
  const generalInfoMessage = generalMessage.trim() || 'General message from school.'

  return (
    <div className="student-profile-page">
      <nav className="student-profile-breadcrumb" aria-label="Breadcrumb">
        <Link to="/admin">Home</Link>
        {' / '}
        <Link to={listBackTo}>Student List</Link>
        {' / '}
        {profile.fullName}'s Profile
        {' / '}
        <Link to={listBackTo}>Students List</Link>
      </nav>
      <GoBack to={listBackTo} label={listBackLabel}
        className="student-profile-goback"
      />

      <h1 className="student-profile-title">
        Student Profile - {profile.fullName} - {profile.status}
      </h1>

      <div className="student-profile-layout">
        <aside className="student-profile-sidebar">
          <div className="student-profile-avatar" aria-hidden>
            <PersonIcon />
          </div>
          <p className="student-profile-name">{profile.fullName}</p>
          <p className="student-profile-id">{profile.studentId}</p>
          <p className="student-profile-meta">
            {profile.gender.toUpperCase()} - {profile.currentClass.toUpperCase()}
          </p>
          <div className="student-profile-actions">
            <Link
              to={`${recordsBase}?view=results`}
              className="student-profile-btn student-profile-btn--results"
            >
              <ListIcon />
              RESULTS
            </Link>
            <Link
              to={`${recordsBase}?view=bill`}
              className="student-profile-btn student-profile-btn--bill"
            >
              <DollarIcon />
              BILL
            </Link>
            <Link
              to={`${recordsBase}?view=statements`}
              className="student-profile-btn student-profile-btn--statement"
            >
              <DocumentIcon />
              STATEMENT
            </Link>
          </div>
          <Link to={`/admin/students/profile/${studentId}/settings`} state={location.state} className="student-profile-account-link">
            Account Settings
          </Link>
        </aside>

        <div className="student-profile-main">
          <div className="student-profile-tabs" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id ? 'true' : 'false'}
                className={`student-profile-tab ${activeTab === tab.id ? 'student-profile-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="student-profile-content">
            {activeTab === 'basic' && (
              <section className="student-profile-section" aria-labelledby="basic-heading">
                <h2 id="basic-heading" className="student-profile-section-title">
                  Basic Information
                </h2>
                <div className="student-profile-table-wrap">
                  <table className="student-profile-info-table">
                    <tbody>
                      <InfoRow label="First Name" value={profile.basic.firstName} />
                      <InfoRow label="Surname" value={profile.basic.surname} />
                      <InfoRow label="Other Names" value={profile.basic.otherNames} />
                      <InfoRow label="Student ID" value={profile.studentId} />
                      <InfoRow label="Gender" value={profile.gender} />
                      <InfoRow label="Date of Birth" value={profile.basic.dateOfBirth} />
                      <InfoRow label="National" value={profile.basic.national} />
                      <InfoRow label="Home Town" value={profile.basic.homeTown} />
                      <InfoRow label="Current Country" value={profile.basic.currentCountry} />
                      <InfoRow label="Current City" value={profile.basic.currentCity} />
                      <InfoRow label="Religion" value={profile.basic.religion} />
                      <InfoRow label="Current Class" value={profile.currentClass} />
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'contact' && (
              <section className="student-profile-section" aria-labelledby="contact-heading">
                <h2 id="contact-heading" className="student-profile-section-title">
                  Contact Details
                </h2>
                <div className="student-profile-table-wrap">
                  <table className="student-profile-info-table">
                    <tbody>
                      <InfoRow label="Phone" value={profile.contact.phone || 'N/A'} />
                      <InfoRow label="Email" value={profile.contact.email || 'N/A'} />
                      <InfoRow label="Address" value={profile.contact.address || 'N/A'} />
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'guardian' && (
              <section className="student-profile-section" aria-labelledby="guardian-heading">
                <h2 id="guardian-heading" className="student-profile-section-title">
                  Guardian Info
                </h2>
                <div className="student-profile-table-wrap">
                  <table className="student-profile-info-table">
                    <tbody>
                      <InfoRow label="Father's Name" value={profile.guardian.fatherName || 'N/A'} />
                      <InfoRow label="Father's Contact" value={profile.guardian.fatherContact || 'N/A'} />
                      <InfoRow label="Mother's Name" value={profile.guardian.motherName || 'N/A'} />
                      <InfoRow label="Mother's Contact" value={profile.guardian.motherContact || 'N/A'} />
                      <InfoRow label="Parents Address" value={profile.guardian.parentsAddress || 'N/A'} />
                      <InfoRow label="Parents Email" value={profile.guardian.parentsEmail || 'N/A'} />
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'admin' && (
              <section className="student-profile-section" aria-labelledby="admin-heading">
                <h2 id="admin-heading" className="student-profile-section-title">
                  Admin Info
                </h2>
                <div className="student-profile-table-wrap">
                  <table className="student-profile-info-table">
                    <tbody>
                      <InfoRow label="Entry Class" value={profile.admin.entryClass || 'N/A'} />
                      <InfoRow label="Admin Date" value={profile.admin.adminDate || 'N/A'} />
                      <InfoRow label="Program / Course" value={profile.admin.programCourse || 'N/A'} />
                      <InfoRow label="Affiliate House" value={profile.admin.affiliateHouse || 'N/A'} />
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'notification' && (
              <section className="student-profile-section student-profile-notification" aria-labelledby="notification-heading">
                <h2 id="notification-heading" className="student-profile-section-title">
                  Notification
                </h2>

                <div className="student-profile-notify-block">
                  <h3 className="student-profile-notify-heading">Send Login Details</h3>
                  <div className="student-profile-notify-fields">
                    <label className="student-profile-field">
                      <span className="student-profile-field-label">Phone</span>
                      <input type="text" className="student-profile-input" value={profile.contact.phone || ''} readOnly />
                    </label>
                    <label className="student-profile-field">
                      <span className="student-profile-field-label">Username / ID</span>
                      <input type="text" className="student-profile-input" value={profile.studentId} readOnly />
                    </label>
                    <label className="student-profile-field">
                      <span className="student-profile-field-label">Password</span>
                      <input type="text" className="student-profile-input" value={profile.password ?? '—'} readOnly />
                    </label>
                  </div>
                  <div className="student-profile-notify-actions">
                    <button type="button" className="student-profile-send-btn student-profile-send-btn--whatsapp" onClick={() => sendViaWhatsApp(loginDetailsMessage)}>
                      <WhatsAppIcon /> Send Whatsapp
                    </button>
                    <button type="button" className="student-profile-send-btn student-profile-send-btn--sms" onClick={() => sendViaSms(loginDetailsMessage)}>
                      <SmsIcon /> Send SMS
                    </button>
                  </div>
                </div>

                <div className="student-profile-notify-block">
                  <h3 className="student-profile-notify-heading">Send Bill Info</h3>
                  <div className="student-profile-notify-fields">
                    <label className="student-profile-field">
                      <span className="student-profile-field-label">Phone</span>
                      <input type="text" className="student-profile-input" value={profile.contact.phone || ''} readOnly />
                    </label>
                    <label className="student-profile-field">
                      <span className="student-profile-field-label">Amount</span>
                      <input type="text" className="student-profile-input" value={billAmount} onChange={(e) => setBillAmount(e.target.value)} placeholder="0.00" />
                    </label>
                  </div>
                  <div className="student-profile-notify-actions">
                    <button type="button" className="student-profile-send-btn student-profile-send-btn--whatsapp" onClick={() => sendViaWhatsApp(billInfoMessage)}>
                      <WhatsAppIcon /> Send Whatsapp
                    </button>
                    <button type="button" className="student-profile-send-btn student-profile-send-btn--sms-blue" onClick={() => sendViaSms(billInfoMessage)}>
                      <SmsIcon /> Send SMS
                    </button>
                  </div>
                </div>

                <div className="student-profile-notify-block">
                  <h3 className="student-profile-notify-heading">Send General Info</h3>
                  <p className="student-profile-char-hint">Enter Message here (Max Characters = {GENERAL_MAX_CHARS})</p>
                  <label className="student-profile-field student-profile-field--full">
                    <textarea
                      className="student-profile-textarea"
                      placeholder="Enter Message here to send"
                      value={generalMessage}
                      onChange={(e) => setGeneralMessage(e.target.value.slice(0, GENERAL_MAX_CHARS))}
                      maxLength={GENERAL_MAX_CHARS}
                      rows={4}
                    />
                    <span className="student-profile-char-count">{generalMessage.length} / {GENERAL_MAX_CHARS}</span>
                  </label>
                  <div className="student-profile-notify-actions">
                    <button type="button" className="student-profile-send-btn student-profile-send-btn--whatsapp" onClick={() => sendViaWhatsApp(generalInfoMessage)}>
                      <WhatsAppIcon /> Send Whatsapp
                    </button>
                    <button type="button" className="student-profile-send-btn student-profile-send-btn--sms" onClick={() => sendViaSms(generalInfoMessage)}>
                      <SmsIcon /> Send SMS
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <th scope="row" className="student-profile-info-th">{label}</th>
      <td className="student-profile-info-td">{value}</td>
    </tr>
  )
}

function PersonIcon() {
  return (
    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

function DollarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

function SmsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
