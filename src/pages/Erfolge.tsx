import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Crown,
  Flame,
  GraduationCap,
  Layers,
  ListChecks,
  Lock,
  Star,
  Timer,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { useStore } from '../store/StoreContext'
import {
  ERFOLGE,
  computeStats,
  gesamtXp,
  istFreigeschaltet,
  levelInfo,
  type IconKey,
} from '../lib/erfolge'

const ICONS: Record<IconKey, LucideIcon> = {
  BookOpen,
  Layers,
  CheckCircle2,
  ListChecks,
  Timer,
  Clock,
  Flame,
  Crown,
  GraduationCap,
  Star,
  CalendarCheck,
  Trophy,
}

function fortschrittText(wert: number, ziel: number, einheit: 'anzahl' | 'minuten'): string {
  if (einheit === 'minuten') {
    const h = (n: number) => (n / 60).toFixed(n % 60 === 0 ? 0 : 1)
    return `${h(Math.min(wert, ziel))} / ${h(ziel)} h`
  }
  return `${Math.min(wert, ziel)} / ${ziel}`
}

export function Erfolge() {
  const { faecher, themen, sessions } = useStore()
  const stats = computeStats({ faecher, themen, sessions })
  const xp = gesamtXp(stats)
  const lvl = levelInfo(xp)
  const freigeschaltetAnzahl = ERFOLGE.filter((e) => istFreigeschaltet(e, stats)).length

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
          <Trophy className="text-amber-400" size={24} />
          Erfolge
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Sammle XP, steige im Level auf und schalte Abzeichen frei.
        </p>
      </header>

      {/* Level / XP */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10 p-5 backdrop-blur">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-wide text-indigo-300">Level</div>
            <div className="text-4xl font-extrabold text-white">{lvl.level}</div>
          </div>
          <div className="text-right text-sm text-slate-300">
            <div className="font-semibold text-white">{lvl.xpGesamt} XP</div>
            <div className="text-xs text-slate-400">
              {freigeschaltetAnzahl}/{ERFOLGE.length} Abzeichen
            </div>
          </div>
        </div>
        <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all"
            style={{ width: `${Math.round(lvl.fortschritt * 100)}%` }}
          />
        </div>
        <div className="mt-1 text-right text-[11px] text-slate-400">
          noch {lvl.proLevel - lvl.imLevel} XP bis Level {lvl.level + 1}
        </div>
      </div>

      {/* Abzeichen */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ERFOLGE.map((e) => {
          const Icon = ICONS[e.icon]
          const wert = e.wert(stats)
          const frei = wert >= e.ziel
          const prozent = Math.min(100, Math.round((wert / e.ziel) * 100))
          return (
            <div
              key={e.id}
              className={`flex gap-3 rounded-2xl border p-4 backdrop-blur transition-colors ${
                frei
                  ? 'border-amber-400/30 bg-amber-400/[0.06]'
                  : 'border-white/10 bg-slate-900/60'
              }`}
            >
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  frei
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white/5 text-slate-500'
                }`}
              >
                {frei ? <Icon size={22} /> : <Lock size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-sm font-semibold ${frei ? 'text-white' : 'text-slate-300'}`}>
                    {e.titel}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      frei ? 'bg-amber-400/20 text-amber-300' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    +{e.xp} XP
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{e.beschreibung}</p>
                {!frei && (
                  <div className="mt-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-indigo-400/70"
                        style={{ width: `${prozent}%` }}
                      />
                    </div>
                    <div className="mt-1 text-right text-[10px] text-slate-500">
                      {fortschrittText(wert, e.ziel, e.einheit)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
