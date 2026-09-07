import { useEffect, useState } from 'react'
import { CommandMenu } from './components/CommandMenu'
import { LandingPage } from './components/LandingPage'
import { Game } from './components/Game'
import { PostPage } from './components/PostPage'
import { EventualPage } from './components/EventualPage'
import { WavformPage } from './components/WavformPage'
import { HHWPage } from './components/HHWPage'
import { posts } from './data/posts'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [openPostSlug, setOpenPostSlug] = useState<string | null>(null)
  const [openCaseStudySlug, setOpenCaseStudySlug] = useState<string | null>(null)

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [isPlaying, openPostSlug, openCaseStudySlug])

  if (isPlaying) {
    return <Game onQuit={() => setIsPlaying(false)} />
  }

  if (openCaseStudySlug === 'eventual') {
    return <EventualPage onBack={() => setOpenCaseStudySlug(null)} />
  }

  if (openCaseStudySlug === 'wavform') {
    return <WavformPage onBack={() => setOpenCaseStudySlug(null)} />
  }

  if (openCaseStudySlug === 'hhw') {
    return <HHWPage onBack={() => setOpenCaseStudySlug(null)} />
  }

  const openPost = openPostSlug ? posts.find((post) => post.slug === openPostSlug) : null

  if (openPost) {
    return <PostPage post={openPost} onBack={() => setOpenPostSlug(null)} />
  }

  return (
    <>
      <LandingPage
        onPlay={() => setIsPlaying(true)}
        onOpenPost={setOpenPostSlug}
        onOpenCaseStudy={setOpenCaseStudySlug}
      />
      <CommandMenu onOpenPost={setOpenPostSlug} />
    </>
  )
}

export default App
