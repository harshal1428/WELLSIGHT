import { Link } from 'react-router-dom';
import {
  Drill,
  Gauge,
  Layers,
  MapPin,
  ShieldAlert,
  Bell,
  Activity,
  ArrowDownRight,
  TrendingUp,
  Droplets,
  Weight,
  RotateCw,
  Zap,
  Waves,
  BarChart3,
  Target,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useWellContext } from '../hooks/useWellContext';
import { MetricCard, SectionHeader } from '../components/ui';
import { StatusBadge, RiskBadge } from '../components/ui/Badges';
import { AlertCard } from '../components/alerts/AlertCard';
import { WellCard } from '../components/wells/WellCard';
import { RiskSummaryCard } from '../components/risk/RiskSummaryCard';
import { parameterTimeSeries, formations } from '../data/mockData';

export function OverviewPage() {
  const { activeWell, currentParameters, risks, alerts, nearbyWells } = useWellContext();

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged);
  const topRisks = risks.slice(0, 3);
  const topNearbyWells = nearbyWells.slice(0, 4);

  // Format time series for chart
  const chartData = parameterTimeSeries.map((p) => ({
    depth: p.depth,
    torque: p.torque,
    rop: p.rop,
  }));

  // Current formation info
  const currentFormation = formations.find((f) => f.id === activeWell.formation);

  // Calculate drilling progress
  const progressPercent = activeWell.currentDepth
    ? Math.round((activeWell.currentDepth / activeWell.totalDepth) * 100)
    : 0;

  return (
    <div className="space-y-5 max-w-[1600px] mx-auto">
      {/* ═══════════════════════════════════════════════════════
          TOP SECTION: Well Status + Quick Stats
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Active Well Card ──────────────────────────────── */}
        <div className="lg:col-span-2 bg-surface-card border border-border-default rounded-xl p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-lg font-bold text-white">{activeWell.id}</h1>
                <StatusBadge status={activeWell.status} />
              </div>
              <p className="text-sm text-slate-400">{activeWell.name}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Drilling Progress</p>
              <p className="text-2xl font-bold text-white">{progressPercent}%</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-navy-800 rounded-full mb-5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Key parameters grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MetricCard
              label="Current Depth"
              value={activeWell.currentDepth?.toLocaleString() ?? '—'}
              unit="m"
              icon={ArrowDownRight}
              accent="info"
            />
            <MetricCard
              label="Formation"
              value={activeWell.formation}
              unit={currentFormation?.name?.split(' ')[0]}
              icon={Layers}
              accent="default"
            />
            <MetricCard
              label="Target Depth"
              value={activeWell.totalDepth.toLocaleString()}
              unit="m"
              icon={Target}
              accent="default"
            />
            <MetricCard
              label="ROP"
              value={currentParameters.rop}
              unit="m/hr"
              icon={TrendingUp}
              trend="down"
              trendValue="0.3 from 3130m"
              accent="success"
            />
          </div>
        </div>

        {/* ── Risk Summary Panel ───────────────────────────── */}
        <div className="bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader
            title="Risk Summary"
            subtitle="Current risk posture"
            icon={ShieldAlert}
          />

          {/* Overall risk indicator */}
          <div className="flex items-center gap-3 p-3 bg-orange-500/5 border border-orange-500/15 rounded-lg mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <ShieldAlert size={20} className="text-orange-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Overall Risk</span>
                <RiskBadge level="HIGH" />
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Based on {risks.length} active assessments
              </p>
            </div>
          </div>

          {/* Risk breakdown */}
          <div className="space-y-2">
            {topRisks.map((risk) => (
              <div
                key={risk.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-navy-800/30 hover:bg-navy-800/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <RiskBadge level={risk.riskLevel} size="sm" />
                  <span className="text-xs text-white font-medium truncate">{risk.riskType}</span>
                </div>
                <span className="text-[11px] text-slate-400 shrink-0">{risk.confidence}%</span>
              </div>
            ))}
          </div>

          {/* Active alerts count */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-subtle text-xs text-slate-400">
            <Bell size={12} className={unacknowledgedAlerts.length > 0 ? 'text-red-400' : ''} />
            <span>
              <span className="text-white font-semibold">{unacknowledgedAlerts.length}</span> unacknowledged alert{unacknowledgedAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MIDDLE SECTION: Drilling Parameters + Trend Chart
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* ── Drilling Parameters ──────────────────────────── */}
        <div className="lg:col-span-1 bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader
            title="Drilling Parameters"
            subtitle="Simulated parameters (Demo)"
            icon={Gauge}
          />

          <div className="grid grid-cols-2 gap-2.5">
            <ParameterReadout label="WOB" value={currentParameters.wob} unit="klbs" icon={Weight} />
            <ParameterReadout label="RPM" value={currentParameters.rpm} unit="rpm" icon={RotateCw} />
            <ParameterReadout label="Torque" value={currentParameters.torque} unit="kN·m" icon={Zap} alert />
            <ParameterReadout label="Mud Flow" value={currentParameters.mudFlow} unit="L/min" icon={Droplets} />
            <ParameterReadout label="Mud Weight" value={currentParameters.mudWeight} unit="ppg" icon={Waves} />
            <ParameterReadout label="Pressure" value={currentParameters.pressure.toLocaleString()} unit="psi" icon={Gauge} />
            <ParameterReadout label="ECD" value={currentParameters.ecd} unit="ppg" icon={BarChart3} />
            <ParameterReadout label="Hook Load" value={currentParameters.hookLoad} unit="klbs" icon={Activity} />
          </div>
        </div>

        {/* ── Trend Chart ──────────────────────────────────── */}
        <div className="lg:col-span-2 bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader
            title="Torque & ROP vs Depth"
            subtitle="Last 80m drilling interval — deterministic trend"
            icon={TrendingUp}
          />

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="torqueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ropGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="depth"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  label={{ value: 'Depth (m)', position: 'insideBottom', offset: -2, style: { fontSize: 10, fill: '#64748b' } }}
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'Torque (kN·m)', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#f59e0b' } }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  label={{ value: 'ROP (m/hr)', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#22d3ee' } }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#0f172a',
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="torque"
                  stroke="#f59e0b"
                  fill="url(#torqueGrad)"
                  strokeWidth={2}
                  dot={{ fill: '#f59e0b', r: 3 }}
                  name="Torque (kN·m)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="rop"
                  stroke="#22d3ee"
                  fill="url(#ropGrad)"
                  strokeWidth={2}
                  dot={{ fill: '#22d3ee', r: 3 }}
                  name="ROP (m/hr)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-amber-400 rounded" />
              Torque — trending upward ↑
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-accent-400 rounded" />
              ROP — gradually decreasing ↓
            </span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          BOTTOM SECTION: Nearby Wells + Recent Alerts
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Nearby Wells ─────────────────────────────────── */}
        <div className="bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader
            title="Nearby Wells"
            subtitle={`${nearbyWells.length} offset wells within 10 km`}
            icon={MapPin}
            action={
              <Link to="/nearby-wells" className="text-xs text-accent-400 hover:text-accent-300 font-medium">
                View All →
              </Link>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {topNearbyWells.map((w) => (
              <WellCard key={w.id} well={w} compact />
            ))}
          </div>

          {nearbyWells.length > 4 && (
            <p className="text-center text-xs text-slate-500 mt-3">
              +{nearbyWells.length - 4} more wells
            </p>
          )}
        </div>

        {/* ── Recent Alerts ────────────────────────────────── */}
        <div className="bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader
            title="Recent Alerts"
            subtitle="Evidence-based proactive alerts"
            icon={Bell}
            action={
              <Link to="/alerts" className="text-xs text-accent-400 hover:text-accent-300 font-medium">
                View All →
              </Link>
            }
          />

          <div className="space-y-2.5">
            {alerts.slice(0, 3).map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                compact
                onClick={() => {}}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          RISK INTELLIGENCE CARDS
          ═══════════════════════════════════════════════════════ */}
      <div>
        <SectionHeader
          title="Active Risk Assessments"
          subtitle="AI-correlated risk intelligence with evidence"
          icon={ShieldAlert}
          action={
            <Link to="/risk" className="text-xs text-accent-400 hover:text-accent-300 font-medium">
              View Risk Intelligence →
            </Link>
          }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topRisks.map((risk) => (
            <RiskSummaryCard key={risk.id} risk={risk} />
          ))}
        </div>
      </div>

      {/* ── Formation Strip ────────────────────────────────── */}
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader
          title="Formation Profile"
          subtitle="Stratigraphy & current position"
          icon={Layers}
        />
        <div className="flex gap-1 h-10 rounded-lg overflow-hidden">
          {formations.map((fm) => {
            const totalRange = formations[formations.length - 1].bottomDepth;
            const widthPct = ((fm.bottomDepth - fm.topDepth) / totalRange) * 100;
            const isCurrent = fm.id === activeWell.formation;
            return (
              <div
                key={fm.id}
                className={`relative group flex items-center justify-center text-[10px] font-semibold transition-all ${
                  isCurrent ? 'ring-2 ring-accent-400 ring-offset-1 ring-offset-navy-950 z-10 rounded' : ''
                }`}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: fm.color,
                  opacity: isCurrent ? 1 : 0.6,
                }}
              >
                <span className="text-white drop-shadow-md">{fm.id}</span>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                  <div className="bg-navy-800 border border-border-default rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                    <p className="text-xs font-semibold text-white">{fm.name}</p>
                    <p className="text-[10px] text-slate-400">{fm.topDepth}–{fm.bottomDepth}m</p>
                    <p className="text-[10px] text-slate-400">{fm.lithology}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Current depth indicator */}
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
          <Drill size={12} className="text-accent-400" />
          <span>
            Currently drilling in <span className="text-white font-semibold">{currentFormation?.name}</span>
            {' '}({currentFormation?.lithology}) at <span className="text-white font-semibold">{activeWell.currentDepth?.toLocaleString()}m</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Helper component for drilling parameter readouts ───────

function ParameterReadout({
  label,
  value,
  unit,
  icon: Icon,
  alert = false,
}: {
  label: string;
  value: string | number;
  unit: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  alert?: boolean;
}) {
  return (
    <div className={`p-2.5 rounded-lg border ${alert ? 'border-amber-500/20 bg-amber-500/5' : 'border-border-subtle bg-navy-800/30'}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={alert ? 'text-amber-400' : 'text-slate-500'} />
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-base font-bold ${alert ? 'text-amber-400' : 'text-white'}`}>{value}</span>
        <span className="text-[10px] text-slate-500">{unit}</span>
      </div>
    </div>
  );
}
