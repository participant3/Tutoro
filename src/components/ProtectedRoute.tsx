import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type ProtectedRouteProps = {
  children: React.ReactNode
  requiredRole: 'student' | 'tutor'
}

function ProtectedRoute({
  children,
  requiredRole,
}: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      setIsAuthenticated(true)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile) {
        setRole(profile.role)
      }

      setLoading(false)
    }

    checkUser()
  }, [])

  if (loading) {
    return <p>Loading...</p>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (role !== requiredRole) {
    return <Navigate to={`/${role}/dashboard`} replace />
  }

  return children
}

export default ProtectedRoute