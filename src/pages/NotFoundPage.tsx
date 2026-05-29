import { Link } from 'react-router-dom'
import '../styles/notFound.css'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>Страницата не е намерена</h1>
        <p className="not-found-text">Адресът, който отвори, не съществува или е преместен.</p>

        <div className="not-found-actions">
          <Link to="/" className="not-found-btn primary">Към началото</Link>
          <Link to="/predictions-game" className="not-found-btn secondary">Към прогнозите</Link>
        </div>
      </div>
    </div>
  )
}
