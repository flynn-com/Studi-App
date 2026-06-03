import { Link } from 'react-router-dom'
import { CalendarDays, CalendarPlus, ChevronRight, FileCheck2, GraduationCap, Sparkles, Trophy } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { nachPrioritaet, fortschritt } from '../lib/prio'
import { computeStats, gesamtXp, levelInfo, freigeschaltete, ERFOLGE } from '../lib/erfolge'
import { CountdownBadge } from '../components/CountdownBadge'
import { Fortschrittsbalken } from '../components/Fortschrittsbalken'
import { MonatsKalender } from '../components/MonatsKalender'
import { TagesPlan } from '../components/TagesPlan'
import { formatDeDate, heuteIso } from '../lib/datum'

export function Dashboard() {
  const { faecher, themen, sessions } = useStore()
  const sortiert = nachPrioritaet(faecher, themen)

  const stats = computeStats({ faecher, themen, sessions })
  const lvl = levelInfo(gesamtXp(stats))
  const badges = freigeschaltete(stats).length

  const heuteStr = heuteIso()
  const heuteTermine = faecher.filter((f) => f.termin === heuteStr)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Dein Lern-Cockpit: heutige Termine, Tagesplan, Kalender und Prioritäten.
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

      {/* Heute: Termine + Tagesplanung */}
      <section className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur">
        <div className="mb-3 flex items-center gap-2">
          <CalendarDays size={18} className="text-indigo-400" />
          <h2 className="font-semibold text-white">Heute</h2>
          <span className="text-xs text-slate-400">{formatDeDate(heuteStr)}</span>
        </div>

        {heuteTermine.length > 0 && (
          <div className="mb-3 space-y-1.5">
            {heuteTermine.map((f) => (
              <div
                key={f.id}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  f.typ === 'klausur'
                    ? 'bg-red-500/15 text-red-200'
                    : 'bg-amber-500/10 text-amber-200'
                }`}
              >
                {f.typ === 'klausur' ? <GraduationCap size={15} /> : <FileCheck2 size={15} />}
                <span className="font-semibold">{f.name}</span>
                <span className="text-xs opacity-80">
                  {f.typ === 'klausur' ? 'heute Klausur!' : 'heute Abgabe!'}
                </span>
              </div>
            ))}
          </div>
        )}

        <TagesPlan datum={heuteStr} />
      </section>

      {/* Kalender */}
      <MonatsKalender />

      <h2 className="flex items-center gap-2 pt-1 text-lg font-semibold text-white">
        <Sparkles className="text-indigo-400" size={18} />
        Prioritäten
      </h2>

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
