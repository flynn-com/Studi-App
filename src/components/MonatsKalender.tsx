import { useMemo, useState } from 'react'
import { CalendarClock, ChevronLeft, ChevronRight, FileCheck2, GraduationCap } from 'lucide-react'
import type { Fach } from '../types'
import { useStore } from '../store/StoreContext'
import { formatDeDate, heuteIso } from '../lib/datum'
import { TagesPlan } from './TagesPlan'

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function isoOf(jahr: number, monat: number, tag: number): string {
  return `${jahr}-${String(monat + 1).padStart(2, '0')}-${String(tag).padStart(2, '0')}`
}

export function MonatsKalender() {
  const { faecher, plan } = useStore()
  const heute = new Date()
  const [jahr, setJahr] = useState(heute.getFullYear())
  const [monat, setMonat] = useState(heute.getMonth())
  const [gewaehlt, setGewaehlt] = useState<string | null>(heuteIso())

  // Termine je ISO-Datum gruppieren
  const proTag = useMemo(() => {
    const map = new Map<string, Fach[]>()
    for (const f of faecher) {
      if (!f.termin) continue
      const arr = map.get(f.termin) ?? []
      arr.push(f)
      map.set(f.termin, arr)
    }
    return map
  }, [faecher])

  const planProTag = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of plan) map.set(p.datum, (map.get(p.datum) ?? 0) + 1)
    return map
  }, [plan])

  const ersterWochentag = (new Date(jahr, monat, 1).getDay() + 6) % 7 // Mo=0
  const tageImMonat = new Date(jahr, monat + 1, 0).getDate()
  const heuteIsoStr = isoOf(heute.getFullYear(), heute.getMonth(), heute.getDate())

  const zellen: (number | null)[] = [
    ...Array(ersterWochentag).fill(null),
    ...Array.from({ length: tageImMonat }, (_, i) => i + 1),
  ]

  const blaettern = (delta: number) => {
    const m = monat + delta
    if (m < 0) {
      setMonat(11)
      setJahr((j) => j - 1)
    } else if (m > 11) {
      setMonat(0)
      setJahr((j) => j + 1)
    } else {
      setMonat(m)
    }
  }

  const termineGewaehlt = gewaehlt ? proTag.get(gewaehlt) ?? [] : []

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {MONATE[monat]} {jahr}
        </h2>
        <div className="flex gap-1">
          <button onClick={() => blaettern(-1)} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5" aria-label="Vorheriger Monat">
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              setMonat(heute.getMonth())
              setJahr(heute.getFullYear())
              setGewaehlt(heuteIsoStr)
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Heute
          </button>
          <button onClick={() => blaettern(1)} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5" aria-label="Nächster Monat">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500">
        {WOCHENTAGE.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {zellen.map((tag, i) => {
          if (tag === null) return <div key={`e${i}`} />
          const iso = isoOf(jahr, monat, tag)
          const termine = proTag.get(iso) ?? []
          const hatKlausur = termine.some((t) => t.typ === 'klausur')
          const hatAbgabe = termine.some((t) => t.typ === 'projektabgabe')
          const planAnzahl = planProTag.get(iso) ?? 0
          const istHeute = iso === heuteIsoStr
          const istGewaehlt = iso === gewaehlt

          let cls = 'border-transparent hover:bg-white/5'
          if (hatKlausur) cls = 'border-red-500/40 bg-red-500/15 hover:bg-red-500/20'
          else if (hatAbgabe) cls = 'border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/15'

          return (
            <button
              key={iso}
              onClick={() => setGewaehlt(iso)}
              className={`flex min-h-[3.25rem] flex-col rounded-lg border p-1 text-left transition-colors ${cls} ${
                istGewaehlt ? 'ring-2 ring-inset ring-indigo-400' : ''
              }`}
            >
              <span
                className={`text-xs ${
                  istHeute
                    ? 'font-bold text-indigo-300'
                    : hatKlausur
                      ? 'font-semibold text-red-300'
                      : 'text-slate-400'
                }`}
              >
                {tag}
              </span>
              <div className="mt-auto flex flex-wrap items-center gap-0.5">
                {hatKlausur && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-red-500 text-white">
                    <GraduationCap size={10} />
                  </span>
                )}
                {hatAbgabe && (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-amber-500 text-white">
                    <FileCheck2 size={10} />
                  </span>
                )}
                {planAnzahl > 0 && (
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" title={`${planAnzahl} geplant`} />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Legende */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
        <span className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-red-500 text-white">
            <GraduationCap size={10} />
          </span>
          Klausur
        </span>
        <span className="flex items-center gap-1">
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded bg-amber-500 text-white">
            <FileCheck2 size={10} />
          </span>
          Abgabe
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
          Lernplan
        </span>
      </div>

      {/* Ausgewählter Tag: Termine + Tagesplanung */}
      {gewaehlt && (
        <div className="mt-4 space-y-3 border-t border-white/10 pt-3">
          <p className="text-sm font-medium text-white">{formatDeDate(gewaehlt)}</p>

          {termineGewaehlt.length > 0 && (
            <div className="space-y-1.5">
              {termineGewaehlt.map((f) => (
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
                    {f.typ === 'klausur' ? 'Klausur' : 'Projektabgabe'}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <CalendarClock size={13} /> Lernplan für diesen Tag
            </div>
            <TagesPlan datum={gewaehlt} />
          </div>
        </div>
      )}
    </div>
  )
}
