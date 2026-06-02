import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, FileCheck2, GraduationCap } from 'lucide-react'
import type { Fach } from '../types'
import { formatDeDate } from '../lib/datum'

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const MONATE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function isoOf(jahr: number, monat: number, tag: number): string {
  return `${jahr}-${String(monat + 1).padStart(2, '0')}-${String(tag).padStart(2, '0')}`
}

export function MonatsKalender({ faecher }: { faecher: Fach[] }) {
  const heute = new Date()
  const [jahr, setJahr] = useState(heute.getFullYear())
  const [monat, setMonat] = useState(heute.getMonth())
  const [gewaehlt, setGewaehlt] = useState<string | null>(null)

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

  const ersterWochentag = (new Date(jahr, monat, 1).getDay() + 6) % 7 // Mo=0
  const tageImMonat = new Date(jahr, monat + 1, 0).getDate()
  const heuteIsoStr = isoOf(heute.getFullYear(), heute.getMonth(), heute.getDate())

  const zellen: (number | null)[] = [
    ...Array(ersterWochentag).fill(null),
    ...Array.from({ length: tageImMonat }, (_, i) => i + 1),
  ]

  const blaettern = (delta: number) => {
    setGewaehlt(null)
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

  const gewaehlteTermine = gewaehlt ? proTag.get(gewaehlt) ?? [] : []

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {MONATE[monat]} {jahr}
        </h2>
        <div className="flex gap-1">
          <button
            onClick={() => blaettern(-1)}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => {
              setMonat(heute.getMonth())
              setJahr(heute.getFullYear())
              setGewaehlt(null)
            }}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-white/5"
          >
            Heute
          </button>
          <button
            onClick={() => blaettern(1)}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/5"
            aria-label="Nächster Monat"
          >
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
          const istHeute = iso === heuteIsoStr
          const istGewaehlt = iso === gewaehlt
          return (
            <button
              key={iso}
              onClick={() => setGewaehlt(termine.length ? iso : null)}
              className={`flex min-h-14 flex-col rounded-lg border p-1 text-left transition-colors ${
                istGewaehlt
                  ? 'border-indigo-500/50 bg-indigo-500/10'
                  : 'border-transparent hover:bg-white/5'
              } ${istHeute ? 'ring-1 ring-inset ring-indigo-500/50' : ''}`}
            >
              <span
                className={`text-xs ${istHeute ? 'font-bold text-indigo-300' : 'text-slate-400'}`}
              >
                {tag}
              </span>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {termine.map((f) => (
                  <span
                    key={f.id}
                    title={f.name}
                    style={{ background: f.farbe, boxShadow: `0 0 6px ${f.farbe}90` }}
                    className="h-2 w-2 rounded-full"
                  />
                ))}
              </div>
            </button>
          )
        })}
      </div>

      {gewaehlt && gewaehlteTermine.length > 0 && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
          <p className="text-xs font-medium text-slate-500">{formatDeDate(gewaehlt)}</p>
          {gewaehlteTermine.map((f) => (
            <div key={f.id} className="flex items-center gap-2 text-sm text-slate-200">
              <span style={{ background: f.farbe }} className="h-3 w-3 rounded-full" />
              <span className="font-medium">{f.name}</span>
              <span className="flex items-center gap-1 text-xs text-slate-400">
                {f.typ === 'klausur' ? <GraduationCap size={14} /> : <FileCheck2 size={14} />}
                {f.typ === 'klausur' ? 'Klausur' : 'Projektabgabe'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
