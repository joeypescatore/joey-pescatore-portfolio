import { useCallback, useEffect, useRef, useState } from 'react'
import './Game.css'

const LANE_WIDTH = 480
const CHAR_WIDTH = 34
const CHAR_HEIGHT = 40
const PLATFORM_WIDTH = 90
const PLATFORM_HEIGHT = 14
const GRAVITY = 0.34
const JUMP_VELOCITY = -12
const MOVE_SPEED = 5
const SCROLL_LINE_RATIO = 0.4
const BREAKABLE_CHANCE = 0.25
const MIN_GAP = 90
const MAX_GAP = 170
// safety margin on top of the raw physics-reachable distance, so every
// generated gap accounts for reaction time and is comfortably possible
const REACH_SAFETY = 0.8

type Platform = {
  id: number
  x: number
  y: number
  breakable: boolean
  broken: boolean
}

let nextPlatformId = 0

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// max horizontal distance reachable while falling through a given vertical
// gap, derived from the jump's actual descent time — guarantees every
// spawned platform is within reach of the one before it
function maxHorizontalReach(gap: number) {
  const v0 = -JUMP_VELOCITY
  const underRoot = Math.max(0, v0 * v0 - 2 * GRAVITY * gap)
  const descendTime = (v0 + Math.sqrt(underRoot)) / GRAVITY
  return MOVE_SPEED * descendTime * REACH_SAFETY
}

function makePlatform(y: number, previousX: number, gap: number): Platform {
  const reach = maxHorizontalReach(gap)
  const minX = Math.max(0, previousX - reach)
  const maxX = Math.min(LANE_WIDTH - PLATFORM_WIDTH, previousX + reach)
  return {
    id: nextPlatformId++,
    x: randomBetween(minX, maxX),
    y,
    breakable: Math.random() < BREAKABLE_CHANCE,
    broken: false,
  }
}

function seedPlatforms(viewportHeight: number): Platform[] {
  const starting: Platform = {
    id: nextPlatformId++,
    x: LANE_WIDTH / 2 - PLATFORM_WIDTH / 2,
    y: 60,
    breakable: false,
    broken: false,
  }
  const seeded = [starting]
  let y = starting.y
  let previousX = starting.x
  while (y > -viewportHeight * 1.5) {
    const gap = randomBetween(MIN_GAP, MAX_GAP)
    y -= gap
    const platform = makePlatform(y, previousX, gap)
    seeded.push(platform)
    previousX = platform.x
  }
  return seeded
}

