import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'

/** Themen/Kapitel eines Fachs: anlegen, abhaken, löschen. */
export function ThemaListe({ fachId }: { fachId: string }) {
  const { themen, addThema, toggleThema, removeThema } = useStore()
  const [titel, setTitel] = useState('')
  const eigene = themen.filter((t) => t.fachId === fachId)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titel.trim()) return
    addThema(fachId, titel.trim())
    setTitel('')
  }

  return (
    <div className="space-y-2">
      {eigene.length === 0 && (
        <p className="text-sm text-slate-500">Noch keine Themen — füge unten dein erstes hinzu.</p>
      )}
      {eigene.map((t) => (
        <div key={t.id} className="group flex items-center gap-2">
          <button
            onClick={() => toggleThema(t.id)}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              t.erledigt
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-white/20 hover:border-indigo-400'
            }`}
          >
            {t.erledigt && <Check size={14} />}
          </button>
          <span
            className={`flex-1 text-sm ${
              t.erledigt ? 'text-slate-500 line-through' : 'text-slate-200'
            }`}
          >
            {t.titel}
          </span>
          <button
            onClick={() => removeThema(t.id)}
            className="text-slate-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            aria-label="Thema löschen"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <form onSubmit={submit} className="flex gap-2 pt-1">
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="Neues Thema / Kapitel…"
          className="flex-1 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  )
}
