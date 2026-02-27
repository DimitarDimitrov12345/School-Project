import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ADMIN_LOGIN_PATH } from '../config/admin'

export default function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading…</p>
        </div>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    return <Navigate to={ADMIN_LOGIN_PATH} state={{ from: location }} replace />
  }

  return <>{children}</>
}
