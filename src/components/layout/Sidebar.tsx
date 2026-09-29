import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  MapPin,
  GitCompareArrows,
  BookOpen,
  ShieldAlert,
  Bell,
  FileBarChart,
  Waves,
  Upload,
  BrainCircuit,
} from 'lucide-react';

const navItems = [
  { to: '/',              label: 'Overview',             icon: LayoutDashboard },
  { to: '/live-well',     label: 'Well Monitoring',         icon: Activity },
  { to: '/nearby-wells',  label: 'Nearby Wells',         icon: MapPin },
  { to: '/correlation',   label: 'Well Correlation',     icon: GitCompareArrows },
  { to: '/knowledge',     label: 'Historical Knowledge', icon: BookOpen },
  { to: '/risk',          label: 'Risk Intelligence',    icon: ShieldAlert },
  { to: '/alerts',        label: 'Alerts',               icon: Bell },
  { to: '/reports',       label: 'Reports',              icon: FileBarChart },
  { to: '/import',        label: 'Data Import',          icon: Upload },
  { to: '/intelligence',  label: 'Well Intelligence',    icon: BrainCircuit },
];

export function Sidebar() {
  return (
    <aside className="w-60 bg-surface-secondary border-r border-border-default flex flex-col h-full shrink-0">
      {/* ── Brand ────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-border-default">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-500/15 flex items-center justify-center">
            <Waves size={18} className="text-accent-500" />
          </div>
          <div>
            <span className="text-sm font-bold text-white tracking-tight">WELL</span>
            <span className="text-sm font-bold text-accent-500 ml-0.5">SIGHT</span>
          </div>
        </div>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'text-slate-400 hover:text-white hover:bg-navy-700/50'
                }`
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="px-5 py-4 border-t border-border-default">
        <p className="text-[11px] font-semibold text-navy-300 uppercase tracking-widest">WELLSIGHT</p>
        <p className="text-[10px] text-navy-400 mt-0.5">Well Monitoring &amp; Intelligence</p>
        <p className="text-[10px] text-navy-500 mt-1">Well Operations Decision Support</p>
      </div>
    </aside>
  );
}
