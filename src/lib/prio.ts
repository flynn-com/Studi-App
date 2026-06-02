import type { Fach, Thema } from '../types'
import { daysUntil } from './datum'

/** Fortschritt eines Fachs in Prozent (0–100) auf Basis erledigter Themen. */
export function fortschritt(fachId: string, themen: Thema[]): number {
  const eigene = themen.filter((t) => t.fachId === fachId)
  if (eigene.length === 0) return 0
  const fertig = eigene.filter((t) => t.erledigt).length
  return Math.round((fertig / eigene.length) * 100)
}

/**
 * Prioritäts-Score: höher = dringender.
 * Kombiniert Termin-Nähe, Gewichtung und offenen Lernstoff.
 * Vergangene Termine bekommen Score 0 (erledigt/abgelaufen, raus aus dem Fokus).
 */
export function prioScore(fach: Fach, themen: Thema[]): number {
  const tage = daysUntil(fach.termin)
  if (!isFinite(tage) || tage < 0) return 0

  // Dringlichkeit: je näher der Termin, desto höher (max bei 0 Tagen).
  const naehe = Math.max(0, 60 - tage) // 0 Tage => 60, >=60 Tage => 0
  // Offener Stoff: 0 % erledigt => voller Bonus.
  const offen = (100 - fortschritt(fach.id, themen)) / 100 // 0..1
  const gewicht = fach.gewichtung || 1 // 1..5

  return Math.round((naehe + offen * 25) * gewicht)
}

/** Offene Fächer (Termin heute oder in der Zukunft) nach Priorität sortiert. */
export function nachPrioritaet(faecher: Fach[], themen: Thema[]): Fach[] {
  return [...faecher]
    .filter((f) => daysUntil(f.termin) >= 0)
    .sort((a, b) => prioScore(b, themen) - prioScore(a, themen))
}
