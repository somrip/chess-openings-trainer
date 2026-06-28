import { Chess } from 'chess.js'
import type { Move, PieceSymbol } from 'chess.js'

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

const CENTER = new Set(['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'])

/**
 * A deliberately weak, dependency-free opponent for the "play on" mode — sized
 * for beginners (0–1200) to actually beat. It grabs free material, gives checks,
 * develops toward the centre, and tries not to hang its own pieces, with enough
 * randomness to stay varied. It is NOT a real engine and won't find tactics.
 */
export function chooseBotMove(fen: string): Move | null {
  const game = new Chess(fen)
  const moves = game.moves({ verbose: true })
  if (moves.length === 0) return null

  let best: Move | null = null
  let bestScore = -Infinity

  for (const m of moves) {
    let score = Math.random() * 0.5 // jitter so it isn't deterministic

    if (m.captured) score += VALUE[m.captured as PieceSymbol] * 10
    if (m.san.includes('#')) score += 1000
    else if (m.san.includes('+')) score += 2
    if (m.promotion) score += VALUE[m.promotion as PieceSymbol] * 8
    if (CENTER.has(m.to)) score += 0.6
    if (m.piece !== 'p' && m.piece !== 'k' && Number(m.from[1]) === (game.turn() === 'w' ? 1 : 8)) {
      score += 0.5 // small nudge to develop back-rank pieces
    }

    // Penalise obvious hangs: after our move, can the opponent win the piece
    // we just moved (or a bigger one) for less?
    const after = new Chess(game.fen())
    after.move({ from: m.from, to: m.to, promotion: m.promotion })
    let worstReply = 0
    for (const reply of after.moves({ verbose: true })) {
      if (!reply.captured) continue
      const gain = VALUE[reply.captured as PieceSymbol]
      const probe = new Chess(after.fen())
      probe.move({ from: reply.from, to: reply.to, promotion: reply.promotion })
      const canRecapture = probe.moves({ verbose: true }).some((r) => r.to === reply.to && r.captured)
      const recaptured = canRecapture ? VALUE[reply.piece as PieceSymbol] : 0
      worstReply = Math.max(worstReply, gain - recaptured)
    }
    score -= worstReply * 8

    if (score > bestScore) {
      bestScore = score
      best = m
    }
  }

  return best
}
