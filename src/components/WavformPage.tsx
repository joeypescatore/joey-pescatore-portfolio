import { IconArrowLeft } from '@central-icons-react/round-outlined-radius-3-stroke-2/IconArrowLeft'
import { useActiveSection } from '../hooks/useActiveSection'
import heroDemo from '../assets/wavform/hero-demo.mp4'
import solutionSpotify from '../assets/wavform/solution-spotify.mp4'
import solutionReviews from '../assets/wavform/solution-reviews.mp4'
import solutionStats from '../assets/wavform/solution-stats.mp4'
import marketLandscape1 from '../assets/wavform/market-landscape-1.jpg'
import marketLandscape2 from '../assets/wavform/market-landscape-2.jpg'
import designProcessImage from '../assets/wavform/design-process.jpg'
import homepageImage from '../assets/wavform/homepage.jpg'
import currentlyListeningImage from '../assets/wavform/currently-listening.jpg'
import userProfileImage from '../assets/wavform/user-profile.jpg'
import finalDesignsImage from '../assets/wavform/final-designs.jpg'
import './PostPage.css'
import './CaseStudyPage.css'

const chapters = [
  { id: 'overview', label: 'Overview' },
  { id: 'solution', label: 'Solution' },
  { id: 'impact', label: 'Impact' },
  { id: 'early-findings', label: 'Early Findings' },
  { id: 'market-landscape', label: 'Market Landscape' },
  { id: 'design-process', label: 'Design Process' },
  { id: 'features', label: 'Features' },
  { id: 'final-designs', label: 'Final Designs' },
]

const chapterIds = chapters.map((chapter) => chapter.id)

