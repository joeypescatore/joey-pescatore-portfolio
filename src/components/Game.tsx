import { useCallback, useEffect, useRef, useState } from 'react'
import './Game.css'

const LANE_WIDTH = 480
// his real, full in-game size — during the launch he's rendered at a CSS
// scale of INTRO_START_SCALE (matching the Hero sprite's actual 17x20 size)
// and smoothly grows to this by the time he lands, rather than snapping
// straight to full size the instant he's clicked
const CHAR_WIDTH = 34
const CHAR_HEIGHT = 40
const PLATFORM_WIDTH = 90
const PLATFORM_HEIGHT = 14
const STARTING_PLATFORM_Y = 60
const GRAVITY = 0.24
const JUMP_VELOCITY = -10
const MOVE_SPEED = 5
const SCROLL_LINE_RATIO = 0.4
const BREAKABLE_CHANCE = 0.25
const MIN_GAP = 90
const MAX_GAP = 170
// safety margin on top of the raw physics-reachable distance, so every
// generated gap accounts for reaction time and is comfortably possible
const REACH_SAFETY = 0.8

// the opening "launch" (click the hero sprite -> he leaps into the game): he
// starts this far below the starting platform and gets a one-time bigger
// launch velocity than a normal in-game jump. The rise distance can't be a
// fixed constant — the hero sprite sits close to the top of the page (and
// even closer on narrow viewports, where the section's top padding shrinks),
// so a fixed ~260px rise routinely placed the landing platform above y=0,
// clipped by the lane's overflow:hidden and never visibly "arriving". Instead
// it's derived per-launch from his actual click position, clamped to a
// sensible range, so the platform always lands somewhere actually visible.
// also gives the top-down platform entrance (below) real room to be visibly
// sliding down into place, rather than landing flush against the very top
// edge with nowhere to descend from
const MIN_PLATFORM_SCREEN_Y = 160
const MIN_INTRO_RISE = 40
const MAX_INTRO_RISE = 220
// apex distance a bit past the rise distance so he genuinely overshoots it
// before gravity brings him back down onto it, instead of being clamped the
// instant he first reaches it. Kept close to 1 deliberately — the gap between
// "first reaches the platform's height" and "falls back down and actually
// lands" grows much faster than this ratio suggests (it's roughly (ratio+
// sqrt(ratio-1))/(ratio-sqrt(ratio-1)) of the settle time), so even 1.15 here
// meant waiting more than double the settle time again before he actually
// landed — the "too slow" gap between everything settling and gameplay
// actually starting.
const INTRO_APEX_RATIO = 1.04
// C = sqrt(apexRatio) - sqrt(apexRatio - 1): the constant relating rise
// distance, gravity, and landing time for the apex-ratio arc above (derived
// from the projectile-motion solution). Used to solve backwards for the
// gravity a given rise distance needs to land in exactly INTRO_DURATION_MS —
// a fixed duration for the platform/page/trail to settle into place,
// independent of how far he actually has to rise (the real landing comes
// slightly after this, once he's fallen back down — see INTRO_APEX_RATIO).
// The in-game GRAVITY constant is tuned for normal platform-to-platform
// jumps and is far too strong for a cinematic entrance — used directly, the
// whole launch was resolving in under 500ms, too fast to actually see.
const INTRO_APEX_TIME_CONSTANT = Math.sqrt(INTRO_APEX_RATIO) - Math.sqrt(INTRO_APEX_RATIO - 1)
const INTRO_DURATION_MS = 550
// Hero sprite is 17x20 — exactly half CHAR_WIDTH/CHAR_HEIGHT — so starting
// the launch at this scale and growing to 1 by landing means he visually
// picks up right where the Hero sprite left off, no size pop at either end
const INTRO_START_SCALE = 0.5

// on actually landing, real gameplay's camera convention (keep him at a
// fixed 40%-down screen line) is a completely different position than
// wherever the intro left him — snapping straight to it the instant he lands
// was the "everything skips down" jump. Easing the camera from where the
// intro left it to that resting line over this short window, instead of
// snapping, is what actually fixes it.
const CAMERA_SETTLE_MS = 250

