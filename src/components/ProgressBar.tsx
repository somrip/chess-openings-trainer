interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? Math.min((current / total) * 100, 100) : 0

  return (
    <div className="w-full">
      <div className="h-2 bg-ink-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
