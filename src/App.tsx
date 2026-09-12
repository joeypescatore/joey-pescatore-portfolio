import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom'
import { bind, play } from 'cuelume'
import { CommandMenu } from './components/CommandMenu'
import { LandingPage } from './components/LandingPage'
import { OvidChat, type ChatPhase } from './components/OvidChat'
import type { SpritePhase } from './components/Sprite'
import { PostPage } from './components/PostPage'
import { EventualPage } from './components/EventualPage'
import { WavformPage } from './components/WavformPage'
import { NotFound } from './components/NotFound'
import { posts } from './data/posts'
import './App.css'

type AppChatPhase = 'closed' | 'sinking' | ChatPhase | 'rising'

// a quick, self-contained dip at his home position (clipped by the ground,
// no fade, no travel) plays fully before the drawer reveal even starts —
// these are sequential beats, not simultaneous. Matches the durations used
// in App.css/OvidChat.css.
const SINK_MS = 300
// the drawer's own slide (and the panel's width/clip-path) takes 450ms —
// see the CSS transition durations in App.css/OvidChat.css, kept in sync
// with that value there, not read from here.
//
// His rise/sink is scheduled off HANDOFF_MS below, not that 450ms — with
// an ease-out curve, the drawer is visually all but settled well before
// its transition's full duration elapses, so waiting the whole thing out
// before starting his half of the beat reads as a dead gap. HANDOFF_MS is
// later than "drawer just started moving," earlier than "drawer transition
// technically finished," and never changes how fast the drawer itself
// moves — it only changes when he starts reacting to it. Safe to overlap
// this way since he's a single continuously-existing element animating
// its own live DOM position (see Sprite.tsx) — unlike a frozen snapshot,
// there's nothing that can go stale while the surrounding layout is still
// settling underneath him.
const HANDOFF_MS = 300
// how long his rise-in/sink-out inside the drawer itself takes — matches
// SINK_MS so both ends of the "pipe" move at the same pace
const RISE_MS = 300

// maps the drawer's own phase machine onto his sink/rise state on the home
// page. He's a single, continuously-existing element (see Sprite.tsx) that
// animates in place — no separate "ghost" standing in for him, and nothing
// to measure or predict, so there's no way for his sink/rise position to
// end up out of sync with wherever he actually ends up standing.
function spritePhaseFor(chatPhase: AppChatPhase): SpritePhase {
  if (chatPhase === 'closed') return 'visible'
  if (chatPhase === 'sinking') return 'sinking'
  if (chatPhase === 'rising') return 'rising'
  return 'hidden'
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function HomeRoute({
  onOpenChat,
  ovidHidden,
  spritePhase,
  shrink,
}: {
  onOpenChat: () => void
  ovidHidden: boolean
  spritePhase: SpritePhase
  shrink: boolean
}) {
  return (
    <>
      {/* CommandMenu stays a direct sibling, never wrapped by the shrinking
          panel — it (and the case-study/side-project hover previews further
          down the page) rely on truly viewport-relative position:fixed */}
      <div
        className={`app-panel${ovidHidden ? ' app-panel--pinned' : ''}${shrink ? ' app-panel--shrink' : ''}`}
      >
        <LandingPage onOpenChat={onOpenChat} spritePhase={spritePhase} />
      </div>
      <CommandMenu />
    </>
  )
}

function EventualRoute() {
  const navigate = useNavigate()
  return <EventualPage onBack={() => navigate('/')} />
}

function WavformRoute() {
  const navigate = useNavigate()
  return <WavformPage onBack={() => navigate('/')} />
}

function PostRoute() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const post = posts.find((p) => p.slug === slug)
  if (!post) return <NotFound />
  return <PostPage post={post} onBack={() => navigate('/')} />
}

function App() {
  // sequence: 'sinking' (he dips into the ground at his real spot, alone) ->
  // 'opening' (drawer slides out, empty) -> 'drawer-rising' (he rises up out
  // of the ground inside the drawer) -> 'open' -> 'closing' (drawer slides
  // back immediately, no delay) -> 'rising' (he reappears at his real spot)
  // -> 'closed'. Closing is intentionally not the mirror of opening — a
  // sink-in-the-drawer beat before the drawer could even start closing made
  // the close action feel laggy, so that leg was cut; only the open side
  // still plays the full "trip through the pipe."
  const [chatPhase, setChatPhase] = useState<AppChatPhase>('closed')

  useEffect(() => {
    bind()
  }, [])

  // body is white by default (see index.css) — only gray while the drawer
  // is open or transitioning, so a rubber-band overscroll bounce on the
  // closed home page never reveals gray
  useEffect(() => {
    document.body.classList.toggle('ovid-chat-open', chatPhase !== 'closed')
  }, [chatPhase])

  function handleOpenChat() {
    play('scan')
    setChatPhase('sinking')
    window.setTimeout(() => {
      setChatPhase('opening')
      window.setTimeout(() => {
        setChatPhase('drawer-rising')
        window.setTimeout(() => setChatPhase('open'), RISE_MS)
      }, HANDOFF_MS)
    }, SINK_MS)
  }

  function handleCloseChat() {
    setChatPhase('closing')
    window.setTimeout(() => {
      setChatPhase('rising')
      window.setTimeout(() => setChatPhase('closed'), SINK_MS)
    }, HANDOFF_MS)
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <HomeRoute
              onOpenChat={handleOpenChat}
              ovidHidden={chatPhase !== 'closed'}
              spritePhase={spritePhaseFor(chatPhase)}
              shrink={chatPhase === 'opening' || chatPhase === 'drawer-rising' || chatPhase === 'open'}
            />
          }
        />
        <Route path="/eventual" element={<EventualRoute />} />
        <Route path="/wavform" element={<WavformRoute />} />
        <Route path="/writing/:slug" element={<PostRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {(chatPhase === 'opening' ||
        chatPhase === 'drawer-rising' ||
        chatPhase === 'open' ||
        chatPhase === 'closing') && <OvidChat phase={chatPhase} onClose={handleCloseChat} />}
    </BrowserRouter>
  )
}

export default App
