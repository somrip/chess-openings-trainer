import { useEffect, useRef, useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import type { Square, Move } from 'chess.js'
import { NavBar } from '../components/NavBar'
import { useSound } from '../hooks/useSound'
import { chooseBotMove } from '../lib/simpleBot'

interface FreePlayProps {
  startFen: string
  side: 'white' | 'black'
  openingName: string
  onBack: () => void
  onHome: () => void
}

export function FreePlay({ startFen, side, openingName, onBack, onHome }: FreePlayProps) {
  const isWhite = side === 'white'
  const userColor = isWhite ? 'w' : 'b'
  const play = useSound(true)

  const [game, setGame] = useState(() => new Chess(startFen))
  const [selected, setSelected] = useState<Square | null>(null)
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null)
  const botTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isGameOver = game.isGameOver()
  const isUserTurn = game.turn() === userColor && !isGameOver

  function soundFor(move: Move) {
    if (move.san.includes('+') || move.san.includes('#')) play('check')
    else if (move.captured) play('capture')
    else play('move')
  }

  // Bot replies whenever it's its turn.
  useEffect(() => {
    if (isGameOver || game.turn() === userColor) return
    botTimer.current = setTimeout(() => {
      const move = chooseBotMove(game.fen())
      if (!move) return
      setGame((prev) => {
        const next = new Chess(prev.fen())
        const res = next.move({ from: move.from, to: move.to, promotion: move.promotion })
        if (res) {
          setLastMove({ from: res.from, to: res.to })
          soundFor(res)
        }
        return next
      })
    }, 500)
    return () => {
      if (botTimer.current) clearTimeout(botTimer.current)
    }
  }, [game, userColor, isGameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  function userMove(from: Square, to: Square): boolean {
    if (!isUserTurn) return false
    const next = new Chess(game.fen())
    let res: Move | null
    try {
      res = next.move({ from, to, promotion: 'q' })
    } catch {
      return false
    }
    if (!res) return false
    setGame(next)
    setLastMove({ from: res.from, to: res.to })
    soundFor(res)
    return true
  }

  function onDrop(from: Square, to: Square): boolean {
    setSelected(null)
    return userMove(from, to)
  }

  function ownPieceAt(sq: Square): boolean {
    const p = new Chess(game.fen()).get(sq)
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

  function restart() {
    if (botTimer.current) clearTimeout(botTimer.current)
    setGame(new Chess(startFen))
    setSelected(null)
    setLastMove(null)
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
                You play <span className="text-ivory-200">{isWhite ? 'White' : 'Black'}</span> against a deliberately
                weak bot. Try to convert your opening into a win.
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
