export type FachTyp = 'klausur' | 'projektabgabe'

export interface Fach {
  id: string
  name: string
  typ: FachTyp
  termin: string // ISO-Datum (yyyy-mm-dd): Klausur- bzw. Abgabetermin
  farbe: string // Hex-Farbe zur Wiedererkennung
  gewichtung: number // 1–5, fließt in den Prioritäts-Score ein
  zielnote?: number // geplante Note
  erreichteNote?: number // tatsächliche Note (nach Abschluss)
  notizen?: string
}

export interface Unterpunkt {
  id: string
  titel: string
  erledigt: boolean
}

export interface Thema {
  id: string
  fachId: string
  titel: string
  erledigt: boolean
  notiz?: string // Details / Notizen zum Thema (mehrzeilig)
  unterpunkte?: Unterpunkt[] // Checkliste innerhalb des Themas
}

export interface LernSession {
  id: string
  fachId: string
  datum: string // ISO-Datum
  minuten: number
}

export const FARBEN = [
  '#6366f1', // indigo
  '#0ea5e9', // sky
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#8b5cf6', // violet
  '#14b8a6', // teal
]