// purely cosmetic entrance for platforms: the camera has to stay fixed during
// intro (that's what keeps him pinned to his real click position), so without
// this they'd just sit static the whole time while only he visibly moves.
// Slides straight down from above into its resting spot — same direction as
// the home page content, driven by the exact same introProgress clock so
// both move in lockstep — landing exactly where he's about to land, at the
// same moment he gets there. Only the deterministic starting platform is
// shown during intro (see visiblePlatforms below) — letting every randomly-
// seeded platform do this at once was what actually made it look "weird":
// several of them, at unrelated random x positions, sliding in together.
const PLATFORM_ENTRY_DISTANCE = 200

// rainbow launch trail: spawned as small pixel "chips" (one per band) directly
// under his feet while he rises, each fading/scattering outward independently
// so the trail reads as solid near him and dissolved further below, like the
// reference burst art
const TRAIL_SPAWN_EVERY_MS = 45
const TRAIL_LIFETIME_MS = 900
const TRAIL_CHIP_SIZE = 8
const TRAIL_COLORS = ['#ff4d4d', '#ff9d3d', '#ffd93d', '#5ce65c', '#3dc9ff', '#a35cff']

type Platform = {
  id: number
  x: number
  y: number
  breakable: boolean
  broken: boolean
}

type TrailChip = {
  id: string
  x: number
  y: number
  color: string
  sx: number
  sy: number
  rot: number
  scale: number
}

let nextPlatformId = 0
let nextTrailChipId = 0

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
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
    y: STARTING_PLATFORM_Y,
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

type GameProps = {
  origin: { x: number; y: number }
  onIntroProgress?: (progress: number) => void
  onQuit: () => void
}

