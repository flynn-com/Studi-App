export function Fortschrittsbalken({
  prozent,
  farbe = '#6366f1',
}: {
  prozent: number
  farbe?: string
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, Math.max(0, prozent))}%`,
            background: farbe,
            boxShadow: `0 0 12px ${farbe}80`,
          }}
        />
      </div>
      <span className="w-9 text-right text-xs font-medium text-slate-400">{prozent}%</span>
    </div>
  )
}
