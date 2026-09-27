import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

type JoinedClass = {
  id: string
  class_name: string
  subject: string
  class_code: string
}

type Session = {
  id: string
  class_id: string
  title: string | null
  session_date: string
  start_time: string
  end_time: string
}

function StudentDashboard() {
  const [studentName, setStudentName] = useState('')
  const [classes, setClasses] = useState<JoinedClass[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // --------------------------------------------------
      // 1. Get student's profile
      // --------------------------------------------------

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.error('Error loading profile:', profileError)
      } else if (profile) {
        setStudentName(profile.full_name)
      }

      // --------------------------------------------------
      // 2. Get classes the student has joined
      // --------------------------------------------------

      const { data: memberships, error: membershipError } = await supabase
        .from('class_members')
        .select('class_id')
        .eq('student_id', user.id)

      if (membershipError) {
        console.error('Error loading memberships:', membershipError)
        setLoading(false)
        return
      }

      // Student has not joined any classes yet
      if (!memberships || memberships.length === 0) {
        setLoading(false)
        return
      }

      // Turn memberships into an array of class IDs
      const classIds = memberships.map(
        (membership) => membership.class_id
      )

      // --------------------------------------------------
      // 3. Get information about those classes
      // --------------------------------------------------

      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, class_name, subject, class_code')
        .in('id', classIds)

      if (classError) {
        console.error('Error loading classes:', classError)
      } else {
        setClasses(classData ?? [])
      }

      // --------------------------------------------------
      // 4. Get upcoming sessions for those classes
      // --------------------------------------------------

      const today = new Date().toISOString().split('T')[0]

      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(
          'id, class_id, title, session_date, start_time, end_time'
        )
        .in('class_id', classIds)
        .gte('session_date', today)
        .order('session_date', { ascending: true })
        .order('start_time', { ascending: true })

      if (sessionError) {
        console.error('Error loading sessions:', sessionError)
      } else {
        setSessions(sessionData ?? [])
      }

      setLoading(false)
    }

    loadDashboard()
  }, [])

  // --------------------------------------------------
  // Choose a colour for each class card
  // --------------------------------------------------

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

  return (
    <>
      <Navbar role="student" />

      <main className="dashboard">

        {/* ==================================================
            DASHBOARD HEADER
        ================================================== */}

        <section className="dashboard-header">
          <div>
            <p className="eyebrow">
              STUDENT DASHBOARD
            </p>

            <h1>
              Welcome back
              {studentName
                ? `, ${studentName.split(' ')[0]}`
                : ''}
              !
            </h1>

            <p className="dashboard-subtitle">
              Your classes, resources and upcoming sessions all in one place.
            </p>
          </div>

          <Link
            to="/student/classes/join"
            className="primary-button"
          >
            + Join A Class
          </Link>
        </section>


        {/* ==================================================
            UPCOMING SESSIONS
        ================================================== */}

        <section className="upcoming-section">

          <div className="section-heading">
            <h2>Upcoming sessions</h2>

            {!loading && sessions.length > 0 && (
              <span>
                {sessions.length}{' '}
                {sessions.length === 1
                  ? 'session'
                  : 'sessions'}
              </span>
            )}
          </div>

          {loading && (
            <p>Loading sessions...</p>
          )}

          {!loading && sessions.length === 0 && (
            <div className="empty-session-card">
              <p>
                No upcoming sessions yet.
              </p>
            </div>
          )}

          {!loading && sessions.length > 0 && (
            <div className="session-grid">

              {sessions.map((session) => {

                // Find which class this session belongs to
                const sessionClass = classes.find(
                  (classItem) =>
                    classItem.id === session.class_id
                )

                return (
                  <div
                    className="student-session-card"
                    key={session.id}
                  >

                    {/* DATE */}

                    <div className="session-date-box">

                      <span>
                        {new Date(
                          `${session.session_date}T00:00:00`
                        ).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                          }
                        )}
                      </span>

                      <strong>
                        {new Date(
                          `${session.session_date}T00:00:00`
                        ).getDate()}
                      </strong>

                    </div>


                    {/* SESSION INFORMATION */}

                    <div className="student-session-info">

                      <span className="session-subject">
                        {sessionClass?.subject ?? 'CLASS'}
                      </span>

                      <h3>
                        {session.title ||
                          sessionClass?.class_name ||
                          'Tutoring Session'}
                      </h3>

                      <p>
                        {sessionClass?.class_name}
                      </p>

                      <strong>
                        {session.start_time.slice(0, 5)}
                        {' – '}
                        {session.end_time.slice(0, 5)}
                      </strong>

                    </div>

                  </div>
                )
              })}

            </div>
          )}

        </section>


        {/* ==================================================
            YOUR CLASSES
        ================================================== */}

        <section className="classes-section">

          <div className="section-heading">

            <h2>Your classes</h2>

            {!loading && classes.length > 0 && (
              <span>
                {classes.length}{' '}
                {classes.length === 1
                  ? 'class'
                  : 'classes'}
              </span>
            )}

          </div>


          {/* LOADING */}

          {loading && (
            <p>Loading classes...</p>
          )}


          {/* NO CLASSES */}

          {!loading && classes.length === 0 && (
            <div className="empty-state">

              <h3>
                You haven't joined a class yet
              </h3>

              <p>
                Ask your tutor for their 5-digit
                class code to get started.
              </p>

              <Link
                to="/student/classes/join"
                className="primary-button"
              >
                Join your first class
              </Link>

            </div>
          )}


          {/* CLASS CARDS */}

          <div className="class-grid">

            {classes.map((classItem, index) => (

              <div
                className={`class-card ${getCardColor(index)}`}
                key={classItem.id}
              >

                <span className="subject-badge">
                  {classItem.subject}
                </span>


                <div className="class-card-content">

                  <h3>
                    {classItem.class_name}
                  </h3>

                  <p>
                    View your class and prepare
                    for your next tutoring session.
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
  to={`/student/classes/${classItem.id}`}
  className="card-arrow"
>
  →
</Link>

                </div>

              </div>

            ))}

          </div>

        </section>

      </main>
    </>
  )
}

export default StudentDashboard