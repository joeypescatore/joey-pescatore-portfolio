import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { WalkingOvidIcon } from './OvidChat'
import './Sprite.css'

const SPRITE_WIDTH = 17 // rendered width of .sprite-icon, px
const WALK_SPEED = 0.05 // px per ms — keeps pace constant regardless of distance
const PX_PER_STEP = 4 // px per discrete pixel-art step — small steps, taken fast
const MIN_DURATION = 300 // ms, floor so short hops aren't instant
const TEXT_SWAP_DURATION_MS = 150 // matches --text-swap-dur in Sprite.css
const HINT_TEXT = '!'
const HOVER_TEXT = 'Chat with Ovid'

// module-level, not component state: survives the drawer opening and
// closing (Sprite never unmounts for that), but resets to false on an
// actual page refresh — the hint is a once-per-session nudge, not a
// forever-dismissed (localStorage) one
let hintDismissed = false

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
  const [dismissed, setDismissed] = useState(hintDismissed)
  const [tooltipText, setTooltipText] = useState(hintDismissed ? HOVER_TEXT : HINT_TEXT)
  const [swapPhase, setSwapPhase] = useState<'' | 'is-exit' | 'is-enter-start'>('')
  const [pillWidth, setPillWidth] = useState<number | undefined>(undefined)
  const trackRef = useRef<HTMLDivElement>(null)
  const walkerRef = useRef<HTMLButtonElement>(null)
  const textSpanRef = useRef<HTMLSpanElement>(null)
  const maxTextMeasureRef = useRef<HTMLSpanElement>(null)
  const xRef = useRef(0)
  const rangeRef = useRef(0)
  const moveTimeoutRef = useRef<number | undefined>(undefined)
  const settleTimeoutRef = useRef<number | undefined>(undefined)
  const swapTimeoutRef = useRef<number | undefined>(undefined)
  const swapFrameRef = useRef<number | undefined>(undefined)
  const isPausedRef = useRef(false)
  const performMoveRef = useRef<() => void>(() => {})

  // the tooltip is always left-aligned (pinned to his left edge, extending
  // rightward) — rather than ever flipping it to right-aligned near the
  // page's right edge, he's simply never allowed to walk far enough right
  // that the widest possible tooltip text ("Chat with Ovid", measured
  // off-screen below) would overflow past the track's own right edge
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    function updateRange() {
      const maxTooltipWidth = maxTextMeasureRef.current?.offsetWidth ?? 0
      rangeRef.current = Math.max(0, track!.clientWidth - Math.max(SPRITE_WIDTH, maxTooltipWidth))
      xRef.current = Math.min(xRef.current, rangeRef.current)
      setX((prev) => Math.min(prev, rangeRef.current))
    }

    updateRange()
    const observer = new ResizeObserver(updateRange)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  // the pill's own padding now lives on this inner text span (see
  // Sprite.css), so its offsetWidth *is* the pill's target width — measured
  // fresh off the real element every time the text actually changes
  // (mid-swap, once the new text is in the DOM), rather than pre-computed
  // off-screen. useLayoutEffect so this is applied before paint: the pill
  // only ever animates toward a width that matches real, current content.
  useLayoutEffect(() => {
    if (textSpanRef.current) setPillWidth(textSpanRef.current.offsetWidth)
  }, [tooltipText])

  useEffect(() => {
    return () => {
      window.clearTimeout(swapTimeoutRef.current)
      if (swapFrameRef.current !== undefined) cancelAnimationFrame(swapFrameRef.current)
    }
  }, [])

  // three-phase swap (see Sprite.css's .t-text-swap): slide/blur/fade the
  // current text out, swap the text content once it's invisible, then
  // release it from its offset start point so it animates back in — the
  // pill itself stays at its current width during that exit fade, then
  // smoothly resizes toward the new text's width (see the layout effect
  // above) at the same time the new text fades in
  function swapTooltipText(next: string) {
    window.clearTimeout(swapTimeoutRef.current)
    if (swapFrameRef.current !== undefined) cancelAnimationFrame(swapFrameRef.current)
    setSwapPhase('is-exit')
    swapTimeoutRef.current = window.setTimeout(() => {
      setTooltipText(next)
      setSwapPhase('is-enter-start')
      swapFrameRef.current = requestAnimationFrame(() => setSwapPhase(''))
    }, TEXT_SWAP_DURATION_MS)
  }

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

  function handleMouseEnter() {
    pauseWander()
    // once dismissed, the tooltip is just the classic hover-to-reveal kind
    // (always "Chat with Ovid", see handleClick) — nothing left to swap
    if (!dismissed) swapTooltipText(HOVER_TEXT)
  }

  function handleMouseLeave() {
    resumeWander()
    if (!dismissed) swapTooltipText(HINT_TEXT)
  }

  // the hint only ever goes away once he's actually clicked — hovering
  // (even repeatedly) never dismisses it, and he doesn't need to send an
  // actual message either, just reach the open drawer
  function handleClick() {
    if (!dismissed) {
      hintDismissed = true
      setDismissed(true)
      window.clearTimeout(swapTimeoutRef.current)
      if (swapFrameRef.current !== undefined) cancelAnimationFrame(swapFrameRef.current)
      setSwapPhase('')
      setTooltipText(HOVER_TEXT)
    }
    onOpenChat()
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

  return (
    <div className="sprite-track" ref={trackRef}>
      <button
        type="button"
        className="sprite-walker"
        ref={walkerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
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
            inside it is purely visual and never moves. Concealed outside
            'visible' since it's a sibling of the sink/rise clip above, not
            inside it — without this it would keep floating in place while
            his body sinks away underneath it. */}
        <span className={`sprite-tooltip${sinkPhase === 'visible' ? '' : ' sprite-tooltip--concealed'}`}>
          <span
            className={`sprite-tooltip-pill${dismissed ? '' : ' sprite-tooltip-pill--hint'}`}
            style={{ width: pillWidth }}
          >
            <span ref={textSpanRef} className={`t-text-swap ${swapPhase}`}>
              {tooltipText}
            </span>
          </span>
        </span>
        {/* off-screen, measuring only the widest possible tooltip text so
            the walk range above can be clamped — never shown, never
            interactive */}
        <span aria-hidden="true" style={{ position: 'absolute', visibility: 'hidden', pointerEvents: 'none' }}>
          <span ref={maxTextMeasureRef} className="t-text-swap">
            {HOVER_TEXT}
          </span>
        </span>
      </button>
    </div>
  )
}
