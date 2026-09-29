import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

// ─── Metric Card ────────────────────────────────────────────

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  accent?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

const accentMap = {
  default: 'border-navy-600',
  success: 'border-emerald-500/40',
  warning: 'border-amber-500/40',
  danger: 'border-red-500/40',
  info: 'border-blue-500/40',
};

const accentIconBg = {
  default: 'bg-navy-600/50 text-navy-200',
  success: 'bg-emerald-500/10 text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-400',
  danger: 'bg-red-500/10 text-red-400',
  info: 'bg-blue-500/10 text-blue-400',
};

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  trendValue,
  accent = 'default',
  className = '',
}: MetricCardProps) {
  return (
    <div
      className={`bg-surface-card border ${accentMap[accent]} rounded-lg p-4 flex flex-col gap-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`w-7 h-7 rounded-md flex items-center justify-center ${accentIconBg[accent]}`}>
            <Icon size={14} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-white leading-none">{value}</span>
        {unit && <span className="text-sm text-slate-400 font-medium">{unit}</span>}
      </div>
      {trend && trendValue && (
        <div className="flex items-center gap-1 text-xs">
          <span
            className={
              trend === 'up'
                ? 'text-red-400'
                : trend === 'down'
                ? 'text-emerald-400'
                : 'text-slate-400'
            }
          >
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Section Header ─────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: ReactNode;
}

export function SectionHeader({ title, subtitle, icon: Icon, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-accent-500/10 flex items-center justify-center">
            <Icon size={16} className="text-accent-500" />
          </div>
        )}
        <div>
          <h2 className="text-base font-semibold text-white">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-navy-700 flex items-center justify-center mb-4">
        <Icon size={24} className="text-navy-400" />
      </div>
      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-xs">{description}</p>
    </div>
  );
}

// ─── Loading State ──────────────────────────────────────────

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin mb-4" />
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}
