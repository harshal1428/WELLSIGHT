import { useState, useMemo, useEffect } from 'react';
import { Activity, Gauge, TrendingUp, Zap, Droplets, RotateCw, Weight, Waves, BarChart3, ArrowDownRight, Play, Pause, RotateCcw } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader, MetricCard } from '../components/ui';
import { StatusBadge } from '../components/ui/Badges';
import { parameterTimeSeries } from '../data/mockData';

export function LiveWellPage() {
  const { activeWell, currentParameters } = useWellContext();

  const [playbackHistory, setPlaybackHistory] = useState([{ ...currentParameters }]);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate next deterministic point based on the last point and base depth
  const generateNextPoint = (last: typeof currentParameters, baseDepth: number) => {
    const step = Math.round((last.depth - baseDepth) / 10) + 1;
    return {
      ...last,
      depth: last.depth + 10,
      torque: Number((last.torque + 0.15 + (step % 3 === 0 ? 0.3 : 0)).toFixed(1)),
      rop: Number((Math.max(8, last.rop - 0.2)).toFixed(1)),
      wob: Number((last.wob + 0.1).toFixed(1)),
      rpm: last.rpm,
      ecd: Number((last.ecd + 0.05).toFixed(2)),
      mudFlow: last.mudFlow,
      mudWeight: last.mudWeight,
      pressure: last.pressure + 5,
      hookLoad: last.hookLoad,
      timestamp: new Date(new Date(last.timestamp).getTime() + 15 * 60000).toISOString(),
    };
  };

  // Reset playback if the active well changes
  useEffect(() => {
    setPlaybackHistory([{ ...currentParameters }]);
    setIsPlaying(false);
  }, [currentParameters]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlaybackHistory((prev) => {
          const lastPoint = prev[prev.length - 1];
          const nextPoint = generateNextPoint(lastPoint, currentParameters.depth);
          return [...prev, nextPoint];
        });
      }, 1500); // 1.5 seconds per step
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentParameters.depth]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setIsPlaying(false);
    setPlaybackHistory([{ ...currentParameters }]);
  };

  const currentSimulatedParams = playbackHistory[playbackHistory.length - 1];
  const stepCount = playbackHistory.length - 1;

  // Derive chart data combining history and current playback state with a rolling window
  const chartData = useMemo(() => {
    const baseHistory = parameterTimeSeries.filter(p => p.depth < currentParameters.depth);
    let combined = [...baseHistory, ...playbackHistory];
    
    // Rolling window of max 30 points to keep chart readable and performant
    if (combined.length > 30) {
      combined = combined.slice(combined.length - 30);
    }

    return combined.map((p) => ({
      depth: p.depth,
      torque: p.torque,
      rop: p.rop,
      wob: p.wob,
      rpm: p.rpm,
      ecd: p.ecd,
    }));
  }, [playbackHistory, currentParameters.depth]);

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* ── Well Header ─────────────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <Activity size={20} className="text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white">Drilling Parameters — Demo</h1>
                <StatusBadge status={activeWell.status} />
              </div>
              <p className="text-sm text-slate-400">{activeWell.name} — Simulated drilling data for prototype demonstration</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePlayPause}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 hover:bg-navy-600 border border-border-subtle rounded-md text-sm text-white transition-colors"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                {isPlaying ? 'Pause' : 'Start'}
              </button>
              <button 
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-700 hover:bg-navy-600 border border-border-subtle rounded-md text-sm text-slate-300 transition-colors"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Step: {stepCount}
            </div>
            <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border font-medium ${
              isPlaying ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              {isPlaying ? 'SIMULATED PLAYBACK' : 'SIMULATED DATA — PAUSED'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-sm text-blue-400 text-center flex items-center justify-center gap-2">
        <Activity size={16} />
        <span><strong>Simulated playback uses predefined synthetic drilling measurements for prototype demonstration.</strong> No live rig sensor or eRTMAC connection is active.</span>
      </div>

      {currentSimulatedParams.torque >= 16 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-400 flex items-start gap-3">
          <Zap className="mt-0.5 shrink-0 text-amber-400" size={18} />
          <div>
            <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">Simulated Demo Alert: High Torque Trend</h4>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              The simulated torque parameter has crossed the illustrative threshold of 16 kN·m. This is a deterministic condition for demonstration purposes. It does not reflect live operations and is kept separate from approved historical records.
            </p>
          </div>
        </div>
      )}

      {/* ── Parameters Grid ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard label="Depth" value={currentSimulatedParams.depth.toLocaleString()} unit="m" icon={ArrowDownRight} accent="info" />
        <MetricCard label="ROP" value={currentSimulatedParams.rop} unit="m/hr" icon={TrendingUp} accent="success" trend="down" trendValue="1.8 over 80m" />
        <MetricCard label="WOB" value={currentSimulatedParams.wob} unit="klbs" icon={Weight} accent="default" />
        <MetricCard label="RPM" value={currentSimulatedParams.rpm} unit="rpm" icon={RotateCw} accent="default" />
        <MetricCard label="Torque" value={currentSimulatedParams.torque} unit="kN·m" icon={Zap} accent="warning" trend="up" trendValue="2.7 over 80m" />
        <MetricCard label="Mud Flow" value={currentSimulatedParams.mudFlow} unit="L/min" icon={Droplets} accent="default" />
        <MetricCard label="Mud Weight" value={currentSimulatedParams.mudWeight} unit="ppg" icon={Waves} accent="default" />
        <MetricCard label="Pressure" value={currentSimulatedParams.pressure.toLocaleString()} unit="psi" icon={Gauge} accent="default" />
        <MetricCard label="ECD" value={currentSimulatedParams.ecd} unit="ppg" icon={BarChart3} accent="default" />
        <MetricCard label="Hook Load" value={currentSimulatedParams.hookLoad} unit="klbs" icon={Activity} accent="default" />
      </div>

      {/* ── Torque & ROP Chart ──────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader title="Torque vs Depth" subtitle="Torque trend with illustrative prototype threshold" icon={Zap} />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="depth" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} domain={[10, 20]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
              />
              <ReferenceLine y={16} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Illustrative Threshold', position: 'right', fill: '#ef4444', fontSize: 10 }} />
              <Line type="monotone" dataKey="torque" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} name="Torque (kN·m)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── ROP & WOB Chart ─────────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader title="ROP & WOB vs Depth" subtitle="Drilling efficiency trend" icon={TrendingUp} />
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="depth" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }}
              />
              <Line yAxisId="left" type="monotone" dataKey="rop" stroke="#22d3ee" strokeWidth={2} dot={{ fill: '#22d3ee', r: 4 }} name="ROP (m/hr)" />
              <Line yAxisId="right" type="monotone" dataKey="wob" stroke="#a78bfa" strokeWidth={2} dot={{ fill: '#a78bfa', r: 4 }} name="WOB (klbs)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
