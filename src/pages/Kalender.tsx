import { FileCheck2, GraduationCap } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { MonatsKalender } from '../components/MonatsKalender'
import { CountdownBadge } from '../components/CountdownBadge'
import { daysUntil, formatDeDate } from '../lib/datum'

export function Kalender() {
  const { faecher } = useStore()
  const kommende = [...faecher]
    .filter((f) => daysUntil(f.termin) >= 0)
    .sort((a, b) => daysUntil(a.termin) - daysUntil(b.termin))

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Kalender</h1>
        <p className="mt-1 text-sm text-slate-400">
          Alle Klausur- und Abgabetermine auf einen Blick.
        </p>
      </header>

      <MonatsKalender />

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">Kommende Termine</h2>
        {kommende.length === 0 ? (
          <p className="text-sm text-slate-500">Keine anstehenden Termine.</p>
        ) : (
          <div className="space-y-2">
            {kommende.map((f) => (
              <div
                key={f.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/10 bg-slate-900/60 p-3 backdrop-blur"
                style={{ borderLeft: `4px solid ${f.farbe}` }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{f.name}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    {f.typ === 'klausur' ? <GraduationCap size={14} /> : <FileCheck2 size={14} />}
                    {f.typ === 'klausur' ? 'Klausur' : 'Projektabgabe'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  {formatDeDate(f.termin)}
                  <CountdownBadge termin={f.termin} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
