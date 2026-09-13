import { useEffect, useRef, useState } from 'react'
import { profile } from '../data/portfolio'
import { Sprite, type SpritePhase } from './Sprite'
import { staggerDelay } from '../utils/stagger'
import './Hero.css'

const COPY_TEXT = 'Copy'
const COPIED_TEXT = 'Copied'
const SWAP_MS = 150 // matches --text-swap-dur, defined in Sprite.css (loaded
// here too since Hero always renders <Sprite>) and reused as-is so this
// gets the exact same text-swap animation, not a re-implementation of it
const REVERT_MS = 1500

// a real mailto: link is worse UX here (it either does nothing or dumps
// the visitor into whatever mail client happens to be their OS default,
// which they may not actually use) — copying the address straight to the
// clipboard is the more useful action, so this is a button, not a link
function CopyEmailLink() {
  const [text, setText] = useState(COPY_TEXT)
  const [swapPhase, setSwapPhase] = useState<'' | 'is-exit' | 'is-enter-start'>('')
  // fixed to "Copied"'s own width (the wider of the two) at all times, so
  // the pill never visibly resizes when the label swaps to it
  const [tooltipWidth, setTooltipWidth] = useState<number | undefined>(undefined)
  const measureRef = useRef<HTMLSpanElement>(null)
  const swapTimeoutRef = useRef<number | undefined>(undefined)
  const swapFrameRef = useRef<number | undefined>(undefined)
  const revertTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    if (measureRef.current) setTooltipWidth(measureRef.current.offsetWidth)
    return () => {
      window.clearTimeout(swapTimeoutRef.current)
      window.clearTimeout(revertTimeoutRef.current)
      if (swapFrameRef.current !== undefined) cancelAnimationFrame(swapFrameRef.current)
    }
  }, [])

  function swapText(next: string) {
    window.clearTimeout(swapTimeoutRef.current)
    if (swapFrameRef.current !== undefined) cancelAnimationFrame(swapFrameRef.current)
    setSwapPhase('is-exit')
    swapTimeoutRef.current = window.setTimeout(() => {
      setText(next)
      setSwapPhase('is-enter-start')
      swapFrameRef.current = requestAnimationFrame(() => setSwapPhase(''))
    }, SWAP_MS)
  }

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(profile.email)
    } catch {
      // clipboard permission denied or unavailable — the label still
      // swapping to "Copied" would be misleading, so bail before that
      return
    }
    window.clearTimeout(revertTimeoutRef.current)
    swapText(COPIED_TEXT)
    revertTimeoutRef.current = window.setTimeout(() => swapText(COPY_TEXT), REVERT_MS)
  }

  return (
    <button type="button" className="hero-bio-link hero-email-copy" onClick={handleClick}>
      email
      <span className="hero-email-tooltip" style={{ width: tooltipWidth }}>
        <span className={`t-text-swap ${swapPhase}`}>{text}</span>
      </span>
      {/* off-screen, purely for measuring "Copied"'s own width up front —
          never shown, never interactive */}
      <span aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
        <span ref={measureRef} className="t-text-swap">
          {COPIED_TEXT}
        </span>
      </span>
    </button>
  )
}

export function Hero({
  onOpenChat,
  spritePhase = 'visible',
}: {
  onOpenChat: () => void
  spritePhase?: SpritePhase
}) {
  return (
    <section className="hero">
      <div className="stagger-in" style={staggerDelay(0)}>
        <Sprite onOpenChat={onOpenChat} sinkPhase={spritePhase} />
      </div>

      <div className="hero-bio">
        <p className="hero-bio-line stagger-in" style={staggerDelay(1)}>
          {profile.bioLine1Prefix}
          <a href={profile.bioLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.bioLink.label}
          </a>
          .
        </p>
        <p className="hero-bio-line stagger-in" style={staggerDelay(2)}>
          {profile.bioParagraph2Prefix}
          <a href={profile.eventualLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.eventualLink.label}
          </a>
          {profile.bioParagraph2Middle}
          <a href={profile.wavformLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.wavformLink.label}
          </a>
          {profile.bioParagraph2End}
        </p>
        <p className="hero-bio-line stagger-in" style={staggerDelay(3)}>
          {profile.contactPrefix}
          <a href={profile.twitterLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.twitterLink.label}
          </a>
          ,{' '}
          <a href={profile.linkedinLink.href} target="_blank" rel="noopener noreferrer" className="hero-bio-link">
            {profile.linkedinLink.label}
          </a>
          , or via <CopyEmailLink />.
        </p>
      </div>
    </section>
  )
}
