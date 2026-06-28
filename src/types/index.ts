export interface TrapLine {
  id: string
  name: string
  /** Which side the user plays in this trap (may differ from the opening) */
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
  /** Common beginner traps / deviations tied to this opening */
  traps?: TrapLine[]
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
