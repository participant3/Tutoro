import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import './Auth.css'

function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'tutor'>('student')

  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password requirements
  const hasMinimumLength = password.length >= 6
  const hasNumber = /\d/.test(password)
  const hasSpecialCharacter = /[^A-Za-z0-9]/.test(password)

  const passwordIsValid =
    hasMinimumLength &&
    hasNumber &&
    hasSpecialCharacter

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()

    // Do not send an invalid password to Supabase
    if (!passwordIsValid) {
      setMessage(
        'Please make sure your password meets all the requirements.'
      )
      return
    }

    setIsSubmitting(true)
    setMessage('Creating account...')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (error) {
      console.error('Sign up error:', error)
      setMessage(error.message)
      setIsSubmitting(false)
      return
    }

    console.log(data)

    setMessage(
      'Account created! Check your email to confirm your account.'
    )

    setIsSubmitting(false)
  }

  return (
    <main className="auth-page">

      {/* LEFT SIDE */}
      <section className="auth-brand">

        <div className="auth-logo">
          Tutoro<span>.</span>
        </div>

        <div className="auth-brand-content">

          <p className="auth-tag">
            YOUR LEARNING, ORGANISED
          </p>

          <h1>
            Better tutoring
            <br />
            starts here.
          </h1>

          <p>
            A simple space for tutors and students to manage
            classes, sessions and learning together.
          </p>

        </div>

        {/* Decorative shapes */}
        <div className="auth-shapes">
          <div className="shape shape-yellow"></div>
          <div className="shape shape-lavender"></div>
          <div className="shape shape-blue"></div>
        </div>

      </section>


      {/* RIGHT SIDE */}
      <section className="auth-form-side">

        <div className="auth-form">

          <p className="form-eyebrow">
            GET STARTED
          </p>

          <h2>
            Create your account
          </h2>

          <p className="form-description">
            Tell us a little about yourself to get started.
          </p>


          <form onSubmit={handleSignUp}>

            {/* FULL NAME */}
            <div className="form-group">

              <label>
                Full name
              </label>

              <input
                className="form-input"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                required
              />

            </div>


            {/* EMAIL */}
            <div className="form-group">

              <label>
                Email
              </label>

              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />

            </div>


            {/* PASSWORD */}
            <div className="form-group">

              <label>
                Password
              </label>

              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setMessage('')
                }}
                placeholder="Create a password"
                required
              />


              {/* PASSWORD REQUIREMENTS */}
              <div className="password-requirements">

                <p className="password-requirements-title">
                  Password must contain:
                </p>

                <div
                  className={`password-requirement ${
                    hasMinimumLength ? 'valid' : ''
                  }`}
                >
                  <span>
                    {hasMinimumLength ? '✓' : '○'}
                  </span>

                  At least 6 characters
                </div>


                <div
                  className={`password-requirement ${
                    hasNumber ? 'valid' : ''
                  }`}
                >
                  <span>
                    {hasNumber ? '✓' : '○'}
                  </span>

                  At least 1 number
                </div>


                <div
                  className={`password-requirement ${
                    hasSpecialCharacter ? 'valid' : ''
                  }`}
                >
                  <span>
                    {hasSpecialCharacter ? '✓' : '○'}
                  </span>

                  At least 1 special character
                </div>

              </div>

            </div>


            {/* ROLE */}
            <div className="form-group">

              <span className="form-label">
                I am a...
              </span>

              <div className="role-options">

                <div className="role-option">

                  <input
                    type="radio"
                    id="student"
                    name="role"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                  />

                  <label htmlFor="student">
                    Student
                  </label>

                </div>


                <div className="role-option">

                  <input
                    type="radio"
                    id="tutor"
                    name="role"
                    value="tutor"
                    checked={role === 'tutor'}
                    onChange={() => setRole('tutor')}
                  />

                  <label htmlFor="tutor">
                    Tutor
                  </label>

                </div>

              </div>

            </div>


            <button
              className="form-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? 'Creating account...'
                : 'Create Account'}
            </button>

          </form>


          {message && (
            <p className="form-message">
              {message}
            </p>
          )}


          <p className="form-footer">

            Already have an account?{' '}

            <Link to="/login">
              Sign in
            </Link>

          </p>

        </div>

      </section>

    </main>
  )
}

export default SignUpPage