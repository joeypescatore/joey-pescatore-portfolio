import { useState } from 'react'
import { Link } from 'react-router-dom'
import { writings } from '../data/portfolio'
import { staggerDelay } from '../utils/stagger'
import './Writings.css'

export function Writings() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="writings stagger-in" style={staggerDelay(4)}>
      <div className="section-label">Writings</div>
      <div
        className={`writings-list${hoveredIndex !== null ? ' is-hovering' : ''}`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {writings.map((item, index) =>
          item.comingSoon || !item.slug ? (
            <div key={item.title} className="writing-row is-disabled">
              <div className="writing-left">
                <span className="writing-title">{item.title}</span>
              </div>
              <div className="writing-right">
                <span className="writing-date">{item.date}</span>
              </div>
            </div>
          ) : (
            <Link
              key={item.title}
              to={`/writing/${item.slug}`}
              className={`writing-row${hoveredIndex === index ? ' is-active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <div className="writing-left">
                <span className="writing-title">{item.title}</span>
                {item.badge && <span className="writing-badge">{item.badge}</span>}
              </div>
              <div className="writing-right">
                <span className="writing-date">{item.date}</span>
                <span className="writing-arrow">&#8594;</span>
              </div>
            </Link>
          ),
        )}
      </div>
    </section>
  )
}
