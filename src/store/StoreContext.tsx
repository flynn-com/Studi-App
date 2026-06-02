import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage, uid } from '../lib/storage'
import type { Fach, Thema, LernSession } from '../types'

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
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore muss innerhalb von StoreProvider verwendet werden')
  return ctx
}
