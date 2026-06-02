import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { heuteIso } from '../lib/datum'

const LERN_MIN = 25
const PAUSE_MIN = 5

/** Pomodoro-Timer. Bei Abschluss einer Lernphase wird automatisch eine Session gespeichert. */
export function PomodoroTimer() {
  const { faecher, addSession } = useStore()
  const [fachId, setFachId] = useState('')
  const [modus, setModus] = useState<'lernen' | 'pause'>('lernen')
  const [sekunden, setSekunden] = useState(LERN_MIN * 60)
  const [laeuft, setLaeuft] = useState(false)
  const intervall = useRef<number | null>(null)

  const gesamt = (modus === 'lernen' ? LERN_MIN : PAUSE_MIN) * 60

  useEffect(() => {
    if (!laeuft) return
    intervall.current = window.setInterval(() => {
      setSekunden((s) => s - 1)
    }, 1000)
    return () => {
      if (intervall.current) window.clearInterval(intervall.current)
    }
  }, [laeuft])

  useEffect(() => {
    if (sekunden > 0) return
    // Phase abgeschlossen
    setLaeuft(false)
    if (modus === 'lernen') {
      if (fachId) addSession(fachId, LERN_MIN, heuteIso())
      setModus('pause')
      setSekunden(PAUSE_MIN * 60)
    } else {
      setModus('lernen')
      setSekunden(LERN_MIN * 60)
    }
  }, [sekunden]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setLaeuft(false)
    setSekunden(gesamt)
  }

  const mm = Math.floor(Math.max(0, sekunden) / 60)
    .toString()
    .padStart(2, '0')
  const ss = (Math.max(0, sekunden) % 60).toString().padStart(2, '0')
  const ring = 1 - sekunden / gesamt
  const akzent = modus === 'lernen' ? '#818cf8' : '#34d399'

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center backdrop-blur">
      <div className="mb-4 flex justify-center gap-2">
        {(['lernen', 'pause'] as const).map((m) => (
          <button
            key={m}
            onClick={() => {
              setModus(m)
              setLaeuft(false)
              setSekunden((m === 'lernen' ? LERN_MIN : PAUSE_MIN) * 60)
            }}
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
              modus === m ? 'bg-indigo-500/20 text-indigo-300 ring-1 ring-inset ring-indigo-500/40' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {m === 'lernen' ? `Lernen ${LERN_MIN} min` : `Pause ${PAUSE_MIN} min`}
          </button>
        ))}
      </div>

      <div className="relative mx-auto mb-5 h-44 w-44">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={akzent}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 45}
            strokeDashoffset={2 * Math.PI * 45 * (1 - ring)}
            className="transition-all duration-1000 ease-linear"
            style={{ filter: `drop-shadow(0 0 6px ${akzent}90)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold tabular-nums text-white">
          {mm}:{ss}
        </div>
      </div>

      <select
        value={fachId}
        onChange={(e) => setFachId(e.target.value)}
        className="mb-4 w-full max-w-xs rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
      >
        <option value="">Fach wählen (für die Statistik)…</option>
        {faecher.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <div className="flex justify-center gap-3">
        <button
          onClick={() => setLaeuft((l) => !l)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
        >
          {laeuft ? <Pause size={18} /> : <Play size={18} />}
          {laeuft ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  )
}
