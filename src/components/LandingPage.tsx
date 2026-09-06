import { Hero } from './Hero'
import { CaseStudies } from './CaseStudies'
import { Writings } from './Writings'
import { SideProjects } from './SideProjects'
// import { FloatingNav } from './FloatingNav'
import './sections.css'
import './LandingPage.css'

export function LandingPage({
  onPlay,
  onOpenPost,
}: {
  onPlay: () => void
  onOpenPost: (slug: string) => void
}) {
  return (
    <div className="landing-page">
      <div className="landing-page-column">
        <Hero onPlay={onPlay} />
        <Writings onOpenPost={onOpenPost} />
        <CaseStudies />
        <SideProjects />
      </div>
      {/* <FloatingNav /> */}
    </div>
  )
}
