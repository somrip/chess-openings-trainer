/**
 * A branch line off an opening, practiced as a fixed sequence — either a trap
 * the user springs, or a deviation showing how to handle an off-book opponent.
 */
export interface BranchLine {
  id: string
  name: string
  /**
   * 'trap' = the user springs it; 'deviation' = handling an off-book opponent;
   * 'counter' = training the *other* side, i.e. how to face this opening.
   */
  kind: 'trap' | 'deviation' | 'counter'
  /** Which side the user plays in this line (may differ from the opening) */
  side: 'white' | 'black'
  /**
   * For variations that fork off the opening's main line: the index into the
   * opening's `moves` array at which this line first diverges. `moves[0..n-1]`
   * must equal the opening's main line, and `moves[n]` is the opponent's
   * alternative. Used to surface the variation contextually in the Learn screen
   * exactly where the choice happens. Omit for standalone lines (e.g. traps).
   */
  branchFromMove?: number
  /** Shown to set the scene, e.g. "Black greedily grabs the pawn…" */
  setup: string
  /** Full move list (both sides interleaved), starting from move 1 */
  moves: string[]
  /** Parallel to moves — a short "why" for each half-move (optional) */
  moveNotes?: string[]
  /** The lesson / payoff explained after completion */
  payoff: string
}

/** @deprecated use BranchLine */
export type TrapLine = BranchLine

export interface Opening {
  id: string
  name: string
  side: 'white' | 'black'
  description: string
  /** Full move list (both sides interleaved), starting from move 1 */
  moves: string[]
  /** Parallel to moves — a short "why" for each half-move */
  moveNotes: string[]
  beginnerTips: string[]
  /** One-line strategic goal once the opening is finished */
  plan: string
  eco?: string
  /** Traps the user can spring (kind: 'trap') */
  traps?: BranchLine[]
  /** How to respond when the opponent goes off-book (kind: 'deviation') */
  deviations?: BranchLine[]
  /**
   * How to face this opening from the other side (kind: 'counter'). Each line's
   * `side` is the opposite of the opening's. Standalone lines from move 1 (no
   * `branchFromMove`); like traps/deviations they do NOT count toward progress.
   */
  counters?: BranchLine[]
}

/** A short lesson on the pawn structure an opening produces and the plan it implies */
export interface StructureLesson {
  /** e.g. "Closed Ruy centre", "Pawn chains (e6–d5 vs e5–d4)" */
  name: string
  /** a sentence or two on the structure and the resulting plan */
  idea: string
}

/** Where a key piece ideally belongs in this opening */
export interface PiecePlacement {
  /** target square, e.g. 'f3' */
  square: string
  /** glyph shown on the marker, e.g. '♘' */
  glyph: string
  /** short label, e.g. 'Knight' */
  piece: string
  /** why it belongs there */
  note: string
}

export interface OpeningExtras {
  structure: StructureLesson
  pieceGuide: PiecePlacement[]
  /** Richer per-move explanations for the Learn screen, parallel to opening.moves */
  learnNotes?: string[]
}

export type AppView = 'home' | 'opening' | 'learn' | 'practice' | 'play'

export type PracticeStatus = 'idle' | 'waiting' | 'opponent' | 'wrong' | 'complete'

/** Spaced-repetition + progress state persisted to localStorage, per opening id */
export interface OpeningProgress {
  /** Total successful completions across all sessions */
  completions: number
  /** SM-2 ease factor */
  ease: number
  /** Current review interval in days */
  intervalDays: number
  /** ISO timestamp of last completion */
  lastPracticed: string
  /** ISO timestamp when this opening is next due for review */
  dueDate: string
}

export type ProgressMap = Record<string, OpeningProgress>
