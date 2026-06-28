import { Chessboard } from 'react-chessboard'
import type { Opening } from '../types'
import { NavBar } from '../components/NavBar'
import { useDemo } from '../hooks/useDemo'

interface OpeningPageProps {
  opening: Opening
  onStartPractice: () => void
  onBack: () => void
}

export function OpeningPage({ opening, onStartPractice, onBack }: OpeningPageProps) {
  const isWhite = opening.side === 'white'
  const moveCount = Math.ceil(opening.moves.length / 2)
  const demo = useDemo(opening)

  // Build move list as pairs: [[w, b], [w, b], ...]
  const movePairs: Array<{ w: string; b?: string; wIdx: number; bIdx: number }> = []
  for (let i = 0; i < opening.moves.length; i += 2) {
    movePairs.push({ w: opening.moves[i], b: opening.moves[i + 1], wIdx: i, bIdx: i + 1 })
  }

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
            {/* ECO + Side */}
            <div className="flex items-center gap-3 mb-4">
              {opening.eco && (
                <span className="font-body text-xs font-medium text-ivory-400 bg-ink-800 border border-ink-600 px-2.5 py-1 rounded-full">
                  ECO {opening.eco}
                </span>
              )}
              <span className={`flex items-center gap-1.5 font-body text-xs font-medium px-2.5 py-1 rounded-full border ${isWhite ? 'bg-ivory-200/10 text-ivory-200 border-ivory-400/20' : 'bg-ink-900 text-ivory-400 border-ink-600'}`}>
                <span className={`w-2 h-2 rounded-full ${isWhite ? 'bg-ivory-100' : 'bg-ink-400'}`} />
                Play as {isWhite ? 'White' : 'Black'}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory-100 leading-tight mb-4">
              {opening.name}
            </h1>

            <p className="font-body text-base text-ivory-300 leading-relaxed mb-6">
              {opening.description}
            </p>

            {/* Stats */}
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

            {/* Tips */}
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

            {/* CTA */}
            <button
              onClick={onStartPractice}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-gold-500 hover:bg-gold-400 text-ink-950 font-body font-semibold text-base px-8 py-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_32px_rgba(212,165,32,0.4)] focus-visible:outline-none"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7 4l8 6-8 6V4z" fill="currentColor" />
              </svg>
              Start Practice
            </button>
          </div>

          {/* Right: Demo board */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div className="bg-ink-800 border border-ink-700 rounded-2xl overflow-hidden">
              {/* Board */}
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

              {/* Controls */}
              <div className="px-4 pt-3 pb-2">
                {/* Move counter */}
                <div className="flex items-center justify-between mb-3">
                  <span className="font-body text-xs text-ivory-500">
                    {demo.moveIndex === 0
                      ? 'Starting position'
                      : `Move ${demo.moveIndex} of ${demo.totalMoves}`}
                  </span>
                  {demo.isComplete && (
                    <span className="font-body text-xs text-gold-400 font-medium">Opening complete ✓</span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="h-1 bg-ink-700 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-gold-500 rounded-full transition-all duration-500"
                    style={{ width: `${(demo.moveIndex / demo.totalMoves) * 100}%` }}
                  />
                </div>

                {/* Transport controls */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Reset */}
                    <ControlBtn onClick={demo.reset} title="Reset" disabled={demo.moveIndex === 0 && !demo.playing}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 7a5 5 0 1 0 1.5-3.5L2 2v3h3L3.9 3.9A4 4 0 1 1 3 7H2z" fill="currentColor" />
                      </svg>
                    </ControlBtn>
                    {/* Prev */}
                    <ControlBtn onClick={demo.prev} title="Previous move" disabled={demo.moveIndex === 0}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </ControlBtn>
                    {/* Play/Pause */}
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
                    {/* Next */}
                    <ControlBtn onClick={demo.next} title="Next move" disabled={demo.isComplete}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </ControlBtn>
                  </div>
                </div>
              </div>

              {/* Move list */}
              <div className="px-4 pb-4">
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                  {movePairs.map((pair, pairIdx) => (
                    <span key={pairIdx} className="font-body text-xs flex items-baseline gap-1">
                      <span className="text-ivory-600">{pairIdx + 1}.</span>
                      <button
                        onClick={() => demo.goTo(pair.wIdx + 1)}
                        className={`px-1 py-0.5 rounded transition-colors duration-100 ${
                          demo.moveIndex === pair.wIdx + 1
                            ? 'bg-gold-500 text-ink-950 font-semibold'
                            : demo.moveIndex > pair.wIdx
                            ? 'text-ivory-300 hover:text-ivory-100'
                            : 'text-ivory-600 hover:text-ivory-400'
                        }`}
                      >
                        {pair.w}
                      </button>
                      {pair.b !== undefined && (
                        <button
                          onClick={() => demo.goTo(pair.bIdx + 1)}
                          className={`px-1 py-0.5 rounded transition-colors duration-100 ${
                            demo.moveIndex === pair.bIdx + 1
                              ? 'bg-gold-500 text-ink-950 font-semibold'
                              : demo.moveIndex > pair.bIdx
                              ? 'text-ivory-300 hover:text-ivory-100'
                              : 'text-ivory-600 hover:text-ivory-400'
                          }`}
                        >
                          {pair.b}
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-2 text-center font-body text-xs text-ivory-600">
              Watch the opening · Click any move to jump to it
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlBtn({
  onClick,
  children,
  title,
  disabled,
}: {
  onClick: () => void
  children: React.ReactNode
  title: string
  disabled?: boolean
}) {
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
