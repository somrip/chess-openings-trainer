import { useEffect, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Square } from 'chess.js'
import type { Opening } from '../types'
import { usePractice } from '../hooks/usePractice'
import { ProgressBar } from '../components/ProgressBar'
import { NavBar } from '../components/NavBar'

interface PracticeModeProps {
  opening: Opening
  onBack: () => void
  onChooseAnother: () => void
}

export function PracticeMode({ opening, onBack, onChooseAnother }: PracticeModeProps) {
  const { fen, status, currentMoveIndex, totalMoves, repetitions, isUserTurn, makeMove, restart } =
    usePractice(opening)

  const [shakeKey, setShakeKey] = useState(0)
  const [lastCorrect, setLastCorrect] = useState(false)

  const moveNumber = Math.floor(currentMoveIndex / 2) + 1
  const totalHalfMoves = totalMoves
  const isWhite = opening.side === 'white'

  useEffect(() => {
    if (status === 'wrong') {
      setShakeKey((k) => k + 1)
    }
    if (status === 'waiting' && currentMoveIndex > 0 && isUserTurn) {
      setLastCorrect(true)
      const t = setTimeout(() => setLastCorrect(false), 600)
      return () => clearTimeout(t)
    }
  }, [status, currentMoveIndex, isUserTurn])

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    return makeMove(sourceSquare, targetSquare, 'q')
  }

  if (status === 'complete') {
    return <SuccessScreen opening={opening} repetitions={repetitions} onAgain={restart} onChooseAnother={onChooseAnother} />
  }

  const userMoveCount = opening.side === 'white'
    ? Math.ceil(totalMoves / 2)
    : Math.floor(totalMoves / 2)

  const userMoveDone = opening.side === 'white'
    ? Math.ceil(currentMoveIndex / 2)
    : Math.floor(currentMoveIndex / 2)

  const progressMoves = Math.min(currentMoveIndex, totalHalfMoves)

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100 flex flex-col">
      <NavBar onHome={onChooseAnother} subtitle={opening.name} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-20 pb-6">
        <button
          onClick={onBack}
          className="mt-6 mb-6 flex items-center gap-2 font-body text-sm text-ivory-500 hover:text-ivory-200 transition-colors duration-200 group focus-visible:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Board */}
          <div>
            {/* Status bar */}
            <div
              key={shakeKey}
              className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-200 ${
                status === 'wrong'
                  ? 'border-red-500/50 bg-red-500/10 animate-shake'
                  : lastCorrect
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : status === 'opponent'
                  ? 'border-ink-600 bg-ink-800'
                  : 'border-ink-700 bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {status === 'wrong' ? (
                  <>
                    <span className="text-red-400 text-lg">✗</span>
                    <span className="font-body text-sm font-medium text-red-300">
                      Not quite — try again
                    </span>
                  </>
                ) : lastCorrect ? (
                  <>
                    <span className="text-emerald-400 text-lg">✓</span>
                    <span className="font-body text-sm font-medium text-emerald-300">
                      Correct!
                    </span>
                  </>
                ) : status === 'opponent' ? (
                  <>
                    <span className="animate-pulse-soft text-ivory-400 text-sm">●</span>
                    <span className="font-body text-sm text-ivory-400">
                      {isWhite ? 'Black' : 'White'} is thinking…
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gold-400 text-sm">●</span>
                    <span className="font-body text-sm font-medium text-ivory-200">
                      Your turn — play the next move
                    </span>
                  </>
                )}
              </div>

              <span className="font-body text-xs text-ivory-500">
                Move {userMoveDone} of {userMoveCount}
              </span>
            </div>

            {/* Chessboard */}
            <div className="rounded-2xl overflow-hidden border border-ink-700 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <Chessboard
                position={fen}
                onPieceDrop={onDrop}
                boardOrientation={isWhite ? 'white' : 'black'}
                arePiecesDraggable={isUserTurn && (status === 'waiting' || status === 'wrong')}
                customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customBoardStyle={{ borderRadius: '0' }}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 animate-fade-in">
            {/* Opening info */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-4">
                <div>
                  <p className="font-body text-xs text-ivory-500 mb-1">Opening</p>
                  <h2 className="font-display text-lg font-semibold text-ivory-100">{opening.name}</h2>
                </div>
              </div>

              <ProgressBar current={progressMoves} total={totalHalfMoves} />
              <p className="font-body text-xs text-ivory-500 mt-2 text-right">
                {progressMoves} / {totalHalfMoves} moves
              </p>
            </div>

            {/* Repetitions */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <p className="font-body text-xs text-ivory-500 mb-1">Completed</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-gold-400">{repetitions}</span>
                <span className="font-body text-sm text-ivory-500">
                  {repetitions === 1 ? 'repetition' : 'repetitions'}
                </span>
              </div>
              <div className="mt-3 flex gap-1.5 flex-wrap">
                {Array.from({ length: Math.max(repetitions, 5) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-md border transition-all duration-300 ${
                      i < repetitions
                        ? 'bg-gold-500 border-gold-400'
                        : 'bg-ink-700 border-ink-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <h3 className="font-display text-sm font-semibold text-ivory-300 mb-3 flex items-center gap-2">
                <span className="text-gold-400">✦</span> Key Ideas
              </h3>
              <ul className="space-y-2">
                {opening.beginnerTips.slice(0, 3).map((tip, i) => (
                  <li key={i} className="font-body text-xs text-ivory-400 leading-relaxed flex gap-2">
                    <span className="text-gold-500 flex-shrink-0">·</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Restart */}
            <button
              onClick={restart}
              className="w-full font-body text-sm text-ivory-400 hover:text-ivory-100 border border-ink-600 hover:border-ink-500 rounded-xl py-3 transition-all duration-200 focus-visible:outline-none"
            >
              ↺ Restart Opening
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SuccessScreenProps {
  opening: Opening
  repetitions: number
  onAgain: () => void
  onChooseAnother: () => void
}

function SuccessScreen({ opening, repetitions, onAgain, onChooseAnother }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      {/* Trophy */}
      <div className="text-7xl mb-6 animate-pop">♛</div>

      <p className="font-body text-sm font-medium text-gold-400 tracking-widest uppercase mb-3">
        Opening Complete
      </p>

      <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory-100 mb-4">
        Well played!
      </h1>

      <p className="font-body text-base text-ivory-400 max-w-sm mb-2">
        You've completed the <span className="text-ivory-200 font-medium">{opening.name}</span>.
      </p>

      <div className="my-8 flex items-center gap-8">
        <div className="text-center">
          <div className="font-display text-5xl font-bold text-gold-400">{repetitions}</div>
          <div className="font-body text-sm text-ivory-500 mt-1">
            {repetitions === 1 ? 'repetition' : 'repetitions'}
          </div>
        </div>
        <div className="w-px h-12 bg-ink-700" />
        <div className="text-center">
          <div className="font-display text-5xl font-bold text-ivory-200">
            {Math.ceil(opening.moves.length / 2)}
          </div>
          <div className="font-body text-sm text-ivory-500 mt-1">moves mastered</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={onAgain}
          className="flex-1 bg-gold-500 hover:bg-gold-400 text-ink-950 font-body font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(212,165,32,0.4)] focus-visible:outline-none"
        >
          Practice Again
        </button>
        <button
          onClick={onChooseAnother}
          className="flex-1 bg-ink-800 hover:bg-ink-700 text-ivory-200 font-body font-medium text-sm px-6 py-3.5 rounded-xl border border-ink-600 hover:border-ink-500 transition-all duration-200 focus-visible:outline-none"
        >
          Choose Another
        </button>
      </div>
    </div>
  )
}
