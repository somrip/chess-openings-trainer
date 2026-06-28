# Chess Openings Trainer

A Duolingo-style chess opening trainer for beginners (0–1200 Elo). Learn the most important openings through interactive, guided repetition — no account or backend required.

## Features

- **9 openings** covering both White and Black sides
- **Interactive practice mode** — drag and drop pieces; the app plays the opponent's moves automatically
- **Instant feedback** — wrong moves shake and prompt a retry; correct moves advance automatically
- **Progress tracking** — move counter, progress bar, and repetition count per session
- **Success screen** — shows on completion with options to practice again or choose another opening

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
│   ├── OpeningCard.tsx   # Home page card for each opening
│   └── ProgressBar.tsx   # Animated progress bar
├── data/
│   └── openings.ts       # All opening definitions (moves, tips, metadata)
├── hooks/
│   └── usePractice.ts    # Core practice logic: move validation, auto-play, state
├── pages/
│   ├── Home.tsx          # Opening selection grid
│   ├── OpeningPage.tsx   # Opening detail + board preview + Start Practice
│   └── PracticeMode.tsx  # Interactive board + sidebar + success screen
├── types/
│   └── index.ts          # Shared TypeScript types
└── App.tsx               # View router (state-based, no library needed)
```

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
