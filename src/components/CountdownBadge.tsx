import { countdownText, daysUntil } from '../lib/datum'

/** Farbcodiertes Badge: rot <3, orange <7, gelb <14, grün sonst. */
export function CountdownBadge({ termin }: { termin: string }) {
  const d = daysUntil(termin)
  let cls = 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30'
  if (d < 0) cls = 'bg-slate-500/15 text-slate-400 ring-slate-500/30'
  else if (d < 3) cls = 'bg-red-500/15 text-red-300 ring-red-500/30'
  else if (d < 7) cls = 'bg-orange-500/15 text-orange-300 ring-orange-500/30'
  else if (d < 14) cls = 'bg-amber-500/15 text-amber-300 ring-amber-500/30'

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {countdownText(termin)}
    </span>
  )
}
