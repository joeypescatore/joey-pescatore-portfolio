import { useState } from 'react'
import { CommandMenu } from './components/CommandMenu'
import { LandingPage } from './components/LandingPage'
import { Game } from './components/Game'

function App() {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return <Game onQuit={() => setIsPlaying(false)} />
  }

  return (
    <>
      <LandingPage onPlay={() => setIsPlaying(true)} />
      <CommandMenu />
    </>
  )
}

export default App
