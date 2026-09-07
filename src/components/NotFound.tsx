import { Link } from 'react-router-dom'
import './NotFound.css'

export function NotFound() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <div className="not-found-eyebrow">404</div>
        <h1 className="not-found-title">This page doesn't exist.</h1>
        <Link className="not-found-link" to="/">
          Back to the homepage
        </Link>
      </div>
    </div>
  )
}
