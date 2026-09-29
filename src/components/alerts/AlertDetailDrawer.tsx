import type { Alert } from '../../types';
import { X, Clock, Navigation, BookOpen, Map, CheckCircle2, ShieldAlert } from 'lucide-react';
import { AlertPriorityBadge } from '../ui/Badges';
import { Link } from 'react-router-dom';

interface Props {
  alert: Alert | null;
  onClose: () => void;
  onUpdateStatus: (alertId: string, status: Alert['status']) => void;
}

export function AlertDetailDrawer({ alert, onClose, onUpdateStatus }: Props) {
  if (!alert) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-surface-secondary border-l border-border-default shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      <div className="flex items-center justify-between p-5 border-b border-border-subtle bg-surface-card">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">{alert.title}</h2>
          <div className="flex items-center gap-2">
            <AlertPriorityBadge priority={alert.priority} />
            <span className="text-[10px] text-slate-500 flex items-center gap-1">
              <Clock size={10} /> {new Date(alert.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-navy-800 rounded-lg text-slate-400 hover:text-white transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Status Workflow */}
        <section className="bg-surface-card rounded-lg p-4 border border-border-subtle">
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Workflow Status</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => onUpdateStatus(alert.id, 'NEW')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${alert.status === 'NEW' ? 'bg-navy-700 border-navy-600 text-white' : 'bg-navy-900 border-border-subtle text-slate-400 hover:border-slate-600'}`}
            >
              New
            </button>
            <button 
              onClick={() => onUpdateStatus(alert.id, 'ACKNOWLEDGED')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${alert.status === 'ACKNOWLEDGED' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-navy-900 border-border-subtle text-slate-400 hover:border-slate-600'}`}
            >
              Acknowledged
            </button>
            <button 
              onClick={() => onUpdateStatus(alert.id, 'UNDER_REVIEW')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${alert.status === 'UNDER_REVIEW' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' : 'bg-navy-900 border-border-subtle text-slate-400 hover:border-slate-600'}`}
            >
              Under Review
            </button>
            <button 
              onClick={() => onUpdateStatus(alert.id, 'RESOLVED')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${alert.status === 'RESOLVED' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-navy-900 border-border-subtle text-slate-400 hover:border-slate-600'}`}
            >
              Resolved
            </button>
          </div>
        </section>

        {/* Message and Context */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Alert Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-navy-800/50 p-3 rounded-lg border border-navy-700/50">
            {alert.message}
          </p>
          <div className="flex gap-4 mt-3 px-1 text-xs text-slate-400 font-mono">
            <span>Well: <span className="text-white">{alert.wellId}</span></span>
            <span>Depth: <span className="text-white">{alert.depth}m</span></span>
            <span>Formation: <span className="text-white">{alert.formation}</span></span>
          </div>
        </section>

        {/* Supporting Evidence */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Supporting Evidence</h3>
          <div className="space-y-2 bg-surface-card rounded-lg p-4 border border-border-subtle">
            {alert.evidenceItems && alert.evidenceItems.length > 0 ? (
              alert.evidenceItems.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-300">{item}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 italic">No specific evidence items recorded.</p>
            )}
          </div>
        </section>

        {/* Mitigation */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Historical Mitigation Context</h3>
          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-4">
            {alert.mitigationActions && alert.mitigationActions.length > 0 ? (
              <ul className="space-y-3">
                {alert.mitigationActions.map((action, i) => (
                  <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                    <span className="text-emerald-400 mt-1 shrink-0">→</span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic">Historical response details are not available in this record.</p>
            )}
          </div>
        </section>

        {/* Actions / Links */}
        <section>
          <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Related Investigation</h3>
          <div className="grid grid-cols-2 gap-2">
            <Link to="/risk" className="flex items-center gap-2 p-3 bg-navy-900 border border-border-subtle rounded-lg hover:border-accent-500/50 transition-colors group">
              <ShieldAlert className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">Risk Intelligence</span>
            </Link>
            <Link to="/knowledge" className="flex items-center gap-2 p-3 bg-navy-900 border border-border-subtle rounded-lg hover:border-accent-500/50 transition-colors group">
              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">Knowledge Base</span>
            </Link>
            <Link to="/correlation" className="flex items-center gap-2 p-3 bg-navy-900 border border-border-subtle rounded-lg hover:border-accent-500/50 transition-colors group">
              <Navigation className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">Depth Correlation</span>
            </Link>
            <Link to="/nearby-wells" className="flex items-center gap-2 p-3 bg-navy-900 border border-border-subtle rounded-lg hover:border-accent-500/50 transition-colors group">
              <Map className="w-4 h-4 text-slate-400 group-hover:text-accent-400" />
              <span className="text-xs font-medium text-slate-300 group-hover:text-white">Nearby Wells</span>
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
