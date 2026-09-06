import { useState } from 'react'
import { CommandMenu } from './components/CommandMenu'
import { LandingPage } from './components/LandingPage'
import { Game } from './components/Game'
import { PostPage } from './components/PostPage'
import { posts } from './data/posts'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [openPostSlug, setOpenPostSlug] = useState<string | null>(null)

  if (isPlaying) {
    return <Game onQuit={() => setIsPlaying(false)} />
  }

  const openPost = openPostSlug ? posts.find((post) => post.slug === openPostSlug) : null

  if (openPost) {
    return <PostPage post={openPost} onBack={() => setOpenPostSlug(null)} />
  }

  return (
    <>
      <LandingPage onPlay={() => setIsPlaying(true)} onOpenPost={setOpenPostSlug} />
      <CommandMenu onOpenPost={setOpenPostSlug} />
    </>
  )
}

export default App
