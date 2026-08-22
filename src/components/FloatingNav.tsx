import { HomeIcon, ProjectsIcon, WritingsIcon, FunIcon } from './menuIcons'
import './FloatingNav.css'

type NavItem = {
  id: string
  label: string
  icon: typeof HomeIcon
  targetId: string | null
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: HomeIcon, targetId: null },
  { id: 'projects', label: 'Projects', icon: ProjectsIcon, targetId: 'case-studies' },
  { id: 'writings', label: 'Writings', icon: WritingsIcon, targetId: 'side-projects' },
  { id: 'fun', label: 'Fun', icon: FunIcon, targetId: 'side-projects' },
]

function scrollToTarget(targetId: string | null) {
  if (targetId === null) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function FloatingNav() {
  return (
    <div className="floating-nav-anchor">
      <nav className="floating-nav">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className="floating-nav-icon"
              onClick={() => scrollToTarget(item.targetId)}
              aria-label={item.label}
            >
              <span className="floating-nav-tooltip">{item.label}</span>
              <Icon size={18} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
