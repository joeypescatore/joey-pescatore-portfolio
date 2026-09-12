import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom'
import { bind, play } from 'cuelume'
import { CommandMenu } from './components/CommandMenu'
import { LandingPage } from './components/LandingPage'
import { OvidChat, OvidIcon, type ChatPhase } from './components/OvidChat'
import { PostPage } from './components/PostPage'
import { EventualPage } from './components/EventualPage'
import { WavformPage } from './components/WavformPage'
import { NotFound } from './components/NotFound'
import { posts } from './data/posts'
import './App.css'

type Origin = { x: number; y: number }
type AppChatPhase = 'closed' | 'sinking' | ChatPhase | 'rising'

// a quick, self-contained dip at his home position (clipped by the ground,
// no fade, no travel) plays fully before the drawer reveal even starts —
// these are sequential beats, not simultaneous. Matches the durations used
// in App.css/OvidChat.css.
const SINK_MS = 300
const REVEAL_MS = 550
// OvidIcon's rendered height at size=17 (17 * 32/27), matching the Hero
// sprite — the ghost window's height, so its bottom edge lands exactly at
// his feet
const GHOST_SIZE_PX = (17 * 32) / 27

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
  shrink,
}: {
  onOpenChat: (origin: Origin) => void
  ovidHidden: boolean
  shrink: boolean
}) {
  return (
    <>
      {/* CommandMenu stays a direct sibling, never wrapped by the shrinking
          panel — it (and the case-study/side-project hover previews further
          down the page) rely on truly viewport-relative position:fixed */}
      <div className={`app-panel${shrink ? ' app-panel--shrink' : ''}`}>
        <LandingPage onOpenChat={onOpenChat} ovidHidden={ovidHidden} />
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
  // 'opening' (drawer slides out, panel shrinks) -> 'open' -> 'closing'
  // (drawer slides back) -> 'rising' (he reappears at his real spot) ->
  // 'closed'. Ovid's click position is kept for the whole run.
  const [chatPhase, setChatPhase] = useState<AppChatPhase>('closed')
  const [ovidOrigin, setOvidOrigin] = useState<Origin | null>(null)

  useEffect(() => {
    bind()
  }, [])

  function handleOpenChat(origin: Origin) {
    play('scan')
    setOvidOrigin(origin)
    setChatPhase('sinking')
    window.setTimeout(() => {
      setChatPhase('opening')
      window.setTimeout(() => setChatPhase('open'), REVEAL_MS)
    }, SINK_MS)
  }

  function handleCloseChat() {
    setChatPhase('closing')
    window.setTimeout(() => {
      setChatPhase('rising')
      window.setTimeout(() => {
        setChatPhase('closed')
        setOvidOrigin(null)
      }, SINK_MS)
    }, REVEAL_MS)
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
              shrink={chatPhase === 'opening' || chatPhase === 'open'}
            />
          }
        />
        <Route path="/eventual" element={<EventualRoute />} />
        <Route path="/wavform" element={<WavformRoute />} />
        <Route path="/writing/:slug" element={<PostRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {(chatPhase === 'opening' || chatPhase === 'open' || chatPhase === 'closing') && (
        <OvidChat phase={chatPhase} onClose={handleCloseChat} />
      )}

      {/* the "slip into the ground" / "rise back out" beat — lives at his
          real click position (viewport-fixed), plays alone before the drawer
          reveal starts (and after it finishes closing). The window is a
          fixed-position peephole the exact size of his sprite with its
          bottom edge sitting right at his feet ("the ground") — he's the
          thing that moves (translateY), sliding down past that fixed edge
          and out of view, like Mario going into a pipe. The earlier version
          animated clip-path on him directly, which moved the "ground" over
          a static sprite instead — that read as erasing, not sinking. */}
      {ovidOrigin && (chatPhase === 'sinking' || chatPhase === 'rising') && (
        <div
          key={chatPhase}
          className="ovid-ghost-window"
          style={{ left: ovidOrigin.x, top: ovidOrigin.y, width: 17, height: GHOST_SIZE_PX }}
        >
          <div className={`ovid-ghost ovid-ghost--${chatPhase}`}>
            <OvidIcon size={17} />
          </div>
        </div>
      )}
    </BrowserRouter>
  )
}

export default App
