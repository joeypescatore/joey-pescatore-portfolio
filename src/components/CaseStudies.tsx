import { caseStudies } from '../data/portfolio'
import { useCursorPreview } from '../hooks/useCursorPreview'
import './CaseStudies.css'

export function CaseStudies() {
  const { hoveredIndex, setHoveredIndex, previewX, previewY, handleMouseMove, handleMouseLeave } = useCursorPreview({
    width: 200,
    height: 130,
  })

  return (
    <section id="case-studies" className="case-studies">
      <div className="section-label">Projects</div>

      <div
        className={`case-studies-list${hoveredIndex !== null ? ' is-hovering' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {caseStudies.map((item, index) => (
          <a
            key={item.title}
            href={item.href}
            className={`case-study-row${hoveredIndex === index ? ' is-active' : ''}`}
            onMouseEnter={() => setHoveredIndex(index)}
          >
            <div className="case-study-title">{item.title}</div>
            <div className="case-study-right">
              <div className="case-study-company">{item.company}</div>
              <span className="case-study-arrow">&#8594;</span>
            </div>
          </a>
        ))}
      </div>

      <div
        className={`case-study-preview${hoveredIndex !== null ? ' is-visible' : ''}`}
        style={{ left: previewX, top: previewY }}
      >
        {caseStudies.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt=""
            className={`case-study-preview-image${hoveredIndex === index ? ' is-active' : ''}`}
          />
        ))}
      </div>
    </section>
  )
}
