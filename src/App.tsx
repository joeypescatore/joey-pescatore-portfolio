import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate, useParams } from 'react-router-dom'
import { CommandMenu } from './components/CommandMenu'
import { LandingPage } from './components/LandingPage'
import { Game } from './components/Game'
import { PostPage } from './components/PostPage'
import { EventualPage } from './components/EventualPage'
import { WavformPage } from './components/WavformPage'
import { NotFound } from './components/NotFound'
import { posts } from './data/posts'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

function HomeRoute({ onPlay }: { onPlay: () => void }) {
  return (
    <>
      <LandingPage onPlay={onPlay} />
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
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return <Game onQuit={() => setIsPlaying(false)} />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomeRoute onPlay={() => setIsPlaying(true)} />} />
        <Route path="/eventual" element={<EventualRoute />} />
        <Route path="/wavform" element={<WavformRoute />} />
        <Route path="/writing/:slug" element={<PostRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
