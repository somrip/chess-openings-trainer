interface NavBarProps {
  onHome: () => void
  subtitle?: string
}

export function NavBar({ onHome, subtitle }: NavBarProps) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink-950/80 backdrop-blur-md border-b border-ink-700/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">
        <button
          onClick={onHome}
          className="flex items-center gap-2.5 group focus-visible:outline-none"
        >
          <span className="text-xl leading-none">♟</span>
          <span className="font-display font-semibold text-ivory-100 text-base leading-none group-hover:text-gold-400 transition-colors duration-200">
            Openings Trainer
          </span>
        </button>

        {subtitle && (
          <>
            <span className="text-ink-600">/</span>
            <span className="font-body text-sm text-ivory-400 truncate">{subtitle}</span>
          </>
        )}
      </div>
    </header>
  )
}
