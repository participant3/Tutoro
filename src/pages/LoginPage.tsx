import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './Auth.css'

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    setMessage('Signing in...')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
        console.error('Login error:', error)
        setMessage(error.message)
        return
      }

    const user = data.user

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError) {
      setMessage('Could not load your profile.')
      return
    }

    if (profile.role === 'tutor') {
      navigate('/tutor/dashboard')
    } else if (profile.role === 'student') {
      navigate('/student/dashboard')
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-brand">
        <div className="auth-logo">
          Tutoro<span>.</span>
        </div>
  
        <div className="auth-brand-content">
          <p className="auth-tag">LEARN • TEACH • GROW</p>
  
          <h1>
            Tutoring made
            <br />
            beautifully simple.
          </h1>
  
          <p>
            Classes, sessions and learning resources —
            organised in one place.
          </p>
        </div>
  
        <div className="auth-shapes">
          <div className="shape shape-yellow"></div>
          <div className="shape shape-lavender"></div>
          <div className="shape shape-blue"></div>
        </div>
      </section>
  
      <section className="auth-form-side">
        <div className="auth-form">
          <p className="form-eyebrow">WELCOME BACK</p>
  
          <h2>Sign in to Tutoro</h2>
  
          <p className="form-description">
            Enter your details to continue.
          </p>
  
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
  
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
  
            <div className="form-group">
              <label>Password</label>
  
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
  
            <div className="password-row">
              <span></span>
              <a href="#">Forgot password?</a>
            </div>
  
            <button
              className="form-submit"
              type="submit"
            >
              Sign In
            </button>
          </form>
  
          {message && (
            <p className="form-message">
              {message}
            </p>
          )}
  
          <p className="form-footer">
            New to Tutoro?{' '}
            <Link to="/signup">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage