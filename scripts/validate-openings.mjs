// Validates that every opening + trap line is fully legal per chess.js,
// and that moveNotes arrays line up with their move lists.
import { Chess } from '../node_modules/chess.js/dist/esm/chess.js'
import { openings } from '../src/data/openings.ts'
import { openingExtras } from '../src/data/openingExtras.ts'

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
    checkLine(`${o.name} → trap: ${t.name}`, t.moves, t.moveNotes)
  }
  for (const c of o.counters ?? []) {
    checkLine(`${o.name} → counter: ${c.name}`, c.moves, c.moveNotes)
  }
  for (const d of o.deviations ?? []) {
    checkLine(`${o.name} → deviation: ${d.name}`, d.moves, d.moveNotes)
    if (d.branchFromMove != null) {
      const n = d.branchFromMove
      const label = `${o.name} → variation: ${d.name}`
      if (n <= 0 || n >= o.moves.length || n >= d.moves.length) {
        console.error(`  ✗ ${label}: branchFromMove ${n} out of range`)
        errors++
      } else {
        for (let i = 0; i < n; i++) {
          if (d.moves[i] !== o.moves[i]) {
            console.error(`  ✗ ${label}: move #${i + 1} "${d.moves[i]}" must match the main line "${o.moves[i]}" before branchFromMove ${n}`)
            errors++
          }
        }
        if (d.moves[n] === o.moves[n]) {
          console.error(`  ✗ ${label}: branchFromMove ${n} should diverge from the main line, but both play "${d.moves[n]}"`)
          errors++
        }
        // The fork must be the opponent's move (the user follows the main line up to here).
        const userIsWhite = o.side === 'white'
        const forkIsWhite = n % 2 === 0
        if (forkIsWhite === userIsWhite) {
          console.error(`  ✗ ${label}: branchFromMove ${n} is one of the user's own moves; it must be an opponent move`)
          errors++
        }
      }
    }
  }
  const learn = openingExtras[o.id]?.learnNotes
  if (learn && learn.length !== o.moves.length) {
    console.error(`  ✗ ${o.name}: ${o.moves.length} moves but ${learn.length} learnNotes`)
    errors++
  }
}

if (errors === 0) {
  console.log('✓ All opening and trap lines are legal and well-formed.')
  process.exit(0)
} else {
  console.error(`\n${errors} problem(s) found.`)
  process.exit(1)
}
