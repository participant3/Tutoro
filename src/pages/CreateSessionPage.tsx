import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function CreateSessionPage() {
  const { classId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [sessionDate, setSessionDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  async function handleCreateSession(e: React.FormEvent) {
    e.preventDefault()

    if (!classId) {
      setMessage('Class could not be found.')
      return
    }

    if (endTime <= startTime) {
      setMessage('End time must be after the start time.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('sessions')
      .insert({
        class_id: classId,
        title: title || null,
        session_date: sessionDate,
        start_time: startTime,
        end_time: endTime,
      })

    if (error) {
      console.error('Error creating session:', error)
      setMessage('Could not create the session.')
      setLoading(false)
      return
    }

    navigate(`/tutor/classes/${classId}`)
  }

  return (
    <>
      <Navbar role="tutor" />

      <main className="form-page">
        <div className="form-card">
          <Link
            to={`/tutor/classes/${classId}`}
            className="back-link"
          >
            ← Back to class
          </Link>

          <p className="form-eyebrow">
            NEW SESSION
          </p>

          <h1>Schedule a session</h1>

          <p className="form-description">
            Choose when your next tutoring session will take place.
          </p>

          <form onSubmit={handleCreateSession}>
            <div className="form-group">
              <label>Session title</label>

              <input
                className="form-input"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Quadratic Functions"
              />
            </div>

            <div className="form-group">
              <label>Date</label>

              <input
                className="form-input"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                required
              />
            </div>

            <div className="time-inputs">
              <div className="form-group">
                <label>Start time</label>

                <input
                  className="form-input"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>End time</label>

                <input
                  className="form-input"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="form-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </form>

          {message && (
            <p className="form-message">
              {message}
            </p>
          )}
        </div>
      </main>
    </>
  )
}

export default CreateSessionPage