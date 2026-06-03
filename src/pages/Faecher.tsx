import { useState } from 'react'
import { FileCheck2, GraduationCap, Pencil, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/StoreContext'
import { fortschritt } from '../lib/prio'
import { FachForm } from '../components/FachForm'
import { ThemaListe } from '../components/ThemaListe'
import { Fortschrittsbalken } from '../components/Fortschrittsbalken'
import { CountdownBadge } from '../components/CountdownBadge'
import { formatDeDate } from '../lib/datum'
import type { Fach } from '../types'

export function Faecher() {
  const { faecher, themen, addFach, updateFach, removeFach } = useStore()
  const [formOffen, setFormOffen] = useState(false)
  const [bearbeite, setBearbeite] = useState<Fach | null>(null)
  const [offen, setOffen] = useState<string | null>(null)

  const schliessen = () => {
    setFormOffen(false)
    setBearbeite(null)
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Fächer</h1>
          <p className="mt-1 text-sm text-slate-400">
            Lege deine Fächer mit Klausur- oder Abgabetermin an.
          </p>
        </div>
        {!formOffen && !bearbeite && (
          <button
            onClick={() => setFormOffen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
          >
            <Plus size={18} />
            Fach hinzufügen
          </button>
        )}
      </header>

      {(formOffen || bearbeite) && (
        <FachForm
          initial={bearbeite ?? undefined}
          onCancel={schliessen}
          onSubmit={(data) => {
            if (bearbeite) updateFach(bearbeite.id, data)
            else addFach(data)
            schliessen()
          }}
        />
      )}

      {faecher.length === 0 && !formOffen && (
        <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/40 p-10 text-center text-slate-400">
          Noch keine Fächer.
        </div>
      )}

      <div className="space-y-3">
        {faecher.map((f) => {
          const prozent = fortschritt(f.id, themen)
          const istOffen = offen === f.id
          return (
            <div
              key={f.id}
              className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur"
              style={{ borderLeft: `4px solid ${f.farbe}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <button onClick={() => setOffen(istOffen ? null : f.id)} className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{f.name}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      {f.typ === 'klausur' ? <GraduationCap size={14} /> : <FileCheck2 size={14} />}
                      {f.typ === 'klausur' ? 'Klausur' : 'Projektabgabe'}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    {formatDeDate(f.termin)}
                    <CountdownBadge termin={f.termin} />
                  </div>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setBearbeite(f)
                      setFormOffen(false)
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-slate-200"
                    aria-label="Bearbeiten"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`„${f.name}" wirklich löschen?`)) removeFach(f.id)
                    }}
                    className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                    aria-label="Löschen"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="px-4 pb-3">
                <Fortschrittsbalken prozent={prozent} farbe={f.farbe} />
              </div>

              {istOffen && (
                <div className="border-t border-white/10 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-300">Themen & Aufgaben</h3>
                  <ThemaListe fachId={f.id} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
