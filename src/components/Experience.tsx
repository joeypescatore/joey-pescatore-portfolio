import { useState } from 'react'
import { experience } from '../data/portfolio'
import './Experience.css'

export function Experience() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="experience">
      <div className="section-label">Experience</div>
      <div
        className={`experience-rows${hoveredIndex !== null ? ' is-hovering' : ''}`}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {experience.map((item, index) => (
          <div
            key={item.company}
            className={`experience-row${hoveredIndex === index ? ' is-active' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <div className="experience-company">
              {item.company}
              <span className="experience-year">{item.startYear}</span>
            </div>
            <div className="experience-right">
              <div className="experience-title">{item.title}</div>
              <span className="experience-arrow">&#8594;</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
