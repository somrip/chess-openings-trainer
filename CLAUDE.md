# Chess Openings Trainer

A "Duolingo for chess openings" web app for beginners (0–1200 Elo). No backend,
auth, or database — everything is local. Live at https://learnchessopenings.vercel.app
(GitHub: somrip/chess-openings-trainer, Vercel project: omris-projects-1016fe51/chessopenings).

## Stack
React 18 + TypeScript (strict) · Vite · Tailwind CSS · chess.js · react-chessboard (v4).

## Commands
- `npm run dev` — dev server on port 5173 (autoPort: false; .claude/launch.json drives the preview tool)
- `npm run build` — `tsc && vite build` (strict; **unused locals fail the build** — Vercel runs this)
- `npm run validate` — **run after editing any opening/branch/learnNotes data**; checks every line is
  legal via chess.js and that moveNotes/learnNotes arrays match their move lists. Uses tsx.

## Architecture
State-based view router in `src/App.tsx` (no routing lib). Views: `home → opening → {learn | practice | play}`.
`useProgress` (localStorage SM-2 spaced repetition + streak) lives in App and is passed down.

- `src/pages/Home.tsx` — opening grid, streak / learned / due-for-review badges
- `src/pages/OpeningPage.tsx` — hub: description, tips, structure/plan, piece guide, traps, deviations;
  two CTAs (**Learn** and **Practice**) + practice depth (essentials/full) selector
- `src/pages/LearnScreen.tsx` — guided move-by-move walkthrough; rich per-move explanations (learnNotes)
- `src/pages/PracticeMode.tsx` — drag/click-to-move trainer; validates each move, auto-plays opponent,
  per-move notes, two-stage hints, sounds, mistake feedback; success screen → "Play on"
- `src/pages/FreePlay.tsx` — "play on" vs the bot from the final position; difficulty, hint, take-back (undo)
- `src/hooks/` — `usePractice` (core move-validation/auto-play/hint/mistake engine), `useDemo`
  (play/step/jump over a move list), `useProgress` (SR + streak), `useSound` (Web Audio, no assets)
- `src/lib/` — `analyzeMistake` (one-ply "why is this wrong / what does it hang" heuristic),
  `simpleBot` (weak, dependency-free opponent; `chooseBotMove(fen, difficulty)`, also powers hints)
- `src/data/openings.ts` — 12 openings: moves, moveNotes, beginnerTips, plan, traps, deviations
- `src/data/openingExtras.ts` — per-id structure lessons, piece guides, and rich learnNotes
- `scripts/validate-openings.mjs` — the data validator (`npm run validate`)

## Data model (key types in src/types/index.ts)
- `Opening`: `moves` and `moveNotes` are parallel arrays (same length, interleaved both sides).
  `side` is which side the user plays. `plan` shows on the success screen.
- `BranchLine` (kind `'trap' | 'deviation'`): a short line off the opening with its own `side`
  (may differ from the opening), `setup`, `moves`, optional `moveNotes`, `payoff`. Both `traps`
  and `deviations` on an opening use this type. Branches do NOT count toward learned/spaced-repetition.
- `OpeningExtras` (keyed by opening id in openingExtras.ts): `structure`, `pieceGuide`,
  and `learnNotes` (parallel to opening.moves, used by the Learn screen; falls back to moveNotes).

## Conventions
- **Always `npm run validate` after touching opening data** — chess lines must be legal SAN and
  note arrays must match move-list length. The validator imports the .ts data via tsx.
- A line can end on the opponent's move; `usePractice` handles completion in the auto-play path too.
- Design system: dark ink palette + gold accents; fonts Playfair Display (display) / DM Sans (body).
  Board colors: dark `#4a7c59`, light `#f0d9b5`, accents `#f0c040`. Tailwind theme in tailwind.config.js
  (custom `ink`, `gold`, `ivory` scales). Reuse existing components/cards rather than new patterns.
- Adding an opening: add to openings.ts (run validate), add a matching `openingExtras` entry
  (structure + pieceGuide + learnNotes), and add a card icon in `OpeningCard.tsx` PIECE_ICON.

## Deploy
`git push` (auto-deploys), or `vercel --prod --yes` (aliases to learnchessopenings.vercel.app).
`gh` CLI is at "/c/Program Files/GitHub CLI" (add to PATH in Bash). End commits with the
Co-Authored-By trailer.

## Backlog / ideas not yet built (highest-value first)
- **Review loop**: a "Review (N due)" session, a test/free-recall mode (counter + hints hidden), and
  adaptive scheduling (feed per-run mistakes into the SR ease). The SR data + "due" badges already exist
  but there's no flow to *do* reviews — this is the biggest unfinished system.
- Random in-practice deviations (opponent goes off-book mid-game; needs a move tree, not the current
  fixed-line `usePractice`).
- Traps/deviations for the remaining openings; more openings (pure data now).
- Post-game review in FreePlay (run each user move through `analyzeMistake`); move list / PGN export.
- Progress export/import (back up localStorage), spot-the-threat puzzles, PWA/offline, per-opening stats.
