import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

import { ADMIN_DASHBOARD_PATH } from '../config/admin'
import '../styles/auth.css'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, profile } = useAuth()
  const navigate = useNavigate()

  // If already logged in, redirect to dashboard
  // TODO: Re-enable admin role check when database is working
  React.useEffect(() => {
    if (profile?.email) {
      navigate(ADMIN_DASHBOARD_PATH, { replace: true })
    }
  }, [profile, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!email || !password) {
      setError('Имейл и парола са задължителни')
      setLoading(false)
      return
    }

    // Demo mode for testing (no database setup)
    if (email === 'demo@admin.com' && password === 'demo123') {
      // Store demo session in localStorage
      localStorage.setItem('adminSession', JSON.stringify({
        email: 'demo@admin.com',
        role: 'admin',
        demoMode: true
      }))
      setLoading(false)
      navigate(ADMIN_DASHBOARD_PATH, { replace: true })
      return
    }

    const { error: err } = await signIn(email, password)
    if (err) {
      setLoading(false)
      setError(err.message || 'Неуспешен вход. Опитайте demo@admin.com / demo123')
      return
    }

    // TODO: Re-enable admin role check when database is working
    /*
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
    */

    setLoading(false)
    navigate(ADMIN_DASHBOARD_PATH, { replace: true })
  }

  return (
    <div className="auth-page admin-context">
      <div className="auth-card">
        <h1 className="auth-title">Админ</h1>
        <p className="auth-subtitle">Вход само за администратори</p>
        <div style={{ 
          background: '#e3f2fd', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '16px',
          fontSize: '13px',
          color: '#1565c0'
        }}>
          <strong>Демо данни за вход:</strong><br/>
          Имейл: <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '3px' }}>demo@admin.com</code><br/>
          Парола: <code style={{ background: '#fff', padding: '2px 4px', borderRadius: '3px' }}>demo123</code>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-label">
            Имейл
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
            Парола
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
            {loading ? 'Влизане…' : 'Вход'}
          </button>
        </form>
        <p className="auth-footer">
          Тази страница е само за администратори.
        </p>
      </div>
    </div>
  )
}
