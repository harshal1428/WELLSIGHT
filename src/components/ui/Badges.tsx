import type { RiskLevel, EventSeverity, AlertPriority, WellStatus } from '../../types';

// ─── Status Badge ───────────────────────────────────────────

interface StatusBadgeProps {
  status: WellStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<WellStatus, { label: string; color: string; bg: string; dot: string }> = {
  DRILLING: { label: 'Drilling', color: 'text-emerald-400', bg: 'bg-emerald-400/10', dot: 'bg-emerald-400' },
  COMPLETED: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-400/10', dot: 'bg-blue-400' },
  SUSPENDED: { label: 'Suspended', color: 'text-amber-400', bg: 'bg-amber-400/10', dot: 'bg-amber-400' },
  PLANNED: { label: 'Planned', color: 'text-slate-400', bg: 'bg-slate-400/10', dot: 'bg-slate-400' },
  ABANDONED: { label: 'Abandoned', color: 'text-red-400', bg: 'bg-red-400/10', dot: 'bg-red-400' },
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${cfg.color} ${cfg.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'DRILLING' ? 'pulse-dot' : ''}`} />
      {cfg.label}
    </span>
  );
}

// ─── Risk Badge ─────────────────────────────────────────────

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const riskConfig: Record<RiskLevel, { label: string; color: string; bg: string; border: string }> = {
  LOW: { label: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/30' },
  MEDIUM: { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  HIGH: { label: 'High', color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/30' },
  CRITICAL: { label: 'Critical', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30' },
};

export function RiskBadge({ level, size = 'md', showLabel = true }: RiskBadgeProps) {
  const cfg = riskConfig[level];
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded font-semibold border ${cfg.color} ${cfg.bg} ${cfg.border} ${sizeClasses}`}>
      {showLabel ? cfg.label : level}
    </span>
  );
}

// ─── Severity Badge ─────────────────────────────────────────

interface SeverityBadgeProps {
  severity: EventSeverity;
  className?: string;
}

export function SeverityBadge({ severity, className = '' }: SeverityBadgeProps) {
  const cfg = riskConfig[severity];
  return (
    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded font-medium ${cfg.color} ${cfg.bg} ${className}`}>
      {severity}
    </span>
  );
}

// ─── Alert Priority Badge ───────────────────────────────────

interface AlertPriorityBadgeProps {
  priority: AlertPriority;
}

const alertConfig: Record<AlertPriority, { color: string; bg: string }> = {
  INFO: { color: 'text-blue-400', bg: 'bg-blue-400/10' },
  WARNING: { color: 'text-amber-400', bg: 'bg-amber-400/10' },
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-400/10' },
};

export function AlertPriorityBadge({ priority }: AlertPriorityBadgeProps) {
  const cfg = alertConfig[priority];
  return (
    <span className={`inline-flex items-center text-[11px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide ${cfg.color} ${cfg.bg}`}>
      {priority}
    </span>
  );
}
