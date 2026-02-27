import { useState, useMemo, useEffect, useRef } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useRegisteredStudents } from '@/contexts/RegisteredStudentsContext'
import { useStudentAccountOverrides, mergeProfileWithOverrides } from '@/contexts/StudentAccountOverridesContext'
import { getStudentProfile, studentRowToProfile } from '@/data/adminMock'
import { GoBack } from '@/components/GoBack'
import './EditStudentPage.css'

type TabId = 'basic' | 'guardian' | 'admin'

const GENDER_OPTIONS = ['Male', 'Female']
const BLOOD_GROUP_OPTIONS = ['', 'N/A', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
const RELIGION_OPTIONS = ['', 'Christian', 'Christianity', 'Islam', 'Other']
const FEE_OPTIONS = ['', 'No Scholarship', 'Full Fee', 'Scholarship']

const ENTRY_CLASS_OPTIONS = ['', 'Creche', 'Nursery 1', 'Nursery 2', 'KG 1', 'KG 2', 'Basic 1', 'Basic 2', 'Basic 3', 'JHS 1', 'JHS 2', 'JHS 3']
const AFFILIATE_HOUSE_OPTIONS = ['', 'House A', 'House B']
const STUDENT_STATUS_OPTIONS = ['', 'Active', 'Inactive']

export default function EditStudentPage() {
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
  const { getProfileOverride, setProfileOverride } = useStudentAccountOverrides()

  const baseProfile = useMemo(() => {
    if (!studentId) return null
    const registered = registeredStudents.find((r) => r.studentId === studentId)
    if (registered) return studentRowToProfile(registered)
    return getStudentProfile(studentId)
  }, [studentId, registeredStudents])

  const profileOverride = studentId ? getProfileOverride(studentId) : undefined
  const profile = useMemo(() => {
    if (!baseProfile) return null
    return mergeProfileWithOverrides(baseProfile, profileOverride, undefined)
  }, [baseProfile, profileOverride])

  const [activeTab, setActiveTab] = useState<TabId>('basic')

  const [basic, setBasic] = useState({
    firstName: '',
    surname: '',
    otherNames: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: 'N/A',
    allergies: 'N/A',
    address: '',
    contact: '',
    email: '',
    national: 'Ghanaian',
    countryOfResidence: '',
    homeTown: 'N/A',
    currentCity: '',
    religion: 'Christian',
    feeScholarship: 'No Scholarship',
    photo: null as File | null,
  })

  const [guardian, setGuardian] = useState({
    fatherName: '',
    fatherContact: '',
    motherName: '',
    motherContact: '',
    parentsAddress: '',
    parentsEmail: '',
  })

  const [admin, setAdmin] = useState({
    entryClass: '',
    currentClass: '',
    programCourse: 'General',
    affiliateHouse: '',
    adminDate: '',
    studentStatus: 'Active',
  })

  useEffect(() => {
    if (profile) {
      setBasic((prev) => ({
        ...prev,
        firstName: profile.basic.firstName,
        surname: profile.basic.surname,
        otherNames: profile.basic.otherNames,
        gender: profile.gender,
        dateOfBirth: profile.basic.dateOfBirth || '',
        address: profile.contact.address || '',
        contact: profile.contact.phone || '',
        email: profile.contact.email || '',
        national: profile.basic.national || 'Ghanaian',
        countryOfResidence: profile.basic.currentCountry || '',
        homeTown: profile.basic.homeTown || 'N/A',
        currentCity: profile.basic.currentCity || '',
        religion: profile.basic.religion || 'Christian',
      }))
      setGuardian({
        fatherName: profile.guardian.fatherName || '',
        fatherContact: profile.guardian.fatherContact || '',
        motherName: profile.guardian.motherName || '',
        motherContact: profile.guardian.motherContact || '',
        parentsAddress: profile.guardian.parentsAddress || '',
        parentsEmail: profile.guardian.parentsEmail || '',
      })
      setAdmin({
        entryClass: profile.admin.entryClass || '',
        currentClass: profile.currentClass || '',
        programCourse: profile.admin.programCourse || 'General',
        affiliateHouse: profile.admin.affiliateHouse || '',
        adminDate: profile.admin.adminDate || '',
        studentStatus: profile.status || 'Active',
      })
    }
  }, [profile])

  const photoPreviewUrl = basic.photo ? URL.createObjectURL(basic.photo) : null
  const photoRef = useRef<string | null>(null)
  useEffect(() => {
    if (photoRef.current) URL.revokeObjectURL(photoRef.current)
    photoRef.current = photoPreviewUrl
    return () => {
      if (photoRef.current) URL.revokeObjectURL(photoRef.current)
    }
  }, [photoPreviewUrl])

  const fullName = profile ? [profile.basic.surname, profile.basic.firstName, profile.basic.otherNames].filter(Boolean).join(' ') : ''

  const clearAll = () => {
    if (profile) {
      setBasic((prev) => ({
        ...prev,
        firstName: profile.basic.firstName,
        surname: profile.basic.surname,
        otherNames: profile.basic.otherNames,
        gender: profile.gender,
        dateOfBirth: profile.basic.dateOfBirth || '',
        bloodGroup: 'N/A',
        allergies: 'N/A',
        address: profile.contact.address || '',
        contact: profile.contact.phone || '',
        email: profile.contact.email || '',
        national: profile.basic.national || 'Ghanaian',
        countryOfResidence: profile.basic.currentCountry || '',
        homeTown: profile.basic.homeTown || 'N/A',
        currentCity: profile.basic.currentCity || '',
        religion: profile.basic.religion || 'Christian',
        feeScholarship: 'No Scholarship',
        photo: null,
      }))
      setGuardian({
        fatherName: profile.guardian.fatherName || '',
        fatherContact: profile.guardian.fatherContact || '',
        motherName: profile.guardian.motherName || '',
        motherContact: profile.guardian.motherContact || '',
        parentsAddress: profile.guardian.parentsAddress || '',
        parentsEmail: profile.guardian.parentsEmail || '',
      })
      setAdmin({
        entryClass: profile.admin.entryClass || '',
        currentClass: profile.currentClass || '',
        programCourse: profile.admin.programCourse || 'General',
        affiliateHouse: profile.admin.affiliateHouse || '',
        adminDate: profile.admin.adminDate || '',
        studentStatus: profile.status || 'Active',
      })
    }
    showFeedback('Form cleared.')
  }

  const handleSave = () => {
    if (!studentId || !profile) return
    const newFullName = [basic.surname, basic.firstName, basic.otherNames].filter(Boolean).join(' ') || profile.fullName
    setProfileOverride(studentId, {
      fullName: newFullName,
      gender: basic.gender || profile.gender,
      currentClass: admin.currentClass || profile.currentClass,
      status: admin.studentStatus || profile.status,
      basic: {
        firstName: basic.firstName,
        surname: basic.surname,
        otherNames: basic.otherNames,
        dateOfBirth: basic.dateOfBirth,
        national: basic.national,
        homeTown: basic.homeTown,
        currentCountry: basic.countryOfResidence || basic.national,
        currentCity: basic.currentCity,
        religion: basic.religion,
      },
      contact: {
        phone: basic.contact,
        email: basic.email,
        address: basic.address,
      },
      guardian: {
        fatherName: guardian.fatherName,
        fatherContact: guardian.fatherContact,
        motherName: guardian.motherName,
        motherContact: guardian.motherContact,
        parentsAddress: guardian.parentsAddress,
        parentsEmail: guardian.parentsEmail,
      },
      admin: {
        entryClass: admin.entryClass,
        adminDate: admin.adminDate,
        programCourse: admin.programCourse,
        affiliateHouse: admin.affiliateHouse,
      },
    })
    showFeedback('Student info saved successfully.', 'success')
  }

  if (!studentId || !profile) {
    return (
      <div className="edit-student-page">
        <p className="edit-student-empty">Student not found.</p>
        <Link to={listBackTo}>Back to Students List</Link>
      </div>
    )
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'guardian', label: 'Parents/Guardian Info' },
    { id: 'admin', label: 'Admin Info' },
  ]

  return (
    <div className="edit-student-page">
      <header className="edit-student-header">
        <div className="edit-student-heading">
          <h1 className="edit-student-title">Edit Student Info - {fullName || profile.fullName}</h1>
          <nav className="edit-student-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to={listBackTo}>Student List</Link>
            {' / '}
            Edit Student
          </nav>
          <GoBack to={listBackTo} label={listBackLabel} className="edit-student-goback" />
        </div>
      </header>

      <div className="edit-student-card">
        <div className="edit-student-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={`edit-student-tab ${activeTab === tab.id ? 'edit-student-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="edit-student-tabpanel">
          {activeTab === 'basic' && (
            <section className="edit-student-section" aria-labelledby="edit-basic-heading">
              <h2 id="edit-basic-heading" className="edit-student-section-title">Basic Information</h2>
              <div className="edit-student-fields edit-student-fields--grid">
                <div className="edit-student-field">
                  <label htmlFor="edit-studentId">Student ID</label>
                  <input id="edit-studentId" type="text" value={profile.studentId} readOnly className="edit-student-input--readonly" />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-firstName">First Name</label>
                  <input id="edit-firstName" type="text" value={basic.firstName} onChange={(e) => setBasic((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-surname">Surname</label>
                  <input id="edit-surname" type="text" value={basic.surname} onChange={(e) => setBasic((p) => ({ ...p, surname: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-otherNames">Other Name(s)</label>
                  <input id="edit-otherNames" type="text" value={basic.otherNames} onChange={(e) => setBasic((p) => ({ ...p, otherNames: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-gender">Gender</label>
                  <select id="edit-gender" value={basic.gender} onChange={(e) => setBasic((p) => ({ ...p, gender: e.target.value }))}>
                    {GENDER_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-dateOfBirth">Date of Birth <span className="required">*</span></label>
                  <input id="edit-dateOfBirth" type="text" placeholder="dd/mm/yyyy" value={basic.dateOfBirth} onChange={(e) => setBasic((p) => ({ ...p, dateOfBirth: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-bloodGroup">Blood Group/type</label>
                  <select id="edit-bloodGroup" value={basic.bloodGroup} onChange={(e) => setBasic((p) => ({ ...p, bloodGroup: e.target.value }))}>
                    {BLOOD_GROUP_OPTIONS.map((o) => (
                      <option key={o || 'blank'} value={o}>{o || 'Select'}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-allergies">Allergies</label>
                  <input id="edit-allergies" type="text" value={basic.allergies} onChange={(e) => setBasic((p) => ({ ...p, allergies: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-address">Address</label>
                  <input id="edit-address" type="text" value={basic.address} onChange={(e) => setBasic((p) => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-contact">Contact</label>
                  <input id="edit-contact" type="text" value={basic.contact} onChange={(e) => setBasic((p) => ({ ...p, contact: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-email">Email</label>
                  <input id="edit-email" type="email" placeholder="Student Email" value={basic.email} onChange={(e) => setBasic((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-national">National</label>
                  <select id="edit-national" value={basic.national} onChange={(e) => setBasic((p) => ({ ...p, national: e.target.value }))}>
                    <option value="Ghanaian">Ghanaian</option>
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-countryOfResidence">Country of Residence</label>
                  <input id="edit-countryOfResidence" type="text" value={basic.countryOfResidence} onChange={(e) => setBasic((p) => ({ ...p, countryOfResidence: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-homeTown">Home Town</label>
                  <input id="edit-homeTown" type="text" value={basic.homeTown} onChange={(e) => setBasic((p) => ({ ...p, homeTown: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-currentCity">Current City</label>
                  <input id="edit-currentCity" type="text" value={basic.currentCity} onChange={(e) => setBasic((p) => ({ ...p, currentCity: e.target.value }))} />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-religion">Religion</label>
                  <select id="edit-religion" value={basic.religion} onChange={(e) => setBasic((p) => ({ ...p, religion: e.target.value }))}>
                    {RELIGION_OPTIONS.map((o) => (
                      <option key={o || 'blank'} value={o}>{o || 'Select'}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-feeScholarship">Fee/Scholarship</label>
                  <select id="edit-feeScholarship" value={basic.feeScholarship} onChange={(e) => setBasic((p) => ({ ...p, feeScholarship: e.target.value }))}>
                    {FEE_OPTIONS.map((o) => (
                      <option key={o || 'blank'} value={o}>{o || 'Select'}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field edit-student-field--photo">
                  <label htmlFor="edit-photo">Photo</label>
                  <div className="edit-student-photo-row">
                    <input id="edit-photo" type="file" accept="image/*" aria-label="Choose photo file" onChange={(e) => setBasic((p) => ({ ...p, photo: e.target.files?.[0] ?? null }))} />
                    {photoPreviewUrl ? (
                      <div className="edit-student-photo-preview" aria-hidden>
                        <img src={photoPreviewUrl} alt="Preview" />
                      </div>
                    ) : (
                      <div className="edit-student-photo-placeholder" aria-hidden>
                        <PersonIcon />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'guardian' && (
            <section className="edit-student-section" aria-labelledby="edit-guardian-heading">
              <h2 id="edit-guardian-heading" className="edit-student-section-title">Parents/Guardian Info</h2>
              <div className="edit-student-fields edit-student-fields--two-col">
                <div className="edit-student-col">
                  <div className="edit-student-field">
                    <label htmlFor="edit-fatherName">Father</label>
                    <input
                      id="edit-fatherName"
                      type="text"
                      placeholder="Father's Name *"
                      value={guardian.fatherName}
                      onChange={(e) => setGuardian((p) => ({ ...p, fatherName: e.target.value }))}
                    />
                  </div>
                  <div className="edit-student-field">
                    <label htmlFor="edit-parentsAddress">Address</label>
                    <input
                      id="edit-parentsAddress"
                      type="text"
                      placeholder="Parents' Address *"
                      value={guardian.parentsAddress}
                      onChange={(e) => setGuardian((p) => ({ ...p, parentsAddress: e.target.value }))}
                    />
                  </div>
                  <div className="edit-student-field">
                    <label htmlFor="edit-fatherContact">Father&apos;s Contact</label>
                    <input
                      id="edit-fatherContact"
                      type="text"
                      placeholder="Father's Contact *"
                      value={guardian.fatherContact}
                      onChange={(e) => setGuardian((p) => ({ ...p, fatherContact: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="edit-student-col">
                  <div className="edit-student-field">
                    <label htmlFor="edit-motherName">Mother</label>
                    <input
                      id="edit-motherName"
                      type="text"
                      placeholder="Mother's Name *"
                      value={guardian.motherName}
                      onChange={(e) => setGuardian((p) => ({ ...p, motherName: e.target.value }))}
                    />
                  </div>
                  <div className="edit-student-field">
                    <label htmlFor="edit-parentsEmail">Email</label>
                    <input
                      id="edit-parentsEmail"
                      type="email"
                      placeholder="Parents' Email *"
                      value={guardian.parentsEmail}
                      onChange={(e) => setGuardian((p) => ({ ...p, parentsEmail: e.target.value }))}
                    />
                  </div>
                  <div className="edit-student-field">
                    <label htmlFor="edit-motherContact">Mother&apos;s Contact</label>
                    <input
                      id="edit-motherContact"
                      type="text"
                      placeholder="Mother's Contact *"
                      value={guardian.motherContact}
                      onChange={(e) => setGuardian((p) => ({ ...p, motherContact: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'admin' && (
            <section className="edit-student-section" aria-labelledby="edit-admin-heading">
              <h2 id="edit-admin-heading" className="edit-student-section-title">Admin Info</h2>
              <div className="edit-student-fields edit-student-fields--grid edit-student-fields--grid-three">
                <div className="edit-student-field">
                  <label htmlFor="edit-entryClass">Entry Class</label>
                  <select
                    id="edit-entryClass"
                    value={admin.entryClass}
                    onChange={(e) => setAdmin((p) => ({ ...p, entryClass: e.target.value }))}
                  >
                    <option value="">Select class group</option>
                    {ENTRY_CLASS_OPTIONS.filter(Boolean).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-currentClass">Current Class</label>
                  <select
                    id="edit-currentClass"
                    value={admin.currentClass}
                    onChange={(e) => setAdmin((p) => ({ ...p, currentClass: e.target.value }))}
                  >
                    <option value="">Select class group</option>
                    {ENTRY_CLASS_OPTIONS.filter(Boolean).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-programCourse">Program/Course</label>
                  <input
                    id="edit-programCourse"
                    type="text"
                    value={admin.programCourse}
                    onChange={(e) => setAdmin((p) => ({ ...p, programCourse: e.target.value }))}
                  />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-affiliateHouse">Affiliate House/Section <span className="required">*</span></label>
                  <select
                    id="edit-affiliateHouse"
                    value={admin.affiliateHouse}
                    onChange={(e) => setAdmin((p) => ({ ...p, affiliateHouse: e.target.value }))}
                  >
                    <option value="">Affiliate House/Section *</option>
                    {AFFILIATE_HOUSE_OPTIONS.filter(Boolean).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-adminDate">Admission Date <span className="required">*</span></label>
                  <input
                    id="edit-adminDate"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={admin.adminDate}
                    onChange={(e) => setAdmin((p) => ({ ...p, adminDate: e.target.value }))}
                    title="Day/month/year (e.g. 26/02/2025)"
                  />
                </div>
                <div className="edit-student-field">
                  <label htmlFor="edit-studentStatus">Student Status <span className="required">*</span></label>
                  <select
                    id="edit-studentStatus"
                    value={admin.studentStatus}
                    onChange={(e) => setAdmin((p) => ({ ...p, studentStatus: e.target.value }))}
                  >
                    <option value="">Student Status *</option>
                    {STUDENT_STATUS_OPTIONS.filter(Boolean).map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="edit-student-actions">
          <button type="button" className="edit-student-btn edit-student-btn--clear" onClick={clearAll}>
            <BroomIcon /> Clear All
          </button>
          <button type="button" className="edit-student-btn edit-student-btn--save" onClick={handleSave}>
            <SaveIcon /> Save
          </button>
        </div>
      </div>
    </div>
  )
}

function PersonIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  )
}

function BroomIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83M19.07 4.93l-2.83 2.83M7.76 16.24l-2.83 2.83" />
      <path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  )
}
