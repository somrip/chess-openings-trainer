// Validates that every opening + trap line is fully legal per chess.js,
// and that moveNotes arrays line up with their move lists.
import { Chess } from '../node_modules/chess.js/dist/esm/chess.js'
import { openings } from '../src/data/openings.ts'

let errors = 0

function checkLine(label, moves, notes) {
  const game = new Chess()
  moves.forEach((san, i) => {
    try {
      const res = game.move(san)
      if (!res) throw new Error('rejected')
    } catch {
      console.error(`  ✗ ${label}: illegal move #${i + 1} "${san}" (FEN: ${game.fen()})`)
      errors++
    }
  })
  if (notes && notes.length !== moves.length) {
    console.error(`  ✗ ${label}: ${moves.length} moves but ${notes.length} notes`)
    errors++
  }
}

for (const o of openings) {
  checkLine(`${o.name} [main]`, o.moves, o.moveNotes)
  for (const t of o.traps ?? []) {
    checkLine(`${o.name} → ${t.name}`, t.moves, t.moveNotes)
  }
}

if (errors === 0) {
  console.log('✓ All opening and trap lines are legal and well-formed.')
  process.exit(0)
} else {
  console.error(`\n${errors} problem(s) found.`)
  process.exit(1)
}
