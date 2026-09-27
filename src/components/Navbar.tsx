import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type NavbarProps = {
  role: 'tutor' | 'student'
}

function Navbar({ role }: NavbarProps) {
  const navigate = useNavigate()

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout error:', error)
      return
    }

    navigate('/login')
  }

  return (
    <nav className="navbar">

      <Link
        to={`/${role}/dashboard`}
        className="navbar-logo"
      >
        Tutoro<span>.</span>
      </Link>

      <div className="navbar-links">

        <Link to={`/${role}/dashboard`}>
          Home
        </Link>

        <Link to={`/${role}/dashboard`}>
          Classes
        </Link>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Log out
        </button>

      </div>

    </nav>
  )
}

export default Navbar