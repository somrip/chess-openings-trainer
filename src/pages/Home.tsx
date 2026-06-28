import { openings } from '../data/openings'
import { OpeningCard } from '../components/OpeningCard'
import { NavBar } from '../components/NavBar'
import type { Opening } from '../types'

interface HomeProps {
  onSelect: (opening: Opening) => void
}

export function Home({ onSelect }: HomeProps) {
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
        <div className="mt-10 flex flex-wrap gap-6 animate-fade-in" style={{ animationDelay: '0.15s', opacity: 0 }}>
          {[
            { label: 'Openings', value: `${openings.length}` },
            { label: 'For beginners', value: '0–1200' },
            { label: 'No account needed', value: 'Free' },
          ].map((stat) => (
            <div key={stat.label} className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-bold text-gold-400">{stat.value}</span>
              <span className="font-body text-sm text-ivory-500">{stat.label}</span>
            </div>
          ))}
        </div>
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
          baseDelay={0}
        />
        <Section
          title="Playing Black"
          description="Solid, counter-punching defenses"
          icon="♚"
          openings={blackOpenings}
          onSelect={onSelect}
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
  baseDelay,
}: {
  title: string
  description: string
  icon: string
  openings: Opening[]
  onSelect: (o: Opening) => void
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
            style={{ animationDelay: `${(baseDelay + i) * 0.07}s`, opacity: 0 }}
          />
        ))}
      </div>
    </section>
  )
}
