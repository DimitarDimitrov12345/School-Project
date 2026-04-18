import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/auth.css'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await signIn(identifier, password)
    setLoading(false)
    if (err) {
      setError(err.message || 'Failed to sign in')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="auth-page" onClick={() => navigate('/')} role="dialog" aria-modal="true">
      <div className="auth-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="auth-close-btn"
          onClick={() => navigate('/')}
          aria-label="Close"
        >
          ✕
        </button>
        <h1 className="auth-title">Вход</h1>
        <p className="auth-subtitle">Влезте в акаунта си</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <label className="auth-label">
            Имейл или потребителско име
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="auth-input"
              placeholder="вашият@имейл.com или потр. име"
              required
              autoComplete="username"
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
          Нямате акаунт? <Link to="/signup">Регистрация</Link>
        </p>
      </div>
    </div>
  )
}
