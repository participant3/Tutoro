import { useEffect, useState } from 'react'
import {
  Link,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

type Session = {
  id: string
  class_id: string
  title: string | null
  session_date: string
  start_time: string
  end_time: string
}

function EditSessionPage() {
  const { classId, sessionId } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [sessionDate, setSessionDate] =
    useState('')
  const [startTime, setStartTime] =
    useState('')
  const [endTime, setEndTime] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [saving, setSaving] =
    useState(false)

  const [deleting, setDeleting] =
    useState(false)

  const [showDeleteConfirm, setShowDeleteConfirm] =
    useState(false)

  const [message, setMessage] =
    useState('')

  // ---------------------------------------------
  // LOAD SESSION
  // ---------------------------------------------

  useEffect(() => {
    async function loadSession() {
      if (!classId || !sessionId) {
        setMessage('Session not found.')
        setLoading(false)
        return
      }

      const {
        data,
        error,
      } = await supabase
        .from('sessions')
        .select(
          'id, class_id, title, session_date, start_time, end_time'
        )
        .eq('id', sessionId)
        .eq('class_id', classId)
        .maybeSingle()

      if (error) {
        console.error(
          'Error loading session:',
          error
        )

        setMessage(
          'Could not load this session.'
        )

        setLoading(false)
        return
      }

      if (!data) {
        setMessage('Session not found.')
        setLoading(false)
        return
      }

      const session =
        data as Session

      setTitle(
        session.title ?? ''
      )

      setSessionDate(
        session.session_date
      )

      setStartTime(
        session.start_time.slice(0, 5)
      )

      setEndTime(
        session.end_time.slice(0, 5)
      )

      setLoading(false)
    }

    loadSession()
  }, [classId, sessionId])

  // ---------------------------------------------
  // SAVE CHANGES
  // ---------------------------------------------

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault()

    if (
      !classId ||
      !sessionId
    ) {
      return
    }

    setMessage('')

    if (endTime <= startTime) {
      setMessage(
        'End time must be later than start time.'
      )

      return
    }

    setSaving(true)

    const {
      error,
    } = await supabase
      .from('sessions')
      .update({
        title:
          title.trim() || null,

        session_date:
          sessionDate,

        start_time:
          startTime,

        end_time:
          endTime,
      })
      .eq('id', sessionId)
      .eq('class_id', classId)

    if (error) {
      console.error(
        'Error updating session:',
        error
      )

      setMessage(
        'Could not update the session. Please try again.'
      )

      setSaving(false)
      return
    }

    navigate(
      `/tutor/classes/${classId}`
    )
  }

  // ---------------------------------------------
  // DELETE SESSION
  // ---------------------------------------------

  async function handleDeleteSession() {
    if (
      !classId ||
      !sessionId
    ) {
      return
    }

    setDeleting(true)
    setMessage('')

    const {
      error,
    } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('class_id', classId)

    if (error) {
      console.error(
        'Error deleting session:',
        error
      )

      setMessage(
        'Could not delete the session. Please try again.'
      )

      setDeleting(false)
      return
    }

    navigate(
      `/tutor/classes/${classId}`
    )
  }

  // ---------------------------------------------
  // LOADING
  // ---------------------------------------------

  if (loading) {
    return (
      <>
        <Navbar role="tutor" />

        <main className="dashboard">
          <p>
            Loading session...
          </p>
        </main>
      </>
    )
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
            EDIT SESSION
          </p>

          <h1>
            Update session
          </h1>

          <p className="form-description">
            Change the session details below.
          </p>


          <form
            onSubmit={handleSubmit}
          >

            {/* TITLE */}

            <div className="form-group">

              <label htmlFor="title">
                Session title
              </label>

              <input
                id="title"
                className="form-input"
                type="text"
                value={title}
                onChange={(e) =>
                  setTitle(
                    e.target.value
                  )
                }
                placeholder="Quadratic equations"
              />

            </div>


            {/* DATE */}

            <div className="form-group">

              <label htmlFor="session-date">
                Date
              </label>

              <input
                id="session-date"
                className="form-input"
                type="date"
                value={sessionDate}
                onChange={(e) =>
                  setSessionDate(
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* START TIME */}

            <div className="form-group">

              <label htmlFor="start-time">
                Start time
              </label>

              <input
                id="start-time"
                className="form-input"
                type="time"
                value={startTime}
                onChange={(e) =>
                  setStartTime(
                    e.target.value
                  )
                }
                required
              />

            </div>


            {/* END TIME */}

            <div className="form-group">

              <label htmlFor="end-time">
                End time
              </label>

              <input
                id="end-time"
                className="form-input"
                type="time"
                value={endTime}
                onChange={(e) =>
                  setEndTime(
                    e.target.value
                  )
                }
                required
              />

            </div>


            <button
              className="form-submit"
              type="submit"
              disabled={
                saving ||
                deleting
              }
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>

          </form>


          {message && (
            <p className="form-message">
              {message}
            </p>
          )}


          {/* =====================================
              DANGER ZONE
          ===================================== */}

          <div className="session-danger-zone">

            <div>

              <strong>
                Delete session
              </strong>

              <p>
                Permanently remove this session.
              </p>

            </div>


            {!showDeleteConfirm ? (

              <button
                type="button"
                className="delete-session-button"
                onClick={() =>
                  setShowDeleteConfirm(true)
                }
              >
                Delete session
              </button>

            ) : (

              <div className="delete-confirmation">

                <p>
                  Are you sure? This cannot be undone.
                </p>

                <div className="delete-confirmation-actions">

                  <button
                    type="button"
                    className="cancel-delete-button"
                    onClick={() =>
                      setShowDeleteConfirm(false)
                    }
                    disabled={deleting}
                  >
                    Keep session
                  </button>

                  <button
                    type="button"
                    className="confirm-delete-button"
                    onClick={
                      handleDeleteSession
                    }
                    disabled={deleting}
                  >
                    {deleting
                      ? 'Deleting...'
                      : 'Yes, delete'}
                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </main>
    </>
  )
}

export default EditSessionPage