import { useState } from 'react'
import { useNav } from './NavContext'
import { SideMenu } from './SideMenu'

interface NavBarProps {
  onHome: () => void
  subtitle?: string
}

export function NavBar({ onHome, subtitle }: NavBarProps) {
  const nav = useNav()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-ink-950/80 backdrop-blur-md border-b border-ink-700/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        {nav && (
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="flex-shrink-0 -ml-1 p-1.5 rounded-lg text-ivory-300 hover:text-ivory-100 hover:bg-ink-800 transition-colors duration-150 focus-visible:outline-none"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}

        <button onClick={onHome} className="flex items-center gap-2.5 group focus-visible:outline-none">
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

      {nav && <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} nav={nav} />}
    </header>
  )
}
