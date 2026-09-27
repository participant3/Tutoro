import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function JoinClassPage() {
  const navigate = useNavigate()

  const [classCode, setClassCode] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoinClass(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    // ---------------------------------------------
    // 1. CHECK CURRENT USER
    // ---------------------------------------------

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error(
        'Error getting current user:',
        userError
      )

      setMessage(
        'Something went wrong. Please try again.'
      )

      setLoading(false)
      return
    }

    if (!user) {
      setMessage(
        'You must be logged in to join a class.'
      )

      setLoading(false)
      return
    }

    // ---------------------------------------------
    // 2. CLEAN CLASS CODE
    // ---------------------------------------------

    const cleanedCode =
      classCode.trim()

    // ---------------------------------------------
    // 3. FIND CLASS
    // ---------------------------------------------

    const {
      data: classData,
      error: classError,
    } = await supabase
      .from('classes')
      .select(
        'id, class_name, class_code'
      )
      .eq(
        'class_code',
        cleanedCode
      )
      .maybeSingle()

    if (classError) {
      console.error(
        'Error finding class:',
        classError
      )

      setMessage(
        'Something went wrong while finding the class. Please try again.'
      )

      setLoading(false)
      return
    }

    if (!classData) {
      setMessage(
        'Class not found. Check the code and try again.'
      )

      setLoading(false)
      return
    }

    // ---------------------------------------------
    // 4. JOIN CLASS
    // ---------------------------------------------

    const {
      error: joinError,
    } = await supabase
      .from('class_members')
      .insert({
        class_id: classData.id,
        student_id: user.id,
      })

    if (joinError) {
      console.error(
        'Error joining class:',
        joinError
      )

      // Student already belongs to this class
      if (joinError.code === '23505') {
        setMessage(
          'You have already joined this class.'
        )
      } else {
        setMessage(
          'Could not join the class. Please try again.'
        )
      }

      setLoading(false)
      return
    }

    // ---------------------------------------------
    // 5. SUCCESS
    // ---------------------------------------------

    navigate(
      '/student/dashboard'
    )
  }

  return (
    <>
      <Navbar role="student" />

      <main className="form-page">

        <div className="form-card">

          <p className="form-eyebrow">
            JOIN A CLASS
          </p>

          <h1>
            Enter your class code
          </h1>

          <p className="form-description">
            Your tutor will give you a
            5-digit code. Enter it below
            to join their class.
          </p>


          <form
            onSubmit={handleJoinClass}
          >

            <div className="form-group">

              <label htmlFor="class-code">
                Class code
              </label>

              <input
                id="class-code"
                className="form-input class-code-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={classCode}
                onChange={(e) =>
                  setClassCode(
                    e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 5)
                  )
                }
                placeholder="48291"
                maxLength={5}
                required
              />

            </div>


            <button
              className="form-submit"
              type="submit"
              disabled={
                loading ||
                classCode.length !== 5
              }
            >
              {loading
                ? 'Joining...'
                : 'Join Class'}
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

export default JoinClassPage