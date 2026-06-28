import { Chess } from 'chess.js'
import type { Move, PieceSymbol } from 'chess.js'

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }

const CENTER = new Set(['d4', 'e4', 'd5', 'e5', 'c4', 'f4', 'c5', 'f5'])

export type BotDifficulty = 'easy' | 'medium' | 'hard'

interface BotWeights {
  jitter: number // randomness — higher = more erratic
  capture: number // how much it values winning material
  hang: number // how much it avoids hanging its own pieces
  check: number // bonus for giving check
  center: number // bonus for occupying the centre
  develop: number // bonus for bringing pieces off the back rank
}

const WEIGHTS: Record<BotDifficulty, BotWeights> = {
  easy: { jitter: 4, capture: 3, hang: 2, check: 0.5, center: 0.2, develop: 0.1 },
  medium: { jitter: 0.5, capture: 10, hang: 8, check: 2, center: 0.6, develop: 0.5 },
  hard: { jitter: 0.05, capture: 10, hang: 13, check: 2.5, center: 0.9, develop: 0.7 },
}

/**
 * A deliberately weak, dependency-free opponent for the "play on" mode — sized
 * for beginners (0–1200). It grabs material, gives checks, develops toward the
 * centre, and tries not to hang its own pieces, tuned by difficulty. It is NOT
 * a real engine and won't find combinations.
 *
 * Also used to power the "hint" button (call with 'hard' to get a decent move
 * suggestion for whoever is to move).
 */
export function chooseBotMove(fen: string, difficulty: BotDifficulty = 'medium'): Move | null {
  const w = WEIGHTS[difficulty]
  const game = new Chess(fen)
  const moves = game.moves({ verbose: true })
  if (moves.length === 0) return null

  let best: Move | null = null
  let bestScore = -Infinity

  for (const m of moves) {
    let score = Math.random() * w.jitter

    if (m.captured) score += VALUE[m.captured as PieceSymbol] * w.capture
    if (m.san.includes('#')) score += 1000
    else if (m.san.includes('+')) score += w.check
    if (m.promotion) score += VALUE[m.promotion as PieceSymbol] * 8
    if (CENTER.has(m.to)) score += w.center
    if (m.piece !== 'p' && m.piece !== 'k' && Number(m.from[1]) === (game.turn() === 'w' ? 1 : 8)) {
      score += w.develop
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
    score -= worstReply * w.hang

    if (score > bestScore) {
      bestScore = score
      best = m
    }
  }

  return best
}
