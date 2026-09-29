import { useMemo, useState } from 'react';
import { Activity, Gauge, TrendingUp, Zap, Droplets, RotateCw, Weight, Waves, BarChart3, ArrowDownRight, Save, History, Trash2 } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader, MetricCard } from '../components/ui';
import { StatusBadge } from '../components/ui/Badges';
import type { DrillingParameters } from '../types';
import { parameterTimeSeries } from '../data/mockData';
import { monitoringSections } from '../data/monitoringChannels';

interface SavedReading {
  id: string;
  wellId: string;
  capturedAt: string;
  sourceTimestamp: string;
  parameters: DrillingParameters;
}

const STORAGE_KEY = 'wellsight.saved-well-readings.v1';
const LEGACY_STORAGE_KEY = 'offsetiq.saved-well-readings.v1';

function loadSavedReadings(): SavedReading[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as SavedReading[] : [];
  } catch {
    return [];
  }
}

function formatTimestamp(timestamp: string) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? 'Unknown time' : date.toLocaleString();
}

interface TrendPoint {
  timestamp: string;
  depth: number;
  torque: number;
  rop: number;
  wob: number;
  pressure: number;
  ecd: number;
  mudFlow: number;
  mudWeight: number;
}

interface TemperaturePoint {
  depth: number;
  lowerGradient: number;
  centralGradient: number;
  upperGradient: number;
}

type TrendValueKey = Exclude<keyof TrendPoint, 'timestamp' | 'depth'>;

interface TrendChartProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  data: TrendPoint[];
  leftKey: TrendValueKey;
  leftName: string;
  leftColor: string;
  rightKey?: TrendValueKey;
  rightName?: string;
  rightColor?: string;
}

function TrendChart({ title, subtitle, icon: Icon, data, leftKey, leftName, leftColor, rightKey, rightName, rightColor }: TrendChartProps) {
  return (
    <section className="bg-surface-card border border-border-default rounded-xl p-5">
      <SectionHeader title={title} subtitle={subtitle} icon={Icon} />
      {data.length === 0 ? (
        <div className="h-60 rounded-lg border border-dashed border-border-subtle flex items-center justify-center text-sm text-slate-400">
          No readings available for this graph.
        </div>
      ) : (
        <div className="mt-3">
          <div className="flex items-center justify-center gap-5 min-h-6 mb-1 text-[11px]">
            <span className="flex items-center gap-1.5" style={{ color: leftColor }}>
              <span className="inline-block w-3 h-0.5" style={{ backgroundColor: leftColor }} />{leftName}
            </span>
            {rightKey && rightName && (
              <span className="flex items-center gap-1.5" style={{ color: rightColor }}>
                <span className="inline-block w-3 h-0.5" style={{ backgroundColor: rightColor }} />{rightName}
              </span>
            )}
          </div>
          <div className="h-64 flex min-w-0 items-stretch">
            <div className="w-7 shrink-0 flex items-center justify-center" aria-hidden="true">
              <span className="whitespace-nowrap text-[10px]" style={{ color: leftColor, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>{leftName}</span>
            </div>
            <div className="flex-1 min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="depth" type="number" domain={['dataMin', 'dataMax']} tickCount={6} tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={{ stroke: '#64748b' }} tickMargin={8} />
                  <YAxis yAxisId="left" tickCount={6} width={48} tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  {rightKey && <YAxis yAxisId="right" orientation="right" tickCount={6} width={48} tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />}
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} labelFormatter={(depth, payload) => `Depth ${depth} m · ${payload?.[0]?.payload?.timestamp ? formatTimestamp(payload[0].payload.timestamp) : 'time unavailable'}`} />
                  <Line yAxisId="left" type="monotone" dataKey={leftKey} stroke={leftColor} strokeWidth={2} dot={{ fill: leftColor, r: 3 }} name={leftName} />
                  {rightKey && <Line yAxisId="right" type="monotone" dataKey={rightKey} stroke={rightColor ?? '#cbd5e1'} strokeWidth={2} dot={{ fill: rightColor ?? '#cbd5e1', r: 3 }} name={rightName} />}
                </LineChart>
              </ResponsiveContainer>
            </div>
            {rightKey && rightName && (
              <div className="w-7 shrink-0 flex items-center justify-center" aria-hidden="true">
                <span className="whitespace-nowrap text-[10px]" style={{ color: rightColor, writingMode: 'vertical-rl' }}>{rightName}</span>
              </div>
            )}
          </div>
          <p className="mt-1 text-center text-[11px] text-slate-300">Measured depth (m)</p>
        </div>
      )}
    </section>
  );
}

function TemperatureTrendChart({ data }: { data: TemperaturePoint[] }) {
  return (
    <section className="bg-surface-card border border-border-default rounded-xl p-5">
      <SectionHeader title="Formation temperature profile" subtitle="Calculated range using assumed geothermal gradients and measured depth; not a downhole sensor measurement." icon={Waves} />
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-3 mb-1 text-[11px]">
        <span className="text-sky-300">— Lower scenario · 1.5°C/100 m</span>
        <span className="text-amber-800">— Central scenario · 2.2°C/100 m</span>
        <span className="text-rose-300">— Upper scenario · 3.3°C/100 m</span>
      </div>
      <div className="h-64 flex min-w-0 items-stretch">
        <div className="w-7 shrink-0 flex items-center justify-center" aria-hidden="true">
          <span className="whitespace-nowrap text-[10px] text-amber-800" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>Modelled formation temperature (°C)</span>
        </div>
        <div className="flex-1 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="depth" type="number" domain={['dataMin', 'dataMax']} tickCount={6} tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={{ stroke: '#64748b' }} tickMargin={8} />
              <YAxis tickCount={6} width={48} tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }} labelFormatter={(depth) => `Measured depth ${depth} m`} />
              <Line type="monotone" dataKey="lowerGradient" stroke="#0369a1" strokeDasharray="4 3" strokeWidth={2} dot={false} name="Lower gradient profile (°C)" />
              <Line type="monotone" dataKey="centralGradient" stroke="#b45309" strokeWidth={2} dot={false} name="Central gradient profile (°C)" />
              <Line type="monotone" dataKey="upperGradient" stroke="#be123c" strokeDasharray="4 3" strokeWidth={2} dot={false} name="Upper gradient profile (°C)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <p className="mt-1 text-center text-[11px] text-slate-300">Measured depth (m)</p>
    </section>
  );
}

