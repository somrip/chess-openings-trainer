import { useState } from 'react'
import type { Opening, AppView, BranchLine } from './types'
import { Home } from './pages/Home'
import { OpeningPage } from './pages/OpeningPage'
import { PracticeMode } from './pages/PracticeMode'
import { useProgress } from './hooks/useProgress'

export function App() {
  const [view, setView] = useState<AppView>('home')
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<BranchLine | null>(null)
  const [maxMoves, setMaxMoves] = useState<number | undefined>(undefined)
  const progress = useProgress()

  function handleSelectOpening(opening: Opening) {
    setSelectedOpening(opening)
    setView('opening')
  }

  function handleStartPractice(limit?: number) {
    setSelectedBranch(null)
    setMaxMoves(limit)
    setView('practice')
  }

  function handleStartBranch(branch: BranchLine) {
    setSelectedBranch(branch)
    setMaxMoves(undefined)
    setView('practice')
  }

  function handleGoHome() {
    setView('home')
    setSelectedOpening(null)
    setSelectedBranch(null)
  }

  function handleBackToOpening() {
    setSelectedBranch(null)
    setView('opening')
  }

  if (view === 'opening' && selectedOpening) {
    return (
      <OpeningPage
        opening={selectedOpening}
        progress={progress.getProgress(selectedOpening.id)}
        isDue={progress.isDue(selectedOpening.id)}
        onStartPractice={handleStartPractice}
        onStartBranch={handleStartBranch}
        onBack={handleGoHome}
      />
    )
  }

  if (view === 'practice' && selectedOpening) {
    return (
      <PracticeMode
        opening={selectedOpening}
        branch={selectedBranch}
        maxMoves={maxMoves}
        onBack={handleBackToOpening}
        onChooseAnother={handleGoHome}
        onCompleted={progress.recordCompletion}
      />
    )
  }

  return (
    <Home
      onSelect={handleSelectOpening}
      streak={progress.streak}
      learnedCount={progress.learnedCount}
      dueCount={progress.dueCount}
      getProgress={progress.getProgress}
      isDue={progress.isDue}
    />
  )
}
