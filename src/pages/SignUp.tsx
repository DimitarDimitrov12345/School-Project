import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import '../styles/auth.css'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
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
    setMessage('')
    if (password !== confirmPassword) {
      setError('Паролите не съвпадат')
      return
    }
    if (password.length < 6) {
      setError('Паролата трябва да е поне 6 символа')
      return
    }
    setLoading(true)
    const { error: err } = await signUp(email, password, username, 'user')
    setLoading(false)
    if (err) {
      setError(err.message || 'Failed to sign up')
      return
    }
    setMessage('Проверете имейла си за потвърждение, след което влезте.')
    setTimeout(() => navigate('/login', { replace: true }), 2000)
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
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Създайте акаунт</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-message">{message}</div>}
          <label className="auth-label">
            Потребителско име
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="auth-input"
              placeholder="изберете потребителско име"
              required
              minLength={3}
              maxLength={32}
              autoComplete="username"
            />
          </label>
          <label className="auth-label">
            Имейл
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              placeholder="вашият@имейл.com"
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
              placeholder="Поне 6 символа"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <label className="auth-label">
            Потвърди паролата
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              placeholder="••••••••"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Създаване…' : 'Регистрация'}
          </button>
        </form>
        <p className="auth-footer">
          Вече имате акаунт? <Link to="/login">Вход</Link>
        </p>
      </div>
    </div>
  )
}
