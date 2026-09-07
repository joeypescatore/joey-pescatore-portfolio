import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconArrowLeft'
import { useActiveSection } from '../hooks/useActiveSection'
import iconContrast from '../assets/hhw/icon-contrast.png'
import iconFlow from '../assets/hhw/icon-flow.png'
import iconMobile from '../assets/hhw/icon-mobile.png'
import iconDesignSystem from '../assets/hhw/icon-design-system.png'
import iconHierarchy from '../assets/hhw/icon-hierarchy.png'
import iconImagery from '../assets/hhw/icon-imagery.png'
import iconInfo from '../assets/hhw/icon-info.png'
import './PostPage.css'
import './CaseStudyPage.css'

const chapters = [
  { id: 'overview', label: 'Overview' },
  { id: 'problems', label: 'Problems & Opportunities' },
  { id: 'solutions', label: 'Solutions' },
  { id: 'results', label: 'Results' },
]

const chapterIds = chapters.map((chapter) => chapter.id)

export function HHWPage({ onBack }: { onBack: () => void }) {
  const activeId = useActiveSection(chapterIds)

  return (
    <div className="post-page">
      <div className="post-content">
        <aside className="post-aside">
          <button type="button" className="post-back-button" onClick={onBack}>
            <IconArrowLeft size={16} />
            Back
          </button>

          <nav className="post-chapters">
            <ul className="post-chapters-list">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <a href={`#${chapter.id}`} className={activeId === chapter.id ? 'is-active' : undefined}>
                    {chapter.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="post-main">
          <article className="post-article">
            <header className="post-header">
              <div className="post-date">HHW · 2025</div>
              <h1 className="post-title">Redesigning Happy Health &amp; Wellness' Homepage</h1>
            </header>

            <section id="overview" className="post-section">
              <div className="case-study-section-eyebrow">Overview</div>
              <p className="post-paragraph">
                The current website was hard to understand what it is we do, where to go for new patients, and
                didn't follow WCAG guidelines. The goal was to streamline all user tasks to 3 clicks.
              </p>
            </section>

            <section id="problems" className="post-section">
              <div className="case-study-section-eyebrow">Problems &amp; Opportunities</div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconContrast} alt="" />
                <h3 className="post-section-heading">Poor Color Contrast</h3>
                <p className="post-paragraph">
                  The site failed to meet WCAG standards, which made reading difficult for many users. Especially
                  given our target audience was an older demographic (50+) with health issues, this was a huge
                  issue.
                </p>
              </div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconFlow} alt="" />
                <h3 className="post-section-heading">Confusing Flow</h3>
                <p className="post-paragraph">
                  Clutter caused patients, new and returning, to get lost and frustrated. The goal was to make it
                  easier to request an appointment in just 3 clicks.
                </p>
              </div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconMobile} alt="" />
                <h3 className="post-section-heading">Lack of Mobile Optimization</h3>
                <p className="post-paragraph">
                  80% of the visitors to our website were coming from mobile, yet the mobile site was broken on
                  multiple pages - losing trust with non-tech savvy users.
                </p>
              </div>
            </section>

            <section id="solutions" className="post-section">
              <div className="case-study-section-eyebrow">Solutions</div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconDesignSystem} alt="" />
                <h3 className="post-section-heading">Updated Design System</h3>
                <p className="post-paragraph">
                  Introduced new colors to improve WCAG requirements, as well as allow for a brighter and more
                  inviting starting point.
                </p>
              </div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconHierarchy} alt="" />
                <h3 className="post-section-heading">Simple, Clear Hierarchy</h3>
                <p className="post-paragraph">
                  Legibility for older users is much better with dark text on a white background, so I got rid of
                  text on top of images. There's now two clear CTAs, one for new users to find a clinic in their
                  area, and one to request an appointment for existing patients.
                </p>
              </div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconImagery} alt="" />
                <h3 className="post-section-heading">Explanation Through Imagery</h3>
                <p className="post-paragraph">
                  Replaced generic "health" stock images, with pictures directly showing the type of preventative
                  care provided.
                </p>
              </div>

              <div className="case-study-feature">
                <img className="case-study-feature-icon" src={iconInfo} alt="" />
                <h3 className="post-section-heading">Information First</h3>
                <p className="post-paragraph">
                  Interactive maps, phone number, email and other useful information was made front and center for
                  every location's landing page.
                </p>
              </div>
            </section>

            <section id="results" className="post-section">
              <div className="case-study-section-eyebrow">Results</div>
              <div className="case-study-stats case-study-stats--2col">
                <div className="case-study-stat">
                  <span className="case-study-stat-value">8.8%</span>
                  <span className="post-paragraph">increase in appointment requests.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">2.3s</span>
                  <span className="post-paragraph">load time, down from 7.2s.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">9.5%</span>
                  <span className="post-paragraph">decrease in bounce rate.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">14.21</span>
                  <span className="post-paragraph">WCAG accessibility rating, up from 1.83.</span>
                </div>
              </div>
            </section>
          </article>
        </main>
      </div>
    </div>
  )
}
