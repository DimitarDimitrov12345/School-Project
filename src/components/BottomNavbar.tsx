import React, { useEffect, useState } from 'react'
import '../styles/bottomNavbar.css'

const BottomNavbar: React.FC = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <footer className={`bottom-navbar ${visible ? 'visible' : ''}`} aria-label="Bottom navigation">
      <div className="bn-inner">
        <div className="bn-links">
          <a className="bn-link" href="/privacy">Privacy</a>
          <a className="bn-link" href="mailto:contact@flashscore.example">Contact</a>
          <a className="bn-link" href="https://instagram.com/yourhandle" target="_blank" rel="noopener noreferrer">Instagram</a>
          <a className="bn-link" href="/terms">Terms</a>
        </div>
        <div className="bn-brand">© 2026 Flash Score</div>
      </div>
    </footer>
  )
}

export default BottomNavbar
