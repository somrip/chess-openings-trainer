import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { openings } from '../data/openings'
import type { Opening } from '../types'
import type { NavContextValue } from './NavContext'

interface SideMenuProps {
  open: boolean
  onClose: () => void
  nav: NavContextValue
}

export function SideMenu({ open, onClose, nav }: SideMenuProps) {
  const [query, setQuery] = useState('')

  // Close on Escape and lock body scroll while open.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  const term = query.trim().toLowerCase()
  const matches = (o: Opening) =>
    !term || o.name.toLowerCase().includes(term) || (o.eco?.toLowerCase().includes(term) ?? false)
  const white = openings.filter((o) => o.side === 'white' && matches(o))
  const black = openings.filter((o) => o.side === 'black' && matches(o))

  function go(o: Opening) {
    nav.onSelectOpening(o)
    onClose()
  }

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-label="Openings menu"
        className={`fixed top-0 left-0 z-[61] h-full w-[310px] max-w-[85vw] bg-ink-900 border-r border-ink-700 shadow-[8px_0_40px_rgba(0,0,0,0.5)] flex flex-col transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-ink-700/60 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl leading-none">♟</span>
            <span className="font-display font-semibold text-ivory-100 text-base leading-none">Openings Trainer</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="text-ivory-500 hover:text-ivory-100 transition-colors duration-150 focus-visible:outline-none text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Quick actions */}
        <div className="px-4 pt-4 pb-3 space-y-2 flex-shrink-0">
          <button
            onClick={() => {
              nav.onHome()
              onClose()
            }}
            className="w-full flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-800 hover:bg-ink-700 hover:border-ink-600 px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none"
          >
            <span className="text-ivory-400">⌂</span>
            <span className="font-body text-sm font-medium text-ivory-200">Home</span>
            {nav.streak > 0 && (
              <span className="ml-auto font-body text-xs text-gold-300">🔥 {nav.streak}</span>
            )}
          </button>

          {nav.dueCount > 0 && (
            <button
              onClick={() => {
                nav.onStartReview()
                onClose()
              }}
              className="w-full flex items-center gap-3 rounded-xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/15 px-4 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none"
            >
              <span className="text-gold-400">↻</span>
              <span className="font-body text-sm font-semibold text-ivory-100">Start review</span>
              <span className="ml-auto font-body text-xs font-semibold text-gold-300">{nav.dueCount} due</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="px-4 pb-3 flex-shrink-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search openings…"
            className="w-full rounded-xl border border-ink-700 bg-ink-950 px-3.5 py-2 font-body text-sm text-ivory-100 placeholder:text-ivory-600 focus:border-gold-500/50 focus:outline-none transition-colors duration-150"
          />
        </div>

        {/* Opening list */}
        <nav className="flex-1 overflow-y-auto px-4 pb-6 space-y-5">
          <MenuSection title="Playing White" icon="♔" openings={white} nav={nav} onGo={go} />
          <MenuSection title="Playing Black" icon="♚" openings={black} nav={nav} onGo={go} />
          {white.length === 0 && black.length === 0 && (
            <p className="font-body text-sm text-ivory-500 px-1 pt-2">No openings match “{query}”.</p>
          )}
        </nav>
      </aside>
    </>,
    document.body,
  )
}

function MenuSection({
  title,
  icon,
  openings,
  nav,
  onGo,
}: {
  title: string
  icon: string
  openings: Opening[]
  nav: NavContextValue
  onGo: (o: Opening) => void
}) {
  if (openings.length === 0) return null
  return (
    <div>
      <p className="flex items-center gap-2 font-body text-xs font-semibold uppercase tracking-wider text-ivory-500 mb-2 px-1">
        <span className="text-sm">{icon}</span> {title}
      </p>
      <ul className="space-y-0.5">
        {openings.map((o) => {
          const active = o.id === nav.currentOpeningId
          const due = nav.isDue(o.id)
          const learned = nav.isLearned(o.id)
          return (
            <li key={o.id}>
              <button
                onClick={() => onGo(o)}
                aria-current={active ? 'true' : undefined}
                className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors duration-150 focus-visible:outline-none ${
                  active
                    ? 'bg-gold-500/15 border border-gold-500/40'
                    : 'border border-transparent hover:bg-ink-800'
                }`}
              >
                <span className={`font-body text-sm truncate ${active ? 'text-gold-200 font-medium' : 'text-ivory-200'}`}>
                  {o.name}
                </span>
                {due ? (
                  <span className="ml-auto flex-shrink-0 text-gold-300 text-xs" title="Due for review">
                    ↻
                  </span>
                ) : learned ? (
                  <span className="ml-auto flex-shrink-0 text-emerald-400 text-xs" title="Learned">
                    ✓
                  </span>
                ) : null}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
