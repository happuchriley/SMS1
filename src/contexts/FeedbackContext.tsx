import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import './FeedbackContext.css'

export type FeedbackType = 'success' | 'info' | 'error'

type FeedbackState = {
  message: string
  type: FeedbackType
} | null

type FeedbackContextValue = {
  showFeedback: (message: string, type?: FeedbackType) => void
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [feedback, setFeedback] = useState<FeedbackState>(null)

  const showFeedback = useCallback((message: string, type: FeedbackType = 'success') => {
    setFeedback({ message, type })
  }, [])

  const dismiss = useCallback(() => setFeedback(null), [])

  useEffect(() => {
    if (!feedback) return
    const t = setTimeout(dismiss, 4000)
    return () => clearTimeout(t)
  }, [feedback, dismiss])

  return (
    <FeedbackContext.Provider value={{ showFeedback }}>
      {children}
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          className={`feedback-toast feedback-toast--${feedback.type}`}
        >
          <span className="feedback-toast-message">{feedback.message}</span>
          <button
            type="button"
            className="feedback-toast-dismiss"
            onClick={dismiss}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      )}
    </FeedbackContext.Provider>
  )
}

export function useFeedback(): FeedbackContextValue {
  const ctx = useContext(FeedbackContext)
  if (!ctx) {
    return {
      showFeedback: (message: string) => {
        console.info('[Feedback]', message)
      },
    }
  }
  return ctx
}
