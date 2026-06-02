import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage, uid } from '../lib/storage'
import type { Fach, Thema, LernSession } from '../types'

export interface Backup {
  app: 'lern-tracker'
  version: 1
  exportiertAm: string
  faecher: Fach[]
  themen: Thema[]
  sessions: LernSession[]
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
  removeThema: (id: string) => void

  addSession: (fachId: string, minuten: number, datum: string) => void
  removeSession: (id: string) => void

  /** Alle Daten als Backup-Objekt (zum Herunterladen). */
  exportData: () => Backup
  /** Daten ersetzen (replace) oder zusammenführen (merge) aus einem Backup. */
  importData: (data: Partial<Backup>, modus: 'replace' | 'merge') => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [faecher, setFaecher] = useLocalStorage<Fach[]>('lt.faecher', [])
  const [themen, setThemen] = useLocalStorage<Thema[]>('lt.themen', [])
  const [sessions, setSessions] = useLocalStorage<LernSession[]>('lt.sessions', [])

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
    },

    addThema: (fachId, titel) =>
      setThemen((prev) => [...prev, { id: uid(), fachId, titel, erledigt: false }]),
    toggleThema: (id) =>
      setThemen((prev) =>
        prev.map((t) => (t.id === id ? { ...t, erledigt: !t.erledigt } : t)),
      ),
    removeThema: (id) => setThemen((prev) => prev.filter((t) => t.id !== id)),

    addSession: (fachId, minuten, datum) =>
      setSessions((prev) => [...prev, { id: uid(), fachId, minuten, datum }]),
    removeSession: (id) => setSessions((prev) => prev.filter((s) => s.id !== id)),

    exportData: () => ({
      app: 'lern-tracker',
      version: 1,
      exportiertAm: new Date().toISOString(),
      faecher,
      themen,
      sessions,
    }),

    importData: (data, modus) => {
      const nf = Array.isArray(data.faecher) ? data.faecher : []
      const nt = Array.isArray(data.themen) ? data.themen : []
      const ns = Array.isArray(data.sessions) ? data.sessions : []

      if (modus === 'replace') {
        setFaecher(nf)
        setThemen(nt)
        setSessions(ns)
        return
      }
      // merge: nur Einträge mit neuer ID anhängen (keine Duplikate)
      setFaecher((prev) => {
        const ids = new Set(prev.map((x) => x.id))
        return [...prev, ...nf.filter((x) => !ids.has(x.id))]
      })
      setThemen((prev) => {
        const ids = new Set(prev.map((x) => x.id))
        return [...prev, ...nt.filter((x) => !ids.has(x.id))]
      })
      setSessions((prev) => {
        const ids = new Set(prev.map((x) => x.id))
        return [...prev, ...ns.filter((x) => !ids.has(x.id))]
      })
    },
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden')
  return ctx
}
