import { useEffect, useMemo, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { Square, Move } from 'chess.js'
import { NavBar } from '../components/NavBar'
import { useSound } from '../hooks/useSound'
import { chooseBotMove } from '../lib/simpleBot'
import type { BotDifficulty } from '../lib/simpleBot'

interface FreePlayProps {
  startFen: string
  side: 'white' | 'black'
  openingName: string
  onBack: () => void
  onHome: () => void
}

/** One position in the game, plus the move that produced it (for highlighting). */
interface Ply {
  fen: string
  lastMove: { from: string; to: string } | null
}

export function FreePlay({ startFen, side, openingName, onBack, onHome }: FreePlayProps) {
  const isWhite = side === 'white'
  const userColor = isWhite ? 'w' : 'b'
  const play = useSound(true)

  // Full position history so we can take moves back.
  const [history, setHistory] = useState<Ply[]>(() => [{ fen: startFen, lastMove: null }])
  const [selected, setSelected] = useState<Square | null>(null)
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium')
  const [hint, setHint] = useState<{ from: string; to: string } | null>(null)
  const botTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const current = history[history.length - 1]
  const game = useMemo(() => new Chess(current.fen), [current.fen])
  const lastMove = current.lastMove

  const isGameOver = game.isGameOver()
  const isUserTurn = game.turn() === userColor && !isGameOver
  const canUndo = history.length > 1

  function soundFor(move: Move) {
    if (move.san.includes('+') || move.san.includes('#')) play('check')
    else if (move.captured) play('capture')
    else play('move')
  }

  // Bot replies whenever it's its turn.
  useEffect(() => {
    if (isGameOver || game.turn() === userColor) return
    botTimer.current = setTimeout(() => {
      const move = chooseBotMove(current.fen, difficulty)
      if (!move) return
      const next = new Chess(current.fen)
      const res = next.move({ from: move.from, to: move.to, promotion: move.promotion })
      if (res) {
        soundFor(res)
        setHistory((h) => [...h, { fen: next.fen(), lastMove: { from: res.from, to: res.to } }])
      }
    }, 500)
    return () => {
      if (botTimer.current) clearTimeout(botTimer.current)
    }
  }, [current.fen, userColor, isGameOver, difficulty]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clear any shown hint once the position changes.
  useEffect(() => setHint(null), [current.fen])

  function showHint() {
    if (!isUserTurn) return
    const move = chooseBotMove(current.fen, 'hard')
    if (move) setHint({ from: move.from, to: move.to })
  }

  function userMove(from: Square, to: Square): boolean {
    if (!isUserTurn) return false
    const next = new Chess(current.fen)
    let res: Move | null
    try {
      res = next.move({ from, to, promotion: 'q' })
    } catch {
      return false
    }
    if (!res) return false
    soundFor(res)
    setHistory((h) => [...h, { fen: next.fen(), lastMove: { from: res!.from, to: res!.to } }])
    return true
  }

  function onDrop(from: Square, to: Square): boolean {
    setSelected(null)
    return userMove(from, to)
  }

  function ownPieceAt(sq: Square): boolean {
    const p = new Chess(current.fen).get(sq)
    return !!p && p.color === userColor
  }

  function onSquareClick(sq: Square) {
    if (!isUserTurn) return
    if (selected) {
      if (sq === selected) return setSelected(null)
      if (userMove(selected, sq)) return setSelected(null)
      return setSelected(ownPieceAt(sq) ? sq : null)
    }
    if (ownPieceAt(sq)) setSelected(sq)
  }

  // Take back to the previous position where it's the user's turn (undoes the
  // bot's reply and the user's move together), so the bot doesn't instantly
  // re-move. Works even after the game has ended.
  function undo() {
    if (botTimer.current) clearTimeout(botTimer.current)
    setSelected(null)
    setHistory((h) => {
      if (h.length <= 1) return h
      let idx = h.length - 2
      while (idx > 0 && new Chess(h[idx].fen).turn() !== userColor) idx--
      return h.slice(0, idx + 1)
    })
  }

  function restart() {
    if (botTimer.current) clearTimeout(botTimer.current)
    setSelected(null)
    setHistory([{ fen: startFen, lastMove: null }])
  }

  // Square highlights.
  const squareStyles: Record<string, React.CSSProperties> = {}
  if (lastMove) {
    squareStyles[lastMove.from] = { background: 'rgba(212,165,32,0.18)' }
    squareStyles[lastMove.to] = { background: 'rgba(212,165,32,0.28)' }
  }
  if (selected) {
    squareStyles[selected] = { background: 'rgba(240,192,64,0.35)', boxShadow: 'inset 0 0 0 3px rgba(240,192,64,0.8)' }
    for (const m of new Chess(game.fen()).moves({ square: selected, verbose: true })) {
      squareStyles[m.to] = {
        ...squareStyles[m.to],
        background: m.captured
          ? 'radial-gradient(circle, transparent 55%, rgba(240,192,64,0.5) 56%)'
          : 'radial-gradient(circle, rgba(240,192,64,0.7) 22%, transparent 24%)',
      }
    }
  }
  if (hint) {
    squareStyles[hint.from] = {
      ...squareStyles[hint.from],
      background: 'rgba(74,124,89,0.55)',
      boxShadow: 'inset 0 0 0 3px rgba(240,192,64,0.9)',
    }
  }
  const hintArrows: Array<[Square, Square]> = hint ? [[hint.from as Square, hint.to as Square]] : []

  // Result text.
  let result: { title: string; sub: string; icon: string } | null = null
  if (isGameOver) {
    if (game.isCheckmate()) {
      const userWon = game.turn() !== userColor
      result = userWon
        ? { title: 'Checkmate — you win!', sub: 'You converted the opening into a win. Well played.', icon: '🏆' }
        : { title: 'Checkmate', sub: 'The bot got you this time — give it another go.', icon: '♚' }
    } else if (game.isStalemate()) {
      result = { title: 'Stalemate', sub: 'No legal moves, but no check — it\'s a draw.', icon: '🤝' }
    } else {
      result = { title: 'Draw', sub: 'The game is drawn.', icon: '🤝' }
    }
  }

  const turnLabel = isGameOver
    ? 'Game over'
    : isUserTurn
    ? game.inCheck()
      ? 'You\'re in check — defend your king'
      : 'Your move'
    : 'The computer is thinking…'

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100 flex flex-col">
      <NavBar onHome={onHome} subtitle={`${openingName} · Play on`} />

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-20 pb-6">
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
          <span className="font-body text-xs text-ivory-500">Practice bot · plays weak, beat it!</span>
        </div>

        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">
          <div>
            <div
              className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 border ${
                isUserTurn ? 'border-gold-500/40 bg-ink-800' : 'border-ink-700 bg-ink-800'
              }`}
            >
              <span className={isUserTurn ? 'text-gold-400 text-sm' : 'animate-pulse-soft text-ivory-400 text-sm'}>●</span>
              <span className="font-body text-sm font-medium text-ivory-200">{turnLabel}</span>
            </div>

            <div className="rounded-2xl overflow-hidden border border-ink-700 shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
              <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                onSquareClick={onSquareClick}
                boardOrientation={isWhite ? 'white' : 'black'}
                arePiecesDraggable={isUserTurn}
                customSquareStyles={squareStyles}
                customArrows={hintArrows}
                customArrowColor="#f0c040"
                customDarkSquareStyle={{ backgroundColor: '#4a7c59' }}
                customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
                customBoardStyle={{ borderRadius: '0' }}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <p className="font-body text-xs text-ivory-500 mb-1">Continuing from</p>
              <h2 className="font-display text-lg font-semibold text-ivory-100 mb-1">{openingName}</h2>
              <p className="font-body text-sm text-ivory-400">
                You play <span className="text-ivory-200">{isWhite ? 'White' : 'Black'}</span> against a practice bot.
                Try to convert your opening into a win.
              </p>
            </div>

            {/* Difficulty + hint */}
            <div className="bg-ink-800 border border-ink-700 rounded-2xl p-5">
              <p className="font-body text-xs text-ivory-500 mb-2">Bot difficulty</p>
              <div className="flex p-1 rounded-xl bg-ink-900 border border-ink-700 gap-1 mb-4">
                {(['easy', 'medium', 'hard'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`flex-1 capitalize font-body text-xs font-medium py-2 rounded-lg transition-colors duration-150 focus-visible:outline-none ${
                      difficulty === d ? 'bg-gold-500 text-ink-950' : 'text-ivory-400 hover:text-ivory-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <button
                onClick={showHint}
                disabled={!isUserTurn}
                className="w-full font-body text-sm font-medium text-ink-950 bg-gold-500 hover:bg-gold-400 disabled:opacity-40 disabled:pointer-events-none rounded-xl py-2.5 transition-all duration-200 focus-visible:outline-none"
              >
                💡 Show a hint
              </button>
              <p className="font-body text-[11px] text-ivory-600 mt-2 leading-relaxed">
                The hint suggests a solid move — it won't always be the very best.
              </p>
            </div>

            {result && (
              <div className="bg-ink-800 border border-gold-500/30 rounded-2xl p-5 text-center animate-pop">
                <div className="text-4xl mb-2">{result.icon}</div>
                <h3 className="font-display text-lg font-semibold text-ivory-100 mb-1">{result.title}</h3>
                <p className="font-body text-sm text-ivory-400">{result.sub}</p>
              </div>
            )}

            <button
              onClick={undo}
              disabled={!canUndo}
              className="w-full font-body text-sm text-ivory-200 border border-ink-600 hover:border-ink-500 hover:text-ivory-100 disabled:opacity-40 disabled:pointer-events-none rounded-xl py-3 transition-all duration-200 focus-visible:outline-none"
            >
              ↶ Take back move
            </button>
            <button
              onClick={restart}
              className="w-full font-body text-sm text-ivory-400 hover:text-ivory-100 border border-ink-600 hover:border-ink-500 rounded-xl py-3 transition-all duration-200 focus-visible:outline-none"
            >
              ↺ Restart from opening
            </button>
            <button
              onClick={onHome}
              className="w-full font-body text-sm text-ink-950 bg-gold-500 hover:bg-gold-400 rounded-xl py-3 font-semibold transition-all duration-200 focus-visible:outline-none"
            >
              Choose another opening
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
