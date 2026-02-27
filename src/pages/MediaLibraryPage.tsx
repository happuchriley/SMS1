import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import './MediaLibraryPage.css'

type MediaTabId = 'video' | 'audio'

const MEDIA_TABS = [
  { id: 'video' as MediaTabId, label: 'Video Tutorials', icon: VideoIcon },
  { id: 'audio' as MediaTabId, label: 'Audio Tutorials', icon: AudioIcon },
] as const

export default function MediaLibraryPage() {
  const [searchParams] = useSearchParams()
  const className = searchParams.get('class') || 'Basic 2'

  const [activeTab, setActiveTab] = useState<MediaTabId>('video')

  return (
    <div className="media-library-page">
      <header className="media-library-header">
        <div className="media-library-heading">
          <h1 className="media-library-title">Media Library - {className}</h1>
          <nav className="media-library-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin">Staff List</Link>
          </nav>
          <GoBack to="/admin" label="Go back to Dashboard" className="media-library-goback" />
        </div>
      </header>

      <div className="media-library-tabs" role="tablist">
        {MEDIA_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id ? 'true' : 'false'}
              className={`media-library-tab ${activeTab === tab.id ? 'media-library-tab--active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'video' && (
        <p className="media-library-category-label">Lesson Videos</p>
      )}
      {activeTab === 'audio' && (
        <p className="media-library-category-label">Lesson Audio</p>
      )}

      <div className="media-library-content" aria-label={activeTab === 'video' ? 'Video tutorials list' : 'Audio tutorials list'}>
        <p className="media-library-empty">No media items to display.</p>
      </div>
    </div>
  )
}

function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m10 9 6 4-6 4V9Z" />
    </svg>
  )
}

function AudioIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}
