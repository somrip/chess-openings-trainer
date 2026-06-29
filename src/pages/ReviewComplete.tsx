interface ReviewCompleteProps {
  /** How many openings were reviewed in the session. */
  count: number
  streak: number
  onDone: () => void
}

export function ReviewComplete({ count, streak, onDone }: ReviewCompleteProps) {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="text-7xl mb-6 animate-pop">🎉</div>

      <p className="font-body text-sm font-medium text-gold-400 tracking-widest uppercase mb-3">Review Complete</p>

      <h1 className="font-display text-4xl sm:text-5xl font-bold text-ivory-100 mb-4">All caught up!</h1>

      <p className="font-body text-base text-ivory-400 max-w-md mb-8">
        You reviewed <span className="text-ivory-200 font-medium">{count}</span>{' '}
        {count === 1 ? 'opening' : 'openings'} and refreshed your memory. Each one is now scheduled further out for
        spaced review.
      </p>

      <div className="flex gap-4 mb-8">
        <div className="rounded-2xl border border-ink-700 bg-ink-800 px-6 py-4">
          <div className="font-display text-3xl font-bold text-gold-400">{count}</div>
          <div className="font-body text-xs text-ivory-500 mt-1">reviewed</div>
        </div>
        {streak > 0 && (
          <div className="rounded-2xl border border-ink-700 bg-ink-800 px-6 py-4">
            <div className="font-display text-3xl font-bold text-gold-400">🔥 {streak}</div>
            <div className="font-body text-xs text-ivory-500 mt-1">day streak</div>
          </div>
        )}
      </div>

      <button
        onClick={onDone}
        className="w-full max-w-xs flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-ink-950 font-body font-semibold text-sm px-6 py-3.5 rounded-xl transition-all duration-200 hover:shadow-[0_0_24px_rgba(212,165,32,0.4)] focus-visible:outline-none"
      >
        Back to openings
      </button>
    </div>
  )
}
