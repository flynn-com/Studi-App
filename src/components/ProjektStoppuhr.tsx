import { useEffect, useState } from 'react'
import { Bell, Check, Pause, Play, RotateCcw, Square } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useLocalStorage } from '../lib/storage'
import { heuteIso } from '../lib/datum'
import { feiern } from '../lib/effekte'
import { erlauben, status, zeige, type Erlaubnis } from '../lib/benachrichtigung'

interface SU {
  fachId: string
  laufendSeit: number | null // Zeitstempel (ms) des aktuellen Laufs, null = pausiert/gestoppt
  angesammeltMs: number // bereits gelaufene Zeit aus früheren Läufen
  zielMin: number | null // optionales Erinnerungsziel
  benachrichtigt: boolean
}

const LEER: SU = { fachId: '', laufendSeit: null, angesammeltMs: 0, zielMin: null, benachrichtigt: false }

function hms(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function ProjektStoppuhr() {
  const { faecher, addSession, effekteAn } = useStore()
  const [s, setS] = useLocalStorage<SU>('lt.stoppuhr', LEER)
  const [jetzt, setJetzt] = useState(() => Date.now())
  const [perm, setPerm] = useState<Erlaubnis>(() => status())

  const laeuft = s.laufendSeit !== null
  const vergangenMs = s.angesammeltMs + (s.laufendSeit ? jetzt - s.laufendSeit : 0)
  const fachName = faecher.find((f) => f.id === s.fachId)?.name ?? 'deinem Projekt'

  // Sekundentakt, während die Uhr läuft
  useEffect(() => {
    if (!laeuft) return
    const id = window.setInterval(() => setJetzt(Date.now()), 500)
    return () => window.clearInterval(id)
  }, [laeuft])

  // Bei Rückkehr (Display an / App wieder im Vordergrund) sofort neu berechnen
  useEffect(() => {
    const aktualisieren = () => setJetzt(Date.now())
    document.addEventListener('visibilitychange', aktualisieren)
    window.addEventListener('focus', aktualisieren)
    return () => {
      document.removeEventListener('visibilitychange', aktualisieren)
      window.removeEventListener('focus', aktualisieren)
    }
  }, [])

  // Erinnerung auslösen, sobald das Ziel erreicht ist (auch beim Zurückkehren)
  useEffect(() => {
    if (!laeuft || s.zielMin == null || s.benachrichtigt) return
    if (vergangenMs >= s.zielMin * 60000) {
      zeige('⏱️ Lernzeit erreicht', `Du arbeitest seit ${s.zielMin} Min an ${fachName}.`)
      if (effekteAn) feiern()
      setS({ ...s, benachrichtigt: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jetzt, laeuft, s.zielMin, s.benachrichtigt])

  const start = () => setS({ ...s, laufendSeit: Date.now() })
  const pause = () =>
    setS({ ...s, angesammeltMs: vergangenMs, laufendSeit: null })

  const stoppenSpeichern = () => {
    const min = Math.round(vergangenMs / 60000)
    if (min > 0 && s.fachId) addSession(s.fachId, min, heuteIso())
    if (min > 0 && effekteAn) feiern()
    setS(LEER)
  }

  const zuruecksetzen = () => {
    if (vergangenMs > 0 && !confirm('Stoppuhr ohne Speichern zurücksetzen?')) return
    setS(LEER)
  }

  const benachrichtigungenAn = async () => {
    setPerm(await erlauben())
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center backdrop-blur">
      {/* Fach-Auswahl */}
      <select
        value={s.fachId}
        onChange={(e) => setS({ ...s, fachId: e.target.value })}
        disabled={vergangenMs > 0}
        className="mb-4 w-full max-w-xs rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500/60 disabled:opacity-60"
      >
        <option value="">Projekt / Fach wählen…</option>
        {faecher.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      {/* Zeitanzeige */}
      <div className="my-4">
        <div
          className={`font-bold tabular-nums text-white ${laeuft ? 'text-6xl' : 'text-6xl opacity-90'}`}
        >
          {hms(vergangenMs)}
        </div>
        <div className="mt-1 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span
            className={`h-2 w-2 rounded-full ${laeuft ? 'animate-pulse bg-emerald-400' : 'bg-slate-500'}`}
          />
          {laeuft ? 'läuft – auch wenn du das iPad sperrst' : vergangenMs > 0 ? 'pausiert' : 'bereit'}
        </div>
      </div>

      {/* Erinnerungsziel */}
      <div className="mx-auto mb-4 flex max-w-xs items-center justify-center gap-2 text-sm">
        <Bell size={15} className="text-slate-400" />
        <span className="text-slate-400">Erinnern nach</span>
        <input
          type="number"
          min="1"
          inputMode="numeric"
          value={s.zielMin ?? ''}
          onChange={(e) =>
            setS({
              ...s,
              zielMin: e.target.value ? Number(e.target.value) : null,
              benachrichtigt: false,
            })
          }
          placeholder="–"
          className="w-16 rounded-lg border border-white/10 bg-slate-950/40 px-2 py-1 text-center text-slate-100 outline-none focus:border-indigo-500/60"
        />
        <span className="text-slate-400">Min</span>
      </div>

      {/* Steuerung */}
      <div className="flex justify-center gap-3">
        {!laeuft ? (
          <button
            onClick={start}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
          >
            <Play size={18} /> {vergangenMs > 0 ? 'Weiter' : 'Start'}
          </button>
        ) : (
          <button
            onClick={pause}
            className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
          >
            <Pause size={18} /> Pause
          </button>
        )}

        <button
          onClick={stoppenSpeichern}
          disabled={vergangenMs < 60000 || !s.fachId}
          className="flex items-center gap-2 rounded-lg bg-emerald-500/90 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          title={!s.fachId ? 'Bitte Fach wählen' : 'Zeit speichern'}
        >
          <Check size={18} /> Speichern
        </button>

        <button
          onClick={zuruecksetzen}
          className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10"
          aria-label="Zurücksetzen"
        >
          {vergangenMs > 0 ? <Square size={18} /> : <RotateCcw size={18} />}
        </button>
      </div>

      {/* Benachrichtigungs-Hinweis */}
      {perm !== 'granted' && (
        <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left text-xs text-slate-400">
          {perm === 'unsupported' ? (
            <span>
              Dein Browser unterstützt keine Web-Benachrichtigungen. Tipp: Installiere die App über
              „Teilen → Zum Home-Bildschirm", dann klappt es auf dem iPad zuverlässiger.
            </span>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span>Erinnerung als echte Benachrichtigung erhalten?</span>
              <button
                onClick={benachrichtigungenAn}
                className="shrink-0 rounded-lg bg-indigo-500/90 px-3 py-1.5 font-semibold text-white hover:bg-indigo-500"
              >
                Aktivieren
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
