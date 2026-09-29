import { AlertTriangle, Info, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { AlertPriorityBadge } from '../ui/Badges';
import type { Alert } from '../../types';

interface AlertCardProps {
  alert: Alert;
  onClick: (alert: Alert) => void;
  compact?: boolean;
}

const priorityIcon = {
  CRITICAL: AlertCircle,
  WARNING: AlertTriangle,
  INFO: Info,
};

const priorityBorder = {
  CRITICAL: 'border-l-red-500',
  WARNING: 'border-l-amber-500',
  INFO: 'border-l-blue-500',
};

const statusColors = {
  NEW: 'bg-navy-800 text-white border-navy-700',
  ACKNOWLEDGED: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  UNDER_REVIEW: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  RESOLVED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

export function AlertCard({ alert, onClick, compact = false }: AlertCardProps) {
  const Icon = priorityIcon[alert.priority];

  if (compact) {
    return (
      <div onClick={() => onClick(alert)} className={`bg-surface-card border border-border-default border-l-2 ${priorityBorder[alert.priority]} rounded-lg p-3 cursor-pointer hover:border-accent-500/50 transition-colors`}>
        <div className="flex items-start gap-2.5">
          <Icon size={14} className={
            alert.priority === 'CRITICAL' ? 'text-red-400 mt-0.5' :
            alert.priority === 'WARNING' ? 'text-amber-400 mt-0.5' : 'text-blue-400 mt-0.5'
          } />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold text-white truncate">{alert.title}</p>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{alert.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(alert)}
      className={`bg-surface-card border border-border-default border-l-4 ${priorityBorder[alert.priority]} rounded-xl overflow-hidden cursor-pointer hover:bg-navy-900 transition-colors group`}
    >
      <div className="p-5 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            alert.priority === 'CRITICAL' ? 'bg-red-500/10' :
            alert.priority === 'WARNING' ? 'bg-amber-500/10' : 'bg-blue-500/10'
          }`}>
            <Icon size={20} className={
              alert.priority === 'CRITICAL' ? 'text-red-400' :
              alert.priority === 'WARNING' ? 'text-amber-400' : 'text-blue-400'
            } />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-base font-semibold text-white group-hover:text-accent-300 transition-colors">{alert.title}</h3>
              <AlertPriorityBadge priority={alert.priority} />
            </div>
            <p className="text-sm text-slate-400 line-clamp-2 max-w-3xl">{alert.message}</p>
            
            <div className="flex items-center gap-4 mt-3">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${statusColors[alert.status]}`}>
                {alert.status.replace('_', ' ')}
              </span>
              <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                <Clock size={12} /> {formatTimestamp(alert.timestamp)}
              </span>
              {alert.depth && (
                <span className="text-[11px] text-slate-500 font-mono">Depth: {alert.depth.toLocaleString()}m</span>
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-2">
          <span className="text-[10px] text-slate-500 font-mono">ID: {alert.id.split('-').slice(-2).join('-')}</span>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-accent-400 transition-colors mt-2" />
        </div>
      </div>
    </div>
  );
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
