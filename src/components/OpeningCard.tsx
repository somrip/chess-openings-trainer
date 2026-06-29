import type { Opening } from '../types'

interface OpeningCardProps {
  opening: Opening
  onClick: () => void
  style?: React.CSSProperties
  learned?: boolean
  due?: boolean
}

const PIECE_ICON: Record<string, string> = {
  'italian-game': '♗',
  'ruy-lopez': '♝',
  'queens-gambit': '♕',
  'london-system': '♖',
  'scotch-game': '♞',
  'caro-kann': '♙',
  'french-defense': '♟',
  'sicilian-defense': '♛',
  scandinavian: '♜',
  'vienna-game': '♘',
  'kings-gambit': '♔',
  'slav-defense': '♟',
  'dutch-defense': '♚',
  'smith-morra-gambit': '♙',
  'french-advance': '♗',
  'panov-attack': '♘',
}

export function OpeningCard({ opening, onClick, style, learned, due }: OpeningCardProps) {
  const icon = PIECE_ICON[opening.id] ?? '♟'
  const isWhite = opening.side === 'white'

  return (
    <button
      onClick={onClick}
      style={style}
      className="group w-full text-left rounded-2xl border border-ink-700 bg-ink-800 p-6 transition-all duration-300 hover:border-gold-400/60 hover:bg-ink-700 hover:shadow-[0_0_32px_rgba(212,165,32,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 animate-slide-up"
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-ink-900 border border-ink-600 flex items-center justify-center text-2xl group-hover:border-gold-400/40 transition-colors duration-300">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-display text-lg font-semibold text-ivory-100 group-hover:text-gold-400 transition-colors duration-200 leading-tight">
              {opening.name}
            </h3>
            {opening.eco && (
              <span className="text-xs font-body font-medium text-ivory-400 bg-ink-900 px-2 py-0.5 rounded-full border border-ink-600">
                {opening.eco}
              </span>
            )}
            {due ? (
              <span className="text-[10px] font-body font-semibold text-gold-300 bg-gold-500/15 px-2 py-0.5 rounded-full border border-gold-500/40">
                ↻ Review
              </span>
            ) : learned ? (
              <span className="text-[10px] font-body font-semibold text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                ✓ Learned
              </span>
            ) : null}
          </div>

          {/* Side badge */}
          <div className="mb-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-body font-medium px-2.5 py-1 rounded-full ${
                isWhite
                  ? 'bg-ivory-200/10 text-ivory-300 border border-ivory-400/20'
                  : 'bg-ink-900 text-ivory-400 border border-ink-600'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isWhite ? 'bg-ivory-200' : 'bg-ink-400'} ring-1 ring-ivory-400/30`}
              />
              Play as {isWhite ? 'White' : 'Black'}
            </span>
          </div>

          {/* Description */}
          <p className="font-body text-sm text-ivory-400 leading-relaxed line-clamp-2">
            {opening.description}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 mt-1 text-ivory-500 group-hover:text-gold-400 group-hover:translate-x-1 transition-all duration-200">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M4 10h12M12 6l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </button>
  )
}
