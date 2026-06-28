# Chess Openings Trainer

A Duolingo-style chess opening trainer for beginners (0–1200 Elo). Learn the most important openings through interactive, guided repetition — no account or backend required.

## Features

- **9 openings** covering both White and Black sides
- **Interactive practice mode** — drag and drop pieces; the app plays the opponent's moves automatically
- **Per-move explanations** — every move comes with a one-line "why," in both the demo and practice, so beginners *understand* rather than just memorize
- **Animated demo** — watch the opening play out, step through it, or click any move to jump to it
- **Two-stage hint system** — first highlights the piece, then shows the target square with an arrow, so players never get stuck
- **"Why was that wrong?"** — a wrong move is analyzed with chess.js and, if it drops material, explains the punishment (e.g. *"Black plays Nxa6 and wins your bishop"*) — teaching the #1 beginner skill of not hanging pieces
- **Click-to-move** — tap a piece then tap its destination (with legal-move dots), alongside drag-and-drop — friendlier on mobile and trackpads
- **Progressive stages** — learn an opening's "essentials" (first few moves) before committing the full line
- **Move sounds** — distinct audio for moves, captures, checks, success, and errors (toggleable)
- **Traps & Tricks** — practice famous beginner traps (Fried Liver, Noah's Ark, Elephant) and learn to punish common mistakes
- **"If they go off-book" deviations** — practice the correct response when the opponent leaves the main line (e.g. the Blackburne Shilling try, a queen-harassing pawn lunge, the Exchange French), so a surprise on move 3 doesn't end the game
- **Progress + spaced repetition** — completions are saved to `localStorage`, openings are scheduled for review (SM-2), and the home screen shows a streak, learned count, and "due for review" badges
- **Instant feedback** — wrong moves shake and prompt a retry; correct moves advance automatically
- **Strategic plan on completion** — the success screen tells you what to do once the opening is over
- **Pawn-structure & plan lessons** — each opening explains the structure it produces and the resulting middlegame plan
- **Piece-placement guide** — a mini-board highlighting where your key pieces ideally belong, with a why for each
- **Play on vs the computer** — after finishing, continue from the final position against a built-in weak bot to bridge into a real middlegame

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS (custom design system)
- [chess.js](https://github.com/jhlywa/chess.js) — move validation and game state
- [react-chessboard](https://github.com/Clariity/react-chessboard) — interactive board component

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
├── components/
│   ├── NavBar.tsx        # Persistent top navigation
│   ├── OpeningCard.tsx   # Home page card (with learned / due badges)
│   └── ProgressBar.tsx   # Animated progress bar
├── data/
│   ├── openings.ts       # All opening definitions: moves, per-move notes, tips, plan, traps, deviations
│   └── openingExtras.ts  # Pawn-structure lessons + piece-placement guides, keyed by opening id
├── lib/
│   ├── analyzeMistake.ts # Explains why a wrong move drops material (one-ply heuristic)
│   └── simpleBot.ts      # Weak, dependency-free opponent for the "play on" mode
├── hooks/
│   ├── usePractice.ts    # Core practice logic: move validation, auto-play, hints, events
│   ├── useDemo.ts        # Animated opening playback (play/pause/step/jump)
│   ├── useProgress.ts    # localStorage persistence + SM-2 spaced repetition + streak
│   └── useSound.ts       # Web Audio sound effects (no asset files)
├── pages/
│   ├── Home.tsx          # Opening grid + streak / learned / due-for-review
│   ├── OpeningPage.tsx   # Detail, demo, tips, structure/plan, piece guide, traps, deviations
│   ├── PracticeMode.tsx  # Interactive board, per-move explanations, hints, success
│   └── FreePlay.tsx      # "Play on" mode: free play vs the bot from the final position
├── types/
│   └── index.ts          # Shared TypeScript types
└── App.tsx               # View router (state-based, no library needed)

scripts/
└── validate-openings.mjs # Verifies every opening + trap line is legal via chess.js
```

Run `npm run validate` to check that every opening and trap line is fully legal and
that each move's explanation array lines up with its moves.

## Openings Included

| Opening | Side | ECO |
|---|---|---|
| Italian Game | White | C50 |
| Ruy Lopez | White | C60 |
| Queen's Gambit | White | D06 |
| London System | White | D02 |
| Scotch Game | White | C45 |
| Caro-Kann Defense | Black | B12 |
| French Defense | Black | C11 |
| Sicilian Defense (Najdorf) | Black | B90 |
| Scandinavian Defense | Black | B01 |

## Adding New Openings

Add an entry to `src/data/openings.ts`:

```ts
{
  id: 'kings-indian',
  name: "King's Indian Defense",
  side: 'black',
  eco: 'E62',
  description: '...',
  moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6', 'Nf3', 'O-O'],
  beginnerTips: ['...'],
}
```

Moves are full-game SAN strings interleaved (both sides). The `side` field determines which half-moves the user plays.

## Roadmap

- [ ] Local storage persistence for repetition counts
- [ ] Spaced repetition scheduling (SM-2 algorithm)
- [ ] Move hints (highlight the correct square)
- [ ] Opening explorer with move tree visualization
- [ ] Mobile touch drag support
