/**
 * A branch line off an opening, practiced as a fixed sequence — either a trap
 * the user springs, or a deviation showing how to handle an off-book opponent.
 */
export interface BranchLine {
  id: string
  name: string
  /** 'trap' = the user springs it; 'deviation' = handling an off-book opponent */
  kind: 'trap' | 'deviation'
  /** Which side the user plays in this line (may differ from the opening) */
  side: 'white' | 'black'
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
}

export type AppView = 'home' | 'opening' | 'practice'

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
