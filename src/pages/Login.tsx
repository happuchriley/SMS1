import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import './Login.css'

type UserRole = '' | 'administrator' | 'teacher_staff' | 'student_parent'

const ROLE_ROUTES: Record<Exclude<UserRole, ''>, string> = {
  administrator: '/admin',
  teacher_staff: '/teacher',
  student_parent: '/student',
}

const ROLE_LABELS: Record<Exclude<UserRole, ''>, string> = {
  administrator: 'Administrator',
  teacher_staff: 'Teacher/Staff',
  student_parent: 'Student/Parent',
}

export default function Login() {
  const navigate = useNavigate()
  const [role, setRole] = useState<UserRole>('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const roleLabel = role ? ROLE_LABELS[role] : 'Administrator'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!role) return
    const path = ROLE_ROUTES[role]
    const roleDisplayName = ROLE_LABELS[role]
    Swal.fire({
      icon: 'success',
      title: 'Welcome back!',
      text: `You have logged in successfully as ${roleDisplayName}.`,
      confirmButtonText: 'Continue',
      confirmButtonColor: '#2563eb',
    }).then(() => {
      navigate(path)
    })
  }

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="login-left-bg" />
        <div className="login-left-overlay">
          <h1 className="login-system-title">
            Brainhub School
            <br />
            Management System
          </h1>
          <p className="login-school-name">Excelz International School</p>
        </div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <div className="login-card-header">
            <span className="login-role-label">{roleLabel}</span>
            <div className="login-social">
              <a href="#" aria-label="Facebook">f</a>
              <a href="#" aria-label="Twitter">t</a>
            </div>
          </div>
          <div className="login-logo">
            <span className="login-logo-inner">EIS</span>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="login-role" className="login-select-label">{roleLabel}</label>
            <select
              id="login-role"
              className="login-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              required
              aria-label="Select user role"
            >
              <option value="">Select user here</option>
              <option value="administrator">Administrator</option>
              <option value="teacher_staff">Teacher/Staff</option>
              <option value="student_parent">Student/Parent</option>
            </select>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden>👤</span>
              <input
                type="text"
                className="login-input"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="login-input-wrap">
              <span className="login-input-icon" aria-hidden>🔒</span>
              <input
                type="password"
                className="login-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <div className="login-options">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>
              <a href="#" className="login-forgot">Forgot Password?</a>
            </div>
            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