export function Game({ onQuit }: { onQuit: () => void }) {
  const [viewportHeight] = useState(() => window.innerHeight)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState<'playing' | 'over'>('playing')
  const [platforms, setPlatforms] = useState<Platform[]>(() => seedPlatforms(viewportHeight))
  const [charScreenPos, setCharScreenPos] = useState({ x: LANE_WIDTH / 2 - CHAR_WIDTH / 2, y: 0 })
  const [facing, setFacing] = useState<1 | -1>(1)

  const physicsRef = useRef({
    x: LANE_WIDTH / 2 - CHAR_WIDTH / 2,
    y: 60 - CHAR_HEIGHT,
    vx: 0,
    vy: JUMP_VELOCITY,
  })
  const cameraRef = useRef(0)
  const keysRef = useRef({ left: false, right: false })
  const pointerTargetXRef = useRef<number | null>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const bestLandedYRef = useRef(60)
  const platformsRef = useRef<Platform[]>(platforms)
  const scoreRef = useRef(0)
  const statusRef = useRef<'playing' | 'over'>('playing')
  const rafRef = useRef<number | undefined>(undefined)

  const reset = useCallback(() => {
    const seeded = seedPlatforms(viewportHeight)
    platformsRef.current = seeded
    setPlatforms(seeded)
    physicsRef.current = { x: LANE_WIDTH / 2 - CHAR_WIDTH / 2, y: 60 - CHAR_HEIGHT, vx: 0, vy: JUMP_VELOCITY }
    cameraRef.current = 0
    bestLandedYRef.current = 60
    scoreRef.current = 0
    setScore(0)
    statusRef.current = 'playing'
    setStatus('playing')
  }, [viewportHeight])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onQuit()
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') keysRef.current.left = true
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') keysRef.current.right = true
    }
    function handleKeyUp(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft' || event.key === 'a' || event.key === 'A') keysRef.current.left = false
      if (event.key === 'ArrowRight' || event.key === 'd' || event.key === 'D') keysRef.current.right = false
    }
    function handleBlur() {
      keysRef.current.left = false
      keysRef.current.right = false
      pointerTargetXRef.current = null
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [onQuit])

  // touch/mouse: the character follows the cursor/finger's x position
  // directly — no click-and-hold, just move the mouse or drag a finger
  useEffect(() => {
    function isButtonTarget(target: EventTarget | null) {
      return target instanceof Element && target.closest('button') !== null
    }
    function handlePointerMove(event: PointerEvent) {
      if (isButtonTarget(event.target)) return
      const lane = laneRef.current
      if (!lane) return
      const rect = lane.getBoundingClientRect()
      const localX = event.clientX - rect.left - CHAR_WIDTH / 2
      pointerTargetXRef.current = Math.max(0, Math.min(LANE_WIDTH - CHAR_WIDTH, localX))
    }
    function handlePointerLeave() {
      pointerTargetXRef.current = null
    }
    window.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('mouseleave', handlePointerLeave)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
    }
  }, [])

  useEffect(() => {
    function tick() {
      if (statusRef.current === 'playing') {
        const p = physicsRef.current

        if (keysRef.current.left && !keysRef.current.right) {
          p.vx = -MOVE_SPEED
          setFacing(-1)
        } else if (keysRef.current.right && !keysRef.current.left) {
          p.vx = MOVE_SPEED
          setFacing(1)
        } else if (pointerTargetXRef.current !== null) {
          const dx = pointerTargetXRef.current - p.x
          p.vx = Math.max(-MOVE_SPEED, Math.min(MOVE_SPEED, dx))
          if (Math.abs(dx) > 1) setFacing(dx > 0 ? 1 : -1)
        } else {
          p.vx = 0
        }
        p.x += p.vx
        if (p.x + CHAR_WIDTH < 0) p.x = LANE_WIDTH
        else if (p.x > LANE_WIDTH) p.x = -CHAR_WIDTH

        p.vy += GRAVITY
        p.y += p.vy

        if (p.vy > 0) {
          for (const plat of platformsRef.current) {
            if (plat.broken) continue
            const feetY = p.y + CHAR_HEIGHT
            const withinX = p.x + CHAR_WIDTH > plat.x && p.x < plat.x + PLATFORM_WIDTH
            const withinY = feetY >= plat.y && feetY <= plat.y + PLATFORM_HEIGHT + 10
            if (withinX && withinY) {
              p.y = plat.y - CHAR_HEIGHT
              p.vy = JUMP_VELOCITY
              // score is 1 point per new platform level reached, not distance —
              // landing back on an already-visited height doesn't count again
              if (plat.y < bestLandedYRef.current) {
                bestLandedYRef.current = plat.y
                scoreRef.current += 1
                setScore(scoreRef.current)
              }
              if (plat.breakable) {
                plat.broken = true
                setPlatforms((prev) => prev.map((pl) => (pl.id === plat.id ? { ...pl, broken: true } : pl)))
              }
              break
            }
          }
        }

        const scrollLine = viewportHeight * SCROLL_LINE_RATIO
        if (p.y < cameraRef.current + scrollLine) {
          cameraRef.current = p.y - scrollLine
        }

        const highestPlatform = platformsRef.current.reduce((min, pl) => (pl.y < min.y ? pl : min))
        let highestY = highestPlatform.y
        let highestX = highestPlatform.x
        const spawnCeiling = cameraRef.current - viewportHeight
        const spawned: Platform[] = []
        while (highestY > spawnCeiling) {
          const gap = randomBetween(MIN_GAP, MAX_GAP)
          highestY -= gap
          const platform = makePlatform(highestY, highestX, gap)
          spawned.push(platform)
          highestX = platform.x
        }

        const cullFloor = cameraRef.current + viewportHeight + 100
        let changed = spawned.length > 0
        const kept = platformsRef.current.filter((pl) => {
          const keep = pl.y < cullFloor
          if (!keep) changed = true
          return keep
        })
        if (changed) {
          const updated = [...kept, ...spawned]
          platformsRef.current = updated
          setPlatforms(updated)
        }

        if (p.y - cameraRef.current > viewportHeight + 100) {
          statusRef.current = 'over'
          setStatus('over')
        }

        setCharScreenPos({ x: p.x, y: p.y - cameraRef.current })
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
    }
  }, [viewportHeight])

  return (
    <div className="game-overlay">
      <button type="button" className="game-quit" onClick={onQuit}>
        Quit
        <span className="game-quit-key">Esc</span>
      </button>

      <div className="game-score">
        <div className="game-score-label">Score</div>
        <div className="game-score-value">{String(score).padStart(4, '0')}</div>
      </div>

      <div className="game-lane" ref={laneRef} style={{ width: LANE_WIDTH }}>
        {platforms.map(
          (plat) =>
            !plat.broken && (
              <div
                key={plat.id}
                className={`game-platform${plat.breakable ? ' is-breakable' : ''}`}
                style={{
                  left: plat.x,
                  top: plat.y - cameraRef.current,
                  width: PLATFORM_WIDTH,
                  height: PLATFORM_HEIGHT,
                }}
              />
            ),
        )}

        <div
          className="game-character"
          style={{
            left: charScreenPos.x,
            top: charScreenPos.y,
            width: CHAR_WIDTH,
            height: CHAR_HEIGHT,
            transform: `scaleX(${facing})`,
          }}
        >
          <svg viewBox="0 0 27 32" shapeRendering="crispEdges" width={CHAR_WIDTH} height={CHAR_HEIGHT}>
            <rect x="0" y="0" width="8" height="24" />
            <rect x="12" y="0" width="8" height="8" />
            <rect x="7" y="4" width="16" height="4" />
            <rect x="12" y="4" width="4" height="12" />
            <rect x="20" y="4" width="4" height="12" />
            <rect x="7" y="12" width="20" height="4" />
            <rect x="4" y="15" width="19" height="13" />
            <rect x="8" y="15" width="4" height="17" />
            <rect x="16" y="20" width="4" height="12" />
          </svg>
        </div>

        {status === 'over' && (
          <div className="game-over">
            <div className="game-over-title">Game Over</div>
            <div className="game-over-score">Score: {score}</div>
            <div className="game-over-actions">
              <button type="button" className="game-over-button game-over-button-primary" onClick={reset}>
                Play Again
              </button>
              <button type="button" className="game-over-button" onClick={onQuit}>
                Quit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
