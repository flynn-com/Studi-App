import { useEffect, useState } from 'react'
import { Trophy } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { useLocalStorage } from '../lib/storage'
import { computeStats, freigeschaltete } from '../lib/erfolge'
import { feiern } from '../lib/effekte'

/**
 * Überwacht freigeschaltete Abzeichen app-weit. Schaltet ein neues frei,
 * gibt es Konfetti/Sound (sofern Effekte an) und eine kurze Einblendung.
 */
export function ErfolgWatcher() {
  const { faecher, themen, sessions, effekteAn } = useStore()
  const [gesehen, setGesehen] = useLocalStorage<string[] | null>('lt.erfolge.gesehen', null)
  const [toast, setToast] = useState<{ titel: string; mehr: number } | null>(null)

  useEffect(() => {
    const aktuell = freigeschaltete(computeStats({ faecher, themen, sessions })).map((e) => ({
      id: e.id,
      titel: e.titel,
    }))
    const ids = aktuell.map((a) => a.id)

    // Erstmalige Initialisierung: bestehende Erfolge ohne Feier merken
    if (gesehen === null) {
      setGesehen(ids)
      return
    }

    const neu = aktuell.filter((a) => !gesehen.includes(a.id))
    if (neu.length > 0) {
      if (effekteAn) feiern()
      setToast({ titel: neu[0].titel, mehr: neu.length - 1 })
      setGesehen(ids)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faecher, themen, sessions])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 4200)
    return () => window.clearTimeout(id)
  }, [toast])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 [padding-top:calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center gap-3 rounded-2xl border border-amber-400/40 bg-slate-900/90 px-4 py-3 shadow-xl shadow-black/40 backdrop-blur-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white">
          <Trophy size={18} />
        </div>
        <div>
          <div className="text-xs font-medium text-amber-300">Abzeichen freigeschaltet!</div>
          <div className="text-sm font-semibold text-white">
            {toast.titel}
            {toast.mehr > 0 && <span className="text-slate-400"> +{toast.mehr} weitere</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
