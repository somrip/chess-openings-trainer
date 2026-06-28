import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import type { Opening, OpeningProgress, BranchLine } from '../types'
import { NavBar } from '../components/NavBar'
import { useDemo } from '../hooks/useDemo'
import { getExtras } from '../data/openingExtras'

interface OpeningPageProps {
  opening: Opening
  progress?: OpeningProgress
  isDue: boolean
  onStartPractice: (limit?: number) => void
  onStartBranch: (branch: BranchLine) => void
  onBack: () => void
}

export function OpeningPage({ opening, progress, isDue, onStartPractice, onStartBranch, onBack }: OpeningPageProps) {
  const isWhite = opening.side === 'white'
  const moveCount = Math.ceil(opening.moves.length / 2)
  const demo = useDemo(opening)
  const extras = getExtras(opening.id)

  // Progressive stages: learn the first few moves before the whole line.
  const essentialsLen = Math.min(6, opening.moves.length)
  const hasStages = opening.moves.length > essentialsLen
  const [stage, setStage] = useState<'essentials' | 'full'>('full')

  const movePairs: Array<{ w: string; b?: string; wIdx: number; bIdx: number }> = []
  for (let i = 0; i < opening.moves.length; i += 2) {
    movePairs.push({ w: opening.moves[i], b: opening.moves[i + 1], wIdx: i, bIdx: i + 1 })
  }

  const demoNote = demo.moveIndex > 0 ? opening.moveNotes[demo.moveIndex - 1] : null

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100">
      <NavBar onHome={onBack} subtitle={opening.name} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-12">
        <button
          onClick={onBack}
          className="mt-6 mb-8 flex items-center gap-2 font-body text-sm text-ivory-400 hover:text-ivory-100 transition-colors duration-200 group focus-visible:outline-none"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform duration-200">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back to openings
        </button>

        <div className="grid lg:grid-cols-2 gap-10 items-start">
          {/* Left: Info */}
          <div className="animate-slide-up">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {opening.eco && (
                <span className="font-body text-xs font-medium text-ivory-400 bg-ink-800 border border-ink-600 px-2.5 py-1 rounded-full">
                  ECO {opening.eco}
                </span>
              )}
              <span className={`flex items-center gap-1.5 font-body text-xs font-medium px-2.5 py-1 rounded-full border ${isWhite ? 'bg-ivory-200/10 text-ivory-200 border-ivory-400/20' : 'bg-ink-900 text-ivory-400 border-ink-600'}`}>
                <span className={`w-2 h-2 rounded-full ${isWhite ? 'bg-ivory-100' : 'bg-ink-400'}`} />
                Play as {isWhite ? 'White' : 'Black'}
              </span>
              {progress && (
                <span className={`font-body text-xs font-medium px-2.5 py-1 rounded-full border ${isDue ? 'bg-gold-500/15 text-gold-300 border-gold-500/40' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'}`}>
                  {isDue ? '↻ Due for review' : `✓ Practiced ${progress.completions}×`}
                </span>
              )}
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory-100 leading-tight mb-4">
              {opening.name}
            </h1>

            <p className="font-body text-base text-ivory-300 leading-relaxed mb-6">{opening.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Moves to learn', value: `${moveCount}` },
                { label: 'Your side', value: isWhite ? 'White ♔' : 'Black ♚' },
              ].map((s) => (
                <div key={s.label} className="bg-ink-800 border border-ink-700 rounded-xl p-4">
                  <div className="font-display text-2xl font-bold text-gold-400 mb-1">{s.value}</div>
                  <div className="font-body text-sm text-ivory-500">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 mb-6">
              <h2 className="font-display text-sm font-semibold text-ivory-100 mb-4 flex items-center gap-2">
                <span className="text-gold-400">✦</span> Beginner Tips
              </h2>
              <ul className="space-y-3">
                {opening.beginnerTips.map((tip, i) => (
                  <li key={i} className="flex gap-3 font-body text-sm text-ivory-300 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-ink-700 border border-ink-600 text-xs text-ivory-500 flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pawn structure & plan */}
            {extras && (
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 mb-6">
                <h2 className="font-display text-sm font-semibold text-ivory-100 mb-2 flex items-center gap-2">
                  <span className="text-gold-400">♙</span> Pawn Structure &amp; Plan
                </h2>
                <p className="font-body text-xs font-medium text-gold-300 mb-1">{extras.structure.name}</p>
                <p className="font-body text-sm text-ivory-300 leading-relaxed">{extras.structure.idea}</p>
              </div>
            )}

            {/* Where your pieces belong */}
            {extras && (
              <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5 mb-6">
                <h2 className="font-display text-sm font-semibold text-ivory-100 mb-4 flex items-center gap-2">
                  <span className="text-gold-400">◎</span> Where Your Pieces Belong
                </h2>
                <div className="grid sm:grid-cols-[180px_1fr] gap-5 items-start">
                  {/* Mini board with target squares highlighted */}
                  <div className="rounded-lg overflow-hidden border border-ink-700 max-w-[180px]">
                    <Chessboard
                      position="start"
                      boardOrientation={isWhite ? 'white' : 'black'}
                      arePiecesDraggable={false}
                      customSquareStyles={Object.fromEntries(
                        extras.pieceGuide.map((p) => [
                          p.square,
                          { background: 'rgba(240,192,64,0.55)', boxShadow: 'inset 0 0 0 3px rgba(240,192,64,0.9)' },
                        ]),
                      )}
                      customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
                      customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                      customBoardStyle={{ borderRadius: '0' }}
                    />
                  </div>
                  <ul className="space-y-3">
                    {extras.pieceGuide.map((p) => (
                      <li key={p.square} className="flex gap-3 font-body text-sm text-ivory-300 leading-relaxed">
                        <span className="flex-shrink-0 text-lg leading-none">{p.glyph}</span>
                        <span>
                          <span className="text-ivory-100 font-medium">{p.piece} → {p.square}.</span>{' '}
                          {p.note}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="font-body text-xs text-ivory-600 mt-4">
                  Highlighted squares show where your key pieces want to go once the opening is done.
                </p>
              </div>
            )}

            {/* Stage selector — learn the essentials first, then the full line */}
            {hasStages && (
              <div className="mb-4">
                <p className="font-body text-xs text-ivory-500 mb-2">How much do you want to practice?</p>
                <div className="inline-flex p-1 rounded-xl bg-ink-800 border border-ink-700 gap-1">
                  <StageTab
                    active={stage === 'essentials'}
                    onClick={() => setStage('essentials')}
                    label="Essentials"
                    sub={`${Math.ceil(essentialsLen / 2)} moves`}
                  />
                  <StageTab
                    active={stage === 'full'}
                    onClick={() => setStage('full')}
                    label="Full line"
                    sub={`${moveCount} moves`}
                  />
                </div>
              </div>
            )}

            <button
              onClick={() => onStartPractice(hasStages && stage === 'essentials' ? essentialsLen : undefined)}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-body font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_32px_rgba(212,165,32,0.4)] focus-visible:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l8 6-8 6V4z" fill="currentColor" />
              </svg>
              {hasStages && stage === 'essentials' ? 'Practice the Essentials' : 'Start Practice'}
            </button>

            {/* Traps */}
            <BranchSection
              icon="🎯"
              title="Traps & Tricks"
              blurb="Mistakes opponents make — and how to punish them."
              cta="Practice this trap"
              branches={opening.traps}
              onStart={onStartBranch}
            />

            {/* Deviations */}
            <BranchSection
              icon="🧭"
              title="If They Go Off-Book"
              blurb="What to do when your opponent leaves the main line."
              cta="Practice this line"
              branches={opening.deviations}
              onStart={onStartBranch}
            />
          </div>

          {/* Right: Demo board */}
          <div className="animate-fade-in lg:sticky lg:top-20" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden">
              <div className="shadow-[0_8px_40px_rgba(0,0,0,0.5)]">
                <Chessboard
                  position={demo.fen}
                  boardOrientation={isWhite ? 'white' : 'black'}
                  arePiecesDraggable={false}
                  customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
                  customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                  customBoardStyle={{ borderRadius: '0' }}
                />
              </div>

              <div className="px-4 pt-3 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-xs text-ivory-500">
                    {demo.moveIndex === 0 ? 'Starting position' : `Move ${demo.moveIndex} of ${demo.totalMoves}`}
                  </span>
                  {demo.isComplete && <span className="font-body text-xs text-gold-400 font-medium">Opening complete ✓</span>}
                </div>

                <div className="h-1 bg-ink-700 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full transition-all duration-500" style={{ width: `${(demo.moveIndex / demo.totalMoves) * 100}%` }} />
                </div>

                <div className="flex items-center gap-1">
                  <ControlBtn onClick={demo.reset} title="Reset" disabled={demo.moveIndex === 0 && !demo.playing}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7a5 5 0 1 0 1.5-3.5L2 2v3h3L3.9 3.9A4 4 0 1 1 3 7H2z" fill="currentColor" />
                    </svg>
                  </ControlBtn>
                  <ControlBtn onClick={demo.prev} title="Previous move" disabled={demo.moveIndex === 0}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </ControlBtn>
                  <button
                    onClick={demo.playing ? demo.pause : demo.play}
                    className="w-9 h-9 rounded-lg bg-gold-500 hover:bg-gold-400 text-ink-950 flex items-center justify-center transition-colors duration-150 focus-visible:outline-none"
                    title={demo.playing ? 'Pause' : 'Play demo'}
                  >
                    {demo.playing ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor" />
                        <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M4 2.5l7 4.5-7 4.5V2.5z" fill="currentColor" />
                      </svg>
                    )}
                  </button>
                  <ControlBtn onClick={demo.next} title="Next move" disabled={demo.isComplete}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </ControlBtn>
                </div>
              </div>

              {/* Move list */}
              <div className="px-4 pb-3">
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {movePairs.map((pair, pairIdx) => (
                    <span key={pairIdx} className="font-body text-xs flex items-baseline gap-1">
                      <span className="text-ivory-600">{pairIdx + 1}.</span>
                      <MoveBtn label={pair.w} active={demo.moveIndex === pair.wIdx + 1} played={demo.moveIndex > pair.wIdx} onClick={() => demo.goTo(pair.wIdx + 1)} />
                      {pair.b !== undefined && (
                        <MoveBtn label={pair.b} active={demo.moveIndex === pair.bIdx + 1} played={demo.moveIndex > pair.bIdx} onClick={() => demo.goTo(pair.bIdx + 1)} />
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Demo per-move explanation */}
              <div className="border-t border-ink-700 px-4 py-3 min-h-[3.25rem] flex items-center gap-2.5">
                <span className="flex-shrink-0 text-gold-400 text-sm">💡</span>
                <p className="font-body text-xs text-ivory-300 leading-relaxed">
                  {demoNote ?? <span className="text-ivory-600">Press play, step through, or click a move to see why it's played.</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BranchSection({
  icon,
  title,
  blurb,
  cta,
  branches,
  onStart,
}: {
  icon: string
  title: string
  blurb: string
  cta: string
  branches?: BranchLine[]
  onStart: (b: BranchLine) => void
}) {
  if (!branches || branches.length === 0) return null
  return (
    <div className="mt-8">
      <h2 className="font-display text-base font-semibold text-ivory-100 mb-1 flex items-center gap-2">
        <span className="text-gold-400">{icon}</span> {title}
      </h2>
      <p className="font-body text-sm text-ivory-500 mb-4">{blurb}</p>
      <div className="space-y-3">
        {branches.map((b) => (
          <div key={b.id} className="bg-ink-800 border border-ink-700 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-display text-sm font-semibold text-ivory-100">{b.name}</h3>
              <span className="flex-shrink-0 font-body text-[10px] uppercase tracking-wide text-ivory-500 border border-ink-600 rounded-full px-2 py-0.5">
                Play as {b.side}
              </span>
            </div>
            <p className="font-body text-xs text-ivory-400 leading-relaxed mb-3">{b.setup}</p>
            <button
              onClick={() => onStart(b)}
              className="font-body text-xs font-medium text-gold-300 hover:text-gold-200 border border-gold-500/30 hover:border-gold-500/60 rounded-lg px-3 py-1.5 transition-colors duration-200 focus-visible:outline-none"
            >
              {cta} →
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function StageTab({ active, onClick, label, sub }: { active: boolean; onClick: () => void; label: string; sub: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-left transition-colors duration-150 focus-visible:outline-none ${
        active ? 'bg-gold-500 text-ink-950' : 'text-ivory-400 hover:text-ivory-100'
      }`}
    >
      <span className="block font-body text-sm font-semibold leading-tight">{label}</span>
      <span className={`block font-body text-[11px] leading-tight ${active ? 'text-ink-900/70' : 'text-ivory-600'}`}>{sub}</span>
    </button>
  )
}

function MoveBtn({ label, active, played, onClick }: { label: string; active: boolean; played: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-1 py-0.5 rounded transition-colors duration-100 ${
        active ? 'bg-gold-500 text-ink-950 font-semibold' : played ? 'text-ivory-300 hover:text-ivory-100' : 'text-ivory-600 hover:text-ivory-400'
      }`}
    >
      {label}
    </button>
  )
}

function ControlBtn({ onClick, children, title, disabled }: { onClick: () => void; children: React.ReactNode; title: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 rounded-lg bg-ink-700 hover:bg-ink-600 text-ivory-300 hover:text-ivory-100 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center transition-colors duration-150 focus-visible:outline-none"
    >
      {children}
    </button>
  )
}
