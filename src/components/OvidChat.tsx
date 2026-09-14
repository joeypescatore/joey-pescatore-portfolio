import { Fragment, useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react'
import { IconArrowUp } from '@central-icons-react/round-filled-radius-3-stroke-2/IconArrowUp'
import { IconSidebarSimpleRightWide } from '@central-icons-react/round-filled-radius-3-stroke-2/IconSidebarSimpleRightWide'
import { IconCrossMedium } from '@central-icons-react/round-filled-radius-3-stroke-2/IconCrossMedium'
import { IconUserAdd } from '@central-icons-react/round-filled-radius-3-stroke-2/IconUserAdd'
import { IconLightbulbSparkle } from '@central-icons-react/round-filled-radius-3-stroke-2/IconLightbulbSparkle'
import { IconCd } from '@central-icons-react/round-filled-radius-3-stroke-2/IconCd'
import linkedinLogo from '../assets/linkedin-logo.png'
import { trackVisitorEvent } from '../utils/trackVisitorEvent'
import './OvidChat.css'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ChatPhase = 'opening' | 'drawer-rising' | 'open' | 'closing'

// idle-wander tuning, mirrors Sprite.tsx's own constants exactly so the
// drawer's walk reads identically to the home page one
const WALK_SPEED = 0.05 // px per ms
const PX_PER_STEP = 4
const MIN_DURATION = 300

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

// remembers the conversation across a close/reopen of the drawer, but only
// for as long as this script stays loaded — a plain module-level variable
// rather than sessionStorage, which would also survive a page refresh.
// Refreshing re-runs this module from scratch, resetting both back to
// their initial values here, same as any other in-memory state.
let rememberedMessages: ChatMessage[] = []
// whether the server has already told this conversation it's hit its spend
// cap (see api/chat.ts) — remembered alongside the messages so closing and
// reopening the drawer doesn't quietly re-enable input on a conversation
// that's already maxed out
let rememberedLimitReached = false
// groups this conversation's rows together in the logging sheet (see
// api/chat.ts) — regenerated whenever a fresh conversation actually starts
// (first message of a new rememberedMessages, or "Start a new
// conversation"), not on every close/reopen of an existing one
let rememberedConversationId = crypto.randomUUID()

// one fixed size for Ovid everywhere in and around the drawer (header,
// welcome icon) — matches the Hero sprite's own size (see Sprite.css) and
// the sink/rise ghost App.tsx renders, so he never visibly grows or shrinks
// at any point in the transition or the drawer's two states
const OVID_ICON_SIZE = 17
// his exact rendered height at that size — the walker track's own height,
// so the "ground" clipping him during rise/sink lines up with his real feet
const OVID_ICON_HEIGHT = (OVID_ICON_SIZE * 32) / 27

const SUGGESTIONS: {
  icon: ComponentType<{ size?: number; color?: string }>
  text: string
  event: string
}[] = [
  { icon: IconUserAdd, text: "I'm a hiring manager, what should I know?", event: 'ovid_chip_hiring_manager' },
  { icon: IconLightbulbSparkle, text: "What's Joey's design philosophy?", event: 'ovid_chip_design_philosophy' },
  { icon: IconCd, text: "How's Wavform going?", event: 'ovid_chip_wavform' },
]

// shared with the Hero sprite — same 27x32 pixel art, just rendered wherever
// Ovid needs to appear (drawer header, welcome icon, sink/rise ghost in App)
export function OvidIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 27 32"
      shapeRendering="crispEdges"
      width={size}
      height={(size * 32) / 27}
      style={{ display: 'block', color: '#0a0a0a', flexShrink: 0 }}
    >
      <rect x="0" y="0" width="8" height="24" fill="currentColor" />
      <rect x="12" y="0" width="8" height="8" fill="currentColor" />
      <rect x="7" y="4" width="16" height="4" fill="currentColor" />
      <rect x="12" y="4" width="4" height="12" fill="currentColor" />
      <rect x="20" y="4" width="4" height="12" fill="currentColor" />
      <rect x="7" y="12" width="20" height="4" fill="currentColor" />
      <rect x="4" y="15" width="19" height="13" fill="currentColor" />
      <rect x="8" y="15" width="4" height="13" fill="currentColor" />
      <rect x="16" y="20" width="4" height="8" fill="currentColor" />
      <rect x="8" y="28" width="4" height="4" fill="currentColor" />
      <rect x="16" y="28" width="4" height="4" fill="currentColor" />
    </svg>
  )
}

