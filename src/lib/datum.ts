/** Anzahl Tage von heute bis zum Ziel-Datum (negativ = in der Vergangenheit). */
export function daysUntil(iso: string): number {
  if (!iso) return Infinity
  const heute = new Date()
  heute.setHours(0, 0, 0, 0)
  const ziel = new Date(iso + 'T00:00:00')
  ziel.setHours(0, 0, 0, 0)
  const ms = ziel.getTime() - heute.getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Datum auf Deutsch, z. B. "2. Juni 2026". */
export function formatDeDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso + 'T00:00:00').toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Kurztext für den Countdown, z. B. "noch 5 Tage", "heute", "vor 2 Tagen". */
export function countdownText(iso: string): string {
  const d = daysUntil(iso)
  if (!isFinite(d)) return 'kein Termin'
  if (d === 0) return 'heute'
  if (d === 1) return 'morgen'
  if (d === -1) return 'gestern'
  if (d < 0) return `vor ${Math.abs(d)} Tagen`
  return `noch ${d} Tage`
}

/** ISO-Datum (yyyy-mm-dd) von heute. */
export function heuteIso(): string {
  const d = new Date()
  const off = d.getTimezoneOffset()
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10)
}

/** Montag der Woche, in der das gegebene Datum liegt (ISO). */
export function montagDerWoche(d = new Date()): string {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const tag = (x.getDay() + 6) % 7 // Mo=0 … So=6
  x.setDate(x.getDate() - tag)
  const off = x.getTimezoneOffset()
  return new Date(x.getTime() - off * 60000).toISOString().slice(0, 10)
}
