import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { GoBack } from '@/components/GoBack'
import { useFeedback } from '@/contexts/FeedbackContext'
import './TLMUploadPage.css'

type UploadTabId = 'assignment' | 'syllabus' | 'lesson-notes' | 'video' | 'audio'

const UPLOAD_TABS = [
  { id: 'assignment' as UploadTabId, label: 'Assignment' },
  { id: 'syllabus' as UploadTabId, label: 'Syllabus' },
  { id: 'lesson-notes' as UploadTabId, label: 'Lesson notes' },
  { id: 'video' as UploadTabId, label: 'Video' },
  { id: 'audio' as UploadTabId, label: 'Audio' },
] as const

export default function TLMUploadPage() {
  const [searchParams] = useSearchParams()
  const { showFeedback } = useFeedback()
  const className = searchParams.get('class') || 'Basic 2'

  const [activeTab, setActiveTab] = useState<UploadTabId>('assignment')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [submissionDate, setSubmissionDate] = useState('')
  const [status, setStatus] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [mainMessage, setMainMessage] = useState('')

  const [syllabusSubject, setSyllabusSubject] = useState('')
  const [syllabusTitle, setSyllabusTitle] = useState('')
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null)
  const [syllabusMessage, setSyllabusMessage] = useState('')

  const [lessonNotesSubject, setLessonNotesSubject] = useState('')
  const [lessonNotesTitle, setLessonNotesTitle] = useState('')
  const [lessonNotesFile, setLessonNotesFile] = useState<File | null>(null)
  const [lessonNotesMessage, setLessonNotesMessage] = useState('')

  type VideoRow = { id: number; videoFile: File | null; coverFile: File | null; title: string }
  const [videoSubject, setVideoSubject] = useState('')
  const [videoTopic, setVideoTopic] = useState('')
  const [videoStatus, setVideoStatus] = useState('')
  const [videoMessage, setVideoMessage] = useState('')
  const [videoRows, setVideoRows] = useState<VideoRow[]>([
    { id: 1, videoFile: null, coverFile: null, title: '' },
  ])
  const [videoRowId, setVideoRowId] = useState(2)

  type AudioRow = { id: number; audioFile: File | null; title: string }
  const [audioSubject, setAudioSubject] = useState('')
  const [audioTopic, setAudioTopic] = useState('')
  const [audioStatus, setAudioStatus] = useState('')
  const [audioMessage, setAudioMessage] = useState('')
  const [audioRows, setAudioRows] = useState<AudioRow[]>([
    { id: 1, audioFile: null, title: '' },
  ])
  const [audioRowId, setAudioRowId] = useState(2)

  const wordCount = mainMessage.trim() ? mainMessage.trim().split(/\s+/).length : 0
  const syllabusWordCount = syllabusMessage.trim() ? syllabusMessage.trim().split(/\s+/).length : 0
  const lessonNotesWordCount = lessonNotesMessage.trim() ? lessonNotesMessage.trim().split(/\s+/).length : 0
  const videoWordCount = videoMessage.trim() ? videoMessage.trim().split(/\s+/).length : 0
  const audioWordCount = audioMessage.trim() ? audioMessage.trim().split(/\s+/).length : 0

  const resetForm = () => {
    setSubject('')
    setTopic('')
    setSubmissionDate('')
    setStatus('')
    setFile(null)
    setMainMessage('')
  }

  const resetSyllabusForm = () => {
    setSyllabusSubject('')
    setSyllabusTitle('')
    setSyllabusFile(null)
    setSyllabusMessage('')
  }

  const resetLessonNotesForm = () => {
    setLessonNotesSubject('')
    setLessonNotesTitle('')
    setLessonNotesFile(null)
    setLessonNotesMessage('')
  }

  const resetVideoForm = () => {
    setVideoSubject('')
    setVideoTopic('')
    setVideoStatus('')
    setVideoMessage('')
    setVideoRows([{ id: 1, videoFile: null, coverFile: null, title: '' }])
    setVideoRowId(2)
  }

  const addVideoRow = () => {
    setVideoRows((prev) => [...prev, { id: videoRowId, videoFile: null, coverFile: null, title: '' }])
    setVideoRowId((id) => id + 1)
    showFeedback('Video row added.')
  }

  const removeVideoRow = (id: number) => {
    setVideoRows((prev) => {
      if (prev.length <= 1) return prev
      queueMicrotask(() => showFeedback('Video row removed.'))
      return prev.filter((r) => r.id !== id)
    })
  }

  const updateVideoRow = (id: number, updates: Partial<VideoRow>) => {
    setVideoRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const resetAudioForm = () => {
    setAudioSubject('')
    setAudioTopic('')
    setAudioStatus('')
    setAudioMessage('')
    setAudioRows([{ id: 1, audioFile: null, title: '' }])
    setAudioRowId(2)
  }

  const addAudioRow = () => {
    setAudioRows((prev) => [...prev, { id: audioRowId, audioFile: null, title: '' }])
    setAudioRowId((id) => id + 1)
    showFeedback('Audio row added.')
  }

  const removeAudioRow = (id: number) => {
    setAudioRows((prev) => {
      if (prev.length <= 1) return prev
      queueMicrotask(() => showFeedback('Audio row removed.'))
      return prev.filter((r) => r.id !== id)
    })
  }

  const updateAudioRow = (id: number, updates: Partial<AudioRow>) => {
    setAudioRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    )
  }

  const handlePost = () => {
    resetForm()
    showFeedback('Assignment posted successfully.')
  }

  const handleSyllabusPost = () => {
    resetSyllabusForm()
    showFeedback('Syllabus posted successfully.')
  }

  const handleLessonNotesPost = () => {
    resetLessonNotesForm()
    showFeedback('Lesson notes posted successfully.')
  }

  const handleVideoPost = () => {
    resetVideoForm()
    showFeedback('Video(s) posted successfully.')
  }

  const handleAudioPost = () => {
    resetAudioForm()
    showFeedback('Audio(s) posted successfully.')
  }

  return (
    <div className="tlm-upload-page">
      <header className="tlm-upload-header">
        <div className="tlm-upload-heading">
          <h1 className="tlm-upload-title">Teaching, Learning Materials - {className}</h1>
          <nav className="tlm-upload-breadcrumb" aria-label="Breadcrumb">
            <Link to="/admin">Home</Link>
            {' / '}
            <Link to="/admin">Staff List</Link>
          </nav>
          <GoBack to="/admin/tlm" label="Go back to TLM" className="tlm-upload-goback" />
        </div>
      </header>

      <div className="tlm-upload-tabs" role="tablist">
        {UPLOAD_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id ? 'true' : 'false'}
            className={`tlm-upload-tab ${activeTab === tab.id ? 'tlm-upload-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <PencilIcon />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="tlm-upload-content">
        {activeTab === 'assignment' && (
          <section className="tlm-upload-form-section" aria-labelledby="create-assignment-heading">
            <h2 id="create-assignment-heading" className="tlm-upload-form-title">
              CREATE ASSIGNMENT
            </h2>
            <p className="tlm-upload-required-notice">
              Fields marked with (*) cannot be blank
            </p>
            <p className="tlm-upload-instruction">
              Provide details of item in the form below
            </p>

            <form className="tlm-upload-form" onSubmit={(e) => { e.preventDefault(); handlePost(); }}>
              <div className="tlm-upload-fields">
                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Subject/Course</span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Subject or course"
                  >
                    <option value="">Select Subject/Course Here</option>
                    <option value="math">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                  </select>
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Topic/Title <span className="tlm-upload-required">*</span></span>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter assignment title/topic here *"
                    className="tlm-upload-input"
                    aria-required
                  />
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Submission Date</span>
                  <input
                    type="date"
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="tlm-upload-input tlm-upload-date"
                    aria-label="Submission date"
                  />
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Assignment Status <span className="tlm-upload-required">*</span></span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-required
                    aria-label="Assignment status"
                  >
                    <option value="">Select assignment status here *</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Upload File/Doc/Notes</span>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="tlm-upload-file"
                    aria-label="Upload file or document"
                  />
                  <span className="tlm-upload-file-label">
                    {file ? file.name : 'No file chosen'}
                  </span>
                </label>
              </div>

              <div className="tlm-upload-editor-wrap">
                <div className="tlm-upload-editor-toolbar" role="toolbar" aria-label="Formatting">
                  <span className="tlm-upload-editor-toolbar-text">File</span>
                  <span className="tlm-upload-editor-toolbar-text">Edit</span>
                  <span className="tlm-upload-editor-toolbar-text">Insert</span>
                  <span className="tlm-upload-editor-toolbar-text">View</span>
                  <span className="tlm-upload-editor-toolbar-text">Format</span>
                  <span className="tlm-upload-editor-toolbar-text">Table</span>
                  <span className="tlm-upload-editor-toolbar-text">Tools</span>
                </div>
                <div className="tlm-upload-editor-body">
                  <textarea
                    value={mainMessage}
                    onChange={(e) => setMainMessage(e.target.value)}
                    placeholder="Enter assignment description or instructions…"
                    className="tlm-upload-textarea"
                    rows={12}
                    aria-label="Main message or description"
                  />
                  <div className="tlm-upload-editor-footer">
                    <span className="tlm-upload-word-count">Words: {wordCount}</span>
                  </div>
                </div>
              </div>

              <div className="tlm-upload-actions">
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-btn--reset"
                  onClick={() => { resetForm(); showFeedback('Form reset.'); }}
                >
                  Reset Form
                </button>
                <button type="submit" className="tlm-upload-btn tlm-upload-btn--post">
                  Post Item
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'syllabus' && (
          <section className="tlm-upload-form-section" aria-labelledby="upload-syllabus-heading">
            <h2 id="upload-syllabus-heading" className="tlm-upload-form-title">
              UPLOAD SYLLABUS
            </h2>
            <p className="tlm-upload-required-notice">
              Fields marked with (*) cannot be blank
            </p>
            <p className="tlm-upload-instruction">
              Provide details of item in the form below
            </p>

            <form
              className="tlm-upload-form"
              onSubmit={(e) => { e.preventDefault(); handleSyllabusPost(); }}
            >
              <div className="tlm-upload-fields">
                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Subject/Course</span>
                  <select
                    value={syllabusSubject}
                    onChange={(e) => setSyllabusSubject(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Subject or course"
                  >
                    <option value="">Select Subject/Course Here</option>
                    <option value="general">General Knowledge</option>
                    <option value="math">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                  </select>
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Name/Title <span className="tlm-upload-required">*</span></span>
                  <input
                    type="text"
                    value={syllabusTitle}
                    onChange={(e) => setSyllabusTitle(e.target.value)}
                    placeholder="Enter assignment title/topic here"
                    className="tlm-upload-input"
                    aria-required
                  />
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Upload File/Doc/Notes</span>
                  <input
                    type="file"
                    onChange={(e) => setSyllabusFile(e.target.files?.[0] ?? null)}
                    className="tlm-upload-file"
                    aria-label="Upload file or document"
                  />
                  <span className="tlm-upload-file-label">
                    {syllabusFile ? syllabusFile.name : 'No file chosen'}
                  </span>
                </label>
              </div>

              <div className="tlm-upload-editor-wrap">
                <div className="tlm-upload-editor-toolbar" role="toolbar" aria-label="Formatting">
                  <span className="tlm-upload-editor-toolbar-text">File</span>
                  <span className="tlm-upload-editor-toolbar-text">Edit</span>
                  <span className="tlm-upload-editor-toolbar-text">Insert</span>
                  <span className="tlm-upload-editor-toolbar-text">View</span>
                  <span className="tlm-upload-editor-toolbar-text">Format</span>
                  <span className="tlm-upload-editor-toolbar-text">Table</span>
                  <span className="tlm-upload-editor-toolbar-text">Tools</span>
                </div>
                <div className="tlm-upload-editor-body">
                  <textarea
                    value={syllabusMessage}
                    onChange={(e) => setSyllabusMessage(e.target.value)}
                    placeholder="Enter main message…"
                    className="tlm-upload-textarea"
                    rows={12}
                    aria-label="Main message"
                  />
                  <div className="tlm-upload-editor-footer">
                    <span className="tlm-upload-word-count">Words: {syllabusWordCount}</span>
                  </div>
                </div>
              </div>

              <div className="tlm-upload-actions">
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-btn--reset"
                  onClick={() => { resetSyllabusForm(); showFeedback('Form reset.'); }}
                >
                  Reset Form
                </button>
                <button type="submit" className="tlm-upload-btn tlm-upload-btn--post">
                  Post Item
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'lesson-notes' && (
          <section className="tlm-upload-form-section" aria-labelledby="upload-lesson-notes-heading">
            <h2 id="upload-lesson-notes-heading" className="tlm-upload-form-title">
              UPLOAD LESSON NOTES
            </h2>
            <p className="tlm-upload-required-notice">
              Fields marked with (*) cannot be blank
            </p>
            <p className="tlm-upload-instruction">
              Provide details of item in the form below
            </p>

            <form
              className="tlm-upload-form"
              onSubmit={(e) => { e.preventDefault(); handleLessonNotesPost(); }}
            >
              <div className="tlm-upload-fields">
                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Subject/Course</span>
                  <select
                    value={lessonNotesSubject}
                    onChange={(e) => setLessonNotesSubject(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Subject or course"
                  >
                    <option value="">Select Subject/Course Here</option>
                    <option value="general">General Knowledge</option>
                    <option value="math">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                  </select>
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Topic/Title <span className="tlm-upload-required">*</span></span>
                  <input
                    type="text"
                    value={lessonNotesTitle}
                    onChange={(e) => setLessonNotesTitle(e.target.value)}
                    placeholder="Enter assignment title/topic here"
                    className="tlm-upload-input"
                    aria-required
                  />
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Upload File/Doc/Notes</span>
                  <input
                    type="file"
                    onChange={(e) => setLessonNotesFile(e.target.files?.[0] ?? null)}
                    className="tlm-upload-file"
                    aria-label="Upload file or document"
                  />
                  <span className="tlm-upload-file-label">
                    {lessonNotesFile ? lessonNotesFile.name : 'No file chosen'}
                  </span>
                </label>
              </div>

              <div className="tlm-upload-editor-wrap">
                <div className="tlm-upload-editor-toolbar" role="toolbar" aria-label="Formatting">
                  <span className="tlm-upload-editor-toolbar-text">File</span>
                  <span className="tlm-upload-editor-toolbar-text">Edit</span>
                  <span className="tlm-upload-editor-toolbar-text">Insert</span>
                  <span className="tlm-upload-editor-toolbar-text">View</span>
                  <span className="tlm-upload-editor-toolbar-text">Format</span>
                  <span className="tlm-upload-editor-toolbar-text">Table</span>
                  <span className="tlm-upload-editor-toolbar-text">Tools</span>
                </div>
                <div className="tlm-upload-editor-body">
                  <textarea
                    value={lessonNotesMessage}
                    onChange={(e) => setLessonNotesMessage(e.target.value)}
                    placeholder="Enter main message…"
                    className="tlm-upload-textarea"
                    rows={12}
                    aria-label="Main message"
                  />
                  <div className="tlm-upload-editor-footer">
                    <span className="tlm-upload-word-count">Words: {lessonNotesWordCount}</span>
                  </div>
                </div>
              </div>

              <div className="tlm-upload-actions">
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-btn--reset"
                  onClick={() => { resetLessonNotesForm(); showFeedback('Form reset.'); }}
                >
                  Reset Form
                </button>
                <button type="submit" className="tlm-upload-btn tlm-upload-btn--post">
                  Post Item
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'video' && (
          <section className="tlm-upload-form-section" aria-labelledby="upload-videos-heading">
            <h2 id="upload-videos-heading" className="tlm-upload-form-title">
              UPLOAD VIDEOS
            </h2>
            <p className="tlm-upload-required-notice">
              Fields marked with (*) cannot be blank
            </p>
            <p className="tlm-upload-instruction">
              Provide video details below
            </p>

            <form
              className="tlm-upload-form"
              onSubmit={(e) => { e.preventDefault(); handleVideoPost(); }}
            >
              <div className="tlm-upload-fields">
                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Subject/Course</span>
                  <select
                    value={videoSubject}
                    onChange={(e) => setVideoSubject(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Subject or course"
                  >
                    <option value="">Select Subject/Course Here</option>
                    <option value="general">General Knowledge</option>
                    <option value="math">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                  </select>
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Topic/Title <span className="tlm-upload-required">*</span></span>
                  <input
                    type="text"
                    value={videoTopic}
                    onChange={(e) => setVideoTopic(e.target.value)}
                    placeholder="Enter tutorial title/topic here"
                    className="tlm-upload-input"
                    aria-required
                  />
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Video Status</span>
                  <select
                    value={videoStatus}
                    onChange={(e) => setVideoStatus(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Video status"
                  >
                    <option value="">Select video status here</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>

              <div className="tlm-upload-editor-wrap">
                <label className="tlm-upload-field-label">Enter main Message</label>
                <div className="tlm-upload-editor-toolbar" role="toolbar" aria-label="Formatting">
                  <span className="tlm-upload-editor-toolbar-text">File</span>
                  <span className="tlm-upload-editor-toolbar-text">Edit</span>
                  <span className="tlm-upload-editor-toolbar-text">Insert</span>
                  <span className="tlm-upload-editor-toolbar-text">View</span>
                  <span className="tlm-upload-editor-toolbar-text">Format</span>
                  <span className="tlm-upload-editor-toolbar-text">Table</span>
                  <span className="tlm-upload-editor-toolbar-text">Tools</span>
                </div>
                <div className="tlm-upload-editor-body">
                  <textarea
                    value={videoMessage}
                    onChange={(e) => setVideoMessage(e.target.value)}
                    placeholder="Enter main message…"
                    className="tlm-upload-textarea"
                    rows={12}
                    aria-label="Main message"
                  />
                  <div className="tlm-upload-editor-footer">
                    <span className="tlm-upload-word-count">Words: {videoWordCount}</span>
                  </div>
                </div>
              </div>

              <div className="tlm-upload-video-table-wrap">
                <table className="tlm-upload-video-table" role="grid">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">VIDEO FILE</th>
                      <th scope="col">VIDEO COVER</th>
                      <th scope="col">VIDEO TITLE</th>
                      <th scope="col">DEL ROW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {videoRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="tlm-upload-video-cell">
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) => updateVideoRow(row.id, { videoFile: e.target.files?.[0] ?? null })}
                              className="tlm-upload-file tlm-upload-file--inline"
                              aria-label={`Video file row ${index + 1}`}
                            />
                            <span className="tlm-upload-file-label">
                              {row.videoFile ? row.videoFile.name : 'No file chosen'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="tlm-upload-video-cell">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => updateVideoRow(row.id, { coverFile: e.target.files?.[0] ?? null })}
                              className="tlm-upload-file tlm-upload-file--inline"
                              aria-label={`Video cover row ${index + 1}`}
                            />
                            <span className="tlm-upload-file-label">
                              {row.coverFile ? row.coverFile.name : 'No file chosen'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => updateVideoRow(row.id, { title: e.target.value })}
                            placeholder="Video Title (eg. Video Part 1)"
                            className="tlm-upload-input tlm-upload-video-title-input"
                            aria-label={`Video title row ${index + 1}`}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="tlm-upload-btn tlm-upload-video-del-btn"
                            onClick={() => removeVideoRow(row.id)}
                            aria-label={`Delete row ${index + 1}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-video-add-row"
                  onClick={addVideoRow}
                >
                  Add Row
                </button>
              </div>

              <div className="tlm-upload-actions">
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-btn--reset"
                  onClick={() => { resetVideoForm(); showFeedback('Form reset.'); }}
                >
                  Reset Form
                </button>
                <button type="submit" className="tlm-upload-btn tlm-upload-btn--post tlm-upload-btn--post-video">
                  Post Item
                </button>
              </div>
            </form>
          </section>
        )}

        {activeTab === 'audio' && (
          <section className="tlm-upload-form-section" aria-labelledby="upload-audios-heading">
            <h2 id="upload-audios-heading" className="tlm-upload-form-title">
              UPLOAD AUDIOS
            </h2>
            <p className="tlm-upload-required-notice">
              Fields marked with (*) cannot be blank
            </p>
            <p className="tlm-upload-instruction">
              Provide Audio details below
            </p>

            <form
              className="tlm-upload-form"
              onSubmit={(e) => { e.preventDefault(); handleAudioPost(); }}
            >
              <div className="tlm-upload-fields">
                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Subject/Course <span className="tlm-upload-required">*</span></span>
                  <select
                    value={audioSubject}
                    onChange={(e) => setAudioSubject(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Subject or course"
                    aria-required
                  >
                    <option value="">Select Subject/Course Here</option>
                    <option value="general">General Knowledge</option>
                    <option value="math">Mathematics</option>
                    <option value="english">English</option>
                    <option value="science">Science</option>
                  </select>
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Topic/Title <span className="tlm-upload-required">*</span></span>
                  <input
                    type="text"
                    value={audioTopic}
                    onChange={(e) => setAudioTopic(e.target.value)}
                    placeholder="Enter tutorial title/topic here"
                    className="tlm-upload-input"
                    aria-required
                  />
                </label>

                <label className="tlm-upload-field">
                  <span className="tlm-upload-field-label">Audio Status <span className="tlm-upload-required">*</span></span>
                  <select
                    value={audioStatus}
                    onChange={(e) => setAudioStatus(e.target.value)}
                    className="tlm-upload-input tlm-upload-select"
                    aria-label="Audio status"
                    aria-required
                  >
                    <option value="">Select audio status here</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </label>
              </div>

              <div className="tlm-upload-editor-wrap">
                <label className="tlm-upload-field-label">Enter main Message</label>
                <div className="tlm-upload-editor-toolbar" role="toolbar" aria-label="Formatting">
                  <span className="tlm-upload-editor-toolbar-text">File</span>
                  <span className="tlm-upload-editor-toolbar-text">Edit</span>
                  <span className="tlm-upload-editor-toolbar-text">Insert</span>
                  <span className="tlm-upload-editor-toolbar-text">View</span>
                  <span className="tlm-upload-editor-toolbar-text">Format</span>
                  <span className="tlm-upload-editor-toolbar-text">Table</span>
                  <span className="tlm-upload-editor-toolbar-text">Tools</span>
                </div>
                <div className="tlm-upload-editor-body">
                  <textarea
                    value={audioMessage}
                    onChange={(e) => setAudioMessage(e.target.value)}
                    placeholder="Enter main message…"
                    className="tlm-upload-textarea"
                    rows={12}
                    aria-label="Main message"
                  />
                  <div className="tlm-upload-editor-footer">
                    <span className="tlm-upload-word-count">Words: {audioWordCount}</span>
                  </div>
                </div>
              </div>

              <div className="tlm-upload-video-table-wrap">
                <table className="tlm-upload-video-table tlm-upload-audio-table" role="grid">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">AUDIO FILE</th>
                      <th scope="col">AUDIO TITLE</th>
                      <th scope="col">DEL ROW</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audioRows.map((row, index) => (
                      <tr key={row.id}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="tlm-upload-video-cell">
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) => updateAudioRow(row.id, { audioFile: e.target.files?.[0] ?? null })}
                              className="tlm-upload-file tlm-upload-file--inline"
                              aria-label={`Audio file row ${index + 1}`}
                            />
                            <span className="tlm-upload-file-label">
                              {row.audioFile ? row.audioFile.name : 'No file chosen'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <input
                            type="text"
                            value={row.title}
                            onChange={(e) => updateAudioRow(row.id, { title: e.target.value })}
                            placeholder="Audio Title (eg. Audio Part 1)"
                            className="tlm-upload-input tlm-upload-video-title-input"
                            aria-label={`Audio title row ${index + 1}`}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="tlm-upload-btn tlm-upload-video-del-btn"
                            onClick={() => removeAudioRow(row.id)}
                            aria-label={`Delete row ${index + 1}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-video-add-row"
                  onClick={addAudioRow}
                >
                  Add row
                </button>
              </div>

              <div className="tlm-upload-actions">
                <button
                  type="button"
                  className="tlm-upload-btn tlm-upload-btn--reset"
                  onClick={() => { resetAudioForm(); showFeedback('Form reset.'); }}
                >
                  Reset Form
                </button>
                <button type="submit" className="tlm-upload-btn tlm-upload-btn--post tlm-upload-btn--post-video">
                  Post Item
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}
