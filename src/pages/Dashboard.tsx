import { Link } from 'react-router-dom'
import { CalendarPlus, ChevronRight, FileCheck2, GraduationCap, Sparkles, Trophy } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { nachPrioritaet, fortschritt } from '../lib/prio'
import { computeStats, gesamtXp, levelInfo, freigeschaltete, ERFOLGE } from '../lib/erfolge'
import { CountdownBadge } from '../components/CountdownBadge'
import { Fortschrittsbalken } from '../components/Fortschrittsbalken'
import { formatDeDate } from '../lib/datum'

export function Dashboard() {
  const { faecher, themen, sessions } = useStore()
  const sortiert = nachPrioritaet(faecher, themen)

  const stats = computeStats({ faecher, themen, sessions })
  const lvl = levelInfo(gesamtXp(stats))
  const badges = freigeschaltete(stats).length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Sparkles className="text-indigo-400" size={24} />
          Was lerne ich heute?
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Deine Fächer nach Dringlichkeit sortiert — oben steht, was am wichtigsten ist.
        </p>
      </header>

      {/* Level-Banner */}
      <Link
        to="/erfolge"
        className="block rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-4 backdrop-blur transition-colors hover:border-white/20"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30">
            <Trophy size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-white">Level {lvl.level}</span>
              <span className="text-xs text-slate-400">
                {badges}/{ERFOLGE.length} Abzeichen · {lvl.xpGesamt} XP
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                style={{ width: `${Math.round(lvl.fortschritt * 100)}%` }}
              />
            </div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-slate-500" />
        </div>
      </Link>

      {faecher.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-10 text-center">
          <p className="text-slate-400">Noch keine Fächer angelegt.</p>
          <Link
            to="/faecher"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
          >
            <CalendarPlus size={18} />
            Erstes Fach anlegen
          </Link>
        </div>
      ) : sortiert.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center text-slate-400">
          Keine anstehenden Termine — alle Termine liegen in der Vergangenheit. 🎉
        </div>
      ) : (
        <div className="space-y-3">
          {sortiert.map((f, i) => {
            const prozent = fortschritt(f.id, themen)
            return (
              <div
                key={f.id}
                className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur transition-colors hover:border-white/20"
                style={{ borderLeft: `4px solid ${f.farbe}` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <span className="rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-2 py-0.5 text-xs font-bold text-white shadow shadow-indigo-500/30">
                        Top
                      </span>
                    )}
                    <span className="font-semibold text-white">{f.name}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      {f.typ === 'klausur' ? <GraduationCap size={14} /> : <FileCheck2 size={14} />}
                      {f.typ === 'klausur' ? 'Klausur' : 'Projektabgabe'}
                    </span>
                  </div>
                  <CountdownBadge termin={f.termin} />
                </div>
                <div className="mt-1 text-xs text-slate-500">{formatDeDate(f.termin)}</div>
                <div className="mt-3">
                  <Fortschrittsbalken prozent={prozent} farbe={f.farbe} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
