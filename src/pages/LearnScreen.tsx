import { useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { Opening, BranchLine } from '../types'
import { NavBar } from '../components/NavBar'
import { useDemo } from '../hooks/useDemo'
import { getExtras } from '../data/openingExtras'

interface LearnScreenProps {
  opening: Opening
  onPractice: () => void
  onStartBranch: (branch: BranchLine) => void
  onBack: () => void
}

export function LearnScreen({ opening, onPractice, onStartBranch, onBack }: LearnScreenProps) {
  const isWhite = opening.side === 'white'
  const demo = useDemo(opening)
  const extras = getExtras(opening.id)
  const notes = extras?.learnNotes ?? opening.moveNotes

  // The move just played and its board squares (for highlighting + the SAN badge).
  const { lastMove, san, byUser } = useMemo(() => {
    if (demo.moveIndex === 0) return { lastMove: null, san: null, byUser: false }
    const g = new Chess()
    let res = null
    for (let i = 0; i < demo.moveIndex; i++) res = g.move(opening.moves[i])
    const idx = demo.moveIndex - 1
    const userPlayed = isWhite ? idx % 2 === 0 : idx % 2 === 1
    return res ? { lastMove: { from: res.from, to: res.to }, san: res.san, byUser: userPlayed } : { lastMove: null, san: null, byUser: false }
  }, [demo.moveIndex, opening.moves, isWhite])

  const moveNumber = Math.ceil(demo.moveIndex / 2)
  const explanation = demo.moveIndex > 0 ? notes[demo.moveIndex - 1] : null

  // Variations that fork right here — i.e. the opponent could deviate on the
  // move that is about to be played. Surface them at the decision point.
  const whatIfs = useMemo(
    () => (opening.deviations ?? []).filter((d) => d.branchFromMove === demo.moveIndex),
    [opening.deviations, demo.moveIndex],
  )

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(212,165,32,0.25)' }
    squareStyles[lastMove.to] = { background: 'rgba(212,165,32,0.4)' }
  }

  const movePairs: Array<{ w: string; b?: string; wIdx: number; bIdx: number }> = []
  for (let i = 0; i < opening.moves.length; i += 2) {
    movePairs.push({ w: opening.moves[i], b: opening.moves[i + 1], wIdx: i, bIdx: i + 1 })
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100 flex flex-col">
      <NavBar onHome={onBack} subtitle={`${opening.name} · Learn`} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-20 pb-8">
        <button
          onClick={onBack}
          className="mt-6 mb-6 flex items-center gap-2 font-body text-sm text-ivory-400 hover:text-ivory-100 transition-colors duration-200 group focus-visible:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to overview
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-8 items-start">
          {/* Board + transport */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-ink-700 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <Chessboard
                position={demo.fen}
                boardOrientation={isWhite ? 'white' : 'black'}
                arePiecesDraggable={false}
                customSquareStyles={squareStyles}
                customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customBoardStyle={{ borderRadius: '0' }}
              />
            </div>

            {/* Progress + transport */}
            <div className="mt-4">
              <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden mb-3">
                <div className="h-full bg-gold-500 rounded-full transition-all duration-500" style={{ width: `${(demo.moveIndex / demo.totalMoves) * 100}%` }} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={demo.prev}
                  disabled={demo.moveIndex === 0}
                  className="flex items-center gap-1.5 font-body text-sm text-ivory-300 hover:text-ivory-100 border border-ink-600 hover:border-ink-500 disabled:opacity-30 disabled:pointer-events-none rounded-xl px-4 py-2.5 transition-colors duration-150 focus-visible:outline-none"
                >
                  ‹ Previous
                </button>
                <button
                  onClick={demo.playing ? demo.pause : demo.play}
                  className="font-body text-sm text-ivory-300 hover:text-ivory-100 border border-ink-600 hover:border-ink-500 rounded-xl px-4 py-2.5 transition-colors duration-150 focus-visible:outline-none"
                >
                  {demo.playing ? '❚❚ Pause' : '▶ Auto-play'}
                </button>
                {demo.isComplete ? (
                  <button
                    onClick={onPractice}
                    className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink-950 bg-gold-500 hover:bg-gold-400 rounded-xl px-4 py-2.5 transition-colors duration-150 focus-visible:outline-none"
                  >
                    Practice now ›
                  </button>
                ) : (
                  <button
                    onClick={demo.next}
                    className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink-950 bg-gold-500 hover:bg-gold-400 rounded-xl px-4 py-2.5 transition-colors duration-150 focus-visible:outline-none"
                  >
                    Next ›
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Explanation panel */}
          <div className="space-y-5">
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-6 min-h-[220px]">
              {explanation ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-body text-xs text-ivory-500">Move {moveNumber} of {Math.ceil(demo.totalMoves / 2)}</span>
                    <span className="font-body text-xs px-2 py-0.5 rounded-full bg-ink-900 border border-ink-600 text-ivory-400">
                      {byUser ? 'You' : 'Opponent'}
                    </span>
                  </div>
                  <div className="font-display text-4xl font-bold text-gold-400 mb-4">{san}</div>
                  <p className="font-body text-base text-ivory-200 leading-relaxed">{explanation}</p>
                </>
              ) : (
                <div className="h-full flex flex-col justify-center">
                  <h2 className="font-display text-2xl font-bold text-ivory-100 mb-2">Learn the {opening.name}</h2>
                  <p className="font-body text-base text-ivory-400 leading-relaxed">
                    Step through the opening one move at a time. Each move comes with an explanation of the idea behind it
                    and why it's good. Press <span className="text-gold-400 font-medium">Next</span> to begin.
                  </p>
                </div>
              )}
            </div>

            {/* Contextual variations: what if the opponent deviates here? */}
            {whatIfs.length > 0 && (
              <div className="bg-ink-800 border border-gold-500/30 rounded-2xl p-5">
                <h3 className="font-display text-sm font-semibold text-ivory-100 mb-1 flex items-center gap-2">
                  <span className="text-gold-400">⤳</span> What if they play something else?
                </h3>
                <p className="font-body text-xs text-ivory-500 mb-4">
                  Here the main line continues{' '}
                  <span className="text-ivory-300 font-medium">{opening.moves[demo.moveIndex]}</span>. But your opponent
                  might try:
                </p>
                <div className="space-y-3">
                  {whatIfs.map((d) => (
                    <div key={d.id} className="rounded-xl border border-ink-700 bg-ink-900/60 p-3">
                      <p className="font-body text-sm text-ivory-200 leading-relaxed mb-1">
                        <span className="font-semibold text-gold-300">{d.moves[d.branchFromMove!]}</span> — {d.name}
                      </p>
                      <p className="font-body text-xs text-ivory-400 leading-relaxed mb-2.5">{d.setup}</p>
                      <button
                        onClick={() => onStartBranch(d)}
                        className="font-body text-xs font-medium text-gold-300 hover:text-gold-200 border border-gold-500/30 hover:border-gold-500/60 rounded-lg px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none"
                      >
                        Practice this line →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Move list */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {movePairs.map((pair, pairIdx) => (
                  <span key={pairIdx} className="font-body text-sm flex items-baseline gap-1">
                    <span className="text-ivory-600">{pairIdx + 1}.</span>
                    <MoveBtn label={pair.w} active={demo.moveIndex === pair.wIdx + 1} played={demo.moveIndex > pair.wIdx} onClick={() => demo.goTo(pair.wIdx + 1)} />
                    {pair.b !== undefined && (
                      <MoveBtn label={pair.b} active={demo.moveIndex === pair.bIdx + 1} played={demo.moveIndex > pair.bIdx} onClick={() => demo.goTo(pair.bIdx + 1)} />
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Always-available practice CTA */}
            <button
              onClick={onPractice}
              className="w-full flex items-center justify-center gap-2 font-body text-sm font-semibold text-ivory-200 bg-ink-800 hover:bg-ink-700 border border-ink-600 hover:border-gold-400/50 rounded-xl py-3.5 transition-all duration-200 focus-visible:outline-none"
            >
              Ready? Practice this opening →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MoveBtn({ label, active, played, onClick }: { label: string; active: boolean; played: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-1.5 py-0.5 rounded transition-colors duration-100 ${
        active ? 'bg-gold-500 text-ink-950 font-semibold' : played ? 'text-ivory-200 hover:text-ivory-100' : 'text-ivory-600 hover:text-ivory-400'
      }`}
    >
      {label}
    </button>
  )
}
