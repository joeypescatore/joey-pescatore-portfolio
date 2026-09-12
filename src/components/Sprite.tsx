import { useEffect, useRef, useState } from 'react'
import { WalkingOvidIcon } from './OvidChat'
import './Sprite.css'

const SPRITE_WIDTH = 17 // rendered width of .sprite-icon, px
const WALK_SPEED = 0.05 // px per ms — keeps pace constant regardless of distance
const PX_PER_STEP = 4 // px per discrete pixel-art step — small steps, taken fast
const MIN_DURATION = 300 // ms, floor so short hops aren't instant

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// reads the current interpolated translateX off the element mid-transition,
// so a hover-triggered pause freezes him exactly where he stands rather than
// snapping to whichever end of the hop he was walking toward
function getCurrentTranslateX(el: HTMLElement) {
  const transform = getComputedStyle(el).transform
  if (transform === 'none') return 0
  const match = transform.match(/matrix\(([^)]+)\)/)
  if (!match) return 0
  const parts = match[1].split(',').map((n) => parseFloat(n.trim()))
  return parts[4] ?? 0
}

// 'visible' (normal wander) -> 'sinking' (dips into the ground in place) ->
// 'hidden' (fully sunk, paused, while the drawer's open) -> 'rising' (comes
// back up in place) -> 'visible'. He's a single, continuously-existing
// element throughout — the animation plays on his own real DOM position,
// so there's nothing to capture, measure, or predict, and nothing that can
// end up out of sync with wherever he actually ends up standing.
export type SpritePhase = 'visible' | 'sinking' | 'hidden' | 'rising'

export function Sprite({
  onOpenChat,
  sinkPhase = 'visible',
}: {
  onOpenChat: () => void
  sinkPhase?: SpritePhase
}) {
  const [x, setX] = useState(0)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [isMoving, setIsMoving] = useState(false)
  const [footFrame, setFootFrame] = useState<0 | 1>(0)
  const [moveDuration, setMoveDuration] = useState(MIN_DURATION)
  const [moveSteps, setMoveSteps] = useState(6)
  const [stepInterval, setStepInterval] = useState(200)
  const [tooltipWidth, setTooltipWidth] = useState(0)
  const trackRef = useRef<HTMLDivElement>(null)
  const walkerRef = useRef<HTMLButtonElement>(null)
  const tooltipRef = useRef<HTMLSpanElement>(null)
  const xRef = useRef(0)
  const rangeRef = useRef(0)
  const moveTimeoutRef = useRef<number | undefined>(undefined)
  const settleTimeoutRef = useRef<number | undefined>(undefined)
  const isPausedRef = useRef(false)
  const performMoveRef = useRef<() => void>(() => {})

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    function updateRange() {
      rangeRef.current = Math.max(0, track!.clientWidth - SPRITE_WIDTH)
      xRef.current = Math.min(xRef.current, rangeRef.current)
      setX((prev) => Math.min(prev, rangeRef.current))
    }

    updateRange()
    const observer = new ResizeObserver(updateRange)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  // measured once — the tooltip's text is static, so its width never
  // changes after first render
  useEffect(() => {
    if (tooltipRef.current) setTooltipWidth(tooltipRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    function performMove() {
      const next = randomBetween(0, rangeRef.current)
      const distance = Math.abs(next - xRef.current)
      const duration = Math.max(MIN_DURATION, distance / WALK_SPEED)
      const steps = Math.max(2, Math.round(distance / PX_PER_STEP))
      setFacing(next >= xRef.current ? 1 : -1)
      xRef.current = next
      setMoveDuration(duration)
      setMoveSteps(steps)
      setStepInterval(duration / steps)
      setX(next)
      setIsMoving(true)

      // wait for this move's transition to fully finish before scheduling
      // the next one, so moves never interrupt/re-target each other mid-flight
      settleTimeoutRef.current = window.setTimeout(() => {
        setIsMoving(false)
        if (isPausedRef.current) return
        const pause = randomBetween(1200, 3500)
        moveTimeoutRef.current = window.setTimeout(performMove, pause)
      }, duration)
    }

    performMoveRef.current = performMove

    const initialPause = randomBetween(1200, 3500)
    moveTimeoutRef.current = window.setTimeout(() => {
      if (!isPausedRef.current) performMove()
    }, initialPause)

    return () => {
      window.clearTimeout(moveTimeoutRef.current)
      window.clearTimeout(settleTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isMoving) {
      setFootFrame(0)
      return
    }
    const interval = window.setInterval(() => setFootFrame((f) => (f === 0 ? 1 : 0)), stepInterval)
    return () => window.clearInterval(interval)
  }, [isMoving, stepInterval])

  function pauseWander() {
    isPausedRef.current = true
    window.clearTimeout(moveTimeoutRef.current)
    if (isMoving && walkerRef.current) {
      const currentX = getCurrentTranslateX(walkerRef.current)
      window.clearTimeout(settleTimeoutRef.current)
      xRef.current = currentX
      setMoveDuration(0)
      setX(currentX)
      setIsMoving(false)
    }
  }

  function resumeWander() {
    isPausedRef.current = false
    if (!isMoving) {
      window.clearTimeout(moveTimeoutRef.current)
      moveTimeoutRef.current = window.setTimeout(() => performMoveRef.current(), randomBetween(300, 800))
    }
  }

  // he otherwise keeps wandering in the background the whole time the chat
  // is open (paused, never unmounted) — without this, he'd resume from
  // wherever that idle wander happened to land instead of exactly where he
  // sank
  useEffect(() => {
    if (sinkPhase === 'visible') resumeWander()
    else pauseWander()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sinkPhase])

  // left-aligned by default (just looks better than centered) — only
  // switches to right-aligned once he's far enough right that a
  // left-aligned tooltip would actually overflow past the track's own
  // right edge (and bleed past the page's own content padding with it)
  const trackWidth = rangeRef.current + SPRITE_WIDTH
  const tooltipSide = x + tooltipWidth > trackWidth ? 'right' : 'left'

  return (
    <div className="sprite-track" ref={trackRef}>
      <button
        type="button"
        className="sprite-walker"
        ref={walkerRef}
        onMouseEnter={pauseWander}
        onMouseLeave={resumeWander}
        onClick={onOpenChat}
        style={{
          transform: `translateX(${x}px)`,
          transitionDuration: `${moveDuration}ms`,
          transitionTimingFunction: `steps(${moveSteps}, jump-end)`,
        }}
      >
        {/* the vertical sink/rise clip lives here, wrapping only the icon —
            the tooltip sits outside it (as a sibling below) so it isn't
            clipped away too; it needs to poke up above his head, which the
            "ground" boundary would otherwise cut off */}
        <div className="sprite-ground">
          <div className={`sprite-rise sprite-rise--${sinkPhase}`}>
            <WalkingOvidIcon size={SPRITE_WIDTH} facing={facing} footFrame={footFrame} />
          </div>
        </div>
        {/* the outer span is the actual hoverable/clickable hit region
            (body + gap + pill + a small buffer, see Sprite.css) — the pill
            inside it is purely visual and never moves */}
        <span ref={tooltipRef} className={`sprite-tooltip sprite-tooltip--${tooltipSide}`}>
          <span className="sprite-tooltip-pill">Chat with Ovid</span>
        </span>
      </button>
    </div>
  )
}
