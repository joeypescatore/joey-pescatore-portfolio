import { Hero } from './Hero'
import { CaseStudies } from './CaseStudies'
import { Writings } from './Writings'
import { SideProjects } from './SideProjects'
// import { FloatingNav } from './FloatingNav'
import './sections.css'
import './LandingPage.css'

type Origin = { x: number; y: number }

export function LandingPage({
  onOpenChat,
  ovidHidden = false,
}: {
  onOpenChat: (origin: Origin) => void
  ovidHidden?: boolean
}) {
  return (
    <div className="landing-page">
      <div className="landing-page-column">
        <Hero onOpenChat={onOpenChat} hidden={ovidHidden} />
        <Writings />
        <CaseStudies />
        <SideProjects />
      </div>
      {/* <FloatingNav /> */}
    </div>
  )
}
