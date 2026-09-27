import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import './Dashboard.css'

type Class = {
  id: string
  class_name: string
  subject: string
  class_code: string
  student_count: number
}

type Session = {
  id: string
  class_id: string
  title: string | null
  session_date: string
  start_time: string
  end_time: string
}

type UpcomingSession = Session & {
  class_name: string
  subject: string
}

function TutorDashboard() {
  const [classes, setClasses] = useState<Class[]>([])
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([])
  const [loading, setLoading] = useState(true)
  const [tutorName, setTutorName] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // -----------------------------------------
      // LOAD TUTOR PROFILE
      // -----------------------------------------

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
      }

      if (profile) {
        setTutorName(profile.full_name)
      }

      // -----------------------------------------
      // LOAD TUTOR CLASSES
      // -----------------------------------------

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select(`
          id,
          class_name,
          subject,
          class_code,
          class_members(count)
        `)
        .eq('tutor_id', user.id)

      if (classError) {
        console.error('Error loading classes:', classError)
        setLoading(false)
        return
      }

      const classesWithCounts: Class[] = (classData ?? []).map(
        (classItem) => ({
          id: classItem.id,
          class_name: classItem.class_name,
          subject: classItem.subject,
          class_code: classItem.class_code,
          student_count: classItem.class_members?.[0]?.count ?? 0,
        })
      )

      setClasses(classesWithCounts)

      // -----------------------------------------
      // LOAD UPCOMING SESSIONS
      // -----------------------------------------

      if (classesWithCounts.length > 0) {
        const classIds = classesWithCounts.map(
          (classItem) => classItem.id
        )

        const today = new Date().toISOString().split('T')[0]

        const { data: sessionData, error: sessionError } =
          await supabase
            .from('sessions')
            .select(`
              id,
              class_id,
              title,
              session_date,
              start_time,
              end_time
            `)
            .in('class_id', classIds)
            .gte('session_date', today)
            .order('session_date', { ascending: true })
            .order('start_time', { ascending: true })

        if (sessionError) {
          console.error(
            'Error loading upcoming sessions:',
            sessionError
          )
        } else {
          const sessionsWithClasses: UpcomingSession[] =
            (sessionData ?? []).map((session) => {
              const matchingClass = classesWithCounts.find(
                (classItem) =>
                  classItem.id === session.class_id
              )

              return {
                ...session,
                class_name:
                  matchingClass?.class_name ?? 'Class',
                subject:
                  matchingClass?.subject ?? '',
              }
            })

          setUpcomingSessions(sessionsWithClasses)
        }
      }

      setLoading(false)
    }

    loadDashboard()
  }, [])

  // -----------------------------------------
  // CLASS CARD COLOURS
  // -----------------------------------------

  function getCardColor(index: number) {
    const colors = [
      'card-lavender',
      'card-yellow',
      'card-blue',
      'card-pink',
      'card-mint',
    ]

    return colors[index % colors.length]
  }

  // -----------------------------------------
  // SESSION CARD COLOURS
  // -----------------------------------------

  function getSessionColor(index: number) {
    const colors = [
      'dashboard-session-yellow',
      'dashboard-session-lavender',
      'dashboard-session-blue',
    ]

    return colors[index % colors.length]
  }

  // -----------------------------------------
  // DATE FORMATTING
  // -----------------------------------------

  function formatMonth(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`)

    return date
      .toLocaleDateString('en-US', {
        month: 'short',
      })
      .toUpperCase()
  }

  function formatDay(dateString: string) {
    const date = new Date(`${dateString}T00:00:00`)

    return date.getDate()
  }

  // -----------------------------------------
  // TIME FORMATTING
  // -----------------------------------------

  function formatTime(time: string) {
    const [hours, minutes] = time.split(':')

    const date = new Date()

    date.setHours(Number(hours))
    date.setMinutes(Number(minutes))
    date.setSeconds(0)

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <>
      <Navbar role="tutor" />

      <main className="dashboard">

        {/* =====================================
            WELCOME
        ====================================== */}

        <section className="dashboard-header">

          <div>
            <p className="eyebrow">
              TUTOR DASHBOARD
            </p>

            <h1>
              Welcome back
              {tutorName
                ? `, ${tutorName.split(' ')[0]}`
                : ''}
              !
            </h1>

            <p className="dashboard-subtitle">
              Here's what's coming up with your students.
            </p>
          </div>

          <Link
            to="/tutor/classes/create"
            className="primary-button"
          >
            <span>+</span>
            Create class
          </Link>

        </section>


        {/* =====================================
            UPCOMING SESSIONS
        ====================================== */}

        <section className="dashboard-upcoming">

          <div className="dashboard-section-header">

            <div>
              <p className="dashboard-section-eyebrow">
                YOUR SCHEDULE
              </p>

              <h2>
                Upcoming sessions
              </h2>
            </div>

            {!loading && upcomingSessions.length > 0 && (
              <span className="dashboard-count">
                {upcomingSessions.length}{' '}
                {upcomingSessions.length === 1
                  ? 'session'
                  : 'sessions'}
              </span>
            )}

          </div>


          {/* LOADING */}

          {loading && (
            <p className="dashboard-loading">
              Loading your schedule...
            </p>
          )}


          {/* NO UPCOMING SESSIONS */}

          {!loading &&
            upcomingSessions.length === 0 && (

              <div className="dashboard-no-sessions">

                <div className="dashboard-no-sessions-icon">
                  ✓
                </div>

                <div>
                  <h3>
                    No upcoming sessions
                  </h3>

                  <p>
                    Your schedule is clear for now.
                    Sessions you create will appear here.
                  </p>
                </div>

              </div>
            )}


          {/* UPCOMING SESSION CARDS */}

          {!loading &&
            upcomingSessions.length > 0 && (

              <div className="dashboard-session-grid">

                {upcomingSessions
                  .slice(0, 3)
                  .map((session, index) => (

                    <Link
                      key={session.id}
                      to={`/tutor/classes/${session.class_id}`}
                      className={`dashboard-session-card ${getSessionColor(
                        index
                      )}`}
                    >

                      {/* DATE + NEXT BADGE */}

                      <div className="dashboard-session-top">

                        <div className="dashboard-session-date">

                          <span>
                            {formatMonth(
                              session.session_date
                            )}
                          </span>

                          <strong>
                            {formatDay(
                              session.session_date
                            )}
                          </strong>

                        </div>

                        {index === 0 && (
                          <span className="dashboard-next-badge">
                            NEXT
                          </span>
                        )}

                      </div>


                      {/* SESSION INFORMATION */}

                      <div className="dashboard-session-content">

                        <span className="dashboard-session-subject">
                          {session.subject}
                        </span>

                        <h3>
                          {session.class_name}
                        </h3>

                        {session.title && (
                          <p className="dashboard-session-title">
                            {session.title}
                          </p>
                        )}

                      </div>


                      {/* TIME */}

                      <div className="dashboard-session-footer">

                        <strong>
                          {formatTime(
                            session.start_time
                          )}
                          {' – '}
                          {formatTime(
                            session.end_time
                          )}
                        </strong>

                        <span className="dashboard-session-arrow">
                          →
                        </span>

                      </div>

                    </Link>
                  ))}

              </div>
            )}

        </section>


        {/* =====================================
            YOUR CLASSES
        ====================================== */}

        <section className="classes-section">

          <div className="dashboard-section-header">

            <div>
              <p className="dashboard-section-eyebrow">
                TEACHING
              </p>

              <h2>
                Your classes
              </h2>
            </div>

            {!loading && classes.length > 0 && (
              <span className="dashboard-count">
                {classes.length}{' '}
                {classes.length === 1
                  ? 'class'
                  : 'classes'}
              </span>
            )}

          </div>


          {/* NO CLASSES */}

          {!loading && classes.length === 0 && (

            <div className="empty-state">

              <h3>
                No classes yet
              </h3>

              <p>
                Create your first class and invite
                your students to join.
              </p>

              <Link
                to="/tutor/classes/create"
                className="primary-button"
              >
                Create your first class
              </Link>

            </div>

          )}


          {/* CLASS CARDS */}

          <div className="class-grid">

            {classes.map(
              (classItem, index) => (

                <div
                  key={classItem.id}
                  className={`class-card ${getCardColor(
                    index
                  )}`}
                >

                  <span className="subject-badge">
                    {classItem.subject}
                  </span>


                  <div className="class-card-content">

                    <h3>
                      {classItem.class_name}
                    </h3>

                    <p>
                      {classItem.student_count}{' '}
                      {classItem.student_count === 1
                        ? 'student'
                        : 'students'}
                    </p>

                  </div>


                  <div className="class-card-footer">

                    <div>

                      <span className="code-label">
                        CLASS CODE
                      </span>

                      <strong>
                        {classItem.class_code}
                      </strong>

                    </div>


                    <Link
                      to={`/tutor/classes/${classItem.id}`}
                      className="card-arrow"
                      aria-label={`Open ${classItem.class_name}`}
                    >
                      →
                    </Link>

                  </div>

                </div>

              )
            )}

          </div>

        </section>

      </main>
    </>
  )
}

export default TutorDashboard