export function WavformPage({ onBack }: { onBack: () => void }) {
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
              <div className="post-date">Wavform · 2025</div>
              <h1 className="post-title">Reinventing How Fans Find & Review Music</h1>
            </header>

            <video className="case-study-image" src={heroDemo} loop muted autoPlay playsInline />

            <div className="case-study-meta-grid">
              <div className="case-study-meta-item">
                <div className="post-date">Role</div>
                <div className="post-paragraph">Founder, Product Designer</div>
              </div>
              <div className="case-study-meta-item">
                <div className="post-date">Timeline</div>
                <div className="post-paragraph">Apr 2024 – Jan 2026</div>
              </div>
              <div className="case-study-meta-item">
                <div className="post-date">Team</div>
                <div className="post-paragraph">Product Designer, Engineer</div>
              </div>
              <div className="case-study-meta-item">
                <div className="post-date">Tools</div>
                <div className="post-paragraph">Figma, After Effects</div>
              </div>
            </div>

            <section id="overview" className="post-section">
              <div className="case-study-section-eyebrow">Overview</div>
              <h2 className="post-section-heading">
                With the rise of tracking apps, why is there no music equivalent?
              </h2>
              <p className="post-paragraph">
                People love tracking and sharing their hobbies – runs on Strava, restaurants on Beli, films on
                Letterboxd. But with 1.1 billion people streaming music, there was no user-friendly equivalent for
                listening. That gap was the starting point for Wavform.
              </p>
            </section>

            <section id="solution" className="post-section">
              <div className="case-study-section-eyebrow">Solution</div>
              <h2 className="post-section-heading">
                Wavform: A social platform for rating, reviewing, and discovering music with friends.
              </h2>

              <video
                className="case-study-image case-study-image--square"
                src={solutionSpotify}
                loop
                muted
                autoPlay
                playsInline
              />
              <p className="case-study-video-caption">The only music tracking app that connects right to your Spotify.</p>

              <video
                className="case-study-image case-study-image--square"
                src={solutionReviews}
                loop
                muted
                autoPlay
                playsInline
              />
              <p className="case-study-video-caption">Write reviews and share your thoughts on albums/songs.</p>

              <video
                className="case-study-image case-study-image--square"
                src={solutionStats}
                loop
                muted
                autoPlay
                playsInline
              />
              <p className="case-study-video-caption">Track your listening habits with detailed stats.</p>
            </section>

            <section id="impact" className="post-section">
              <div className="case-study-section-eyebrow">Impact</div>
              <div className="case-study-stats">
                <div className="case-study-stat">
                  <span className="case-study-stat-value">#134</span>
                  <span className="post-paragraph">ranked on the iOS App Store music category charts.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">1,500+</span>
                  <span className="post-paragraph">total users in 2 months post-launch.</span>
                </div>
                <div className="case-study-stat">
                  <span className="case-study-stat-value">22%</span>
                  <span className="post-paragraph">week 1 retention</span>
                </div>
              </div>
            </section>

            <section id="early-findings" className="post-section">
              <div className="case-study-section-eyebrow">Early Findings</div>
              <h2 className="post-section-heading">
                There's no convenient or centralized location for fans to review & share what they're listening to.
              </h2>
              <p className="post-paragraph">
                Existing options are clunky and not built for convenience. After talking to users (and from my own
                experience) speed is everything. If it's not instant, it can't happen because unlike a restaurant or
                movie you're usually onto the next song or album in minutes. And while Twitter and Reddit are where
                fans naturally share their thoughts, they weren't built strictly for it, making genuine music takes
                hard to find.
              </p>

              <div className="post-paragraph">Pain Points</div>
              <ul className="case-study-list">
                <li>Existing tools aren't built for mobile</li>
                <li>No quick way to leave a review</li>
                <li>Music blogs offer quality, not community</li>
              </ul>

              <div className="post-paragraph">Key Insight</div>
              <h3 className="post-section-heading">
                The average song is ~3mins. Rating it needs to be just as fast.
              </h3>
            </section>

            <section id="market-landscape" className="post-section">
              <div className="case-study-section-eyebrow">Market Landscape</div>
              <img className="case-study-image" src={marketLandscape1} alt="Quadrant chart comparing Wavform to Pitchfork, AOTY, RYM, and Musicboard on complexity and community" />

              <div className="case-study-feature">
                <h3 className="post-section-heading">Pitchfork (Traditional Music Blogs)</h3>
                <p className="post-paragraph">
                  Music blogs have been around forever and are easy to find, but you're getting one person's take.
                  Monthly traffic is down 48.3% across the three biggest blogs showing that audiences are moving on,
                  and readers increasingly disagree with the singular critical voice. Coverage is also limited to
                  whatever a writer chose to review, so if no one wrote about it, it doesn't exist on the platform.
                </p>
              </div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">AOTY/RYM</h3>
                <p className="post-paragraph">
                  Allows for user-written reviews and functions more like a social network, but the web-only
                  experience creates too much friction for casual users.
                </p>
              </div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">Musicboard</h3>
                <p className="post-paragraph">
                  The closest competitor. Uses streaming service data for an unlimited database and tracks personal
                  analytics but no connection to the users library for logging. Built by a solo developer back in
                  2020 who has since been transparent about shifting his focus elsewhere, leaving the platform down
                  for weeks at a time and filled with bots.
                </p>
              </div>

              <img className="case-study-image" src={marketLandscape2} alt="Screenshots of competing music review platforms Pitchfork and Musicboard" />
            </section>

            <section id="design-process" className="post-section">
              <div className="case-study-section-eyebrow">Design Process</div>
              <h2 className="post-section-heading">How can we take the V1 of Wavform to a product people love?</h2>
              <p className="post-paragraph">
                I had already designed a rough v1 of the app because we needed to get the app submitted for our
                Spotify integration application, so the goal was to take this idea and develop it into a product
                ready for market.
              </p>
              <img className="case-study-image" src={designProcessImage} alt="Wavform quote generation loading screen shown on a laptop mockup" />
            </section>

            <section id="features" className="post-section">
              <div className="case-study-section-eyebrow">Features</div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">Homepage</h3>
                <p className="post-paragraph">
                  Probably the biggest departure from v1 due to horizontal scrolling categories becoming a vertical
                  infinite scroll. This gave written reviews the real estate they deserve, while ratings live in a
                  horizontal strip at the top, similar to an Instagram Stories layout. The redesign also solved a
                  retention problem, over 50% of users weren't following anyone, so we introduced an Everyone tab,
                  giving new users content to browse from day one regardless of who they follow.
                </p>
                <img className="case-study-image" src={homepageImage} alt="Redesigned Wavform homepage feed with a vertical scroll and an Everyone tab" />
              </div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">Currently Listening To</h3>
                <p className="post-paragraph">
                  The core design challenge was making rating feel effortless. In v1, the Now Playing card only
                  lived on the homepage. So if you were anywhere else in the app, you had to navigate back just to
                  leave a rating. The fix was simple: move it into the navigation bar, so no matter where you are,
                  you're always one tap away from rating whatever's playing.
                </p>
                <img className="case-study-image" src={currentlyListeningImage} alt="Currently Listening To rating control moved into the navigation bar" />
              </div>

              <div className="case-study-feature">
                <h3 className="post-section-heading">User Profile</h3>
                <p className="post-paragraph">
                  The goal here wasn't to just build something functional, but to turn it into a canvas. Something
                  users would actually want to share, so the redesign focused on hierarchy and giving people a
                  better way to showcase their favorites and recent activity.
                </p>
                <img className="case-study-image" src={userProfileImage} alt="Redesigned Wavform user profile showcasing favorites and recent activity" />
              </div>
            </section>

            <section id="final-designs" className="post-section">
              <div className="case-study-section-eyebrow">Final Designs</div>
              <img className="case-study-image case-study-image--portrait" src={finalDesignsImage} alt="Grid of final Wavform screen designs, including sign in, stats, and settings" />
            </section>
          </article>
        </main>
      </div>
    </div>
  )
}
