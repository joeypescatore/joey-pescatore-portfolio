import { Hero } from './Hero'
import { CaseStudies } from './CaseStudies'
import { Writings } from './Writings'
import { SideProjects } from './SideProjects'
import { FloatingNav } from './FloatingNav'
import './sections.css'
import './LandingPage.css'

export function LandingPage({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="landing-page">
      <div className="landing-page-column">
        <Hero onPlay={onPlay} />
        <Writings />
        <CaseStudies />
        <SideProjects />
      </div>
      <FloatingNav />
    </div>
  )
}
