import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'

function CreateClassPage() {
  const navigate = useNavigate()

  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  function generateClassCode() {
    return Math.floor(10000 + Math.random() * 90000).toString()
  }

  async function handleCreateClass(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)
    setMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage('You must be logged in.')
      setLoading(false)
      return
    }

    const classCode = generateClassCode()

    const { error } = await supabase
      .from('classes')
      .insert({
        tutor_id: user.id,
        class_name: className,
        subject: subject,
        class_code: classCode,
      })

    if (error) {
      console.error(error)
      setMessage(error.message)
      setLoading(false)
      return
    }

    navigate('/tutor/dashboard')
  }

  return (
    <>
      <Navbar role="tutor" />
  
      <main className="form-page">
        <div className="form-card">
          <p className="form-eyebrow">
            NEW CLASS
          </p>
  
          <h1>Create a class</h1>
  
          <p className="form-description">
            Set up your class. You'll receive a unique code
            that students can use to join.
          </p>
  
          <form onSubmit={handleCreateClass}>
            <div className="form-group">
              <label>Class name</label>
  
              <input
                className="form-input"
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Grade 10 Mathematics"
                required
              />
            </div>
  
            <div className="form-group">
              <label>Subject</label>
  
              <input
                className="form-input"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics"
                required
              />
            </div>
  
            <button
              className="form-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Class'}
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

export default CreateClassPage