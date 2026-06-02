import { useState } from 'react'
import { FARBEN, type Fach, type FachTyp } from '../types'

interface Props {
  initial?: Fach
  onSubmit: (data: Omit<Fach, 'id'>) => void
  onCancel: () => void
}

const inputCls =
  'w-full rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20'
const labelCls = 'mb-1 block text-sm font-medium text-slate-300'

export function FachForm({ initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [typ, setTyp] = useState<FachTyp>(initial?.typ ?? 'klausur')
  const [termin, setTermin] = useState(initial?.termin ?? '')
  const [farbe, setFarbe] = useState(initial?.farbe ?? FARBEN[0])
  const [gewichtung, setGewichtung] = useState(initial?.gewichtung ?? 3)
  const [zielnote, setZielnote] = useState(initial?.zielnote?.toString() ?? '')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !termin) return
    const data: Omit<Fach, 'id'> = {
      name: name.trim(),
      typ,
      termin,
      farbe,
      gewichtung,
      zielnote: zielnote ? Number(zielnote) : undefined,
      erreichteNote: initial?.erreichteNote,
      notizen: initial?.notizen,
    }
    onSubmit(data)
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur"
    >
      <div>
        <label className={labelCls}>Fachname</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Mathematik II"
          className={inputCls}
        />
      </div>

      <div>
        <label className={labelCls}>Art</label>
        <div className="flex gap-2">
          {(['klausur', 'projektabgabe'] as FachTyp[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTyp(t)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                typ === t
                  ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
                  : 'border-white/10 text-slate-400 hover:bg-white/5'
              }`}
            >
              {t === 'klausur' ? 'Klausur' : 'Projektabgabe'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>
            {typ === 'klausur' ? 'Klausurtermin' : 'Abgabetermin'}
          </label>
          <input
            type="date"
            value={termin}
            onChange={(e) => setTermin(e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Zielnote (optional)</label>
          <input
            type="number"
            step="0.1"
            min="1"
            max="6"
            value={zielnote}
            onChange={(e) => setZielnote(e.target.value)}
            placeholder="z. B. 2.0"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Gewichtung / Wichtigkeit: {gewichtung}</label>
        <input
          type="range"
          min="1"
          max="5"
          value={gewichtung}
          onChange={(e) => setGewichtung(Number(e.target.value))}
          className="w-full accent-indigo-500"
        />
      </div>

      <div>
        <label className={labelCls}>Farbe</label>
        <div className="flex flex-wrap gap-2">
          {FARBEN.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFarbe(c)}
              style={{ background: c }}
              className={`h-7 w-7 rounded-full transition-transform ${
                farbe === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
              }`}
              aria-label={`Farbe ${c}`}
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-200"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
        >
          Speichern
        </button>
      </div>
    </form>
  )
}
