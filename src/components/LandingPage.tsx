import { Hero } from './Hero'
import type { SpritePhase } from './Sprite'
import { CaseStudies } from './CaseStudies'
import { Writings } from './Writings'
import { SideProjects } from './SideProjects'
// import { FloatingNav } from './FloatingNav'
import './sections.css'
import './LandingPage.css'

export function LandingPage({
  onOpenChat,
  spritePhase = 'visible',
}: {
  onOpenChat: () => void
  spritePhase?: SpritePhase
}) {
  return (
    <div className="landing-page">
      <div className="landing-page-column">
        <Hero onOpenChat={onOpenChat} spritePhase={spritePhase} />
        <Writings />
        <CaseStudies />
        <SideProjects />
      </div>
      {/* <FloatingNav /> */}
    </div>
  )
}
