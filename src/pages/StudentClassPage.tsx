import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import SessionCard from '../components/SessionCard'
import ResourceFile from '../components/ResourceFile'

type ClassDetails = {
  id: string
  class_name: string
  subject: string
  class_code: string
}

type Session = {
  id: string
  title: string | null
  session_date: string
  start_time: string
  end_time: string
}

type SessionResource = {
  id: string
  file_name: string
  file_path: string
  file_type: string
  file_size: number
}

function StudentClassPage() {
  const { classId } = useParams()

  const [classDetails, setClassDetails] =
    useState<ClassDetails | null>(null)

  const [sessions, setSessions] =
    useState<Session[]>([])

  const [loading, setLoading] =
    useState(true)

  // Preparation
  const [helpText, setHelpText] =
    useState('')

  const [preparationId, setPreparationId] =
    useState<string | null>(null)

  const [savingPreparation, setSavingPreparation] =
    useState(false)

  const [preparationMessage, setPreparationMessage] =
    useState('')

  // Resources already uploaded to Supabase
  const [resources, setResources] =
    useState<SessionResource[]>([])

  // Files selected in the browser
  const [selectedFiles, setSelectedFiles] =
    useState<File[]>([])

  // --------------------------------------------------
  // LOAD CLASS PAGE
  // --------------------------------------------------

  useEffect(() => {
    async function loadClassPage() {
      if (!classId) {
        setLoading(false)
        return
      }

      // ------------------------------------------------
      // 1. Get class information
      // ------------------------------------------------

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

      // ------------------------------------------------
      // 2. Get upcoming sessions
      // ------------------------------------------------

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
        .order('session_date', {
          ascending: true,
        })
        .order('start_time', {
          ascending: true,
        })

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

      // No upcoming session means there is
      // no preparation to load.
      if (upcomingSessions.length === 0) {
        setLoading(false)
        return
      }

      // ------------------------------------------------
      // 3. Get current student
      // ------------------------------------------------

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      const nextSession =
        upcomingSessions[0]

      // ------------------------------------------------
      // 4. Load preparation for next session
      // ------------------------------------------------

      const {
        data: preparationData,
        error: preparationError,
      } = await supabase
        .from('session_preparations')
        .select('id, help_text')
        .eq(
          'session_id',
          nextSession.id
        )
        .eq(
          'student_id',
          user.id
        )
        .maybeSingle()

      if (preparationError) {
        console.error(
          'Error loading preparation:',
          preparationError
        )

        setLoading(false)
        return
      }

      // If the student has never prepared
      // for this session, there are no
      // resources to load yet.
      if (!preparationData) {
        setLoading(false)
        return
      }

      setPreparationId(
        preparationData.id
      )

      setHelpText(
        preparationData.help_text ?? ''
      )

      // ------------------------------------------------
      // 5. Load uploaded resources
      // ------------------------------------------------

      const {
        data: resourceData,
        error: resourceError,
      } = await supabase
        .from('session_resources')
        .select(
          'id, file_name, file_path, file_type, file_size'
        )
        .eq(
          'preparation_id',
          preparationData.id
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
      } else {
        setResources(
          resourceData ?? []
        )
      }

      setLoading(false)
    }

    loadClassPage()
  }, [classId])

  // --------------------------------------------------
  // VALIDATE FILES
  // --------------------------------------------------

  function validateFiles(
    files: File[]
  ) {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    const maxSize =
      10 * 1024 * 1024

    for (const file of files) {
      if (
        !allowedTypes.includes(
          file.type
        )
      ) {
        return `${file.name} is not a supported file type.`
      }

      if (file.size > maxSize) {
        return `${file.name} is larger than 10 MB.`
      }
    }

    return null
  }

  // --------------------------------------------------
  // UPLOAD FILES
  // --------------------------------------------------

  async function uploadFiles(
    files: File[],
    currentPreparationId: string,
    studentId: string,
    sessionId: string
  ) {
    const uploadedResources:
      SessionResource[] = []

    for (const file of files) {
      // Clean filename for Storage
      const safeFileName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        )

      // Give every upload a unique name
      const uniqueFileName =
        `${crypto.randomUUID()}-${safeFileName}`

      // Storage path:
      // student/session/file
      const filePath =
        `${studentId}/${sessionId}/${uniqueFileName}`

      // ----------------------------------------------
      // Upload actual file
      // ----------------------------------------------

      const {
        error: uploadError,
      } = await supabase.storage
        .from('session-resources')
        .upload(
          filePath,
          file,
          {
            contentType: file.type,
            upsert: false,
          }
        )

      if (uploadError) {
        throw new Error(
          `Could not upload ${file.name}: ${uploadError.message}`
        )
      }

      // ----------------------------------------------
      // Save metadata in database
      // ----------------------------------------------

      const {
        data: resourceData,
        error: resourceError,
      } = await supabase
        .from('session_resources')
        .insert({
          preparation_id:
            currentPreparationId,

          student_id:
            studentId,

          file_name:
            file.name,

          file_path:
            filePath,

          file_type:
            file.type,

          file_size:
            file.size,
        })
        .select(
          'id, file_name, file_path, file_type, file_size'
        )
        .single()

      if (resourceError) {
        // Storage succeeded but database failed.
        // Clean up the Storage file.

        await supabase.storage
          .from('session-resources')
          .remove([filePath])

        throw new Error(
          `Could not save ${file.name}: ${resourceError.message}`
        )
      }

      uploadedResources.push(
        resourceData
      )
    }

    return uploadedResources
  }

  // --------------------------------------------------
  // SAVE PREPARATION
  // --------------------------------------------------

  async function handleSavePreparation() {
    if (sessions.length === 0) {
      return
    }

    // Student must provide text,
    // a new file, or already have a resource.
    if (
      !helpText.trim() &&
      selectedFiles.length === 0 &&
      resources.length === 0
    ) {
      setPreparationMessage(
        'Add a question, note, or resource before saving.'
      )

      return
    }

    setSavingPreparation(true)
    setPreparationMessage('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error(
          'You need to be logged in.'
        )
      }

      const nextSession =
        sessions[0]

      let currentPreparationId =
        preparationId

      // ------------------------------------------------
      // Existing preparation
      // ------------------------------------------------

      if (currentPreparationId) {
        const {
          error: updateError,
        } = await supabase
          .from(
            'session_preparations'
          )
          .update({
            help_text:
              helpText.trim() ||
              null,

            updated_at:
              new Date()
                .toISOString(),
          })
          .eq(
            'id',
            currentPreparationId
          )

        if (updateError) {
          throw new Error(
            `Could not update preparation: ${updateError.message}`
          )
        }
      }

      // ------------------------------------------------
      // New preparation
      // ------------------------------------------------

      else {
        const {
          data: preparationData,
          error: insertError,
        } = await supabase
          .from(
            'session_preparations'
          )
          .insert({
            session_id:
              nextSession.id,

            student_id:
              user.id,

            help_text:
              helpText.trim() ||
              null,
          })
          .select('id')
          .single()

        if (insertError) {
          throw new Error(
            `Could not create preparation: ${insertError.message}`
          )
        }

        currentPreparationId =
          preparationData.id

        setPreparationId(
          preparationData.id
        )
      }

      // ------------------------------------------------
      // Upload selected files
      // ------------------------------------------------

      if (
        selectedFiles.length > 0
      ) {
        const uploadedResources =
          await uploadFiles(
            selectedFiles,
            currentPreparationId,
            user.id,
            nextSession.id
          )

        setResources(
          (currentResources) => [
            ...currentResources,
            ...uploadedResources,
          ]
        )

        // Clear browser-selected files
        // because they now exist in Supabase.
        setSelectedFiles([])
      }

      setPreparationMessage(
        'Preparation saved!'
      )
    } catch (error) {
      console.error(
        'Error saving preparation:',
        error
      )

      if (error instanceof Error) {
        setPreparationMessage(
          error.message
        )
      } else {
        setPreparationMessage(
          'Could not save your preparation.'
        )
      }
    } finally {
      setSavingPreparation(false)
    }
  }

  // --------------------------------------------------
  // DELETE UPLOADED RESOURCE
  // --------------------------------------------------

  async function handleDeleteResource(
    resource: SessionResource
  ) {
    const confirmed =
      window.confirm(
        `Remove ${resource.file_name}?`
      )

    if (!confirmed) {
      return
    }

    setPreparationMessage('')

    // Delete actual Storage file
    const {
      error: storageError,
    } = await supabase.storage
      .from('session-resources')
      .remove([
        resource.file_path,
      ])

    if (storageError) {
      console.error(
        'Error deleting Storage file:',
        storageError
      )

      setPreparationMessage(
        'Could not remove the file.'
      )

      return
    }

    // Delete metadata row
    const {
      error: databaseError,
    } = await supabase
      .from('session_resources')
      .delete()
      .eq(
        'id',
        resource.id
      )

    if (databaseError) {
      console.error(
        'Error deleting resource:',
        databaseError
      )

      setPreparationMessage(
        'The file was removed, but its resource record could not be deleted.'
      )

      return
    }

    setResources(
      (currentResources) =>
        currentResources.filter(
          (currentResource) =>
            currentResource.id !==
            resource.id
        )
    )

    setPreparationMessage(
      'Resource removed.'
    )
  }

  // --------------------------------------------------
  // OPEN PRIVATE RESOURCE
  // --------------------------------------------------

  async function handleOpenResource(
    resource: SessionResource
  ) {
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

      setPreparationMessage(
        'Could not open the resource.'
      )

      return
    }

    window.open(
      data.signedUrl,
      '_blank',
      'noopener,noreferrer'
    )
  }

  // --------------------------------------------------
  // LOADING
  // --------------------------------------------------

  if (loading) {
    return (
      <>
        <Navbar role="student" />

        <main className="dashboard">
          <p>
            Loading class...
          </p>
        </main>
      </>
    )
  }

  // --------------------------------------------------
  // CLASS NOT FOUND
  // --------------------------------------------------

  if (!classDetails) {
    return (
      <>
        <Navbar role="student" />

        <main className="dashboard">

          <h1>
            Class not found
          </h1>

          <Link to="/student/dashboard">
            ← Back to dashboard
          </Link>

        </main>
      </>
    )
  }

  return (
    <>
      <Navbar role="student" />

      <main className="dashboard">

        {/* ==================================================
            CLASS HEADER
        ================================================== */}

        <Link
          to="/student/dashboard"
          className="back-link"
        >
          ← Back to dashboard
        </Link>

        <section className="student-class-header">

          <div>

            <span className="subject-badge">
              {classDetails.subject}
            </span>

            <h1>
              {classDetails.class_name}
            </h1>

            <p>
              Class code:{' '}

              <strong>
                {classDetails.class_code}
              </strong>
            </p>

          </div>

        </section>


        {/* ==================================================
            UPCOMING SESSIONS
        ================================================== */}

        <section className="student-class-section">

          <div className="section-heading">

            <h2>
              Upcoming sessions
            </h2>

            {sessions.length > 0 && (
              <span>
                {sessions.length}{' '}

                {sessions.length === 1
                  ? 'session'
                  : 'sessions'}
              </span>
            )}

          </div>


          {sessions.length === 0 && (

            <div className="empty-session-card">

              <h3>
                Nothing scheduled yet
              </h3>

              <p>
                Your tutor hasn't scheduled an
                upcoming session for this class.
              </p>

            </div>

          )}


          {sessions.length > 0 && (

            <div className="student-class-session-list">
                {sessions.map((session, index) => (

<SessionCard
  key={session.id}
  title={session.title}
  sessionDate={session.session_date}
  startTime={session.start_time}
  endTime={session.end_time}
  label={
    index === 0
      ? 'NEXT SESSION'
      : undefined
  }
/>

))}

            </div>

          )}

        </section>


        {/* ==================================================
            PREPARE FOR NEXT SESSION
        ================================================== */}

        {sessions.length > 0 && (

          <section className="preparation-section">

            <div className="preparation-heading">

              <div>

                <p className="eyebrow">
                  BEFORE YOUR NEXT SESSION
                </p>

                <h2>
                  What do you need help with?
                </h2>

                <p>
                  Let your tutor know what you're
                  finding difficult and attach any
                  questions or worksheets you'd like
                  to discuss.
                </p>

              </div>

            </div>


            <div className="preparation-card">

              {/* QUESTIONS */}

              <label htmlFor="helpText">
                Questions or topics
              </label>

              <textarea
                id="helpText"
                value={helpText}
                onChange={(e) => {
                  setHelpText(
                    e.target.value
                  )

                  setPreparationMessage('')
                }}
                placeholder="For example: I'm struggling with completing the square, especially question 7 from my homework..."
                rows={6}
              />


              {/* ==================================================
                  ATTACHMENTS
              ================================================== */}

              <div className="resource-upload-section">

                <div className="resource-upload-heading">

                  <strong>
                    Attachments
                  </strong>

                  <p>
                    Add PDFs, worksheets,
                    screenshots or photos of
                    questions.
                  </p>

                </div>

                
                {/* ALREADY UPLOADED */}

{resources.length > 0 && (

<div className="uploaded-resources">

  {resources.map((resource) => (

    <ResourceFile
      key={resource.id}
      fileName={resource.file_name}
      fileType={resource.file_type}
      fileSize={resource.file_size}
      onOpen={() =>
        handleOpenResource(resource)
      }
      onRemove={() =>
        handleDeleteResource(resource)
      }
    />

  ))}

</div>

)}


                {/* FILE PICKER */}

                <label className="file-upload-box">

                  <span className="file-upload-icon">
                    +
                  </span>

                  <div>

                    <strong>
                      Add PDF or image
                    </strong>

                    <p>
                      PDF, JPG, PNG or WEBP ·
                      Maximum 10 MB each
                    </p>

                  </div>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    multiple
                    onChange={(e) => {
                      const files =
                        Array.from(
                          e.target.files ?? []
                        )

                      const validationError =
                        validateFiles(files)

                      if (validationError) {
                        setPreparationMessage(
                          validationError
                        )

                        e.target.value = ''

                        return
                      }

                      setSelectedFiles(
                        (currentFiles) => [
                          ...currentFiles,
                          ...files,
                        ]
                      )

                      setPreparationMessage('')

                      e.target.value = ''
                    }}
                  />

                </label>


                {/* SELECTED, NOT YET SAVED */}

                {selectedFiles.length > 0 && (

                  <div className="selected-files">

                    {selectedFiles.map(
                      (file, index) => (

                        <div
                          className="selected-file"
                          key={`${file.name}-${index}`}
                        >

                          <div className="selected-file-info">

                            <strong>
                              {file.name}
                            </strong>

                            <span>
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(2)}{' '}
                              MB
                            </span>

                          </div>


                          <button
                            type="button"
                            onClick={() => {
                              setSelectedFiles(
                                (currentFiles) =>
                                  currentFiles.filter(
                                    (
                                      _,
                                      fileIndex
                                    ) =>
                                      fileIndex !==
                                      index
                                  )
                              )
                            }}
                          >
                            Remove
                          </button>

                        </div>

                      )
                    )}

                  </div>

                )}

              </div>


              {/* ==================================================
                  SAVE
              ================================================== */}

              <div className="preparation-actions">

                <span className="preparation-status">
                  {preparationMessage}
                </span>

                <button
                  className="primary-button"
                  onClick={
                    handleSavePreparation
                  }
                  disabled={
                    savingPreparation
                  }
                >
                  {savingPreparation
                    ? 'Saving...'
                    : preparationId
                      ? 'Save changes'
                      : 'Save preparation'}
                </button>

              </div>

            </div>

          </section>

        )}

      </main>
    </>
  )
}

export default StudentClassPage