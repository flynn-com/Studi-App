import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'

const WOCHEN = 17
const LEER = 'rgba(255,255,255,0.06)'
const STUFEN = ['#14532d', '#166534', '#16a34a', '#22c55e', '#4ade80']

function stufe(min: number): string {
  if (min <= 0) return LEER
  if (min < 15) return STUFEN[0]
  if (min < 40) return STUFEN[1]
  if (min < 75) return STUFEN[2]
  if (min < 120) return STUFEN[3]
  return STUFEN[4]
}

function isoLokal(d: Date): string {
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export function Heatmap() {
  const { sessions } = useStore()

  const { wochen, monatsLabels, heuteIso } = useMemo(() => {
    const minProTag = new Map<string, number>()
    for (const s of sessions) minProTag.set(s.datum, (minProTag.get(s.datum) ?? 0) + s.minuten)

    const heute = new Date()
    heute.setHours(0, 0, 0, 0)
    const start = new Date(heute)
    const tag = (start.getDay() + 6) % 7 // Mo=0
    start.setDate(start.getDate() - tag - (WOCHEN - 1) * 7)

    const wochen: { iso: string; min: number; zukunft: boolean }[][] = []
    const monatsLabels: (string | null)[] = []
    const heuteIso = isoLokal(heute)

    for (let w = 0; w < WOCHEN; w++) {
      const tage: { iso: string; min: number; zukunft: boolean }[] = []
      let labelGesetzt = false
      for (let d = 0; d < 7; d++) {
        const datum = new Date(start)
        datum.setDate(start.getDate() + w * 7 + d)
        const iso = isoLokal(datum)
        tage.push({ iso, min: minProTag.get(iso) ?? 0, zukunft: iso > heuteIso })
        // Monatslabel oben, wenn in dieser Woche ein Monatsanfang liegt
        if (!labelGesetzt && datum.getDate() <= 7) {
          monatsLabels[w] = MONATE[datum.getMonth()]
          labelGesetzt = true
        }
      }
      if (monatsLabels[w] === undefined) monatsLabels[w] = null
      wochen.push(tage)
    }
    return { wochen, monatsLabels, heuteIso }
  }, [sessions])

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
      <h2 className="mb-3 text-sm font-semibold text-slate-300">Deine Lerntage</h2>

      <div className="scroll-touch overflow-x-auto pb-1">
        <div className="inline-block">
          {/* Monatslabels */}
          <div className="mb-1 flex gap-1">
            {monatsLabels.map((m, i) => (
              <div key={i} className="w-3 text-[9px] leading-none text-slate-500">
                {m ?? ''}
              </div>
            ))}
          </div>
          {/* Raster */}
          <div className="flex gap-1">
            {wochen.map((woche, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {woche.map((d) => (
                  <div
                    key={d.iso}
                    title={`${new Date(d.iso + 'T00:00:00').toLocaleDateString('de-DE')}: ${d.min} min`}
                    className={`h-3 w-3 rounded-[3px] ${d.iso === heuteIso ? 'ring-1 ring-white/50' : ''}`}
                    style={{ background: d.zukunft ? 'transparent' : stufe(d.min) }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legende */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <span>weniger</span>
        <span className="h-3 w-3 rounded-[3px]" style={{ background: LEER }} />
        {STUFEN.map((c) => (
          <span key={c} className="h-3 w-3 rounded-[3px]" style={{ background: c }} />
        ))}
        <span>mehr</span>
      </div>
    </div>
  )
}
