import { useStore } from '../store/StoreContext'

export function Noten() {
  const { faecher, updateFach } = useStore()

  const mitNote = faecher.filter((f) => typeof f.erreichteNote === 'number')
  const schnitt =
    mitNote.length > 0
      ? (mitNote.reduce((a, f) => a + (f.erreichteNote || 0), 0) / mitNote.length).toFixed(2)
      : '—'

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Noten</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vergleiche deine Zielnoten mit den erreichten Ergebnissen.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
        <div className="text-xs text-slate-500">Notenschnitt (erreichte Noten)</div>
        <div className="text-3xl font-bold text-indigo-400">{schnitt}</div>
      </div>

      {faecher.length === 0 ? (
        <p className="text-sm text-slate-500">Noch keine Fächer angelegt.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left text-xs text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Fach</th>
                <th className="px-4 py-3 font-medium">Zielnote</th>
                <th className="px-4 py-3 font-medium">Erreichte Note</th>
              </tr>
            </thead>
            <tbody>
              {faecher.map((f) => (
                <tr key={f.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 font-medium text-white">
                      <span style={{ background: f.farbe }} className="h-3 w-3 rounded-full" />
                      {f.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{f.zielnote ?? '—'}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="6"
                      value={f.erreichteNote ?? ''}
                      onChange={(e) =>
                        updateFach(f.id, {
                          erreichteNote: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                      placeholder="—"
                      className="w-24 rounded-lg border border-white/10 bg-slate-950/40 px-2 py-1 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
