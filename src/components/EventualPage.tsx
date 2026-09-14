import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-2/IconArrowLeft'
import { useActiveSection } from '../hooks/useActiveSection'
import heroImage from '../assets/eventual/hero.jpg'
import solutionDemo from '../assets/eventual/solution-demo.mp4'
import newWorkflowImage from '../assets/eventual/new-workflow.jpg'
import designProcessImage from '../assets/eventual/design-process.jpg'
import segmentedControlImage from '../assets/eventual/segmented-control.jpg'
import modalImage from '../assets/eventual/modal.jpg'
import summaryCardImage from '../assets/eventual/summary-card.jpg'
import feedbackImage from '../assets/eventual/feedback.jpg'
import './PostPage.css'
import './CaseStudyPage.css'

const chapters = [
  { id: 'overview', label: 'Overview' },
  { id: 'solution', label: 'Solution' },
  { id: 'impact', label: 'Impact' },
  { id: 'early-findings', label: 'Early Findings' },
  { id: 'a-new-workflow', label: 'A New Workflow' },
  { id: 'design-process', label: 'Design Process' },
  { id: 'features', label: 'Features' },
  { id: 'feedback', label: 'Feedback' },
]

const chapterIds = chapters.map((chapter) => chapter.id)

export function EventualPage({ onBack }: { onBack: () => void }) {
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
              <div className="post-date">Eventual · 2026</div>
              <h1 className="post-title">Simplifying Complex Pricing Models</h1>
            </header>

            <img className="case-study-image" src={heroImage} alt="Eventual's Premium Lock quote flow shown across desktop and mobile" />

            <div className="case-study-meta-grid">
              <div className="case-study-meta-item">
                <div className="post-date">Role</div>
                <div className="post-paragraph">Product Designer</div>
              </div>
              <div className="case-study-meta-item">
                <div className="post-date">Timeline</div>
                <div className="post-paragraph">Apr 2026 – May 2026</div>
              </div>
              <div className="case-study-meta-item">
                <div className="post-date">Team</div>
                <div className="post-paragraph">Product Designer, Project Manager, CTO, CEO</div>
              </div>
              <div className="case-study-meta-item">
                <div className="post-date">Tools</div>
                <div className="post-paragraph">Figma, Cursor, After Effects</div>
              </div>
            </div>

            <section id="overview" className="post-section">
              <div className="case-study-section-eyebrow">Overview</div>
              <h2 className="post-section-heading">
                Users knew what they needed, but the challenge was explaining how we delivered it.
              </h2>
              <p className="post-paragraph">
                Users wanted closer thresholds instead of waiting the full three years for a payout. We created
                Relative Pricing to solve that, but it came across complicated. We needed to explain a complex
                solution like it was simple.
              </p>
            </section>

            <section id="solution" className="post-section">
              <div className="case-study-section-eyebrow">Solution</div>
              <h2 className="post-section-heading">
                A workflow that energized agents with the confidence to present the new approach.
              </h2>
              <video className="case-study-image" src={solutionDemo} loop muted autoPlay playsInline />
            </section>

            <section id="impact" className="post-section">
              <div className="case-study-section-eyebrow">Impact</div>
              <div className="case-study-stats">
                <div className="case-study-stat">
                  <span className="case-study-stat-value">77%</span>
                  <span className="post-paragraph">adoption among quotes created post-launch.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">12</span>
                  <span className="post-paragraph">days from concept to production by using AI for prototyping.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">1/2</span>
                  <span className="post-paragraph">of the flow shipped with minimal engineering input.</span>
                </div>
              </div>
            </section>

            <section id="early-findings" className="post-section">
              <div className="case-study-section-eyebrow">Early Findings</div>
              <h2 className="post-section-heading">Users needed to see the difference, not just read about it.</h2>
              <p className="post-paragraph">
                We'd already proven that interactive visuals worked for Fixed pricing. So we applied the same logic
                to help users compare Fixed vs Relative.
              </p>
              <div className="post-paragraph">Pain Points</div>
              <ul className="case-study-list">
                <li>A three-year payout threshold felt too far away for homeowners to commit to.</li>
                <li>Pricing model was hard to explain without visual references.</li>
                <li>Agents needed a way to show homeowners how year-by-year thresholds worked.</li>
              </ul>
            </section>

            <section id="a-new-workflow" className="post-section">
              <div className="case-study-section-eyebrow">A New Workflow</div>
              <h2 className="post-section-heading">
                How can we introduce a new key feature in less than 2 weeks?
              </h2>
              <p className="post-paragraph">
                We needed to ship fast. Instead of traditional handoffs, we worked in parallel. Engineering built
                the backend, I built the frontend in code. We reviewed together at the end instead of blocking each
                other.
              </p>
              <img className="case-study-image" src={newWorkflowImage} alt="Diagram comparing the old sequential design-to-ship workflow with the new parallel one" />

              <div className="case-study-feature">
                <h3 className="post-section-heading">Pixel Perfection Doesn't Require Traditional Handoffs</h3>
                <p className="post-paragraph">
                  Working in the same codebase eliminated the annotation back and forth. No UI handoff meant no
                  delays, I could build every interaction state and edge case exactly as needed, saving the team
                  hours and sometimes days.
                </p>
              </div>
            </section>

            <section id="design-process" className="post-section">
              <div className="case-study-section-eyebrow">Design Process</div>
              <h2 className="post-section-heading">
                Blending Figma and Cursor to streamline the design process.
              </h2>
              <p className="post-paragraph">
                Since this screen was already built and in our Figma, it was easy to jump right in the codebase and
                get to work without needing to create new components.
              </p>
              <img className="case-study-image" src={designProcessImage} alt="Quote creation screen prototyped directly in code" />
            </section>

            <section id="features" className="post-section">
              <div className="case-study-section-eyebrow">Features</div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">Segmented Control</h3>
                <p className="post-paragraph">
                  We wanted to continue using our segmented options to stay consistent with the rest of the page,
                  but we also needed the new Relative option to standout. The 'New' badge breaks up the
                  subconscious navigation and prompts users to look into the feature.
                </p>
                <p className="post-paragraph">
                  I chose to keep 'Fixed' as the default even though we wanted mass adoption, because making
                  Relative default could lead to users aimlessly clicking through and making errors they never knew
                  they made. The descriptive copy inside the buttons was a team preference. In retrospect, I'd
                  remove it entirely or suggest we shorten it as the modal already provides detailed comparison and
                  the buttons should stay scannable.
                </p>
                <img className="case-study-image" src={segmentedControlImage} alt="Segmented control letting agents switch between Fixed and Relative payout pricing" />
              </div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">Modal</h3>
                <p className="post-paragraph">
                  Initially the idea was to have this compare options visualization live inside a tooltip but I
                  ended up moving it over to a modal instead. But why would we choose the modal instead of tooltip?
                </p>
                <ul className="case-study-list">
                  <li>
                    Cognitive focus - Comparing the two pricing models requires the users full attention. Keeping it
                    as a tooltip would split the focus between the comparison and the rest of the UI, but utilizing
                    a modal eliminates distractions.
                  </li>
                  <li>
                    Intentional friction - By blocking the flow momentarily, we can signal to users the importance
                    of the comparison.
                  </li>
                </ul>
                <img className="case-study-image" src={modalImage} alt="Modal comparing Fixed and Relative payout threshold options" />
              </div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">Summary Card</h3>
                <p className="post-paragraph">
                  The summary card dynamically shows the payout threshold as a dollar amount or percentage based on
                  the user's choice. For Relative pricing, displaying '+10%' works but could be clearer. In the next
                  iteration, I'd change it to '10% above annual premium' so the logic is immediately visible without
                  needing to cross-reference the comparison modal.
                </p>
                <img className="case-study-image" src={summaryCardImage} alt="Quote summary card showing the selected payout threshold" />
              </div>
            </section>

            <section id="feedback" className="post-section">
              <div className="case-study-section-eyebrow">Feedback</div>
              <img className="case-study-image" src={feedbackImage} alt="Team Slack messages sharing early positive feedback on the Relative pricing launch" />
            </section>
          </article>
        </main>
      </div>
    </div>
  )
}
