import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import IdeaFormPage from './pages/IdeaFormPage'
import IdeaDetailPage from './pages/IdeaDetailPage'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ideas/new"
            element={
              <ProtectedRoute>
                <IdeaFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ideas/:id"
            element={
              <ProtectedRoute>
                <IdeaDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ideas/:id/edit"
            element={
              <ProtectedRoute>
                <IdeaFormPage />
              </ProtectedRoute>
            }
          />
          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
