import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useRegisteredStudents } from '@/contexts/RegisteredStudentsContext'
import './AddNewStudentPage.css'

type TabId = 'basic' | 'guardian' | 'admin'

function generatePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

function formatDateForDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const day = d.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  return `${String(day).padStart(2, '0')} ${month} ${year}`
}

export default function AddNewStudentPage() {
  const { showFeedback } = useFeedback()
  const { addRegisteredStudent } = useRegisteredStudents()
  const [activeTab, setActiveTab] = useState<TabId>('basic')
  const [savedPassword, setSavedPassword] = useState<string | null>(null)

  const [basic, setBasic] = useState({
    studentId: 'Excelz Int. School0',
    existingId: '',
    firstName: '',
    surname: '',
    otherNames: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    allergies: '',
    address: '',
    contact: '',
    email: '',
    national: 'Ghana',
    countryOfResidence: 'Ghana',
    homeTown: '',
    currentCity: '',
    religion: '',
    feeScholarship: '',
    photo: null as File | null,
  })

  const [guardian, setGuardian] = useState({
    fatherName: '',
    parentsAddress: '',
    fatherContact: '',
    motherName: '',
    parentsEmail: '',
    motherContact: '',
  })

  const [admin, setAdmin] = useState({
    entryClass: '',
    currentClass: '',
    programCourse: 'General',
    affiliateHouse: '',
    admissionDate: '',
    studentStatus: '',
  })

  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const photoPreviewUrlRef = useRef<string | null>(null)

  useEffect(() => {
    if (basic.photo) {
      if (photoPreviewUrlRef.current) URL.revokeObjectURL(photoPreviewUrlRef.current)
      const url = URL.createObjectURL(basic.photo)
      photoPreviewUrlRef.current = url
      setPhotoPreviewUrl(url)
    } else {
      if (photoPreviewUrlRef.current) {
        URL.revokeObjectURL(photoPreviewUrlRef.current)
        photoPreviewUrlRef.current = null
      }
      setPhotoPreviewUrl(null)
    }
    return () => {
      if (photoPreviewUrlRef.current) {
        URL.revokeObjectURL(photoPreviewUrlRef.current)
        photoPreviewUrlRef.current = null
      }
    }
  }, [basic.photo])

  const clearAll = () => {
    setBasic({
      studentId: 'Excelz Int. School0',
      existingId: '',
      firstName: '',
      surname: '',
      otherNames: '',
      gender: '',
      dateOfBirth: '',
      bloodGroup: '',
      allergies: '',
      address: '',
      contact: '',
      email: '',
      national: 'Ghana',
      countryOfResidence: 'Ghana',
      homeTown: '',
      currentCity: '',
      religion: '',
      feeScholarship: '',
      photo: null,
    })
    setGuardian({
      fatherName: '',
      parentsAddress: '',
      fatherContact: '',
      motherName: '',
      parentsEmail: '',
      motherContact: '',
    })
    setAdmin({
      entryClass: '',
      currentClass: '',
      programCourse: 'General',
      affiliateHouse: '',
      admissionDate: '',
      studentStatus: '',
    })
    setSavedPassword(null)
    showFeedback('Form cleared.')
  }

  const handleSave = () => {
    const password = generatePassword()
    setSavedPassword(password)
    const studentName = [basic.surname, basic.firstName, basic.otherNames].filter(Boolean).join(' ') || 'New Student'
    const studentId = basic.existingId?.trim() || basic.studentId?.trim() || `REG${Date.now().toString().slice(-6)}`
    addRegisteredStudent({
      studentId,
      password,
      studentName,
      gender: basic.gender || '—',
      dateOfBirth: formatDateForDisplay(basic.dateOfBirth) || '—',
      contact: basic.contact || '—',
      national: basic.national || 'Ghana',
      entryClass: admin.entryClass || '—',
      currentClass: admin.currentClass || '—',
      status: (admin.studentStatus as 'Active' | 'Left') || 'Active',
      adminDate: formatDateForDisplay(admin.admissionDate) || formatDateForDisplay(new Date().toISOString().slice(0, 10)),
    })
    showFeedback('Student registered successfully.')
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: 'basic', label: 'Basic Info' },
    { id: 'guardian', label: 'Guardian Info' },
    { id: 'admin', label: 'Admin Info' },
  ]

  return (
    <div className="add-student-page">
      <header className="add-student-header">
        <div className="add-student-heading">
          <h1 className="add-student-title">Add New Student</h1>
          <nav className="add-student-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin/students/list">Student List</Link>
            {' / '}
            Add New Student
          </nav>
          <GoBack to="/admin/students/list" label="Go back to Students List" className="add-student-goback" />
        </div>
        <Link to="/admin/students/list" className="add-student-list-link">
          <PeopleIcon /> Students List
        </Link>
      </header>

      <div className="add-student-card">
        <div className="add-student-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id ? 'true' : 'false'}
              className={`add-student-tab ${activeTab === tab.id ? 'add-student-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="add-student-tabpanel">
          {activeTab === 'basic' && (
            <section className="add-student-section" aria-labelledby="basic-heading">
              <h2 id="basic-heading" className="add-student-section-title">BASIC INFO</h2>
              <div className="add-student-fields add-student-fields--grid">
                <div className="add-student-field">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    id="studentId"
                    type="text"
                    value={basic.studentId}
                    onChange={(e) => setBasic((p) => ({ ...p, studentId: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="existingId">Existing ID</label>
                  <input
                    id="existingId"
                    type="text"
                    placeholder="Existing Student ID"
                    value={basic.existingId}
                    onChange={(e) => setBasic((p) => ({ ...p, existingId: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="firstName">First Name <span className="required">*</span></label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="First name *"
                    value={basic.firstName}
                    onChange={(e) => setBasic((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="surname">Surname <span className="required">*</span></label>
                  <input
                    id="surname"
                    type="text"
                    placeholder="Surname *"
                    value={basic.surname}
                    onChange={(e) => setBasic((p) => ({ ...p, surname: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="otherNames">Other Name(s)</label>
                  <input
                    id="otherNames"
                    type="text"
                    placeholder="Other Name(s)"
                    value={basic.otherNames}
                    onChange={(e) => setBasic((p) => ({ ...p, otherNames: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="gender">Gender <span className="required">*</span></label>
                  <select
                    id="gender"
                    value={basic.gender}
                    onChange={(e) => setBasic((p) => ({ ...p, gender: e.target.value }))}
                  >
                    <option value="">Gender *</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="dateOfBirth">Date of Birth <span className="required">*</span></label>
                  <input
                    id="dateOfBirth"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={basic.dateOfBirth}
                    onChange={(e) => setBasic((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    title="Day/month/year (e.g. 26/02/2025)"
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="bloodGroup">Blood Group/type</label>
                  <select
                    id="bloodGroup"
                    value={basic.bloodGroup}
                    onChange={(e) => setBasic((p) => ({ ...p, bloodGroup: e.target.value }))}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="allergies">Allergies</label>
                  <input
                    id="allergies"
                    type="text"
                    placeholder="Allergies if any"
                    value={basic.allergies}
                    onChange={(e) => setBasic((p) => ({ ...p, allergies: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="address">Address</label>
                  <input
                    id="address"
                    type="text"
                    placeholder="Student Address"
                    value={basic.address}
                    onChange={(e) => setBasic((p) => ({ ...p, address: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="contact">Contact <span className="required">*</span></label>
                  <input
                    id="contact"
                    type="text"
                    placeholder="Student Contact"
                    value={basic.contact}
                    onChange={(e) => setBasic((p) => ({ ...p, contact: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="Student Email"
                    value={basic.email}
                    onChange={(e) => setBasic((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="national">National</label>
                  <select
                    id="national"
                    value={basic.national}
                    onChange={(e) => setBasic((p) => ({ ...p, national: e.target.value }))}
                  >
                    <option value="Ghana">Ghana</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="countryOfResidence">Country of Residence</label>
                  <input
                    id="countryOfResidence"
                    type="text"
                    value={basic.countryOfResidence}
                    onChange={(e) => setBasic((p) => ({ ...p, countryOfResidence: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="homeTown">Home town <span className="required">*</span></label>
                  <input
                    id="homeTown"
                    type="text"
                    placeholder="Home Town *"
                    value={basic.homeTown}
                    onChange={(e) => setBasic((p) => ({ ...p, homeTown: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="currentCity">Current City <span className="required">*</span></label>
                  <input
                    id="currentCity"
                    type="text"
                    placeholder="Current City *"
                    value={basic.currentCity}
                    onChange={(e) => setBasic((p) => ({ ...p, currentCity: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="religion">Religion</label>
                  <select
                    id="religion"
                    value={basic.religion}
                    onChange={(e) => setBasic((p) => ({ ...p, religion: e.target.value }))}
                  >
                    <option value="">Religion</option>
                    <option value="Christianity">Christianity</option>
                    <option value="Islam">Islam</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="feeScholarship">Fee/Scholarship</label>
                  <select
                    id="feeScholarship"
                    value={basic.feeScholarship}
                    onChange={(e) => setBasic((p) => ({ ...p, feeScholarship: e.target.value }))}
                  >
                    <option value="">Select fee type</option>
                    <option value="Full Fee">Full Fee</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                </div>
                <div className="add-student-field add-student-field--photo">
                  <label htmlFor="photo">Photo</label>
                  <div className="add-student-photo-row">
                    <input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBasic((p) => ({ ...p, photo: e.target.files?.[0] ?? null }))}
                    />
                    {photoPreviewUrl && (
                      <div className="add-student-photo-preview" aria-hidden>
                        <img src={photoPreviewUrl} alt="Selected student photo preview" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'guardian' && (
            <section className="add-student-section" aria-labelledby="guardian-heading">
              <h2 id="guardian-heading" className="add-student-section-title">Parents/Guardian Info</h2>
              <div className="add-student-fields add-student-fields--two-col">
                <div className="add-student-col">
                  <div className="add-student-field">
                    <label htmlFor="fatherName">Father</label>
                    <input
                      id="fatherName"
                      type="text"
                      placeholder="Father's Name *"
                      value={guardian.fatherName}
                      onChange={(e) => setGuardian((p) => ({ ...p, fatherName: e.target.value }))}
                    />
                  </div>
                  <div className="add-student-field">
                    <label htmlFor="parentsAddress">Address</label>
                    <input
                      id="parentsAddress"
                      type="text"
                      placeholder="Parents' Address *"
                      value={guardian.parentsAddress}
                      onChange={(e) => setGuardian((p) => ({ ...p, parentsAddress: e.target.value }))}
                    />
                  </div>
                  <div className="add-student-field">
                    <label htmlFor="fatherContact">Father's Contact</label>
                    <input
                      id="fatherContact"
                      type="text"
                      placeholder="Father's Contact *"
                      value={guardian.fatherContact}
                      onChange={(e) => setGuardian((p) => ({ ...p, fatherContact: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="add-student-col">
                  <div className="add-student-field">
                    <label htmlFor="motherName">Mother</label>
                    <input
                      id="motherName"
                      type="text"
                      placeholder="Mother's Name *"
                      value={guardian.motherName}
                      onChange={(e) => setGuardian((p) => ({ ...p, motherName: e.target.value }))}
                    />
                  </div>
                  <div className="add-student-field">
                    <label htmlFor="parentsEmail">Email</label>
                    <input
                      id="parentsEmail"
                      type="email"
                      placeholder="Parents' Email *"
                      value={guardian.parentsEmail}
                      onChange={(e) => setGuardian((p) => ({ ...p, parentsEmail: e.target.value }))}
                    />
                  </div>
                  <div className="add-student-field">
                    <label htmlFor="motherContact">Mother's Contact</label>
                    <input
                      id="motherContact"
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
            <section className="add-student-section" aria-labelledby="admin-heading">
              <h2 id="admin-heading" className="add-student-section-title">Admin Info</h2>
              <div className="add-student-fields add-student-fields--grid">
                <div className="add-student-field">
                  <label htmlFor="entryClass">Entry Class</label>
                  <select
                    id="entryClass"
                    value={admin.entryClass}
                    onChange={(e) => setAdmin((p) => ({ ...p, entryClass: e.target.value }))}
                  >
                    <option value="">Select class group</option>
                    <option value="Creche">Creche</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="KG 1">KG 1</option>
                    <option value="Basic 1">Basic 1</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="currentClass">Current Class</label>
                  <select
                    id="currentClass"
                    value={admin.currentClass}
                    onChange={(e) => setAdmin((p) => ({ ...p, currentClass: e.target.value }))}
                  >
                    <option value="">Select class group</option>
                    <option value="Creche">Creche</option>
                    <option value="Nursery 1">Nursery 1</option>
                    <option value="KG 1">KG 1</option>
                    <option value="Basic 1">Basic 1</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="programCourse">Program/Course</label>
                  <input
                    id="programCourse"
                    type="text"
                    value={admin.programCourse}
                    onChange={(e) => setAdmin((p) => ({ ...p, programCourse: e.target.value }))}
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="affiliateHouse">Affiliate House/Section <span className="required">*</span></label>
                  <select
                    id="affiliateHouse"
                    value={admin.affiliateHouse}
                    onChange={(e) => setAdmin((p) => ({ ...p, affiliateHouse: e.target.value }))}
                  >
                    <option value="">Affiliate House/Section *</option>
                    <option value="House A">House A</option>
                    <option value="House B">House B</option>
                  </select>
                </div>
                <div className="add-student-field">
                  <label htmlFor="admissionDate">Admission Date <span className="required">*</span></label>
                  <input
                    id="admissionDate"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={admin.admissionDate}
                    onChange={(e) => setAdmin((p) => ({ ...p, admissionDate: e.target.value }))}
                    title="Day/month/year (e.g. 26/02/2025)"
                  />
                </div>
                <div className="add-student-field">
                  <label htmlFor="studentStatus">Student Status <span className="required">*</span></label>
                  <select
                    id="studentStatus"
                    value={admin.studentStatus}
                    onChange={(e) => setAdmin((p) => ({ ...p, studentStatus: e.target.value }))}
                  >
                    <option value="">Student Status *</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              </section>
          )}

          {savedPassword && (
            <div className="add-student-success" role="alert">
              <p><strong>Student registered successfully.</strong></p>
              <p>An automatic password has been generated for this student. Please share it securely:</p>
              <p className="add-student-generated-password">{savedPassword}</p>
              <p className="add-student-success-note">The student should change this password on first login.</p>
            </div>
          )}
        </div>

        <div className="add-student-actions">
          <div className="add-student-actions-left">
            <Link to="/admin/students" className="add-student-btn add-student-btn--cancel">
              <CloseIcon /> Cancel
            </Link>
            <button type="button" className="add-student-btn add-student-btn--clear" onClick={clearAll}>
              <ClearIcon /> Clear form
            </button>
          </div>
          {activeTab === 'admin' && (
            <button type="button" className="add-student-btn add-student-btn--save" onClick={handleSave}>
              <SaveIcon /> Save & register
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m9 12 2 2 4-4" />
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
