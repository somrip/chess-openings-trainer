import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { Square, Move } from 'chess.js'
import type { Opening, TrapLine } from '../types'
import { usePractice } from '../hooks/usePractice'
import { useSound } from '../hooks/useSound'
import { ProgressBar } from '../components/ProgressBar'
import { NavBar } from '../components/NavBar'

interface PracticeModeProps {
  opening: Opening
  trap?: TrapLine | null
  /** When set, practice only the first N half-moves (the "essentials" stage). */
  maxMoves?: number
  onBack: () => void
  onChooseAnother: () => void
  onCompleted: (openingId: string) => void
}

export function PracticeMode({ opening, trap, maxMoves, onBack, onChooseAnother, onCompleted }: PracticeModeProps) {
  const baseMoves = trap ? trap.moves : opening.moves
  const isEssentials = !trap && typeof maxMoves === 'number' && maxMoves < baseMoves.length
  const moves = isEssentials ? baseMoves.slice(0, maxMoves) : baseMoves
  const side = trap ? trap.side : opening.side
  const notes = (trap ? trap.moveNotes : opening.moveNotes) ?? []
  const title = trap ? `${opening.name}: ${trap.name}` : opening.name
  // Only a full main-line completion counts toward learned/spaced-repetition.
  const recordsProgress = !trap && !isEssentials
  const isWhite = side === 'white'

  const [soundOn, setSoundOn] = useState(true)
  const play = useSound(soundOn)

  const [shakeKey, setShakeKey] = useState(0)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [hintLevel, setHintLevel] = useState(0)
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null)
  const completedRef = useRef(false)

  function soundForMove(move: Move) {
    if (move.san.includes('+') || move.san.includes('#')) play('check')
    else if (move.captured) play('capture')
    else play('move')
  }

  const { fen, status, currentMoveIndex, totalMoves, repetitions, isUserTurn, lastMove, lastMistake, makeMove, getHint, restart } =
    usePractice(
      { moves, side },
      {
        onCorrect: (m) => {
          soundForMove(m)
          setLastCorrect(true)
        },
        onOpponent: (m) => soundForMove(m),
        onWrong: () => {
          play('error')
          setShakeKey((k) => k + 1)
        },
        onComplete: () => {
          play('success')
          if (recordsProgress && !completedRef.current) {
            completedRef.current = true
            onCompleted(opening.id)
          }
        },
      },
    )

  // Clear the "correct!" flash, the active hint, and any selection when the
  // position advances.
  useEffect(() => {
    setHintLevel(0)
    setSelectedSquare(null)
    if (lastCorrect) {
      const t = setTimeout(() => setLastCorrect(false), 700)
      return () => clearTimeout(t)
    }
  }, [currentMoveIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const canMoveNow = isUserTurn && (status === 'waiting' || status === 'wrong')

  function onDrop(sourceSquare: Square, targetSquare: Square): boolean {
    setSelectedSquare(null)
    return makeMove(sourceSquare, targetSquare, 'q')
  }

  function ownPieceAt(square: Square): boolean {
    const piece = new Chess(fen).get(square)
    return !!piece && piece.color === (isWhite ? 'w' : 'b')
  }

  // Click / tap to move: tap a piece, then tap its destination.
  function onSquareClick(square: Square) {
    if (!canMoveNow) return
    if (selectedSquare) {
      if (square === selectedSquare) {
        setSelectedSquare(null)
        return
      }
      const moved = makeMove(selectedSquare, square, 'q')
      if (moved) {
        setSelectedSquare(null)
        return
      }
      // Missed: reselect if they tapped another of their own pieces, else clear.
      setSelectedSquare(ownPieceAt(square) ? square : null)
      return
    }
    if (ownPieceAt(square)) setSelectedSquare(square)
  }

  function handleRestart() {
    completedRef.current = false
    restart()
  }

  if (status === 'complete') {
    return (
      <SuccessScreen
        opening={opening}
        trap={trap}
        recorded={recordsProgress}
        isEssentials={isEssentials}
        onAgain={handleRestart}
        onChooseAnother={onChooseAnother}
      />
    )
  }

  const userMoveCount = isWhite ? Math.ceil(totalMoves / 2) : Math.floor(totalMoves / 2)
  const userMoveDone = isWhite ? Math.ceil(currentMoveIndex / 2) : Math.floor(currentMoveIndex / 2)
  const progressMoves = Math.min(currentMoveIndex, totalMoves)

  // Explanation for the move that was just played (user or opponent).
  const lastNote = currentMoveIndex > 0 ? notes[currentMoveIndex - 1] : null

  // Hint highlighting.
  const hint = hintLevel > 0 ? getHint() : null
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(212,165,32,0.18)' }
    squareStyles[lastMove.to] = { background: 'rgba(212,165,32,0.28)' }
  }
  if (hint) {
    squareStyles[hint.from] = {
      background: 'rgba(74,124,89,0.55)',
      boxShadow: 'inset 0 0 0 3px rgba(240,192,64,0.9)',
    }
    if (hintLevel >= 2) {
      squareStyles[hint.to] = {
        background: 'radial-gradient(circle, rgba(240,192,64,0.85) 28%, transparent 30%)',
      }
    }
  }
  // Click-to-move: highlight the selected piece and dot its legal destinations.
  if (selectedSquare) {
    squareStyles[selectedSquare] = {
      ...squareStyles[selectedSquare],
      background: 'rgba(240,192,64,0.35)',
      boxShadow: 'inset 0 0 0 3px rgba(240,192,64,0.8)',
    }
    for (const m of new Chess(fen).moves({ square: selectedSquare, verbose: true })) {
      squareStyles[m.to] = {
        ...squareStyles[m.to],
        background: m.captured
          ? 'radial-gradient(circle, transparent 55%, rgba(240,192,64,0.5) 56%)'
          : 'radial-gradient(circle, rgba(240,192,64,0.7) 22%, transparent 24%)',
      }
    }
  }
  const customArrows: Array<[Square, Square]> = hint && hintLevel >= 2 ? [[hint.from as Square, hint.to as Square]] : []

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100 flex flex-col">
      <NavBar onHome={onChooseAnother} subtitle={title} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-20 pb-6">
        <div className="mt-6 mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 font-body text-sm text-ivory-500 hover:text-ivory-200 transition-colors duration-200 group focus-visible:outline-none"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>

          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn((s) => !s)}
            className="flex items-center gap-2 font-body text-xs text-ivory-500 hover:text-ivory-200 border border-ink-700 hover:border-ink-600 rounded-lg px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none"
            title={soundOn ? 'Mute sounds' : 'Unmute sounds'}
          >
            {soundOn ? '🔊' : '🔇'} Sound {soundOn ? 'on' : 'off'}
          </button>
        </div>

        {trap && (
          <div className="mb-4 rounded-xl border border-gold-500/30 bg-gold-500/5 px-4 py-3">
            <p className="font-body text-sm text-ivory-300 leading-relaxed">
              <span className="text-gold-400 font-medium">Trap · {trap.name} — </span>
              {trap.setup}
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Board column */}
          <div>
            {/* Status bar */}
            <div
              key={shakeKey}
              className={`mb-4 flex items-center justify-between rounded-xl px-4 py-3 border transition-all duration-200 ${
                status === 'wrong'
                  ? 'border-red-500/50 bg-red-500/10 animate-shake'
                  : lastCorrect
                  ? 'border-emerald-500/50 bg-emerald-500/10'
                  : 'border-ink-700 bg-ink-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {status === 'wrong' ? (
                  <>
                    <span className="text-red-400 text-lg">✗</span>
                    <span className="font-body text-sm font-medium text-red-300">
                      {lastMistake ? `Not quite — ${lastMistake}` : 'Not quite — try again.'}
                    </span>
                  </>
                ) : lastCorrect ? (
                  <>
                    <span className="text-emerald-400 text-lg">✓</span>
                    <span className="font-body text-sm font-medium text-emerald-300">Correct!</span>
                  </>
                ) : status === 'opponent' ? (
                  <>
                    <span className="animate-pulse-soft text-ivory-400 text-sm">●</span>
                    <span className="font-body text-sm text-ivory-400">{isWhite ? 'Black' : 'White'} is thinking…</span>
                  </>
                ) : (
                  <>
                    <span className="text-gold-400 text-sm">●</span>
                    <span className="font-body text-sm font-medium text-ivory-200">Your turn — play the next move</span>
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
                onSquareClick={onSquareClick}
                boardOrientation={isWhite ? 'white' : 'black'}
                arePiecesDraggable={canMoveNow}
                customSquareStyles={squareStyles}
                customArrows={customArrows}
                customArrowColor="#f0c040"
                customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customBoardStyle={{ borderRadius: '0' }}
              />
            </div>

            {/* Per-move explanation */}
            <div className="mt-4 rounded-xl border border-ink-700 bg-ink-800 px-4 py-3 min-h-[3.5rem] flex items-center gap-3">
              <span className="flex-shrink-0 text-gold-400 text-sm">💡</span>
              <p className="font-body text-sm text-ivory-300 leading-relaxed">
                {lastNote ?? (
                  <span className="text-ivory-500">
                    Make the first move to begin. Explanations for each move appear here.
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5 animate-fade-in">
            {/* Progress */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <p className="font-body text-xs text-ivory-500 mb-1">
                {trap ? 'Trap' : isEssentials ? 'Essentials · first moves' : 'Opening'}
              </p>
              <h2 className="font-display text-lg font-semibold text-ivory-100 mb-4">{title}</h2>
              <ProgressBar current={progressMoves} total={totalMoves} />
              <p className="font-body text-xs text-ivory-500 mt-2 text-right">
                {progressMoves} / {totalMoves} moves
              </p>
            </div>

            {/* Hint */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-sm font-semibold text-ivory-300 flex items-center gap-2">
                  <span className="text-gold-400">🔍</span> Stuck?
                </h3>
                {hintLevel > 0 && (
                  <span className="font-body text-xs text-ivory-500">
                    {hintLevel === 1 ? 'Which piece' : 'Where to'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setHintLevel((l) => Math.min(l + 1, 2))}
                disabled={!isUserTurn || hintLevel >= 2}
                className="w-full font-body text-sm text-ink-950 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:pointer-events-none rounded-xl py-2.5 font-medium transition-all duration-200 focus-visible:outline-none"
              >
                {hintLevel === 0 ? 'Show a hint' : hintLevel === 1 ? 'Show me where' : 'Hint shown'}
              </button>
              <p className="font-body text-xs text-ivory-600 mt-2 leading-relaxed">
                First hint highlights the piece, second shows the target square.
              </p>
            </div>

            {/* Repetitions */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <p className="font-body text-xs text-ivory-500 mb-1">This session</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-gold-400">{repetitions}</span>
                <span className="font-body text-sm text-ivory-500">
                  {repetitions === 1 ? 'completion' : 'completions'}
                </span>
              </div>
            </div>

            {/* Restart */}
            <button
              onClick={handleRestart}
              className="w-full font-body text-sm text-ivory-400 hover:text-ivory-100 border border-ink-600 hover:border-ink-500 rounded-xl py-3 transition-all duration-200 focus-visible:outline-none"
            >
              ↺ Restart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SuccessScreenProps {
  opening: Opening
  trap?: TrapLine | null
  recorded: boolean
  isEssentials: boolean
  onAgain: () => void
  onChooseAnother: () => void
}

function SuccessScreen({ opening, trap, recorded, isEssentials, onAgain, onChooseAnother }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="text-7xl mb-6 animate-pop">{trap ? '🎯' : '♛'}</div>

      <p className="font-body text-sm font-medium text-gold-400 tracking-widest uppercase mb-3">
        {trap ? 'Trap Mastered' : 'Opening Complete'}
      </p>

      <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory-100 mb-4">Well played!</h1>

      <p className="font-body text-base text-ivory-400 max-w-md mb-6">
        {trap ? (
          <>You sprang the <span className="text-ivory-200 font-medium">{trap.name}</span>.</>
        ) : isEssentials ? (
          <>You've got the <span className="text-ivory-200 font-medium">essentials</span> of the {opening.name}. Ready for the full line?</>
        ) : (
          <>You've completed the <span className="text-ivory-200 font-medium">{opening.name}</span>.</>
        )}
      </p>

      {/* Takeaway: trap payoff or opening plan */}
      <div className="max-w-md mb-8 rounded-2xl border border-ink-700 bg-ink-800 px-6 py-4">
        <p className="font-body text-xs text-gold-400 uppercase tracking-wider mb-2">
          {trap ? 'The lesson' : 'Your plan from here'}
        </p>
        <p className="font-body text-sm text-ivory-300 leading-relaxed">
          {trap ? trap.payoff : opening.plan}
        </p>
      </div>

      {recorded && (
        <p className="font-body text-sm text-ivory-500 mb-8">
          ✓ Saved to your progress · scheduled for spaced review
        </p>
      )}

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
