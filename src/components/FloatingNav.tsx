import { useEffect, useState } from 'react'
import { HomeIcon, ProjectsIcon, WritingsIcon, FunIcon } from './menuIcons'
import { staggerDelay } from '../utils/stagger'
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

type HoverRect = { index: number; left: number; width: number }

export function FloatingNav() {
  const [hover, setHover] = useState<HoverRect | null>(null)
  const [lastRect, setLastRect] = useState<HoverRect | null>(null)
  const [instant, setInstant] = useState(false)

  useEffect(() => {
    if (!instant) return
    const id = requestAnimationFrame(() => setInstant(false))
    return () => cancelAnimationFrame(id)
  }, [instant])

  const handleEnter = (index: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = e.currentTarget
    const rect = { index, left: el.offsetLeft, width: el.offsetWidth }
    if (!hover) setInstant(true)
    setHover(rect)
    setLastRect(rect)
  }

  const rect = hover ?? lastRect

  return (
    <div className="floating-nav-anchor stagger-in" style={staggerDelay(7)}>
      <nav className="floating-nav" onMouseLeave={() => setHover(null)}>
        <div
          className="floating-nav-highlight"
          style={{
            transform: `translateX(${rect?.left ?? 0}px)`,
            width: rect?.width ?? 0,
            opacity: hover ? 1 : 0,
            transition: instant ? 'opacity 150ms ease' : undefined,
          }}
        />
        <div
          className="floating-nav-tooltip"
          style={{
            left: rect ? `${rect.left + rect.width / 2}px` : '50%',
            opacity: hover ? 1 : 0,
            transition: instant ? 'opacity 150ms ease' : undefined,
          }}
        >
          {rect && (
            <span key={rect.index} className="floating-nav-tooltip-label">
              {navItems[rect.index].label}
            </span>
          )}
        </div>
        {navItems.map((item, index) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              className="floating-nav-icon"
              onClick={() => scrollToTarget(item.targetId)}
              onMouseEnter={handleEnter(index)}
              aria-label={item.label}
            >
              <Icon size={18} />
            </button>
          )
        })}
      </nav>
    </div>
  )
}
