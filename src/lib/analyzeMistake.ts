import { Chess } from 'chess.js'
import type { PieceSymbol } from 'chess.js'

const VALUE: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
const NAME: Record<PieceSymbol, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

/**
 * Beginner-friendly explanation of why a (legal but wrong) move is a mistake.
 *
 * The heuristic looks one ply ahead: after the user's move, does the opponent
 * have a capture that wins material even after the best immediate recapture?
 * If so, the move hangs material — the single most common reason beginners lose.
 * Returns null when no clear material problem is found (the move is simply not
 * the book move), so the caller can fall back to a gentler message.
 */
export function analyzeMistake(
  fenBefore: string,
  from: string,
  to: string,
  promotion = 'q',
): string | null {
  const game = new Chess(fenBefore)
  let played
  try {
    played = game.move({ from, to, promotion })
  } catch {
    return null
  }
  if (!played) return null

  // Opponent is now to move.
  const opponent = game.turn() === 'w' ? 'White' : 'Black'
  const captures = game.moves({ verbose: true }).filter((m) => m.captured)

  let worst: { net: number; piece: PieceSymbol; san: string } | null = null

  for (const cap of captures) {
    const gain = VALUE[cap.captured as PieceSymbol]

    // Can we win the capturing piece straight back on that square?
    const after = new Chess(game.fen())
    try {
      after.move({ from: cap.from, to: cap.to, promotion: 'q' })
    } catch {
      continue
    }
    const capturer = after.get(cap.to as Parameters<typeof after.get>[0])
    const canRecapture = after
      .moves({ verbose: true })
      .some((m) => m.to === cap.to && m.captured)
    const recaptureVal = canRecapture && capturer ? VALUE[capturer.type] : 0

    const net = gain - recaptureVal
    if (net > 0 && (!worst || net > worst.net)) {
      worst = { net, piece: cap.captured as PieceSymbol, san: cap.san }
    }
  }

  if (worst) {
    return `that drops material — ${opponent} plays ${worst.san} and wins your ${NAME[worst.piece]}.`
  }
  return null
}
