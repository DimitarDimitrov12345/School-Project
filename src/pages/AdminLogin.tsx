import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { ADMIN_DASHBOARD_PATH } from '../config/admin'
import '../styles/auth.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()

  // If already logged in as admin, redirect to dashboard
  React.useEffect(() => {
    if (profile?.role === 'admin') {
      navigate(ADMIN_DASHBOARD_PATH, { replace: true })
    }
  }, [profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(email, password)
    if (err) {
      setLoading(false)
      setError(err.message || 'Failed to sign in')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    setLoading(false)
    if (profileRow?.role !== 'admin') {
      setError('Access denied. This area is for administrators only.')
      await supabase.auth.signOut()
      return
    }
    navigate(ADMIN_DASHBOARD_PATH, { replace: true })
  }

  return (
    <div className="auth-page admin-context">
      <div className="auth-card">
        <h1 className="auth-title">Admin</h1>
        <p className="auth-subtitle">Administrator sign in only</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-label">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
          </label>
          <label className="auth-label">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="auth-footer">
          Not an admin. Do not link this page from the public site.
        </p>
      </div>
    </div>
  )
}
