import { openings } from '../data/openings'
import { OpeningCard } from '../components/OpeningCard'
import { NavBar } from '../components/NavBar'
import type { Opening, OpeningProgress } from '../types'

interface HomeProps {
  onSelect: (opening: Opening) => void
  onStartReview: () => void
  streak: number
  learnedCount: number
  dueCount: number
  getProgress: (id: string) => OpeningProgress | undefined
  isDue: (id: string) => boolean
}

export function Home({ onSelect, onStartReview, streak, learnedCount, dueCount, getProgress, isDue }: HomeProps) {
  const whiteOpenings = openings.filter((o) => o.side === 'white')
  const blackOpenings = openings.filter((o) => o.side === 'black')

  return (
    <div className="min-h-screen bg-ink-950 text-ivory-100">
      <NavBar onHome={() => {}} />

      {/* Hero */}
      <section className="pt-28 pb-12 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="max-w-2xl animate-fade-in">
          <p className="font-body text-sm font-medium text-gold-400 tracking-widest uppercase mb-3">
            Chess Openings Trainer
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-bold text-ivory-100 leading-tight mb-4">
            Master openings<br />
            <span className="text-gold-400 italic">one move at a time.</span>
          </h1>
          <p className="font-body text-lg text-ivory-400 leading-relaxed">
            Learn the most important chess openings through guided repetition.
            Choose an opening and practice until it becomes instinct.
          </p>
        </div>

        {/* Stats strip */}
        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
          {[
            ...(streak > 0 ? [{ label: streak === 1 ? 'day streak' : 'day streak', value: `🔥 ${streak}` }] : []),
            ...(learnedCount > 0 ? [{ label: `of ${openings.length} learned`, value: `${learnedCount}` }] : []),
            ...(dueCount > 0 ? [{ label: 'due for review', value: `↻ ${dueCount}` }] : []),
            ...(learnedCount === 0
              ? [
                  { label: 'Openings', value: `${openings.length}` },
                  { label: 'For beginners', value: '0–1200' },
                  { label: 'No account needed', value: 'Free' },
                ]
              : []),
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-gold-400">{stat.value}</span>
              <span className="font-body text-sm text-ivory-500">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Review CTA — appears when openings are due for spaced review */}
        {dueCount > 0 && (
          <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <button
              onClick={onStartReview}
              className="group flex items-center gap-4 rounded-2xl border border-gold-500/40 bg-gold-500/10 hover:bg-gold-500/15 px-5 py-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <span className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl bg-gold-500 text-ink-950 text-xl font-bold">
                ↻
              </span>
              <span className="text-left">
                <span className="block font-display text-base font-semibold text-ivory-100 group-hover:text-gold-300 transition-colors">
                  Start review · {dueCount} due
                </span>
                <span className="block font-body text-sm text-ivory-400">
                  Refresh {dueCount === 1 ? 'an opening' : `${dueCount} openings`} you've already learned
                </span>
              </span>
              <span className="ml-2 text-gold-300 group-hover:translate-x-0.5 transition-transform">→</span>
            </button>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="border-t border-ink-700/50" />

      {/* Opening lists */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <Section
          title="Playing White"
          description="Aggressive, initiative-seizing openings"
          icon="♔"
          openings={whiteOpenings}
          onSelect={onSelect}
          getProgress={getProgress}
          isDue={isDue}
          baseDelay={0}
        />
        <Section
          title="Playing Black"
          description="Solid, counter-punching defenses"
          icon="♚"
          openings={blackOpenings}
          onSelect={onSelect}
          getProgress={getProgress}
          isDue={isDue}
          baseDelay={whiteOpenings.length * 0.05}
        />
      </main>

      <footer className="border-t border-ink-700/50 py-8 text-center">
        <p className="font-body text-sm text-ivory-500">
          Chess Openings Trainer · Built for beginners
        </p>
      </footer>
    </div>
  )
}

function Section({
  title,
  description,
  icon,
  openings,
  onSelect,
  getProgress,
  isDue,
  baseDelay,
}: {
  title: string
  description: string
  icon: string
  openings: Opening[]
  onSelect: (o: Opening) => void
  getProgress: (id: string) => OpeningProgress | undefined
  isDue: (id: string) => boolean
  baseDelay: number
}) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">{icon}</span>
        <div>
          <h2 className="font-display text-xl font-semibold text-ivory-100">{title}</h2>
          <p className="font-body text-sm text-ivory-500">{description}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {openings.map((opening, i) => (
          <OpeningCard
            key={opening.id}
            opening={opening}
            onClick={() => onSelect(opening)}
            learned={!!getProgress(opening.id)}
            due={isDue(opening.id)}
            style={{ animationDelay: `${(baseDelay + i) * 0.07}s`, opacity: 0 }}
          />
        ))}
      </div>
    </section>
  )
}
