import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import ResourceFile from '../components/ResourceFile'

type ClassDetails = {
  id: string
  class_name: string
  subject: string
  class_code: string
}

type Student = {
  id: string
  full_name: string
}

type Session = {
  id: string
  title: string | null
  session_date: string
  start_time: string
  end_time: string
}

type Resource = {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
}

type Preparation = {
  id: string
  student_id: string
  help_text: string | null
  resources: Resource[]
}

function TutorClassPage() {
  const { classId } = useParams()

  const [classDetails, setClassDetails] =
    useState<ClassDetails | null>(null)

  const [students, setStudents] =
    useState<Student[]>([])

  const [sessions, setSessions] =
    useState<Session[]>([])

  const [preparations, setPreparations] =
    useState<Preparation[]>([])

  const [loading, setLoading] =
    useState(true)

  const [resourceMessage, setResourceMessage] =
    useState('')

  // First session in the sorted array
  // becomes the next session.
  const nextSession =
    sessions.length > 0
      ? sessions[0]
      : null

  useEffect(() => {
    async function fetchClass() {
      if (!classId) {
        setLoading(false)
        return
      }

      setLoading(true)

      // ---------------------------------------------
      // 1. LOAD CLASS
      // ---------------------------------------------

      const {
        data: classData,
        error: classError,
      } = await supabase
        .from('classes')
        .select(
          'id, class_name, subject, class_code'
        )
        .eq('id', classId)
        .single()

      if (classError) {
        console.error(
          'Error loading class:',
          classError
        )
      } else {
        setClassDetails(classData)
      }

      // ---------------------------------------------
      // 2. LOAD STUDENTS
      // ---------------------------------------------

      const {
        data: members,
        error: membersError,
      } = await supabase
        .from('class_members')
        .select('student_id')
        .eq('class_id', classId)

      if (membersError) {
        console.error(
          'Error loading class members:',
          membersError
        )
      } else if (
        members &&
        members.length > 0
      ) {
        const studentIds =
          members.map(
            (member) =>
              member.student_id
          )

        const {
          data: studentProfiles,
          error: profilesError,
        } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', studentIds)

        if (profilesError) {
          console.error(
            'Error loading student profiles:',
            profilesError
          )
        } else {
          setStudents(
            studentProfiles ?? []
          )
        }
      } else {
        setStudents([])
      }

      // ---------------------------------------------
      // 3. LOAD ALL UPCOMING SESSIONS
      // ---------------------------------------------

      const today =
        new Date()
          .toISOString()
          .split('T')[0]

      const {
        data: sessionData,
        error: sessionError,
      } = await supabase
        .from('sessions')
        .select(
          'id, title, session_date, start_time, end_time'
        )
        .eq('class_id', classId)
        .gte('session_date', today)
        .order(
          'session_date',
          {
            ascending: true,
          }
        )
        .order(
          'start_time',
          {
            ascending: true,
          }
        )

      if (sessionError) {
        console.error(
          'Error loading sessions:',
          sessionError
        )

        setLoading(false)
        return
      }

      const upcomingSessions =
        sessionData ?? []

      setSessions(upcomingSessions)

      // ---------------------------------------------
      // NO UPCOMING SESSION
      // ---------------------------------------------

      if (upcomingSessions.length === 0) {
        setPreparations([])
        setLoading(false)
        return
      }

      // ---------------------------------------------
      // 4. NEXT SESSION
      // ---------------------------------------------

      const firstSession =
        upcomingSessions[0]

      // Preparation only belongs to the NEXT session.
      const {
        data: preparationData,
        error: preparationError,
      } = await supabase
        .from('session_preparations')
        .select(
          'id, student_id, help_text'
        )
        .eq(
          'session_id',
          firstSession.id
        )

      if (preparationError) {
        console.error(
          'Error loading preparations:',
          preparationError
        )

        setLoading(false)
        return
      }

      if (
        !preparationData ||
        preparationData.length === 0
      ) {
        setPreparations([])
        setLoading(false)
        return
      }

      // ---------------------------------------------
      // 5. LOAD RESOURCES
      // ---------------------------------------------

      const preparationIds =
        preparationData.map(
          (preparation) =>
            preparation.id
        )

      const {
        data: resourceData,
        error: resourceError,
      } = await supabase
        .from('session_resources')
        .select(
          'id, preparation_id, file_name, file_path, file_type, file_size'
        )
        .in(
          'preparation_id',
          preparationIds
        )
        .order(
          'created_at',
          {
            ascending: true,
          }
        )

      if (resourceError) {
        console.error(
          'Error loading resources:',
          resourceError
        )
      }

      // ---------------------------------------------
      // 6. COMBINE PREPARATIONS + RESOURCES
      // ---------------------------------------------

      const preparationsWithResources =
        preparationData.map(
          (preparation) => ({
            id:
              preparation.id,

            student_id:
              preparation.student_id,

            help_text:
              preparation.help_text,

            resources:
              (resourceData ?? [])
                .filter(
                  (resource) =>
                    resource.preparation_id ===
                    preparation.id
                )
                .map(
                  (resource) => ({
                    id:
                      resource.id,

                    file_name:
                      resource.file_name,

                    file_path:
                      resource.file_path,

                    file_type:
                      resource.file_type,

                    file_size:
                      resource.file_size,
                  })
                ),
          })
        )

      setPreparations(
        preparationsWithResources
      )

      setLoading(false)
    }

    fetchClass()
  }, [classId])

  // ---------------------------------------------
  // FIND STUDENT PREPARATION
  // ---------------------------------------------

  function getStudentPreparation(
    studentId: string
  ) {
    return preparations.find(
      (preparation) =>
        preparation.student_id ===
        studentId
    )
  }

  // ---------------------------------------------
  // OPEN PRIVATE RESOURCE
  // ---------------------------------------------

  async function handleOpenResource(
    resource: Resource
  ) {
    setResourceMessage('')

    const {
      data,
      error,
    } = await supabase.storage
      .from('session-resources')
      .createSignedUrl(
        resource.file_path,
        60
      )

    if (error) {
      console.error(
        'Error opening resource:',
        error
      )

      setResourceMessage(
        'Could not open this resource. Please try again.'
      )

      return
    }

    window.open(
      data.signedUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // ---------------------------------------------
  // FORMAT SESSION DATE
  // ---------------------------------------------

  function formatSessionDate(
    dateString: string
  ) {
    const date =
      new Date(`${dateString}T00:00:00`)

    return {
      month: date
        .toLocaleDateString(
          'en-US',
          {
            month: 'short',
          }
        )
        .toUpperCase(),

      day: date.getDate(),
    }
  }

  // ---------------------------------------------
  // FORMAT SESSION TIME
  // ---------------------------------------------

  function formatSessionTime(
    time: string
  ) {
    const [hours, minutes] =
      time.split(':')

    const date = new Date()

    date.setHours(Number(hours))
    date.setMinutes(Number(minutes))
    date.setSeconds(0)

    return date.toLocaleTimeString(
      'en-US',
      {
        hour: 'numeric',
        minute: '2-digit',
      }
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
            Loading class...
          </p>
        </main>
      </>
    )
  }

  // ---------------------------------------------
  // CLASS NOT FOUND
  // ---------------------------------------------

  if (!classDetails) {
    return (
      <>
        <Navbar role="tutor" />

        <main className="dashboard">

          <h1>
            Class not found
          </h1>

          <Link to="/tutor/dashboard">
            ← Back to dashboard
          </Link>

        </main>
      </>
    )
  }

  return (
    <>
      <Navbar role="tutor" />

      <main className="class-detail-page">

        <Link
          to="/tutor/dashboard"
          className="back-link"
        >
          ← Back to classes
        </Link>


        {/* =========================================
            CLASS HEADER
        ========================================= */}

        <section className="class-detail-header">

          <div>

            <span className="subject-badge">
              {classDetails.subject}
            </span>

            <h1>
              {classDetails.class_name}
            </h1>

            <p>
              Manage your students, sessions and
              class resources.
            </p>

          </div>


          <div className="class-code-box">

            <span>
              CLASS CODE
            </span>

            <strong>
              {classDetails.class_code}
            </strong>

            <p>
              Share this code with students
            </p>

          </div>

        </section>


        {/* =========================================
            CLASS MEMBERS + UPCOMING SESSIONS
        ========================================= */}

        <section className="class-content-grid">


          {/* =======================================
              CLASS MEMBERS
          ======================================= */}

          <div className="class-section-card">

            <div className="class-section-heading">

              <div>

                <p className="eyebrow">
                  STUDENTS
                </p>

                <h2>
                  Class members
                </h2>

              </div>

            </div>


            {students.length === 0 ? (

              <div className="coming-soon">

                <p>
                  No students have joined this
                  class yet.
                </p>

              </div>

            ) : (

              <div className="student-list">

                {students.map(
                  (student) => (

                    <div
                      className="student-row"
                      key={student.id}
                    >

                      <div className="student-avatar">
                        {student.full_name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>

                        <strong>
                          {student.full_name}
                        </strong>

                        <span>
                          Student
                        </span>

                      </div>

                    </div>

                  )
                )}

              </div>

            )}

          </div>


          {/* =======================================
              UPCOMING SESSIONS
          ======================================= */}

          <div className="class-section-card upcoming-sessions-card">

            <div className="class-section-heading">

              <div>

                <p className="eyebrow">
                  UPCOMING
                </p>

                <h2>
                  Upcoming sessions
                </h2>

              </div>


              <Link
                to={`/tutor/classes/${classId}/sessions/create`}
                className="small-action-button"
              >
                + Schedule
              </Link>

            </div>


            {sessions.length === 0 ? (

              <div className="coming-soon">

                <p>
                  No upcoming sessions scheduled.
                </p>

              </div>

            ) : (

              <div className="class-session-scroll">

                <div className="class-session-list">

                  {sessions.map(
                    (session, index) => {

                      const sessionDate =
                        formatSessionDate(
                          session.session_date
                        )

                      return (

                        <div
                          className={`class-session-row ${
                            index === 0
                              ? 'class-session-row-next'
                              : ''
                          }`}
                          key={session.id}
                        >

                          {/* DATE */}

                          <div className="class-session-date">

                            <span>
                              {sessionDate.month}
                            </span>

                            <strong>
                              {sessionDate.day}
                            </strong>

                          </div>


                          {/* DIVIDER */}

                          <div className="class-session-divider" />


                          {/* SESSION DETAILS */}

                          <div className="class-session-details">

                            {index === 0 && (
                              <span className="class-session-next-label">
                                NEXT SESSION
                              </span>
                            )}

                            <h3>
                              {session.title ||
                                'Tutoring Session'}
                            </h3>

                          </div>



{/* TIME + EDIT */}

<div className="class-session-actions">

  <div className="class-session-time">

    <span>
      {formatSessionTime(
        session.start_time
      )}
    </span>

    <span className="class-session-time-separator">
      –
    </span>

    <span>
      {formatSessionTime(
        session.end_time
      )}
    </span>

  </div>

  <Link
    to={`/tutor/classes/${classId}/sessions/${session.id}/edit`}
    className="class-session-edit"
    aria-label={`Edit ${
      session.title ||
      'tutoring session'
    }`}
  >
    Edit 
    <span>→</span>
  </Link>

</div>
                          

                       

                        </div>

                      )
                    }
                  )}

                </div>

              </div>

            )}

          </div>

        </section>


        {/* =========================================
            STUDENT PREPARATION
        ========================================= */}

        {nextSession && (

          <section className="tutor-preparation-section">

            <div className="tutor-preparation-heading">

              <div>

                <p className="eyebrow">
                  BEFORE THE NEXT SESSION
                </p>

                <h2>
                  Student preparation
                </h2>

                <p>
                  See what your students would like
                  help with for the next session.
                </p>

              </div>

            </div>


            {resourceMessage && (

              <p className="preparation-status">
                {resourceMessage}
              </p>

            )}


            {students.length === 0 ? (

              <div className="coming-soon">

                <p>
                  No students have joined this
                  class yet.
                </p>

              </div>

            ) : (

              <div className="tutor-preparation-list">

                {students.map(
                  (student) => {

                    const preparation =
                      getStudentPreparation(
                        student.id
                      )

                    return (

                      <div
                        className="tutor-preparation-card"
                        key={student.id}
                      >

                        <div className="preparation-student">

                          <div className="student-avatar">
                            {student.full_name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {student.full_name}
                            </strong>

                            <span>
                              {preparation
                                ? 'Preparation submitted'
                                : 'Not submitted yet'}
                            </span>

                          </div>

                        </div>


                        {!preparation && (

                          <div className="no-preparation">

                            <p>
                              This student hasn't
                              submitted anything for
                              the next session yet.
                            </p>

                          </div>

                        )}


                        {preparation && (

                          <div className="preparation-content">

                            {preparation.help_text && (

                              <div className="preparation-question">

                                <span>
                                  QUESTIONS OR TOPICS
                                </span>

                                <p>
                                  {preparation.help_text}
                                </p>

                              </div>

                            )}


                            {preparation.resources.length > 0 && (

                              <div className="preparation-resources">

                                <span className="preparation-resource-label">
                                  RESOURCES
                                </span>

                                <div className="tutor-resource-list">

                                  {preparation.resources.map(
                                    (resource) => (

                                      <ResourceFile
                                        key={resource.id}
                                        fileName={
                                          resource.file_name
                                        }
                                        fileType={
                                          resource.file_type
                                        }
                                        fileSize={
                                          resource.file_size
                                        }
                                        onOpen={() =>
                                          handleOpenResource(
                                            resource
                                          )
                                        }
                                      />

                                    )
                                  )}

                                </div>

                              </div>

                            )}


                            {!preparation.help_text &&
                              preparation.resources.length === 0 && (

                                <div className="no-preparation">

                                  <p>
                                    No questions or
                                    resources were added.
                                  </p>

                                </div>

                              )}

                          </div>

                        )}

                      </div>

                    )
                  }
                )}

              </div>

            )}

          </section>

        )}

      </main>
    </>
  )
}

export default TutorClassPage