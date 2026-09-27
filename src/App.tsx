import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import TutorDashboard from './pages/TutorDashboard'
import StudentDashboard from './pages/StudentDashboard'
import CreateClassPage from './pages/CreateClassPage'
import JoinClassPage from './pages/JoinClassPage'
import TutorClassPage from './pages/TutorClassPage'
import CreateSessionPage from './pages/CreateSessionPage'
import StudentClassPage from './pages/StudentClassPage'
import EditSessionPage from './pages/EditSessionPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        <Route path="/tutor/dashboard" element={
              <ProtectedRoute requiredRole="tutor">
                <TutorDashboard />
              </ProtectedRoute>
            }
          />

        <Route path="/student/dashboard" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/tutor/classes/create" element={
            <ProtectedRoute requiredRole="tutor">
              <CreateClassPage />
            </ProtectedRoute>
          }
        />

        

      <Route
        path="/tutor/classes/:classId/sessions/create"
        element={
          <ProtectedRoute requiredRole="tutor">
            <CreateSessionPage />
          </ProtectedRoute>
        }
      />

<Route
  path="/tutor/classes/:classId/sessions/:sessionId/edit"
  element={
    <ProtectedRoute requiredRole="tutor">
      <EditSessionPage />
    </ProtectedRoute>
  }
/>

<Route
  path="/student/classes/:classId"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentClassPage />
    </ProtectedRoute>
  }
/>

        <Route
          path="/student/classes/join"
          element={
            <ProtectedRoute requiredRole="student">
              <JoinClassPage />
            </ProtectedRoute>
          }
        />


<Route
  path="/tutor/classes/:classId"
  element={
    <ProtectedRoute requiredRole="tutor">
      <TutorClassPage />
    </ProtectedRoute>
  }
/>

         </Routes>
    </BrowserRouter>
  )
}

export default App