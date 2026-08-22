import { Hero } from './Hero'
import { Experience } from './Experience'
import { CaseStudies } from './CaseStudies'
import { Writings } from './Writings'
import { SideProjects } from './SideProjects'
import { FloatingNav } from './FloatingNav'
import './sections.css'
import './LandingPage.css'

export function LandingPage() {
  return (
    <div className="landing-page">
      <div className="landing-page-column">
        <Hero />
        <Experience />
        <Writings />
        <CaseStudies />
        <SideProjects />
      </div>
      <FloatingNav />
    </div>
  )
}
