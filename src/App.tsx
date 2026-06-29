import { useState } from 'react'
import type { Opening, AppView, BranchLine } from './types'
import { openings, getOpeningById } from './data/openings'
import { NavContext } from './components/NavContext'
import type { NavContextValue } from './components/NavContext'
import { Home } from './pages/Home'
import { ReviewComplete } from './pages/ReviewComplete'
import { OpeningPage } from './pages/OpeningPage'
import { LearnScreen } from './pages/LearnScreen'
import { PracticeMode } from './pages/PracticeMode'
import { FreePlay } from './pages/FreePlay'
import { useProgress } from './hooks/useProgress'

export function App() {
  const [view, setView] = useState<AppView>('home')
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)
  const [selectedBranch, setSelectedBranch] = useState<BranchLine | null>(null)
  const [maxMoves, setMaxMoves] = useState<number | undefined>(undefined)
  const [playState, setPlayState] = useState<{ fen: string; side: 'white' | 'black' } | null>(null)
  // Active spaced-repetition review session: a queue of due opening ids.
  const [review, setReview] = useState<{ queue: string[]; index: number } | null>(null)
  // Set when a review session finishes, to show the completion screen.
  const [reviewDone, setReviewDone] = useState<number | null>(null)
  const progress = useProgress()

  function handleSelectOpening(opening: Opening) {
    setReview(null)
    setSelectedBranch(null)
    setSelectedOpening(opening)
    setView('opening')
  }

  function handleStartLearn() {
    setView('learn')
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

  function handleStartReview() {
    const queue = openings.filter((o) => progress.isDue(o.id)).map((o) => o.id)
    if (queue.length === 0) return
    setReview({ queue, index: 0 })
    setReviewDone(null)
    setSelectedOpening(getOpeningById(queue[0]) ?? null)
    setSelectedBranch(null)
    setMaxMoves(undefined)
    setView('practice')
  }

  function handleReviewNext() {
    if (!review) return
    const next = review.index + 1
    if (next < review.queue.length) {
      setReview({ ...review, index: next })
      setSelectedOpening(getOpeningById(review.queue[next]) ?? null)
    } else {
      setReviewDone(review.queue.length)
      setReview(null)
      setSelectedOpening(null)
      setView('home')
    }
  }

  function handleExitReview() {
    setReview(null)
    setSelectedOpening(null)
    setView('home')
  }

  function handleGoHome() {
    setView('home')
    setSelectedOpening(null)
    setSelectedBranch(null)
    setReview(null)
  }

  function handleBackToOpening() {
    setSelectedBranch(null)
    setView('opening')
  }

  function handlePlayOn(fen: string, playSide: 'white' | 'black') {
    setPlayState({ fen, side: playSide })
    setView('play')
  }

  const navValue: NavContextValue = {
    onSelectOpening: handleSelectOpening,
    onHome: handleGoHome,
    onStartReview: handleStartReview,
    currentOpeningId: selectedOpening?.id,
    dueCount: progress.dueCount,
    streak: progress.streak,
    isDue: progress.isDue,
    isLearned: (id) => !!progress.getProgress(id),
  }

  function renderView() {
    if (view === 'opening' && selectedOpening) {
      return (
        <OpeningPage
          opening={selectedOpening}
          progress={progress.getProgress(selectedOpening.id)}
          isDue={progress.isDue(selectedOpening.id)}
          onStartLearn={handleStartLearn}
          onStartPractice={handleStartPractice}
          onStartBranch={handleStartBranch}
          onBack={handleGoHome}
        />
      )
    }

    if (view === 'learn' && selectedOpening) {
      return (
        <LearnScreen
          opening={selectedOpening}
          onPractice={() => handleStartPractice()}
          onStartBranch={handleStartBranch}
          onBack={() => setView('opening')}
        />
      )
    }

    if (view === 'practice' && selectedOpening) {
      return (
        <PracticeMode
          key={review ? `review-${review.index}` : `${selectedOpening.id}-${selectedBranch?.id ?? 'main'}`}
          opening={selectedOpening}
          branch={selectedBranch}
          maxMoves={maxMoves}
          review={review ? { index: review.index, total: review.queue.length, onNext: handleReviewNext } : undefined}
          onBack={review ? handleExitReview : handleBackToOpening}
          onChooseAnother={review ? handleExitReview : handleGoHome}
          onCompleted={progress.recordCompletion}
          onPlayOn={handlePlayOn}
        />
      )
    }

    if (view === 'play' && selectedOpening && playState) {
      return (
        <FreePlay
          startFen={playState.fen}
          side={playState.side}
          openingName={selectedOpening.name}
          onBack={() => setView('practice')}
          onHome={handleGoHome}
        />
      )
    }

    if (reviewDone !== null) {
      return <ReviewComplete count={reviewDone} streak={progress.streak} onDone={() => setReviewDone(null)} />
    }

    return (
      <Home
        onSelect={handleSelectOpening}
        onStartReview={handleStartReview}
        streak={progress.streak}
        learnedCount={progress.learnedCount}
        dueCount={progress.dueCount}
        getProgress={progress.getProgress}
        isDue={progress.isDue}
      />
    )
  }

  return <NavContext.Provider value={navValue}>{renderView()}</NavContext.Provider>
}
