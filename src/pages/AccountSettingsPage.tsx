import { useState, useMemo, useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import { useRegisteredStudents } from '@/contexts/RegisteredStudentsContext'
import { useStudentAccountOverrides, mergeProfileWithOverrides } from '@/contexts/StudentAccountOverridesContext'
import { getStudentProfile, studentRowToProfile } from '@/data/adminMock'
import './AccountSettingsPage.css'

export default function AccountSettingsPage() {
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
  const { showFeedback } = useFeedback()
  const { registeredStudents } = useRegisteredStudents()
  const { getProfileOverride, setProfileOverride, getPasswordOverride, setPasswordOverride } =
    useStudentAccountOverrides()

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

  const [activeSection, setActiveSection] = useState<'profile' | 'password'>('profile')

  const [profileForm, setProfileForm] = useState<{
    firstName: string
    surname: string
    otherNames: string
    phone: string
    email: string
    address: string
    currentClass: string
  } | null>(null)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        firstName: profile.basic.firstName,
        surname: profile.basic.surname,
        otherNames: profile.basic.otherNames,
        phone: profile.contact.phone,
        email: profile.contact.email,
        address: profile.contact.address,
        currentClass: profile.currentClass,
      })
    } else {
      setProfileForm(null)
    }
  }, [profile])

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  if (!studentId || !profile) {
    return (
      <div className="account-settings-page">
        <p className="account-settings-empty">Student not found.</p>
        <Link to={listBackTo}>Back to Students List</Link>
      </div>
    )
  }

  const fullName = [profile.basic.surname, profile.basic.firstName, profile.basic.otherNames]
    .filter(Boolean)
    .join(' ')

  const handleProfileChange = (field: keyof NonNullable<typeof profileForm>, value: string) => {
    setProfileForm((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!profileForm) return
    const newFullName = [profileForm.surname, profileForm.firstName, profileForm.otherNames]
      .filter(Boolean)
      .join(' ')
    setProfileOverride(studentId, {
      fullName: newFullName || profile.fullName,
      basic: {
        firstName: profileForm.firstName,
        surname: profileForm.surname,
        otherNames: profileForm.otherNames,
      },
      contact: {
        phone: profileForm.phone,
        email: profileForm.email,
        address: profileForm.address,
      },
      currentClass: profileForm.currentClass || profile.currentClass,
    })
    showFeedback('Profile updated successfully.', 'success')
  }

  const currentPassword = passwordOverride !== undefined ? passwordOverride : profile.password ?? ''

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    const { currentPassword: cur, newPassword: newPwd, confirmPassword: conf } = passwordForm
    if (cur !== currentPassword) {
      showFeedback('Current password is incorrect.', 'error')
      return
    }
    if (newPwd.length < 6) {
      showFeedback('New password must be at least 6 characters.', 'error')
      return
    }
    if (newPwd !== conf) {
      showFeedback('New password and confirmation do not match.', 'error')
      return
    }
    setPasswordOverride(studentId, newPwd)
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    showFeedback('Password changed successfully.', 'success')
  }

  return (
    <div className="account-settings-page">
      <nav className="account-settings-breadcrumb" aria-label="Breadcrumb">
        <Link to="/admin">Home</Link>
        {' / '}
        <Link to={listBackTo}>Students List</Link>
        {' / '}
        <Link to={`/admin/students/profile/${studentId}`}>{fullName || profile.fullName}</Link>
        {' / Account Settings'}
      </nav>
      <GoBack to={`/admin/students/profile/${studentId}`} label="Go back to Profile" className="account-settings-goback" />

      <h1 className="account-settings-title">Account Settings - {fullName || profile.fullName}</h1>

      <div className="account-settings-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'profile'}
          className={`account-settings-tab ${activeSection === 'profile' ? 'account-settings-tab--active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          Change Profile
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeSection === 'password'}
          className={`account-settings-tab ${activeSection === 'password' ? 'account-settings-tab--active' : ''}`}
          onClick={() => setActiveSection('password')}
        >
          Change Password
        </button>
      </div>

      <div className="account-settings-content">
        {activeSection === 'profile' && (
          <section className="account-settings-section" aria-labelledby="profile-heading">
            <h2 id="profile-heading" className="account-settings-section-title">
              Change Profile
            </h2>
            {!profileForm ? (
              <p className="account-settings-loading">Loading…</p>
            ) : (
            <form onSubmit={handleSaveProfile} className="account-settings-form">
              <div className="account-settings-field-grid">
                <label className="account-settings-field">
                  <span className="account-settings-label">First Name</span>
                  <input
                    type="text"
                    className="account-settings-input"
                    value={profileForm.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  />
                </label>
                <label className="account-settings-field">
                  <span className="account-settings-label">Surname</span>
                  <input
                    type="text"
                    className="account-settings-input"
                    value={profileForm.surname}
                    onChange={(e) => handleProfileChange('surname', e.target.value)}
                  />
                </label>
                <label className="account-settings-field account-settings-field--full">
                  <span className="account-settings-label">Other Names</span>
                  <input
                    type="text"
                    className="account-settings-input"
                    value={profileForm.otherNames}
                    onChange={(e) => handleProfileChange('otherNames', e.target.value)}
                  />
                </label>
                <label className="account-settings-field">
                  <span className="account-settings-label">Phone</span>
                  <input
                    type="text"
                    className="account-settings-input"
                    value={profileForm.phone}
                    onChange={(e) => handleProfileChange('phone', e.target.value)}
                  />
                </label>
                <label className="account-settings-field">
                  <span className="account-settings-label">Email</span>
                  <input
                    type="email"
                    className="account-settings-input"
                    value={profileForm.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                  />
                </label>
                <label className="account-settings-field account-settings-field--full">
                  <span className="account-settings-label">Address</span>
                  <input
                    type="text"
                    className="account-settings-input"
                    value={profileForm.address}
                    onChange={(e) => handleProfileChange('address', e.target.value)}
                  />
                </label>
                <label className="account-settings-field">
                  <span className="account-settings-label">Current Class</span>
                  <input
                    type="text"
                    className="account-settings-input"
                    value={profileForm.currentClass}
                    onChange={(e) => handleProfileChange('currentClass', e.target.value)}
                  />
                </label>
              </div>
              <div className="account-settings-actions">
                <button type="submit" className="account-settings-btn account-settings-btn--primary">
                  Save Profile
                </button>
                <Link to={`/admin/students/profile/${studentId}`} className="account-settings-btn account-settings-btn--secondary">
                  Cancel
                </Link>
              </div>
            </form>
            )}
          </section>
        )}

        {activeSection === 'password' && (
          <section className="account-settings-section" aria-labelledby="password-heading">
            <h2 id="password-heading" className="account-settings-section-title">
              Change Password
            </h2>
            <form onSubmit={handleSavePassword} className="account-settings-form">
              <div className="account-settings-password-fields">
                <label className="account-settings-field">
                  <span className="account-settings-label">Current Password</span>
                  <input
                    type="password"
                    className="account-settings-input"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                  />
                </label>
                <label className="account-settings-field">
                  <span className="account-settings-label">New Password</span>
                  <input
                    type="password"
                    className="account-settings-input"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </label>
                <label className="account-settings-field">
                  <span className="account-settings-label">Confirm New Password</span>
                  <input
                    type="password"
                    className="account-settings-input"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </label>
              </div>
              <div className="account-settings-actions">
                <button type="submit" className="account-settings-btn account-settings-btn--primary">
                  Change Password
                </button>
                <Link to={`/admin/students/profile/${studentId}`} className="account-settings-btn account-settings-btn--secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}
