import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { PomodoroTimer } from '../components/PomodoroTimer'
import { ProjektStoppuhr } from '../components/ProjektStoppuhr'
import { Heatmap } from '../components/Heatmap'
import { useLocalStorage } from '../lib/storage'
import { heuteIso, montagDerWoche } from '../lib/datum'

const inputCls =
  'rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20'

export function Lernzeit() {
  const { faecher, sessions, addSession } = useStore()
  const [timerModus, setTimerModus] = useLocalStorage<'stoppuhr' | 'pomodoro'>(
    'lt.timerModus',
    'stoppuhr',
  )
  const [fachId, setFachId] = useState('')
  const [minuten, setMinuten] = useState('30')
  const [datum, setDatum] = useState(heuteIso())

  // Summe Minuten je Fach
  const proFach = faecher
    .map((f) => ({
      fach: f,
      min: sessions.filter((s) => s.fachId === f.id).reduce((a, s) => a + s.minuten, 0),
    }))
    .filter((x) => x.min > 0)
    .sort((a, b) => b.min - a.min)

  const maxMin = Math.max(1, ...proFach.map((x) => x.min))
  const startWoche = montagDerWoche()
  const diesWoche = sessions
    .filter((s) => s.datum >= startWoche)
    .reduce((a, s) => a + s.minuten, 0)
  const gesamt = sessions.reduce((a, s) => a + s.minuten, 0)

  const erfassen = (e: React.FormEvent) => {
    e.preventDefault()
    const m = Number(minuten)
    if (!fachId || !m || m <= 0) return
    addSession(fachId, m, datum)
    setMinuten('30')
  }

  const fmt = (m: number) => {
    const h = Math.floor(m / 60)
    const r = m % 60
    return h > 0 ? `${h} h ${r} min` : `${r} min`
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Lernzeit</h1>
        <p className="mt-1 text-sm text-slate-400">
          Nutze den Pomodoro-Timer oder trage Lernzeit manuell ein.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {/* Umschalter Stoppuhr / Pomodoro */}
          <div className="flex gap-1 rounded-xl border border-white/10 bg-slate-900/60 p-1">
            {(['stoppuhr', 'pomodoro'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTimerModus(m)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  timerModus === m
                    ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-500/40'
                    : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                {m === 'stoppuhr' ? 'Stoppuhr' : 'Pomodoro'}
              </button>
            ))}
          </div>
          {timerModus === 'stoppuhr' ? <ProjektStoppuhr /> : <PomodoroTimer />}
        </div>

        <div className="space-y-6">
          {/* Manuelle Erfassung */}
          <form
            onSubmit={erfassen}
            className="space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur"
          >
            <h2 className="text-sm font-semibold text-slate-300">Lernzeit manuell eintragen</h2>
            <select
              value={fachId}
              onChange={(e) => setFachId(e.target.value)}
              className={`w-full ${inputCls}`}
            >
              <option value="">Fach wählen…</option>
              {faecher.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                min="1"
                value={minuten}
                onChange={(e) => setMinuten(e.target.value)}
                className={`w-24 ${inputCls}`}
                placeholder="Min."
              />
              <input
                type="date"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                className={`flex-1 ${inputCls}`}
              />
              <button
                type="submit"
                className="flex items-center gap-1 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
              >
                <Plus size={16} />
              </button>
            </div>
          </form>

          {/* Statistik */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
            <div className="mb-4 flex justify-between text-sm">
              <div>
                <div className="text-2xl font-bold text-indigo-400">{fmt(diesWoche)}</div>
                <div className="text-xs text-slate-500">diese Woche</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">{fmt(gesamt)}</div>
                <div className="text-xs text-slate-500">insgesamt</div>
              </div>
            </div>

            <h2 className="mb-2 text-sm font-semibold text-slate-300">Lernzeit pro Fach</h2>
            {proFach.length === 0 ? (
              <p className="text-sm text-slate-500">Noch keine Lernzeit erfasst.</p>
            ) : (
              <div className="space-y-2">
                {proFach.map(({ fach, min }) => (
                  <div key={fach.id}>
                    <div className="mb-0.5 flex justify-between text-xs">
                      <span className="font-medium text-slate-200">{fach.name}</span>
                      <span className="text-slate-400">{fmt(min)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(min / maxMin) * 100}%`,
                          background: fach.farbe,
                          boxShadow: `0 0 12px ${fach.farbe}80`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Heatmap />
    </div>
  )
}
