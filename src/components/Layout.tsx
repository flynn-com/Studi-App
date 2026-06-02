import { NavLink, Outlet } from 'react-router-dom'
import { CalendarDays, GraduationCap, LayoutDashboard, Timer, BookOpen } from 'lucide-react'

const links = [
  { to: '/', label: 'Dashboard', short: 'Start', icon: LayoutDashboard, end: true },
  { to: '/faecher', label: 'Fächer', short: 'Fächer', icon: BookOpen, end: false },
  { to: '/kalender', label: 'Kalender', short: 'Kalender', icon: CalendarDays, end: false },
  { to: '/lernzeit', label: 'Lernzeit', short: 'Lernzeit', icon: Timer, end: false },
  { to: '/noten', label: 'Noten', short: 'Noten', icon: GraduationCap, end: false },
]

export function Layout() {
  return (
    <div className="flex min-h-[100dvh] flex-col md:flex-row">
      {/* ===== iPad / Desktop: linke Sidebar ===== */}
      <aside className="pt-safe pb-safe pl-safe sticky top-0 z-10 hidden h-[100dvh] w-60 shrink-0 flex-col border-r border-white/10 bg-slate-950/60 backdrop-blur-xl md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="text-sm font-bold leading-tight text-white">Lern-Tracker</div>
            <div className="text-xs text-slate-400">Prüfungen im Griff</div>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-inset ring-indigo-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* ===== iPhone: obere Kopfleiste ===== */}
      <header className="pt-safe sticky top-0 z-20 flex items-center gap-2 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl md:hidden [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]">
        <div className="flex items-center gap-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap size={18} />
          </div>
          <div className="text-base font-bold text-white">Lern-Tracker</div>
        </div>
      </header>

      {/* ===== Inhalt ===== */}
      <main className="scroll-touch flex-1 pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom))] md:p-8 md:pb-8 [padding-left:max(1rem,env(safe-area-inset-left))] [padding-right:max(1rem,env(safe-area-inset-right))]">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>

      {/* ===== iPhone: untere Tab-Leiste ===== */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 flex border-t border-white/10 bg-slate-950/80 backdrop-blur-xl md:hidden [padding-left:max(0px,env(safe-area-inset-left))] [padding-right:max(0px,env(safe-area-inset-right))]">
        {links.map(({ to, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[3.25rem] flex-1 flex-col items-center justify-center gap-0.5 pt-2 pb-1.5 text-[11px] font-medium transition-colors ${
                isActive ? 'text-indigo-400' : 'text-slate-500'
              }`
            }
          >
            <Icon size={22} />
            {short}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