// the walking variant of the same pixel art — extracted from Sprite.tsx so
// both the home page wander and the drawer's own wander look identical
export function WalkingOvidIcon({
  size = 18,
  facing = 1,
  footFrame = 0,
}: {
  size?: number
  facing?: 1 | -1
  footFrame?: 0 | 1
}) {
  return (
    <svg
      viewBox="0 0 27 32"
      shapeRendering="crispEdges"
      width={size}
      height={(size * 32) / 27}
      style={{ display: 'block', color: '#0a0a0a', transform: `scaleX(${facing})`, flexShrink: 0 }}
    >
      <rect x="0" y="0" width="8" height="24" fill="currentColor" />
      <rect x="12" y="0" width="8" height="8" fill="currentColor" />
      <rect x="7" y="4" width="16" height="4" fill="currentColor" />
      <rect x="12" y="4" width="4" height="12" fill="currentColor" />
      <rect x="20" y="4" width="4" height="12" fill="currentColor" />
      <rect x="7" y="12" width="20" height="4" fill="currentColor" />
      <rect x="4" y="15" width="19" height="13" fill="currentColor" />
      <rect x="8" y="15" width="4" height="13" fill="currentColor" />
      <rect x="16" y="20" width="4" height="8" fill="currentColor" />
      {footFrame === 0 ? (
        <>
          <rect x="8" y="28" width="4" height="4" fill="currentColor" />
          <rect x="16" y="28" width="4" height="4" fill="currentColor" />
        </>
      ) : (
        <>
          <rect x="10" y="28" width="4" height="4" fill="currentColor" />
          <rect x="14" y="28" width="4" height="4" fill="currentColor" />
        </>
      )}
    </svg>
  )
}

// a small, self-contained wander confined to a track exactly as wide as the
// welcome text beneath him — mounts/unmounts with the welcome screen itself,
// so there's no pause/resume to manage (unlike the home page Sprite, which
// has to freeze in place while the drawer is open)
function DrawerWalker({ trackWidth }: { trackWidth: number }) {
  const [x, setX] = useState(0)
  const [facing, setFacing] = useState<1 | -1>(1)
  const [isMoving, setIsMoving] = useState(false)
  const [footFrame, setFootFrame] = useState<0 | 1>(0)
  const [moveDuration, setMoveDuration] = useState(MIN_DURATION)
  const [moveSteps, setMoveSteps] = useState(6)
  const [stepInterval, setStepInterval] = useState(200)
  const xRef = useRef(0)
  const rangeRef = useRef(Math.max(0, trackWidth - OVID_ICON_SIZE))
  const moveTimeoutRef = useRef<number | undefined>(undefined)
  const settleTimeoutRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    rangeRef.current = Math.max(0, trackWidth - OVID_ICON_SIZE)
    xRef.current = Math.min(xRef.current, rangeRef.current)
    setX((prev) => Math.min(prev, rangeRef.current))
  }, [trackWidth])

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

      settleTimeoutRef.current = window.setTimeout(() => {
        setIsMoving(false)
        const pause = randomBetween(1200, 3500)
        moveTimeoutRef.current = window.setTimeout(performMove, pause)
      }, duration)
    }

    const initialPause = randomBetween(400, 1000)
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
    <div
      className="ovid-drawer-walker"
      style={{
        transform: `translateX(${x}px)`,
        transitionDuration: `${moveDuration}ms`,
        transitionTimingFunction: `steps(${moveSteps}, jump-end)`,
      }}
    >
      <WalkingOvidIcon size={OVID_ICON_SIZE} facing={facing} footFrame={footFrame} />
    </div>
  )
}

