import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import '../styles/bottomNavbar.css'

const BottomNavbar: React.FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <footer className={`bottom-navbar ${visible ? 'visible' : 'hidden'}`} aria-label="Bottom navigation">
      <div className="bn-inner">
        <div className="bn-links">
          <Link className="bn-link" to="/privacy">Поверителност</Link>
          <a className="bn-link" href="mailto:contact@finalscore.bg">Контакт</a>
          <a className="bn-link" href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer">Instagram</a>
          <Link className="bn-link" to="/terms">Условия</Link>
        </div>
        <div className="bn-brand">© 2026 FinalScore</div>
      </div>
    </footer>
  )
}

export default BottomNavbar
