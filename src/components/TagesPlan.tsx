import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { tick } from '../lib/effekte'

/** Lernplan für einen einzelnen Tag: Einträge anlegen, abhaken, löschen. */
export function TagesPlan({ datum, kompakt = false }: { datum: string; kompakt?: boolean }) {
  const { plan, faecher, addPlan, togglePlan, removePlan, effekteAn } = useStore()
  const [titel, setTitel] = useState('')
  const [fachId, setFachId] = useState('')

  const items = plan.filter((p) => p.datum === datum)
  const farbeVon = (id?: string) => faecher.find((f) => f.id === id)?.farbe ?? '#64748b'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titel.trim()) return
    addPlan(datum, titel.trim(), fachId || undefined)
    setTitel('')
  }

  return (
    <div className="space-y-2">
      {items.length === 0 && !kompakt && (
        <p className="text-sm text-slate-500">Noch nichts geplant — trag unten ein, was du lernen willst.</p>
      )}

      {items.map((p) => (
        <div key={p.id} className="group flex items-center gap-2">
          <button
            onClick={() => {
              const wird = !p.erledigt
              togglePlan(p.id)
              if (wird && effekteAn) tick()
            }}
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
              p.erledigt
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-white/20 hover:border-indigo-400'
            }`}
            aria-label="Erledigt"
          >
            {p.erledigt && <Check size={14} />}
          </button>
          <span
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ background: farbeVon(p.fachId) }}
          />
          <span
            className={`flex-1 text-sm ${
              p.erledigt ? 'text-slate-500 line-through' : 'text-slate-200'
            }`}
          >
            {p.titel}
          </span>
          <button
            onClick={() => removePlan(p.id)}
            className="text-slate-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
            aria-label="Eintrag löschen"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <form onSubmit={submit} className="flex flex-wrap gap-2 pt-1">
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="Was lernen? z. B. Kapitel 3 wiederholen"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
        />
        {faecher.length > 0 && (
          <select
            value={fachId}
            onChange={(e) => setFachId(e.target.value)}
            className="rounded-lg border border-white/10 bg-slate-950/40 px-2 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
            aria-label="Fach (optional)"
          >
            <option value="">Fach…</option>
            {faecher.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
        <button
          type="submit"
          className="flex items-center rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  )
}
