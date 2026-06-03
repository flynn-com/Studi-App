import { useState } from 'react'
import { Check, ChevronDown, ChevronRight, ListChecks, Plus, StickyNote, X } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { feiern, tick } from '../lib/effekte'
import type { Thema } from '../types'

/** Themen/Aufgaben eines Fachs: anlegen, abhaken, mit Details & Unterpunkten. */
export function ThemaListe({ fachId }: { fachId: string }) {
  const { themen, addThema } = useStore()
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
        <ThemaItem key={t.id} thema={t} />
      ))}

      <form onSubmit={submit} className="flex gap-2 pt-1">
        <input
          value={titel}
          onChange={(e) => setTitel(e.target.value)}
          placeholder="Neues Thema / Aufgabe…"
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

function ThemaItem({ thema }: { thema: Thema }) {
  const {
    toggleThema,
    updateThema,
    removeThema,
    addUnterpunkt,
    toggleUnterpunkt,
    removeUnterpunkt,
    effekteAn,
  } = useStore()
  const [offen, setOffen] = useState(false)
  const [upTitel, setUpTitel] = useState('')

  const ups = thema.unterpunkte ?? []
  const upFertig = ups.filter((u) => u.erledigt).length
  const hatNotiz = !!thema.notiz?.trim()

  const upSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!upTitel.trim()) return
    addUnterpunkt(thema.id, upTitel.trim())
    setUpTitel('')
  }

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02]">
      {/* Kopfzeile */}
      <div className="group flex items-center gap-2 px-2 py-1.5">
        <button
          onClick={() => {
            const wirdErledigt = !thema.erledigt
            toggleThema(thema.id)
            if (wirdErledigt && effekteAn) feiern()
          }}
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
            thema.erledigt
              ? 'border-emerald-500 bg-emerald-500 text-white'
              : 'border-white/20 hover:border-indigo-400'
          }`}
          aria-label="Thema abhaken"
        >
          {thema.erledigt && <Check size={14} />}
        </button>

        <button
          onClick={() => setOffen((o) => !o)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span
            className={`flex-1 text-sm ${
              thema.erledigt ? 'text-slate-500 line-through' : 'text-slate-200'
            }`}
          >
            {thema.titel}
          </span>
          {/* Meta-Hinweise */}
          {ups.length > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-400">
              <ListChecks size={12} />
              {upFertig}/{ups.length}
            </span>
          )}
          {hatNotiz && <StickyNote size={13} className="text-slate-500" />}
          {offen ? (
            <ChevronDown size={16} className="text-slate-500" />
          ) : (
            <ChevronRight size={16} className="text-slate-500" />
          )}
        </button>

        <button
          onClick={() => removeThema(thema.id)}
          className="text-slate-600 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
          aria-label="Thema löschen"
        >
          <X size={16} />
        </button>
      </div>

      {/* Detailbereich */}
      {offen && (
        <div className="space-y-3 border-t border-white/10 px-3 py-3">
          {/* Titel bearbeiten */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Titel
            </label>
            <input
              value={thema.titel}
              onChange={(e) => updateThema(thema.id, { titel: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Notizen */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Details / Notizen
            </label>
            <textarea
              value={thema.notiz ?? ''}
              onChange={(e) => updateThema(thema.id, { notiz: e.target.value })}
              rows={3}
              placeholder="Was gehört zu dieser Aufgabe? Inhalte, Quellen, To-dos…"
              className="w-full resize-y rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Unterpunkte */}
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Unterpunkte
            </label>
            <div className="space-y-1.5">
              {ups.map((u) => (
                <div key={u.id} className="group/up flex items-center gap-2">
                  <button
                    onClick={() => {
                      const wird = !u.erledigt
                      toggleUnterpunkt(thema.id, u.id)
                      if (wird && effekteAn) tick()
                    }}
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      u.erledigt
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : 'border-white/20 hover:border-indigo-400'
                    }`}
                    aria-label="Unterpunkt abhaken"
                  >
                    {u.erledigt && <Check size={12} />}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      u.erledigt ? 'text-slate-500 line-through' : 'text-slate-300'
                    }`}
                  >
                    {u.titel}
                  </span>
                  <button
                    onClick={() => removeUnterpunkt(thema.id, u.id)}
                    className="text-slate-600 opacity-0 transition-opacity hover:text-red-400 group-hover/up:opacity-100"
                    aria-label="Unterpunkt löschen"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={upSubmit} className="mt-2 flex gap-2">
              <input
                value={upTitel}
                onChange={(e) => setUpTitel(e.target.value)}
                placeholder="Unterpunkt hinzufügen…"
                className="flex-1 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-1.5 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="submit"
                className="flex items-center rounded-lg bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10"
              >
                <Plus size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
