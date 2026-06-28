import { useState } from 'react'
import type { Opening, AppView } from './types'
import { Home } from './pages/Home'
import { OpeningPage } from './pages/OpeningPage'
import { PracticeMode } from './pages/PracticeMode'

export function App() {
  const [view, setView] = useState<AppView>('home')
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)

  function handleSelectOpening(opening: Opening) {
    setSelectedOpening(opening)
    setView('opening')
  }

  function handleStartPractice() {
    setView('practice')
  }

  function handleGoHome() {
    setView('home')
    setSelectedOpening(null)
  }

  function handleBackToOpening() {
    setView('opening')
  }

  if (view === 'opening' && selectedOpening) {
    return (
      <OpeningPage
        opening={selectedOpening}
        onStartPractice={handleStartPractice}
        onBack={handleGoHome}
      />
    )
  }

  if (view === 'practice' && selectedOpening) {
    return (
      <PracticeMode
        opening={selectedOpening}
        onBack={handleBackToOpening}
        onChooseAnother={handleGoHome}
      />
    )
  }

  return <Home onSelect={handleSelectOpening} />
}
