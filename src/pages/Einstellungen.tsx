import { useRef, useState } from 'react'
import { Download, Upload, Database, CheckCircle2, AlertTriangle } from 'lucide-react'
import { useStore, type Backup } from '../store/StoreContext'

export function Einstellungen() {
  const { faecher, themen, sessions, exportData, importData } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [meldung, setMeldung] = useState<{ ok: boolean; text: string } | null>(null)

  const exportieren = () => {
    const daten = exportData()
    const name = `studi-app-backup-${daten.exportiertAm.slice(0, 10)}.json`
    const blob = new Blob([JSON.stringify(daten, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    setMeldung({ ok: true, text: `Backup „${name}" wurde heruntergeladen.` })
  }

  const dateiGewaehlt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // erlaubt erneutes Wählen derselben Datei
    if (!file) return
    try {
      const text = await file.text()
      const data = JSON.parse(text) as Partial<Backup>
      if (data.app !== 'lern-tracker' || !Array.isArray(data.faecher)) {
        setMeldung({ ok: false, text: 'Das ist keine gültige Lern-Tracker-Backup-Datei.' })
        return
      }
      const anzahl = data.faecher.length
      const ersetzen = confirm(
        `Backup mit ${anzahl} Fächern gefunden.\n\n` +
          'OK = vorhandene Daten ERSETZEN\n' +
          'Abbrechen = stattdessen ZUSAMMENFÜHREN (nur Neues hinzufügen)',
      )
      importData(data, ersetzen ? 'replace' : 'merge')
      setMeldung({
        ok: true,
        text: ersetzen
          ? 'Daten wurden durch das Backup ersetzt.'
          : 'Backup wurde mit deinen Daten zusammengeführt.',
      })
    } catch {
      setMeldung({ ok: false, text: 'Datei konnte nicht gelesen werden (kein gültiges JSON).' })
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Einstellungen</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sichere deine Daten oder übertrage sie auf ein anderes Gerät.
        </p>
      </header>

      {/* Aktueller Bestand */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-300">
          <Database size={16} /> Gespeicherte Daten (auf diesem Gerät)
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          {[
            ['Fächer', faecher.length],
            ['Themen', themen.length],
            ['Lern-Einträge', sessions.length],
          ].map(([label, n]) => (
            <div key={label} className="rounded-xl bg-white/5 py-3">
              <div className="text-2xl font-bold text-white">{n}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
        <h2 className="text-sm font-semibold text-slate-200">Daten exportieren (Backup)</h2>
        <p className="mt-1 text-sm text-slate-400">
          Lädt alle Fächer, Themen und Lernzeiten als eine JSON-Datei herunter.
        </p>
        <button
          onClick={exportieren}
          className="mt-3 flex items-center gap-2 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:from-indigo-400 hover:to-violet-500"
        >
          <Download size={18} /> Backup herunterladen
        </button>
      </div>

      {/* Import */}
      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur">
        <h2 className="text-sm font-semibold text-slate-200">Daten importieren</h2>
        <p className="mt-1 text-sm text-slate-400">
          Lade eine zuvor exportierte Backup-Datei. Du wirst gefragt, ob du die vorhandenen Daten
          <strong className="text-slate-300"> ersetzen</strong> oder
          <strong className="text-slate-300"> zusammenführen</strong> möchtest.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          onChange={dateiGewaehlt}
          className="hidden"
        />
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10"
        >
          <Upload size={18} /> Backup-Datei wählen
        </button>
      </div>

      {meldung && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-3 text-sm ${
            meldung.ok
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {meldung.ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
          {meldung.text}
        </div>
      )}
    </div>
  )
}
