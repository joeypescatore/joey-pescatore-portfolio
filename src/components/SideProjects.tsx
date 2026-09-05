import { sideProjects } from '../data/portfolio'
import { useCursorPreview } from '../hooks/useCursorPreview'
import { staggerDelay } from '../utils/stagger'
import './SideProjects.css'

export function SideProjects() {
  const { hoveredIndex, setHoveredIndex, previewX, previewY, handleMouseMove, handleMouseLeave } = useCursorPreview({
    width: 200,
    height: 130,
  })

  return (
    <section id="side-projects" className="side-projects">
      <div className="side-projects-content stagger-in" style={staggerDelay(6)}>
        <div className="section-label">Fun</div>

        <div
          className={`side-projects-list${hoveredIndex !== null ? ' is-hovering' : ''}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {sideProjects.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`side-project-row${hoveredIndex === index ? ' is-active' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
            >
              <div className="side-project-title">{item.title}</div>
              <div className="side-project-right">
                <div className="side-project-description">{item.description}</div>
                <span className="side-project-arrow">&#8594;</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div
        className={`side-project-preview${hoveredIndex !== null ? ' is-visible' : ''}`}
        style={{ left: previewX, top: previewY }}
      >
        {sideProjects.map((item, index) => (
          <img
            key={item.title}
            src={item.image}
            alt=""
            className={`side-project-preview-image${hoveredIndex === index ? ' is-active' : ''}`}
          />
        ))}
      </div>
    </section>
  )
}