export function Game({ origin, onIntroProgress, onQuit }: GameProps) {
  const [viewportHeight] = useState(() => window.innerHeight)
  const [viewportWidth] = useState(() => window.innerWidth)
  const [score, setScore] = useState(0)
  const [status, setStatus] = useState<'intro' | 'settling' | 'playing' | 'over'>('intro')
  const [platforms, setPlatforms] = useState<Platform[]>(() => seedPlatforms(viewportHeight))

  // how far he needs to rise so the starting platform lands somewhere
  // actually visible, given where he really is on the page right now
  const [introRiseDistance] = useState(() =>
    clamp(origin.y - MIN_PLATFORM_SCREEN_Y, MIN_INTRO_RISE, MAX_INTRO_RISE),
  )
  // gravity solved backwards from introRiseDistance so the launch always
  // takes ~INTRO_DURATION_MS regardless of how far he actually has to rise —
  // a short rise (small viewport) drifts up gently, a long one (roomier
  // viewport) gets more of a real launch, but neither finishes too fast to see
  const [introGravity] = useState(() => {
    const durationFrames = INTRO_DURATION_MS / (1000 / 60)
    return (2 * introRiseDistance * INTRO_APEX_TIME_CONSTANT ** 2) / durationFrames ** 2
  })
  const [introLaunchVelocity] = useState(() => -Math.sqrt(2 * introGravity * introRiseDistance * INTRO_APEX_RATIO))

  // he launches from wherever he actually stood on the home page, not a
  // fixed lane center — anchor both the camera and the lane's own screen
  // position to that click-time spot, once, for this play session
  const initialWorldY = STARTING_PLATFORM_Y - CHAR_HEIGHT + introRiseDistance
  const [camera0] = useState(() => initialWorldY + CHAR_HEIGHT - origin.y)
  const [laneLeft, setLaneLeft] = useState(() =>
    clamp(origin.x - LANE_WIDTH / 2, 0, Math.max(0, viewportWidth - LANE_WIDTH)),
  )

  const [charScreenPos, setCharScreenPos] = useState({
    x: LANE_WIDTH / 2 - CHAR_WIDTH / 2,
    y: initialWorldY - camera0,
  })
  const [facing, setFacing] = useState<1 | -1>(1)
  const [trail, setTrail] = useState<TrailChip[]>([])
  // drives the starting platform's own cosmetic reveal offset, below
  const [introProgress, setIntroProgress] = useState(0)

  const physicsRef = useRef({
    x: LANE_WIDTH / 2 - CHAR_WIDTH / 2,
    y: initialWorldY,
    vx: 0,
    vy: introLaunchVelocity,
  })
  const cameraRef = useRef(camera0)
  const keysRef = useRef({ left: false, right: false })
  const pointerTargetXRef = useRef<number | null>(null)
  const laneRef = useRef<HTMLDivElement>(null)
  const bestLandedYRef = useRef(STARTING_PLATFORM_Y)
  const platformsRef = useRef<Platform[]>(platforms)
  const scoreRef = useRef(0)
  const statusRef = useRef<'intro' | 'settling' | 'playing' | 'over'>('intro')
  const rafRef = useRef<number | undefined>(undefined)
  const trailRef = useRef<TrailChip[]>([])
  const lastTrailSpawnRef = useRef(0)
  const cameraSettleRef = useRef({ from: 0, to: 0, startedAt: 0 })

  // scale captured at spawn time (matching however big he currently is
  // mid-launch) so the trail visibly grows in step with him, rather than
  // staying full-size while he's still small
  const spawnTrailChips = useCallback((x: number, y: number, scale: number) => {
    const chips: TrailChip[] = TRAIL_COLORS.map((color, row) => {
      // chips further down the stack (spawned "later" in the band, visually
      // trailing furthest from his feet) scatter wider — mirrors how the
      // reference art reads as solid near the source, dissolved further out
      const spread = (6 + row * 5) * scale
      return {
        id: `trail-${nextTrailChipId++}`,
        x: x + (Math.random() - 0.5) * 6 * scale,
        y: y + row * TRAIL_CHIP_SIZE * scale,
        color,
        sx: (Math.random() - 0.5) * spread * 2,
        sy: spread * 0.6 + Math.random() * spread,
        rot: (Math.random() - 0.5) * 50,
        scale,
      }
    })
    trailRef.current = [...trailRef.current, ...chips]
    setTrail((prev) => [...prev, ...chips])
    window.setTimeout(() => {
      const ids = new Set(chips.map((c) => c.id))
      trailRef.current = trailRef.current.filter((c) => !ids.has(c.id))
      setTrail((prev) => prev.filter((c) => !ids.has(c.id)))
    }, TRAIL_LIFETIME_MS)
  }, [])

  const reset = useCallback(() => {
    const seeded = seedPlatforms(viewportHeight)
    platformsRef.current = seeded
    setPlatforms(seeded)
    physicsRef.current = {
      x: LANE_WIDTH / 2 - CHAR_WIDTH / 2,
      y: STARTING_PLATFORM_Y - CHAR_HEIGHT,
      vx: 0,
      vy: JUMP_VELOCITY,
    }
    cameraRef.current = 0
    // "Play Again" drops straight back into normal, centered play — the
    // home-anchored lane position and launch intro are a one-time flourish
    // for the very first entrance, not every retry
    setLaneLeft(Math.max(0, (viewportWidth - LANE_WIDTH) / 2))
    bestLandedYRef.current = STARTING_PLATFORM_Y
    scoreRef.current = 0
    setScore(0)
    statusRef.current = 'playing'
    setStatus('playing')
  }, [viewportHeight, viewportWidth])

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
    function tick(now: number) {
      if (statusRef.current === 'intro') {
        const p = physicsRef.current
        p.vy += introGravity
        p.y += p.vy

        // drives the platforms' own reveal offset and his own scale-up
        // below, and — via onIntroProgress — the home page's synchronized
        // slide-away (same underlying clock as his own rise, just scaled to
        // a much larger distance by whoever's listening)
        const progress = clamp((initialWorldY - p.y) / introRiseDistance, 0, 1)
        const scale = INTRO_START_SCALE + progress * (1 - INTRO_START_SCALE)
        setIntroProgress(progress)
        onIntroProgress?.(progress)

        if (now - lastTrailSpawnRef.current >= TRAIL_SPAWN_EVERY_MS) {
          lastTrailSpawnRef.current = now
          // his visual scale is anchored at the bottom (transform-origin),
          // so his feet stay at p.y + CHAR_HEIGHT regardless of scale — only
          // the chip size/spacing need to shrink to match his current size
          spawnTrailChips(p.x + CHAR_WIDTH / 2 - (TRAIL_CHIP_SIZE * scale) / 2, p.y + CHAR_HEIGHT, scale)
        }

        // he's allowed to rise past the platform (his launch velocity is
        // tuned via INTRO_APEX_RATIO to overshoot it slightly before his
        // arc peaks) rather than being clamped the instant he first reaches
        // it — the platform and home page have already fully settled by
        // then (progress is clamped at 1 above), so there's a beat where
        // everything else is still before gravity actually brings him back
        // down onto it. Real gameplay only starts on that real landing,
        // exactly like every other platform landing in normal play.
        if (p.vy > 0) {
          const feetY = p.y + CHAR_HEIGHT
          if (feetY >= STARTING_PLATFORM_Y && feetY <= STARTING_PLATFORM_Y + PLATFORM_HEIGHT + 10) {
            p.y = STARTING_PLATFORM_Y - CHAR_HEIGHT
            p.vy = JUMP_VELOCITY
            // real gameplay's camera convention (keep him at a fixed 40%-down
            // screen line) is a totally different position than wherever the
            // intro left the camera — ease into it over CAMERA_SETTLE_MS
            // instead of snapping straight to it, which is what was actually
            // causing the "everything skips down" jump
            cameraSettleRef.current = {
              from: cameraRef.current,
              to: p.y - viewportHeight * SCROLL_LINE_RATIO,
              startedAt: now,
            }
            statusRef.current = 'settling'
            setStatus('settling')
          }
        }

        setCharScreenPos({ x: p.x, y: p.y - cameraRef.current })
      } else if (statusRef.current === 'playing' || statusRef.current === 'settling') {
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

        if (statusRef.current === 'settling') {
          const settle = cameraSettleRef.current
          const t = clamp((now - settle.startedAt) / CAMERA_SETTLE_MS, 0, 1)
          const eased = 1 - (1 - t) ** 3
          cameraRef.current = settle.from + (settle.to - settle.from) * eased
          if (t >= 1) {
            statusRef.current = 'playing'
            setStatus('playing')
          }
        } else {
          const scrollLine = viewportHeight * SCROLL_LINE_RATIO
          if (p.y < cameraRef.current + scrollLine) {
            cameraRef.current = p.y - scrollLine
          }
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
  }, [viewportHeight, spawnTrailChips, onIntroProgress, initialWorldY, introRiseDistance, introGravity])

  // during intro, only the deterministic starting platform is shown (see
  // PLATFORM_ENTRY_DISTANCE above — showing every randomly-seeded platform
  // was the actual source of the "weird" reveal). Negative offset = shifted
  // up above its resting spot; sliding from -PLATFORM_ENTRY_DISTANCE to 0 as
  // introProgress runs 0->1 reads as descending straight down into place.
  const visiblePlatforms = status === 'intro' ? platforms.filter((p) => p.y === STARTING_PLATFORM_Y) : platforms
  const platformRevealOffset = status === 'intro' ? -(1 - introProgress) * PLATFORM_ENTRY_DISTANCE : 0
  // grows from the Hero sprite's scale up to full size over the launch —
  // anchored at the bottom (transform-origin below) so his feet stay exactly
  // where the physics places them while only his head end grows upward
  const charScale = status === 'intro' ? INTRO_START_SCALE + introProgress * (1 - INTRO_START_SCALE) : 1

  return (
    <div className={`game-overlay${status === 'intro' ? ' is-intro' : ''}`}>
      <button type="button" className="game-quit" onClick={onQuit}>
        Quit
        <span className="game-quit-key">Esc</span>
      </button>

      <div className="game-score">
        <div className="game-score-label">Score</div>
        <div className="game-score-value">{String(score).padStart(4, '0')}</div>
      </div>

      <div className="game-lane" ref={laneRef} style={{ width: LANE_WIDTH, left: laneLeft }}>
        {visiblePlatforms.map(
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
                  transform: status === 'intro' ? `translateY(${platformRevealOffset}px)` : undefined,
                }}
              />
            ),
        )}

        {trail.map((chip) => (
          <span
            key={chip.id}
            className="game-trail-chip"
            style={
              {
                left: chip.x,
                top: chip.y - cameraRef.current,
                width: TRAIL_CHIP_SIZE * chip.scale,
                height: TRAIL_CHIP_SIZE * chip.scale,
                backgroundColor: chip.color,
                '--sx': `${chip.sx}px`,
                '--sy': `${chip.sy}px`,
                '--rot': `${chip.rot}deg`,
              } as React.CSSProperties
            }
          />
        ))}

        <div
          className="game-character"
          style={{
            left: charScreenPos.x,
            top: charScreenPos.y,
            width: CHAR_WIDTH,
            height: CHAR_HEIGHT,
            transformOrigin: '50% 100%',
            transform: `scale(${charScale * facing}, ${charScale})`,
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
