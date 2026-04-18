import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ADMIN_LOGIN_PATH } from '../config/admin'

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  // Check for demo mode session
  const demoSession = localStorage.getItem('adminSession')
  const isDemoMode = demoSession ? JSON.parse(demoSession).demoMode : false

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  // Allow if authenticated admin OR in demo mode
  if (profile?.role !== 'admin' && !isDemoMode) {
    return <Navigate to={ADMIN_LOGIN_PATH} state={{ from: location }} replace />
  }

  return <>{children}</>
}
