import { useEffect, useRef, useState } from 'react'
import './Sprite.css'

const SPRITE_WIDTH = 17 // rendered width of .sprite-icon, px
const WALK_SPEED = 0.05 // px per ms — keeps pace constant regardless of distance
const PX_PER_STEP = 4 // px per discrete pixel-art step — small steps, taken fast
const MIN_DURATION = 300 // ms, floor so short hops aren't instant

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function Sprite({ onPlay }: { onPlay: () => void }) {
  const [x, setX] = useState(0)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [isMoving, setIsMoving] = useState(false)
  const [footFrame, setFootFrame] = useState(0)
  const [moveDuration, setMoveDuration] = useState(MIN_DURATION)
  const [moveSteps, setMoveSteps] = useState(6)
  const [stepInterval, setStepInterval] = useState(200)
  const trackRef = useRef<HTMLDivElement>(null)
  const xRef = useRef(0)
  const rangeRef = useRef(0)
  const moveTimeoutRef = useRef<number | undefined>(undefined)
  const settleTimeoutRef = useRef<number | undefined>(undefined)

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
        const pause = randomBetween(1200, 3500)
        moveTimeoutRef.current = window.setTimeout(performMove, pause)
      }, duration)
    }

    const initialPause = randomBetween(1200, 3500)
    moveTimeoutRef.current = window.setTimeout(performMove, initialPause)
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

  return (
    <div className="sprite-track" ref={trackRef}>
      <button
        type="button"
        className="sprite-walker"
        onClick={onPlay}
        style={{
          transform: `translateX(${x}px)`,
          transitionDuration: `${moveDuration}ms`,
          transitionTimingFunction: `steps(${moveSteps}, jump-end)`,
        }}
      >
        <svg
          className="sprite-icon"
          viewBox="0 0 27 32"
          shapeRendering="crispEdges"
          style={{ transform: `scaleX(${facing})` }}
        >
          {/* left side of head/body — full-height bar, not just the head block */}
          <rect x="0" y="0" width="8" height="24" />
          {/* right head block */}
          <rect x="12" y="0" width="8" height="8" />
          <rect x="7" y="4" width="16" height="4" />
          <rect x="12" y="4" width="4" height="12" />
          <rect x="20" y="4" width="4" height="12" />
          {/* brow bridging into body */}
          <rect x="7" y="12" width="20" height="4" />
          {/* torso, extended up to close the head-to-body gap (mouth) */}
          <rect x="4" y="15" width="19" height="13" />
          {/* legs — static thighs, animated lower legs/feet */}
          <rect x="8" y="15" width="4" height="13" />
          <rect x="16" y="20" width="4" height="8" />
          {footFrame === 0 ? (
            <>
              <rect x="8" y="28" width="4" height="4" />
              <rect x="16" y="28" width="4" height="4" />
            </>
          ) : (
            <>
              <rect x="10" y="28" width="4" height="4" />
              <rect x="14" y="28" width="4" height="4" />
            </>
          )}
        </svg>
        <span className="sprite-tooltip">Click to play</span>
      </button>
    </div>
  )
}
