import { Link, useNavigate } from 'react-router-dom'
import './GoBack.css'

type GoBackProps = {
  /** Optional fallback URL when history is empty or when you want a specific destination */
  to?: string
  /** Button/link label */
  label?: string
  /** Optional class name for the wrapper */
  className?: string
}

export function GoBack({ to, label = 'Go back', className = '' }: GoBackProps) {
  const navigate = useNavigate()

  const handleClick = (e: React.MouseEvent) => {
    if (to) return
    e.preventDefault()
    navigate(-1)
  }

  if (to) {
    return (
      <Link to={to} className={`go-back go-back--link ${className}`.trim()} aria-label={label}>
        <span className="go-back-icon" aria-hidden>←</span>
        {label}
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`go-back go-back--button ${className}`.trim()}
      aria-label={label}
    >
      <span className="go-back-icon" aria-hidden>←</span>
      {label}
    </button>
  )
}
