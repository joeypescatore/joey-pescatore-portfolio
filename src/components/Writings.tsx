import { useState } from 'react'
import { writings } from '../data/portfolio'
import { staggerDelay } from '../utils/stagger'
import './Writings.css'

export function Writings({ onOpenPost }: { onOpenPost: (slug: string) => void }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="writings stagger-in" style={staggerDelay(4)}>
      <div className="section-label">Writings</div>
      <div
        className={`writings-list${hoveredIndex !== null ? ' is-hovering' : ''}`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {writings.map((item, index) =>
          item.comingSoon ? (
            <div key={item.title} className="writing-row is-disabled">
              <div className="writing-left">
                <span className="writing-title">{item.title}</span>
              </div>
              <div className="writing-right">
                <span className="writing-date">{item.date}</span>
              </div>
            </div>
          ) : (
            <button
              key={item.title}
              type="button"
              className={`writing-row${hoveredIndex === index ? ' is-active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onClick={() => item.slug && onOpenPost(item.slug)}
            >
              <div className="writing-left">
                <span className="writing-title">{item.title}</span>
                {item.badge && <span className="writing-badge">{item.badge}</span>}
              </div>
              <div className="writing-right">
                <span className="writing-date">{item.date}</span>
                <span className="writing-arrow">&#8594;</span>
              </div>
            </button>
          ),
        )}
      </div>
    </section>
  )
}
