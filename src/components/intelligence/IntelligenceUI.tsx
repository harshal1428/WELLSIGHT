import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Activity, ArrowLeft, ArrowRight, Circle, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { useScenarioStream } from '../../hooks/useScenarioStream';
import { intelligenceFeatures } from '../../data/intelligenceFeatures';
import { SectionHeader } from '../ui';

export function IntelligenceFeatureLayout({ featureId, title, summary, children }: { featureId: string; title: string; summary: string; children: ReactNode }) {
  const { activeWell } = useWellContext();
  const { reading, label } = useScenarioStream();
  const index = intelligenceFeatures.findIndex((feature) => feature.id === featureId);
  const previous = intelligenceFeatures[(index - 1 + intelligenceFeatures.length) % intelligenceFeatures.length];
  const next = intelligenceFeatures[(index + 1) % intelligenceFeatures.length];
  return <div className="mx-auto max-w-[1500px] space-y-5 pb-10">
    <header className="rounded-xl border border-border-default bg-surface-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link to="/intelligence" className="inline-flex items-center gap-2 text-xs font-semibold text-accent-600 hover:text-accent-500"><ArrowLeft size={14} /> Intelligence hub</Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold tracking-wide text-emerald-800"><Circle size={8} fill="currentColor" />{label}</span>
      </div>
      <SectionHeader title={title} subtitle={summary} icon={intelligenceFeatures[index]?.icon ?? Activity} />
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StreamMetric label="Scenario depth" value={`${reading.depth.toLocaleString()} m`} />
        <StreamMetric label="ROP" value={`${reading.rop} m/hr`} />
        <StreamMetric label="Torque" value={`${reading.torque} kN·m`} />
        <StreamMetric label="Temperature" value={`${reading.temperature} °C`} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-500"><span>Well context: {activeWell.id}</span><span className="inline-flex items-center gap-1"><Clock3 size={11} /> Updated {reading.timestamp.toLocaleTimeString()}</span><span>Local reference playback · rig telemetry connection inactive.</span></div>
    </header>
    {children}
    <nav className="flex flex-wrap justify-between gap-3 border-t border-border-default pt-4"><Link to={previous.route} className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-accent-600"><ArrowLeft size={14} /> {previous.title}</Link><Link to={next.route} className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-accent-600">{next.title} <ArrowRight size={14} /></Link></nav>
  </div>;
}

export function Panel({ title, subtitle, icon: Icon, children, className = '' }: { title: string; subtitle?: string; icon?: LucideIcon; children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-border-default bg-surface-card p-5 ${className}`}><SectionHeader title={title} subtitle={subtitle} icon={Icon} />{children}</section>;
}

export function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: ReactNode }) {
  return <label className="block text-xs font-medium text-slate-500">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 block w-full rounded-md border border-border-default bg-surface-elevated px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none">{children}</select></label>;
}

export function ValueCard({ label, value, help }: { label: string; value: string; help?: string }) {
  return <div className="rounded-lg border border-border-subtle bg-surface-elevated p-3"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-semibold text-white">{value}</p>{help && <p className="mt-1 text-[10px] text-slate-500">{help}</p>}</div>;
}

export function EmptyNotice({ children }: { children: ReactNode }) { return <div className="rounded-lg border border-dashed border-border-strong bg-surface-elevated p-5 text-sm text-slate-500">{children}</div>; }

function StreamMetric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2"><p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{label}</p><p className="mt-0.5 text-sm font-bold text-white">{value}</p></div>;
}
