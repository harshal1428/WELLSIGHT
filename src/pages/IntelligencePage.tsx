import { ArrowRight, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { intelligenceFeatures } from '../data/intelligenceFeatures';
import { collectCases } from '../data/intelligenceCasework';
import { useWellContext } from '../hooks/useWellContext';
import { useScenarioStream } from '../hooks/useScenarioStream';
import { SectionHeader } from '../components/ui';

export function IntelligencePage() {
  const { activeWell, nearbyWells } = useWellContext();
  const { reading, label } = useScenarioStream();
  const totalCases = collectCases([activeWell, ...nearbyWells]).length;
  return <div className="mx-auto max-w-[1500px] space-y-5 pb-10">
    <section className="rounded-xl border border-border-default bg-surface-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3"><SectionHeader title="Well Intelligence" subtitle="A guided workspace for comparing the active well with historical offset evidence." icon={Workflow} /><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-bold tracking-wide text-emerald-800">● {label}</span></div>
      <p className="mt-1 max-w-4xl text-xs leading-relaxed text-slate-500">Local reference playback is shown below. A rig telemetry connection is inactive; historical records and readings are not verified against an external source.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Summary label="Active well" value={activeWell.id} />
        <Summary label="Reference depth" value={`${reading.depth.toLocaleString()} m`} />
        <Summary label="Formation" value={activeWell.formation} />
        <Summary label="Historical event records" value={String(totalCases)} />
      </div>
    </section>

    <section className="rounded-xl border border-border-default bg-surface-card p-5">
      <SectionHeader title="Intelligence workflow" subtitle="Move from relevant offsets to depth context, evidence review, and engineer feedback." icon={Workflow} />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {intelligenceFeatures.map((feature, index) => <Link key={feature.id} to={feature.route} className="group flex min-h-32 gap-3 rounded-xl border border-border-default bg-surface-elevated p-4 transition-colors hover:border-accent-500/50 hover:bg-surface-hover">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-500/10 text-accent-600"><feature.icon size={18} /></span>
          <span className="min-w-0 flex-1"><span className="mb-1 block text-[9px] font-bold uppercase tracking-widest text-slate-500">{String(index + 1).padStart(2, '0')} · {feature.group}</span><span className="block text-sm font-semibold text-white group-hover:text-accent-700">{feature.title}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{feature.summary}</span></span>
          <ArrowRight size={15} className="mt-1 shrink-0 text-slate-400 group-hover:text-accent-600" />
        </Link>)}
      </div>
    </section>
  </div>;
}

function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2"><p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-white">{value}</p></div>; }
