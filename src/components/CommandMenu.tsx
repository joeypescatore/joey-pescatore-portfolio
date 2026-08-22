import { useEffect, useMemo, useRef, useState, type FC } from 'react'
import { IconMagnifyingGlass } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconMagnifyingGlass'
import { IconArrowRight } from '@central-icons-react/round-outlined-radius-1-stroke-1.5/IconArrowRight'
import { HomeIcon, ProjectsIcon, WritingsIcon, FunIcon } from './menuIcons'
import './CommandMenu.css'

const UNSELECTED_COLOR = '#8D8D8D'
const SELECTED_COLOR = '#171717'

type IconComponent = FC<{ size?: number; color?: string }>

type MenuItem = {
  id: string
  label: string
  icon: IconComponent
  shortcut: string
  badge?: string
}

const navItems: MenuItem[] = [
  { id: 'homepage', label: 'Homepage', icon: HomeIcon, shortcut: 'H' },
  { id: 'projects', label: 'Projects', icon: ProjectsIcon, shortcut: 'P' },
  { id: 'writings', label: 'Writings', icon: WritingsIcon, shortcut: 'W' },
  { id: 'fun', label: 'Fun', icon: FunIcon, shortcut: 'F' },
]

const writingItems: MenuItem[] = [
  {
    id: 'ai-and-its-place-in-design',
    label: 'AI and Its Place in Design',
    icon: IconArrowRight,
    shortcut: '1',
    badge: 'New',
  },
  {
    id: 'spend-more-time-on-why-you-shouldnt-build-it',
    label: "Spend More Time on Why You Shouldn't Build It",
    icon: IconArrowRight,
    shortcut: '2',
  },
]

export function CommandMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const flatItems = useMemo(() => [...navItems, ...writingItems], [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCmdK = event.metaKey && event.key.toLowerCase() === 'k'

      if (isCmdK) {
        event.preventDefault()
        setIsOpen((open) => !open)
        return
      }

      if (!isOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        setIsOpen(false)
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, flatItems.length - 1))
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, flatItems.length])

  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0)
      const frame = requestAnimationFrame(() => inputRef.current?.focus())
      return () => cancelAnimationFrame(frame)
    }
  }, [isOpen])

  return (
    <div
      className={`cmdk-overlay${isOpen ? ' is-open' : ''}`}
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setIsOpen(false)
      }}
    >
      <div className="cmdk-modal" role="dialog" aria-modal="true" aria-label="Command menu">
        <div className="cmdk-search">
          <IconMagnifyingGlass size={18} color="#A3A3A3" />
          <input
            ref={inputRef}
            className="cmdk-search-input"
            type="text"
            placeholder="Search homepage, projects, writings..."
            tabIndex={isOpen ? 0 : -1}
          />
        </div>

        <div className="cmdk-list">
          {navItems.map((item, index) => (
            <Row
              key={item.id}
              item={item}
              isSelected={index === selectedIndex}
              onHover={() => setSelectedIndex(index)}
            />
          ))}
        </div>

        <div className="cmdk-section-label">Writings</div>

        <div className="cmdk-list cmdk-list--writings">
          {writingItems.map((item, i) => {
            const index = navItems.length + i
            return (
              <Row
                key={item.id}
                item={item}
                isSelected={index === selectedIndex}
                onHover={() => setSelectedIndex(index)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Row({
  item,
  isSelected,
  onHover,
}: {
  item: MenuItem
  isSelected: boolean
  onHover: () => void
}) {
  const Icon = item.icon
  return (
    <div
      className={`cmdk-row${isSelected ? ' is-selected' : ''}`}
      onMouseEnter={onHover}
    >
      <div className="cmdk-row-icon">
        <Icon size={18} color={isSelected ? SELECTED_COLOR : UNSELECTED_COLOR} />
      </div>
      <div className="cmdk-row-label-group">
        <div className="cmdk-row-label">{item.label}</div>
        {item.badge && <div className="cmdk-badge">{item.badge}</div>}
      </div>
      <div className="cmdk-row-shortcut">{item.shortcut}</div>
    </div>
  )
}
