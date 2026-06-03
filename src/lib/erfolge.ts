import type { Fach, Thema, LernSession } from '../types'

export interface StatsCtx {
  faecher: Fach[]
  themen: Thema[]
  sessions: LernSession[]
}

export interface Stats {
  anzahlFaecher: number
  themenGesamt: number
  themenErledigt: number
  unterpunkteErledigt: number
  sessions: number
  minutenGesamt: number
  faecherGemeistert: number
  notenAnzahl: number
  besteNote: number | null
  lerntage: number
}

/** Leitet alle Kennzahlen aus den Rohdaten ab. */
export function computeStats({ faecher, themen, sessions }: StatsCtx): Stats {
  const themenErledigt = themen.filter((t) => t.erledigt).length
  const unterpunkteErledigt = themen.reduce(
    (a, t) => a + (t.unterpunkte?.filter((u) => u.erledigt).length ?? 0),
    0,
  )
  const faecherGemeistert = faecher.filter((f) => {
    const eigene = themen.filter((t) => t.fachId === f.id)
    return eigene.length > 0 && eigene.every((t) => t.erledigt)
  }).length
  const noten = faecher
    .map((f) => f.erreichteNote)
    .filter((n): n is number => typeof n === 'number')
  const lerntage = new Set(sessions.map((s) => s.datum)).size

  return {
    anzahlFaecher: faecher.length,
    themenGesamt: themen.length,
    themenErledigt,
    unterpunkteErledigt,
    sessions: sessions.length,
    minutenGesamt: sessions.reduce((a, s) => a + s.minuten, 0),
    faecherGemeistert,
    notenAnzahl: noten.length,
    besteNote: noten.length ? Math.min(...noten) : null,
    lerntage,
  }
}

export type IconKey =
  | 'BookOpen'
  | 'Layers'
  | 'CheckCircle2'
  | 'ListChecks'
  | 'Timer'
  | 'Clock'
  | 'Flame'
  | 'Crown'
  | 'GraduationCap'
  | 'Star'
  | 'CalendarCheck'
  | 'Trophy'

export interface Erfolg {
  id: string
  titel: string
  beschreibung: string
  icon: IconKey
  xp: number
  ziel: number
  einheit: 'anzahl' | 'minuten'
  wert: (s: Stats) => number
}

export const ERFOLGE: Erfolg[] = [
  { id: 'erstes-fach', titel: 'Startschuss', beschreibung: 'Lege dein erstes Fach an', icon: 'BookOpen', xp: 25, ziel: 1, einheit: 'anzahl', wert: (s) => s.anzahlFaecher },
  { id: 'drei-faecher', titel: 'Gut organisiert', beschreibung: 'Lege 3 Fächer an', icon: 'Layers', xp: 40, ziel: 3, einheit: 'anzahl', wert: (s) => s.anzahlFaecher },
  { id: 'erstes-thema', titel: 'Abgehakt', beschreibung: 'Erledige dein erstes Thema', icon: 'CheckCircle2', xp: 25, ziel: 1, einheit: 'anzahl', wert: (s) => s.themenErledigt },
  { id: 'zehn-themen', titel: 'Fleißbiene', beschreibung: 'Erledige 10 Themen', icon: 'CheckCircle2', xp: 60, ziel: 10, einheit: 'anzahl', wert: (s) => s.themenErledigt },
  { id: 'fuenfundzwanzig-themen', titel: 'Lernmaschine', beschreibung: 'Erledige 25 Themen', icon: 'ListChecks', xp: 110, ziel: 25, einheit: 'anzahl', wert: (s) => s.themenErledigt },
  { id: 'erste-session', titel: 'Loslegen', beschreibung: 'Starte deine erste Lerneinheit', icon: 'Timer', xp: 25, ziel: 1, einheit: 'anzahl', wert: (s) => s.sessions },
  { id: 'fuenf-stunden', titel: 'Durchhalter', beschreibung: 'Lerne 5 Stunden insgesamt', icon: 'Clock', xp: 80, ziel: 300, einheit: 'minuten', wert: (s) => s.minutenGesamt },
  { id: 'zwanzig-stunden', titel: 'Marathon', beschreibung: 'Lerne 20 Stunden insgesamt', icon: 'Flame', xp: 160, ziel: 1200, einheit: 'minuten', wert: (s) => s.minutenGesamt },
  { id: 'fach-gemeistert', titel: 'Meister', beschreibung: 'Schließe alle Themen eines Fachs ab', icon: 'Crown', xp: 120, ziel: 1, einheit: 'anzahl', wert: (s) => s.faecherGemeistert },
  { id: 'erste-note', titel: 'Notenbuch', beschreibung: 'Trage deine erste erreichte Note ein', icon: 'GraduationCap', xp: 40, ziel: 1, einheit: 'anzahl', wert: (s) => s.notenAnzahl },
  { id: 'bestnote', titel: 'Glanzleistung', beschreibung: 'Erreiche eine Note von 1,5 oder besser', icon: 'Star', xp: 100, ziel: 1, einheit: 'anzahl', wert: (s) => (s.besteNote !== null && s.besteNote <= 1.5 ? 1 : 0) },
  { id: 'sieben-lerntage', titel: 'Eine Woche dabei', beschreibung: 'Lerne an 7 verschiedenen Tagen', icon: 'CalendarCheck', xp: 90, ziel: 7, einheit: 'anzahl', wert: (s) => s.lerntage },
]

export function istFreigeschaltet(e: Erfolg, s: Stats): boolean {
  return e.wert(s) >= e.ziel
}

export function freigeschaltete(s: Stats): Erfolg[] {
  return ERFOLGE.filter((e) => istFreigeschaltet(e, s))
}

/** Gesamt-XP aus Aktivität + freigeschalteten Abzeichen. */
export function gesamtXp(s: Stats): number {
  const aktivitaet =
    s.themenErledigt * 10 +
    s.unterpunkteErledigt * 4 +
    s.sessions * 5 +
    Math.floor(s.minutenGesamt / 10) * 2
  const badges = freigeschaltete(s).reduce((a, e) => a + e.xp, 0)
  return aktivitaet + badges
}

export interface LevelInfo {
  level: number
  imLevel: number
  proLevel: number
  fortschritt: number // 0..1
  xpGesamt: number
}

const XP_PRO_LEVEL = 100

export function levelInfo(xp: number): LevelInfo {
  const level = Math.floor(xp / XP_PRO_LEVEL) + 1
  const imLevel = xp % XP_PRO_LEVEL
  return { level, imLevel, proLevel: XP_PRO_LEVEL, fortschritt: imLevel / XP_PRO_LEVEL, xpGesamt: xp }
}
