import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage, uid } from '../lib/storage'
import type { Fach, Thema, LernSession, Planeintrag } from '../types'

export interface Backup {
  app: 'lern-tracker'
  version: 1
  exportiertAm: string
  faecher: Fach[]
  themen: Thema[]
  sessions: LernSession[]
  plan: Planeintrag[]
}

interface StoreValue {
  faecher: Fach[]
  themen: Thema[]
  sessions: LernSession[]

  addFach: (data: Omit<Fach, 'id'>) => void
  updateFach: (id: string, data: Partial<Fach>) => void
  removeFach: (id: string) => void

  addThema: (fachId: string, titel: string) => void
  toggleThema: (id: string) => void
  updateThema: (id: string, data: Partial<Thema>) => void
  removeThema: (id: string) => void

  addUnterpunkt: (themaId: string, titel: string) => void
  toggleUnterpunkt: (themaId: string, upId: string) => void
  removeUnterpunkt: (themaId: string, upId: string) => void

  addSession: (fachId: string, minuten: number, datum: string) => void
  removeSession: (id: string) => void

  plan: Planeintrag[]
  addPlan: (datum: string, titel: string, fachId?: string) => void
  togglePlan: (id: string) => void
  removePlan: (id: string) => void

  /** Alle Daten als Backup-Objekt (zum Herunterladen). */
  exportData: () => Backup
  /** Daten ersetzen (replace) oder zusammenführen (merge) aus einem Backup. */
  importData: (data: Partial<Backup>, modus: 'replace' | 'merge') => void

  /** Belohnungs-Effekte (Konfetti/Sound/Vibration) an/aus. */
  effekteAn: boolean
  setEffekteAn: (an: boolean) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [faecher, setFaecher] = useLocalStorage<Fach[]>('lt.faecher', [])
  const [themen, setThemen] = useLocalStorage<Thema[]>('lt.themen', [])
  const [sessions, setSessions] = useLocalStorage<LernSession[]>('lt.sessions', [])
  const [plan, setPlan] = useLocalStorage<Planeintrag[]>('lt.plan', [])
  const [effekteAn, setEffekteAnState] = useLocalStorage<boolean>('lt.effekte', true)

  const value: StoreValue = {
    faecher,
    themen,
    sessions,

    addFach: (data) => setFaecher((prev) => [...prev, { ...data, id: uid() }]),
    updateFach: (id, data) =>
      setFaecher((prev) => prev.map((f) => (f.id === id ? { ...f, ...data } : f))),
    removeFach: (id) => {
      setFaecher((prev) => prev.filter((f) => f.id !== id))
      setThemen((prev) => prev.filter((t) => t.fachId !== id))
      setSessions((prev) => prev.filter((s) => s.fachId !== id))
      // Plan-Einträge behalten, aber Fach-Zuordnung lösen
      setPlan((prev) => prev.map((p) => (p.fachId === id ? { ...p, fachId: undefined } : p)))
    },

    addThema: (fachId, titel) =>
      setThemen((prev) => [...prev, { id: uid(), fachId, titel, erledigt: false }]),
    toggleThema: (id) =>
      setThemen((prev) =>
        prev.map((t) => (t.id === id ? { ...t, erledigt: !t.erledigt } : t)),
      ),
    updateThema: (id, data) =>
      setThemen((prev) => prev.map((t) => (t.id === id ? { ...t, ...data } : t))),
    removeThema: (id) => setThemen((prev) => prev.filter((t) => t.id !== id)),

    addUnterpunkt: (themaId, titel) =>
      setThemen((prev) =>
        prev.map((t) =>
          t.id === themaId
            ? { ...t, unterpunkte: [...(t.unterpunkte ?? []), { id: uid(), titel, erledigt: false }] }
            : t,
        ),
      ),
    toggleUnterpunkt: (themaId, upId) =>
      setThemen((prev) =>
        prev.map((t) =>
          t.id === themaId
            ? {
                ...t,
                unterpunkte: (t.unterpunkte ?? []).map((u) =>
                  u.id === upId ? { ...u, erledigt: !u.erledigt } : u,
                ),
              }
            : t,
        ),
      ),
    removeUnterpunkt: (themaId, upId) =>
      setThemen((prev) =>
        prev.map((t) =>
          t.id === themaId
            ? { ...t, unterpunkte: (t.unterpunkte ?? []).filter((u) => u.id !== upId) }
            : t,
        ),
      ),

    addSession: (fachId, minuten, datum) =>
      setSessions((prev) => [...prev, { id: uid(), fachId, minuten, datum }]),
    removeSession: (id) => setSessions((prev) => prev.filter((s) => s.id !== id)),

    plan,
    addPlan: (datum, titel, fachId) =>
      setPlan((prev) => [...prev, { id: uid(), datum, titel, fachId, erledigt: false }]),
    togglePlan: (id) =>
      setPlan((prev) => prev.map((p) => (p.id === id ? { ...p, erledigt: !p.erledigt } : p))),
    removePlan: (id) => setPlan((prev) => prev.filter((p) => p.id !== id)),

    exportData: () => ({
      app: 'lern-tracker',
      version: 1,
      exportiertAm: new Date().toISOString(),
      faecher,
      themen,
      sessions,
      plan,
    }),

    importData: (data, modus) => {
      const nf = Array.isArray(data.faecher) ? data.faecher : []
      const nt = Array.isArray(data.themen) ? data.themen : []
      const ns = Array.isArray(data.sessions) ? data.sessions : []
      const np = Array.isArray(data.plan) ? data.plan : []

      if (modus === 'replace') {
        setFaecher(nf)
        setThemen(nt)
        setSessions(ns)
        setPlan(np)
        return
      }
      // merge: nur Einträge mit neuer ID anhängen (keine Duplikate)
      const anhaengen = <T extends { id: string }>(prev: T[], neu: T[]): T[] => {
        const ids = new Set(prev.map((x) => x.id))
        return [...prev, ...neu.filter((x) => !ids.has(x.id))]
      }
      setFaecher((prev) => anhaengen(prev, nf))
      setThemen((prev) => anhaengen(prev, nt))
      setSessions((prev) => anhaengen(prev, ns))
      setPlan((prev) => anhaengen(prev, np))
    },

    effekteAn,
    setEffekteAn: (an) => setEffekteAnState(an),
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden')
  return ctx
}