const URL_WORD_PATTERN = /^(https?:\/\/|www\.)\S+$/i
const LEADING_WRAPPER_PATTERN = /^[([{"']+/
const TRAILING_PUNCTUATION_PATTERN = /[.,!?;:)\]}"']+$/

// a word straight from message text — full-URL words only (see the system
// prompt's own rule to always write links out in full). Leading/trailing
// wrapper or sentence punctuation is split off so it renders outside the
// chip as plain text — without stripping the leading half too, a very
// natural phrasing like "here (https://...)." would never even reach the
// URL check at all, since the word doesn't start with http/www.
function parseUrlWord(word: string): { leading: string; url: string; trailing: string } | null {
  const leadingMatch = word.match(LEADING_WRAPPER_PATTERN)
  const leading = leadingMatch ? leadingMatch[0] : ''
  const rest = leading ? word.slice(leading.length) : word
  if (!URL_WORD_PATTERN.test(rest)) return null
  const trailingMatch = rest.match(TRAILING_PUNCTUATION_PATTERN)
  const trailing = trailingMatch ? trailingMatch[0] : ''
  const url = trailing ? rest.slice(0, -trailing.length) : rest
  return { leading, url, trailing }
}

// a couple of domains get a bundled local asset instead of the generic
// favicon service below, when that service's result for them isn't as
// crisp/on-brand as pinning the real logo ourselves
const FAVICON_OVERRIDES: Record<string, string> = {
  'linkedin.com': linkedinLogo,
}

// Google's favicon service, at a high enough requested size that it
// returns each site's actual best-quality declared icon (e.g. its
// apple-touch-icon) rather than a low-res 16x16 — works for literally any
// domain, so there's no hardcoded per-brand registry to maintain beyond
// the small override list above
function getFaviconUrl(hostname: string): string {
  const host = hostname.replace(/^www\./i, '')
  for (const domain in FAVICON_OVERRIDES) {
    if (host === domain || host.endsWith(`.${domain}`)) return FAVICON_OVERRIDES[domain]
  }
  return `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(hostname)}`
}

// any outbound link in one of Ovid's own replies (never user messages)
// renders as this inline chip instead of raw text — that site's own real
// favicon plus the cleaned-up URL
function LinkChip({ url }: { url: string }) {
  const href = url.startsWith('www.') ? `https://${url}` : url
  let hostname = ''
  try {
    hostname = new URL(href).hostname
  } catch {
    hostname = ''
  }
  const label = url.replace(/^https?:\/\//i, '').replace(/^www\./i, '')

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="ovid-drawer-link-chip">
      <img className="ovid-drawer-link-chip-icon" src={getFaviconUrl(hostname)} alt="" width={16} height={16} />
      <span className="ovid-drawer-link-chip-label">{label}</span>
    </a>
  )
}

// splits a reply into words, rendering any full-URL word as a LinkChip
// instead of plain text. Used for both a finalized message and the
// in-progress streamed one — the text just grows in real time as the
// network delivers it (see sendMessage), so there's no separate reveal
// animation layered on top of that.
//
// Splits on runs of *any* whitespace (not just a literal space), keeping
// the actual separator text via a capturing group — splitting on ' '
// alone glued a URL directly followed by a paragraph break (no space,
// just "\n\n") together with the next paragraph's first word into one
// garbled token, which then failed the URL check entirely since its own
// \S+ can't span the embedded newlines. Odd indices in the result are the
// separators themselves (a single space, or a run including newlines for
// a paragraph break) and are rendered back verbatim so the message's own
// pre-wrap paragraph spacing keeps working.
function renderReplyContent(text: string) {
  const parts = text.split(/(\s+)/)
  return parts.map((part, i) => {
    if (i % 2 === 1) return part
    const parsedUrl = parseUrlWord(part)
    if (!parsedUrl) return part
    return (
      <Fragment key={i}>
        {parsedUrl.leading}
        <LinkChip url={parsedUrl.url} />
        {parsedUrl.trailing}
      </Fragment>
    )
  })
}

export function OvidChat({ phase, onClose }: { phase: ChatPhase; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(rememberedMessages)
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // set from the server's response (see api/chat.ts) — the server is the
  // only one who can know this, since checking it means reconstructing the
  // same cost estimate it does
  const [limitReached, setLimitReached] = useState<boolean>(rememberedLimitReached)
  // the in-progress reply's text as it streams in from the network — null
  // when there's no active stream (shows the typing dots instead, see the
  // render below), an empty/growing string once real content starts
  // arriving. Only ever set while sendMessage's own fetch is in flight.
  const [pendingReply, setPendingReply] = useState<string | null>(null)
  // the drawer mounts fresh every time it opens, already in the "open" phase —
  // rendering translateX(0) from the very first paint would skip the slide-in
  // transition entirely (a CSS transition only animates a property change
  // that happens after paint). Rendering off-screen for one frame, then
  // flipping this on, gives the browser something to actually transition.
  const [entered, setEntered] = useState(false)
  const [walkWidth, setWalkWidth] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  const showWelcome = messages.length === 0

  // bounds his wander to exactly how wide the welcome text renders (it
  // wraps across two lines, so this is the width of its widest line, not
  // the full drawer) — measured via the text's own client rects rather than
  // the paragraph's box, which would just report the full container width
  useEffect(() => {
    const el = subtitleRef.current
    if (!el) return
    function measure() {
      if (!el) return
      const range = document.createRange()
      range.selectNodeContents(el)
      const rects = Array.from(range.getClientRects())
      setWalkWidth(Math.max(0, ...rects.map((r) => r.width)))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [showWelcome])

  useEffect(() => {
    if (phase === 'open') inputRef.current?.focus()
  }, [phase])

  useEffect(() => {
    rememberedMessages = messages
  }, [messages])

  useEffect(() => {
    rememberedLimitReached = limitReached
  }, [limitReached])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending, pendingReply])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        trackVisitorEvent('closed_ovid_chat_esc')
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  async function sendMessage(text: string) {
    if (!text || isSending || limitReached) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setError(null)
    setIsSending(true)
    setPendingReply(null)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next, conversationId: rememberedConversationId }),
      })

      // the abuse/limit-reached/error paths (see api/chat.ts) stay plain
      // JSON; only a real model generation comes back as a streamed
      // text/plain body, so the content type is what tells these apart
      const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
      if (isJson) {
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Something went wrong')
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
        if (data.limitReached) setLimitReached(true)
        return
      }

      if (!res.ok || !res.body) throw new Error('Something went wrong')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        if (chunk.length === 0) continue
        full += chunk
        // the typing dots (rendered while pendingReply is null) stay up
        // until the very first real chunk arrives, rather than swapping to
        // an empty bubble the instant the connection opens
        setPendingReply(full)
      }
      if (full.length === 0) throw new Error('No response generated')
      setMessages((prev) => [...prev, { role: 'assistant', content: full }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSending(false)
      setPendingReply(null)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const text = input.trim()
    // only the free-text input path, never a suggestion chip (those fire
    // their own distinct ovid_chip_* events instead) — lets funnels
    // separate "asked one of the premade prompts" from "typed their own
    // question" as two different events, both under "asked Ovid something"
    if (text) trackVisitorEvent('asked_custom_question')
    sendMessage(text)
  }

  function startNewConversation() {
    setMessages([])
    setError(null)
    setLimitReached(false)
    rememberedConversationId = crypto.randomUUID()
  }

  const isVisible = entered && phase !== 'closing'
  // mirrors the home-page sprite's rise beat on the way in: hidden below
  // the ground during 'opening' (drawer still sliding out, empty), rising
  // up during 'drawer-rising', settled during 'open'. He stays
  // settled/visible through 'closing' too, rather than snapping back into
  // the ground — that instant class-swap (no transition) read as him just
  // vanishing right as the drawer started to close. Now he just rides off
  // screen with the drawer's own slide, same as the text next to him.
  //
  // Gated on walkWidth > 0 as well as phase: the walker track only mounts
  // once the welcome text has been measured, and that can lag a beat
  // behind 'drawer-rising' starting. Without this guard, the rise
  // animation would already be partway through its own 300ms clock by the
  // time the track actually appears, so he'd pop in already half-risen
  // instead of starting fully hidden. Staying 'hidden' until there's
  // something to show means the animation only ever starts once he's
  // actually there to play it.
  const walkerRiseClass =
    walkWidth === 0
      ? 'ovid-drawer-walker-rise--hidden'
      : phase === 'drawer-rising'
        ? 'ovid-drawer-walker-rise--rising'
        : phase === 'open' || phase === 'closing'
          ? 'ovid-drawer-walker-rise--risen'
          : 'ovid-drawer-walker-rise--hidden'

  return (
    <div className={`ovid-drawer${isVisible ? ' ovid-drawer--visible' : ''}`}>
      {/* the one consistent, always-visible way to close the drawer — sits
          in the same spot whether or not there's a conversation yet;
          Escape still closes it too */}
      <button
        type="button"
        className="ovid-drawer-close"
        onClick={() => {
          trackVisitorEvent('closed_ovid_chat_button')
          onClose()
        }}
        aria-label="Close chat"
      >
        {/* on mobile the drawer becomes a bottom sheet, not a sidebar, so
            the sidebar-toggle icon stops making sense there — swapped for
            a plain X, moved to the top-right, sized up (see the mobile
            media query in OvidChat.css). Both icons always render; only
            one is ever visible at a given width, avoiding any JS viewport
            check for something CSS can already do on its own. */}
        <IconSidebarSimpleRightWide className="ovid-drawer-close-icon--desktop" size={16} color="#8d8d8d" />
        <IconCrossMedium className="ovid-drawer-close-icon--mobile" size={20} color="#8d8d8d" />
      </button>

      {showWelcome ? (
        <div className="ovid-drawer-welcome">
          <div className="ovid-drawer-welcome-greeting">
            {/* the other half of the Mario-pipe beat: he sank into the
                ground on the home page, now he rises up out of it here —
                and once settled, wanders the width of the text below him,
                same as he does on the home page */}
            <div className="ovid-drawer-walker-ground">
              <div className={`ovid-drawer-walker-rise ${walkerRiseClass}`}>
                {walkWidth > 0 && (
                  <div
                    className="ovid-drawer-walker-track"
                    style={{ width: walkWidth, height: OVID_ICON_HEIGHT }}
                  >
                    <DrawerWalker trackWidth={walkWidth} />
                  </div>
                )}
              </div>
            </div>
            <p ref={subtitleRef} className="ovid-drawer-welcome-subtitle">
              I'm Ovid, Joey's portfolio assistant. Ask me anything.
            </p>
          </div>
          <div className="ovid-drawer-suggestions">
            {SUGGESTIONS.map(({ icon: Icon, text, event }) => (
              <button
                key={text}
                type="button"
                className="ovid-drawer-chip"
                onClick={() => {
                  trackVisitorEvent(event)
                  sendMessage(text)
                }}
                disabled={isSending}
              >
                <Icon size={14} color="#8c8c8c" />
                {text}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="ovid-drawer-messages" ref={listRef}>
          {messages.map((m, i) =>
            m.role === 'user' ? (
              <div key={i} className="ovid-drawer-row ovid-drawer-row--user">
                <div className="ovid-drawer-bubble">{m.content}</div>
              </div>
            ) : (
              <p key={i} className="ovid-drawer-reply">
                {renderReplyContent(m.content)}
              </p>
            ),
          )}
          {pendingReply !== null && <p className="ovid-drawer-reply">{renderReplyContent(pendingReply)}</p>}
          {isSending && pendingReply === null && (
            <div className="ovid-drawer-typing" aria-label="Ovid is typing">
              <span className="ovid-drawer-typing-dot" />
              <span className="ovid-drawer-typing-dot" />
              <span className="ovid-drawer-typing-dot" />
            </div>
          )}
          {error && <p className="ovid-drawer-error">{error}</p>}
          {limitReached && (
            // the "stopping point" line itself already came through as a
            // normal reply bubble above (data.reply) — this is just the action
            <p className="ovid-drawer-error">
              <button type="button" className="ovid-drawer-error-action" onClick={startNewConversation}>
                Start a new conversation
              </button>
            </p>
          )}
        </div>
      )}

      <form
        className="ovid-drawer-input"
        onSubmit={handleSubmit}
        // the visible box is taller than the <input> itself (it has its own
        // padding around a single-line field) — without this, clicking
        // that padding area instead of the text line does nothing, which
        // feels broken for something that looks like one big clickable box
        onClick={() => inputRef.current?.focus()}
      >
        {/* not disabled while isSending — a disabled input auto-blurs in
            every browser, which was kicking focus out of the box on every
            single message. sendMessage's own isSending guard already
            blocks an actual double-send; this just stops that guard from
            also costing the user their cursor position each time. */}
        <input
          ref={inputRef}
          className="ovid-drawer-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={limitReached ? 'Conversation limit reached' : 'Ask something…'}
          disabled={limitReached}
        />
        <div className="ovid-drawer-input-actions">
          <button type="submit" className="ovid-drawer-send" disabled={isSending || limitReached || !input.trim()}>
            <IconArrowUp size={15} color="#ffffff" />
          </button>
        </div>
      </form>
    </div>
  )
}
