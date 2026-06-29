import { useEffect, useMemo, useRef, useState } from 'react'
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
  const extras = getExtras(opening.id)

  // The Learn walkthrough can follow the main line, or branch into a variation
  // at its fork point and continue from there.
  const [branch, setBranch] = useState<BranchLine | null>(null)
  // Where to resume the main line when leaving a variation (its fork move).
  const [mainResume, setMainResume] = useState(0)

  // Reset branching if the opening itself changes.
  useEffect(() => {
    setBranch(null)
    setMainResume(0)
  }, [opening.id])

  const line = branch ?? opening
  const isWhite = line.side === 'white'
  const lineId = branch ? `${opening.id}::${branch.id}` : opening.id
  const initialIndex = branch ? branch.branchFromMove! : mainResume
  const demo = useDemo({ id: lineId, moves: line.moves }, initialIndex)

  const notes = branch ? branch.moveNotes ?? [] : extras?.learnNotes ?? opening.moveNotes

  const whatIfRef = useRef<HTMLDivElement>(null)

  function enterBranch(d: BranchLine) {
    setMainResume(d.branchFromMove!)
    setBranch(d)
  }

  function scrollToWhatIfs() {
    whatIfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // The move just played and its board squares (for highlighting + the SAN badge).
  const { lastMove, san, byUser } = useMemo(() => {
    if (demo.moveIndex === 0) return { lastMove: null, san: null, byUser: false }
    const g = new Chess()
    let res = null
    for (let i = 0; i < demo.moveIndex; i++) res = g.move(line.moves[i])
    const idx = demo.moveIndex - 1
    const userPlayed = isWhite ? idx % 2 === 0 : idx % 2 === 1
    return res ? { lastMove: { from: res.from, to: res.to }, san: res.san, byUser: userPlayed } : { lastMove: null, san: null, byUser: false }
  }, [demo.moveIndex, line.moves, isWhite])

  const moveNumber = Math.ceil(demo.moveIndex / 2)
  const explanation = demo.moveIndex > 0 ? notes[demo.moveIndex - 1] : null

  // Variations that fork right here — i.e. the opponent could deviate on the
  // move that is about to be played. Only offered while on the main line.
  const whatIfs = useMemo(
    () => (branch ? [] : (opening.deviations ?? []).filter((d) => d.branchFromMove === demo.moveIndex)),
    [branch, opening.deviations, demo.moveIndex],
  )

  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(212,165,32,0.25)' }
    squareStyles[lastMove.to] = { background: 'rgba(212,165,32,0.4)' }
  }

  const movePairs: Array<{ w: string; b?: string; wIdx: number; bIdx: number }> = []
  for (let i = 0; i < line.moves.length; i += 2) {
    movePairs.push({ w: line.moves[i], b: line.moves[i + 1], wIdx: i, bIdx: i + 1 })
  }

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100 flex flex-col">
      <NavBar onHome={onBack} subtitle={`${opening.name} · Learn${branch ? ` · ${branch.name}` : ''}`} />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-16 sm:pt-20 pb-8">
        <button
          onClick={onBack}
          className="mt-3 mb-3 sm:mt-6 sm:mb-6 flex items-center gap-2 font-body text-sm text-ivory-400 hover:text-ivory-100 transition-colors duration-200 group focus-visible:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to overview
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-4 sm:gap-8 items-start">
          {/* Board + transport */}
          <div className="mx-auto w-full max-w-[330px] lg:max-w-none">
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
                    onClick={() => (branch ? onStartBranch(branch) : onPractice())}
                    className="flex items-center gap-1.5 font-body text-sm font-semibold text-ink-950 bg-gold-500 hover:bg-gold-400 rounded-xl px-4 py-2.5 transition-colors duration-150 focus-visible:outline-none"
                  >
                    {branch ? 'Practice this line ›' : 'Practice now ›'}
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

            {/* Mobile-only cue: variations exist at this move (panel is below the fold). */}
            {whatIfs.length > 0 && (
              <button
                onClick={scrollToWhatIfs}
                className="lg:hidden mt-3 w-full flex items-center justify-between gap-2 rounded-xl border border-gold-500/40 bg-gold-500/10 px-4 py-3 text-left transition-colors duration-200 hover:bg-gold-500/15 focus-visible:outline-none"
              >
                <span className="font-body text-sm text-ivory-100">
                  <span className="text-gold-400">⤳</span> {whatIfs.length} other{' '}
                  {whatIfs.length > 1 ? 'moves' : 'move'} your opponent might play here
                </span>
                <span className="flex-shrink-0 font-body text-xs font-semibold text-gold-300">View ↓</span>
              </button>
            )}
          </div>

          {/* Explanation panel */}
          <div className="space-y-4 sm:space-y-5">
            {/* Variation banner — shown while learning a branch */}
            {branch && (
              <div className="bg-gold-500/10 border border-gold-500/40 rounded-2xl p-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-body text-[11px] uppercase tracking-wide text-gold-300/80 mb-0.5">Learning variation</p>
                  <p className="font-display text-sm font-semibold text-ivory-100">{branch.name}</p>
                </div>
                <button
                  onClick={() => setBranch(null)}
                  className="flex-shrink-0 font-body text-xs font-medium text-ivory-300 hover:text-ivory-100 border border-ink-600 hover:border-ink-500 rounded-lg px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none"
                >
                  ‹ Back to main line
                </button>
              </div>
            )}

            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 sm:p-6 min-h-[150px] sm:min-h-[220px]">
              {explanation ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-body text-xs text-ivory-500">Move {moveNumber} of {Math.ceil(demo.totalMoves / 2)}</span>
                    <span className="font-body text-xs px-2 py-0.5 rounded-full bg-ink-900 border border-ink-600 text-ivory-400">
                      {byUser ? 'You' : 'Opponent'}
                    </span>
                  </div>
                  <div className="font-display text-3xl sm:text-4xl font-bold text-gold-400 mb-2 sm:mb-4">{san}</div>
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
              <div ref={whatIfRef} className="bg-ink-800 border border-gold-500/30 rounded-2xl p-5 scroll-mt-20">
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
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => enterBranch(d)}
                          className="font-body text-xs font-semibold text-ink-950 bg-gold-500 hover:bg-gold-400 rounded-lg px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none"
                        >
                          📖 Learn this line
                        </button>
                        <button
                          onClick={() => onStartBranch(d)}
                          className="font-body text-xs font-medium text-gold-300 hover:text-gold-200 border border-gold-500/30 hover:border-gold-500/60 rounded-lg px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none"
                        >
                          Practice this line →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Move list (hidden on mobile to save space; use Prev/Next or the menu) */}
            <div className="hidden lg:block bg-ink-800 border border-ink-700 rounded-2xl p-5">
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
              onClick={() => (branch ? onStartBranch(branch) : onPractice())}
              className="w-full flex items-center justify-center gap-2 font-body text-sm font-semibold text-ivory-200 bg-ink-800 hover:bg-ink-700 border border-ink-600 hover:border-gold-400/50 rounded-xl py-3.5 transition-all duration-200 focus-visible:outline-none"
            >
              {branch ? `Ready? Practice this variation →` : `Ready? Practice this opening →`}
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
