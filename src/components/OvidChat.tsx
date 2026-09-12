import { useEffect, useRef, useState, type ComponentType, type FormEvent } from 'react'
import { IconArrowUp } from '@central-icons-react/round-filled-radius-1-stroke-1.5/IconArrowUp'
import { IconCrossSmall } from '@central-icons-react/round-filled-radius-1-stroke-1.5/IconCrossSmall'
import { IconUserAdd } from '@central-icons-react/round-filled-radius-1-stroke-1.5/IconUserAdd'
import { IconTelescope } from '@central-icons-react/round-filled-radius-1-stroke-1.5/IconTelescope'
import { IconAudio } from '@central-icons-react/round-filled-radius-1-stroke-1.5/IconAudio'
import './OvidChat.css'

type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type ChatPhase = 'opening' | 'open' | 'closing'

// keep in sync with MAX_HISTORY_MESSAGES in api/chat.ts
const MAX_MESSAGES = 12

// one fixed size for Ovid everywhere in and around the drawer (header,
// welcome icon) — matches the Hero sprite's own size (see Sprite.css) and
// the sink/rise ghost App.tsx renders, so he never visibly grows or shrinks
// at any point in the transition or the drawer's two states
const OVID_ICON_SIZE = 17

const SUGGESTIONS: { icon: ComponentType<{ size?: number; color?: string }>; text: string }[] = [
  { icon: IconUserAdd, text: "I'm a hiring manager, what should I know?" },
  { icon: IconTelescope, text: 'What side projects has he worked on?' },
  { icon: IconAudio, text: "How's Wavform going?" },
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
      style={{ color: '#0a0a0a', flexShrink: 0 }}
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

export function OvidChat({ phase, onClose }: { phase: ChatPhase; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // the drawer mounts fresh every time it opens, already in the "open" phase —
  // rendering translateX(0) from the very first paint would skip the slide-in
  // transition entirely (a CSS transition only animates a property change
  // that happens after paint). Rendering off-screen for one frame, then
  // flipping this on, gives the browser something to actually transition.
  const [entered, setEntered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = requestAnimationFrame(() => setEntered(true))
    return () => cancelAnimationFrame(id)
  }, [])

  useEffect(() => {
    if (phase === 'open') inputRef.current?.focus()
  }, [phase])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, isSending])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const reachedLimit = messages.length >= MAX_MESSAGES
  const showWelcome = messages.length === 0

  async function sendMessage(text: string) {
    if (!text || isSending || reachedLimit) return
    const next: ChatMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setError(null)
    setIsSending(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Something went wrong')
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsSending(false)
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input.trim())
  }

  const isVisible = entered && phase !== 'closing'

  return (
    <div className={`ovid-drawer${isVisible ? ' ovid-drawer--visible' : ''}`}>
      {/* no header/close-button bar until there's an actual conversation —
          matches the welcome-state reference exactly; Escape still closes
          the drawer at any point regardless */}
      {!showWelcome && (
        <div className="ovid-drawer-header">
          <div className="ovid-drawer-header-icon">
            <OvidIcon size={OVID_ICON_SIZE} />
          </div>
          <button type="button" className="ovid-drawer-close" onClick={onClose} aria-label="Close">
            <IconCrossSmall size={22} color="#8d8d8d" />
          </button>
        </div>
      )}

      {showWelcome ? (
        <div className="ovid-drawer-welcome">
          {/* the one piece of him that "rises" — everything else in the
              drawer just slides/fades in with the panel, but this icon is
              specifically what travels from his home-page position */}
          <div className="ovid-drawer-welcome-icon">
            <OvidIcon size={OVID_ICON_SIZE} />
          </div>
          <h2 className="ovid-drawer-welcome-title">Good to see you,</h2>
          <p className="ovid-drawer-welcome-subtitle">I'm Ovid, Joey's portfolio assistant. Ask me anything</p>
          <div className="ovid-drawer-suggestions">
            {SUGGESTIONS.map(({ icon: Icon, text }) => (
              <button
                key={text}
                type="button"
                className="ovid-drawer-chip"
                onClick={() => sendMessage(text)}
                disabled={isSending}
              >
                <Icon size={14} color="#969696" />
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
                {m.content}
              </p>
            ),
          )}
          {isSending && <p className="ovid-drawer-reply ovid-drawer-typing">···</p>}
          {error && <p className="ovid-drawer-error">{error}</p>}
          {reachedLimit && (
            <p className="ovid-drawer-error">
              That's a good stopping point — close and reopen to start a new conversation.
            </p>
          )}
        </div>
      )}

      <form className="ovid-drawer-input" onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          className="ovid-drawer-input-field"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={reachedLimit ? 'Conversation limit reached' : 'Ask something…'}
          disabled={isSending || reachedLimit}
        />
        <div className="ovid-drawer-input-actions">
          <button type="submit" className="ovid-drawer-send" disabled={isSending || reachedLimit || !input.trim()}>
            <IconArrowUp size={15} color="#ffffff" />
          </button>
        </div>
      </form>
    </div>
  )
}
