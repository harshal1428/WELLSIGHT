import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from 'recharts';
import type { CalculatedRisk } from '../../utils/riskScoring';

interface Props {
  risks: CalculatedRisk[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#06b6d4', '#6366f1', '#94a3b8', '#22c55e'];
export function RiskAnalyticsCharts({ risks }: Props) {
  const { categoryData, eventData, totalCases } = useMemo(() => {
    const categories = risks.map((risk) => ({
      name: risk.riskType,
      events: risk.supportingCases.length,
    }));
    const uniqueEvents = Array.from(new Map(risks.flatMap((risk) => risk.supportingCases).map((event) => [event.id, event])).values());
    const counts = new Map<string, number>();
    uniqueEvents.forEach((event) => counts.set(event.severity, (counts.get(event.severity) || 0) + 1));
    const events = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((severity) => ({ name: severity, value: counts.get(severity) || 0 })).filter((item) => item.value > 0);
    return { categoryData: categories, eventData: events, totalCases: uniqueEvents.length };
  }, [risks]);

  return (
    <section className="grid grid-cols-1 xl:grid-cols-2 gap-4" aria-label="Risk analytics">
      <div className="bg-surface-card border border-border-default rounded-xl p-5 min-w-0">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recorded events by category</h3>
            <p className="text-xs text-slate-500 mt-1">Count of matching historical records</p>
          </div>
          <span className="text-xs text-slate-500">Events</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData} layout="vertical" margin={{ top: 0, right: 18, bottom: 0, left: 6 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={102} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} formatter={(value) => [value, 'Recorded events']} />
              <Bar dataKey="events" radius={[0, 5, 5, 0]} barSize={15}>
                {categoryData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-slate-500 mt-2">Counts show matching records only.</p>
      </div>

      <div className="bg-surface-card border border-border-default rounded-xl p-5 min-w-0">
        <div className="mb-4">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Historical case mix</h3>
          <p className="text-xs text-slate-500 mt-1">Unique event records grouped by recorded severity</p>
        </div>
        {totalCases === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm text-slate-500">No supporting cases available.</div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-full sm:w-1/2 h-56 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={eventData} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={3} stroke="none">
                    {eventData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">{totalCases}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500">events</span>
              </div>
            </div>
            <div className="w-full sm:w-1/2 space-y-2">
              {eventData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 min-w-0 text-slate-400">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="truncate">{entry.name}</span>
                  </span>
                  <span className="font-semibold text-white tabular-nums">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