export function LiveWellPage() {
  const { activeWell, currentParameters } = useWellContext();
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>(loadSavedReadings);
  const [activeTab, setActiveTab] = useState<'monitor' | 'saved'>('monitor');
  const [storageError, setStorageError] = useState('');

  const wellReadings = useMemo(
    () => savedReadings.filter((reading) => reading.wellId === activeWell.id)
      .sort((a, b) => b.capturedAt.localeCompare(a.capturedAt)),
    [savedReadings, activeWell.id],
  );

  const trackedChannelCount = monitoringSections.reduce((count, section) => count + section.channels.length, 0);
  const availableChannelCount = monitoringSections.reduce(
    (count, section) => count + section.channels.filter((channel) =>
      channel.field !== undefined && Number.isFinite(currentParameters?.[channel.field]),
    ).length,
    0,
  );
  const referenceChannelCount = monitoringSections.reduce(
    (count, section) => count + section.channels.filter((channel) =>
      !(channel.field !== undefined && Number.isFinite(currentParameters?.[channel.field])) && channel.referenceValue !== undefined,
    ).length,
    0,
  );

  const chartData = useMemo(() => {
    if (!currentParameters) return [];
    const pointsByDepth = new Map<number, DrillingParameters>();
    parameterTimeSeries.forEach((point) => pointsByDepth.set(point.depth, point));
    pointsByDepth.set(currentParameters.depth, currentParameters);
    return [...pointsByDepth.values()]
      .sort((a, b) => a.depth - b.depth)
      .map((point) => ({
        timestamp: point.timestamp,
        depth: point.depth,
        torque: point.torque,
        rop: point.rop,
        wob: point.wob,
        pressure: point.pressure,
        ecd: point.ecd,
        mudFlow: point.mudFlow,
        mudWeight: point.mudWeight,
      }));
  }, [currentParameters]);

  const temperatureTrend = useMemo<TemperaturePoint[]>(() => chartData.map(({ depth }) => ({
    // Scenario curves use a 25°C intercept and 1.5/2.2/3.3°C per 100m.
    // These are reference scenarios, not predictions for this well.
    depth,
    lowerGradient: Number((25 + depth * 0.015).toFixed(1)),
    centralGradient: Number((25 + depth * 0.022).toFixed(1)),
    upperGradient: Number((25 + depth * 0.033).toFixed(1)),
  })), [chartData]);

  const persistReadings = (updated: SavedReading[]) => {
    setSavedReadings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStorageError('');
    } catch {
      setStorageError('Could not save readings in this browser. Check available site storage.');
    }
  };

  const handleSaveReading = () => {
    if (!currentParameters) return;
    const capturedAt = new Date().toISOString();
    const reading: SavedReading = {
      id: `${capturedAt}-${Math.random().toString(36).slice(2, 8)}`,
      wellId: activeWell.id,
      capturedAt,
      sourceTimestamp: currentParameters.timestamp,
      parameters: { ...currentParameters },
    };
    persistReadings([reading, ...savedReadings]);
    setActiveTab('saved');
  };

  const handleDeleteReading = (readingId: string) => {
    persistReadings(savedReadings.filter((reading) => reading.id !== readingId));
  };

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg font-bold text-white">Well Monitoring</h1>
                <StatusBadge status={activeWell.status} />
              </div>
              <p className="text-sm text-slate-400">{activeWell.name} · {activeWell.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleSaveReading}
              disabled={!currentParameters}
              title={currentParameters ? 'Save the displayed reference snapshot' : 'No parameter record is available for this well'}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-600 hover:bg-accent-500 rounded-md text-sm text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} /> Save reading
            </button>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-border-subtle flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('monitor')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTab === 'monitor' ? 'bg-accent-500/15 text-accent-300' : 'text-slate-400 hover:bg-navy-800'}`}
            >
              <Activity size={15} /> Monitor
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${activeTab === 'saved' ? 'bg-accent-500/15 text-accent-300' : 'text-slate-400 hover:bg-navy-800'}`}
            >
              <History size={15} /> Saved readings <span className="text-xs">({wellReadings.length})</span>
            </button>
          </div>

        </div>
      </div>

      <div role="status" className="rounded-lg border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs text-amber-100">
        Sensor connection: offline. The displayed channel values are stored reference data and calculated profiles, not live rig measurements.
      </div>

      {storageError && (
        <div role="alert" className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-300">{storageError}</div>
      )}

      {activeTab === 'monitor' ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <MetricCard label="Depth" value={currentParameters?.depth.toLocaleString() ?? '—'} unit="m" icon={ArrowDownRight} accent="info" />
            <MetricCard label="ROP" value={currentParameters?.rop ?? '—'} unit="m/hr" icon={TrendingUp} accent="success" />
            <MetricCard label="WOB" value={currentParameters?.wob ?? '—'} unit="klbs" icon={Weight} />
            <MetricCard label="RPM" value={currentParameters?.rpm ?? '—'} unit="rpm" icon={RotateCw} />
            <MetricCard label="Torque" value={currentParameters?.torque ?? '—'} unit="kN·m" icon={Zap} accent="warning" />
            <MetricCard label="Mud Flow" value={currentParameters?.mudFlow ?? '—'} unit="L/min" icon={Droplets} />
            <MetricCard label="Mud Weight" value={currentParameters?.mudWeight ?? '—'} unit="ppg" icon={Waves} />
            <MetricCard label="Pressure" value={currentParameters?.pressure.toLocaleString() ?? '—'} unit="psi" icon={Gauge} />
            <MetricCard label="ECD" value={currentParameters?.ecd ?? '—'} unit="ppg" icon={BarChart3} />
            <MetricCard label="Hook Load" value={currentParameters?.hookLoad ?? '—'} unit="klbs" icon={Activity} />
          </div>

          <section className="space-y-4" aria-labelledby="monitoring-dashboard-title">
            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <SectionHeader
                title="Sensor dashboard summary"
                subtitle="Common drilling channels grouped by the system that reports them. Unavailable channels stay empty until a source provides readings."
                icon={Activity}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                <MetricCard label="Tracked channels" value={trackedChannelCount} icon={BarChart3} accent="info" />
                <MetricCard label="Stored channel values" value={availableChannelCount} icon={Activity} accent="success" />
                <MetricCard label="Calculated reference values" value={referenceChannelCount} icon={Waves} accent="warning" />
              </div>
            </div>

            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <h2 id="monitoring-dashboard-title" className="text-base font-semibold text-white">Sensor readings by system</h2>
                <p className="text-xs text-slate-400 mt-1">The 50 channel types below are common options; each rig’s instrument list can differ.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
              {monitoringSections.map((section) => {
                const sectionAvailable = section.channels.filter((channel) =>
                  channel.field !== undefined && Number.isFinite(currentParameters?.[channel.field]),
                ).length;
                return (
                  <section key={section.id} className="bg-surface-card border border-border-default rounded-xl p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{section.description}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border-subtle px-2.5 py-1 text-[11px] text-slate-300">
                        {sectionAvailable}/{section.channels.length} available
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                      {section.channels.map((channel) => {
                        const value = channel.field ? currentParameters?.[channel.field] : undefined;
                        const hasValue = typeof value === 'number' && Number.isFinite(value);
                        const hasReference = !hasValue && channel.referenceValue !== undefined;
                        const displayedValue = hasValue ? value : channel.referenceValue;
                        return (
                          <div key={channel.id} className="min-w-0 rounded-lg border border-border-subtle bg-navy-900/60 p-3">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs leading-4 text-slate-300">{channel.label}</p>
                              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-wide ${hasValue || hasReference ? 'border border-[#cbd5e1] bg-[#f1f5f9] text-[#334155]' : 'bg-slate-700 text-slate-300'}`}>
                                {hasValue ? 'Stored' : hasReference ? 'Reference' : 'No data'}
                              </span>
                            </div>
                            <div className="mt-3 flex items-baseline gap-1.5">
                              <span className={`text-lg font-semibold ${hasValue || hasReference ? 'text-white' : 'text-slate-500'}`}>
                                {displayedValue !== undefined ? displayedValue.toLocaleString() : '—'}
                              </span>
                              {displayedValue !== undefined && <span className="text-[11px] text-slate-400">{channel.unit}</span>}
                            </div>
                            {!hasValue && !hasReference && <p className="mt-1 text-[10px] text-slate-500">{channel.unit} · no stored value available</p>}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <TrendChart title="Torque vs Depth" subtitle="Stored torque profile against measured depth." icon={Zap} data={chartData} leftKey="torque" leftName="Torque (kN·m)" leftColor="#b45309" />
            <TrendChart title="ROP & WOB vs Depth" subtitle="Penetration rate and weight on bit use separate scales." icon={TrendingUp} data={chartData} leftKey="rop" leftName="ROP (m/hr)" leftColor="#22d3ee" rightKey="wob" rightName="WOB (klbf)" rightColor="#a78bfa" />
            <TrendChart title="Pressure & ECD vs Depth" subtitle="Surface pressure and equivalent circulating density use separate scales." icon={Gauge} data={chartData} leftKey="pressure" leftName="Surface pressure (psi)" leftColor="#fb7185" rightKey="ecd" rightName="ECD (ppg)" rightColor="#c084fc" />
            <TrendChart title="Flow & Mud Weight vs Depth" subtitle="Mud flow in and mud weight in use separate scales." icon={Droplets} data={chartData} leftKey="mudFlow" leftName="Mud flow in (L/min)" leftColor="#38bdf8" rightKey="mudWeight" rightName="Mud weight in (ppg)" rightColor="#4ade80" />
          </div>

          <TemperatureTrendChart data={temperatureTrend} />
        </>
      ) : (
        <section className="bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader title="Saved readings" subtitle={`Browser-stored snapshots for ${activeWell.id}. Each entry includes when it was saved and the source measurement timestamp.`} icon={History} />
          {wellReadings.length === 0 ? (
            <div className="py-14 text-center">
              <History className="mx-auto mb-3 text-slate-500" size={28} />
              <p className="text-sm font-medium text-slate-300">No readings saved for this well yet.</p>
              <p className="text-xs text-slate-500 mt-1">Return to Monitor and choose Save reading.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-slate-500 border-b border-border-subtle">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Saved</th>
                    <th className="py-3 pr-4 font-medium">Source time</th>
                    <th className="py-3 pr-4 font-medium">Depth (m)</th>
                    <th className="py-3 pr-4 font-medium">Torque (kN·m)</th>
                    <th className="py-3 pr-4 font-medium">ROP (m/hr)</th>
                    <th className="py-3 pr-4 font-medium">WOB (klbs)</th>
                    <th className="py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {wellReadings.map((reading) => (
                    <tr key={reading.id} className="text-slate-300">
                      <td className="py-3 pr-4 whitespace-nowrap">{formatTimestamp(reading.capturedAt)}</td>
                      <td className="py-3 pr-4 whitespace-nowrap text-slate-400">{formatTimestamp(reading.sourceTimestamp)}</td>
                      <td className="py-3 pr-4">{reading.parameters.depth.toLocaleString()}</td>
                      <td className="py-3 pr-4">{reading.parameters.torque}</td>
                      <td className="py-3 pr-4">{reading.parameters.rop}</td>
                      <td className="py-3 pr-4">{reading.parameters.wob}</td>
                      <td className="py-3">
                        <button onClick={() => handleDeleteReading(reading.id)} className="text-slate-500 hover:text-red-300" aria-label={`Delete reading saved ${formatTimestamp(reading.capturedAt)}`}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <p className="mt-4 text-xs text-slate-500">Saved readings are kept in this browser on this device. They are not synced to other users or devices.</p>
        </section>
      )}
    </div>
  );
}
