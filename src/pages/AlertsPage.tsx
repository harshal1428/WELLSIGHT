import { useState } from 'react';
import { Bell, Filter } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { AlertCard } from '../components/alerts/AlertCard';
import { AlertDetailDrawer } from '../components/alerts/AlertDetailDrawer';
import type { Alert } from '../types';

export function AlertsPage() {
  const { alerts, updateAlertStatus } = useWellContext();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, NEW, ACKNOWLEDGED, UNDER_REVIEW, RESOLVED

  // Notice for Phase 6 Prototype
  const disclaimer = (
    <div className="bg-navy-800/80 border border-navy-700 rounded-lg p-3 text-xs text-slate-400 text-center mb-6">
      <strong>Notice:</strong> Prototype alerts — simulated decision-support data; not confirmed incidents or live operational notifications.
    </div>
  );

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter === 'ALL') return true;
    return a.status === statusFilter;
  });

  // Sort by priority then by timestamp (newest first)
  const priorityWeight = { CRITICAL: 3, WARNING: 2, INFO: 1 };
  filteredAlerts.sort((a, b) => {
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const handleUpdateStatus = (alertId: string, status: Alert['status']) => {
    updateAlertStatus(alertId, status);
    if (selectedAlert && selectedAlert.id === alertId) {
      setSelectedAlert({ ...selectedAlert, status, acknowledged: status !== 'NEW' });
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto pb-12 relative">
      <div className="bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader
          title="Proactive Alerts"
          subtitle={`${alerts.filter((a) => a.status === 'NEW').length} new alerts requiring attention`}
          icon={Bell}
        />
      </div>

      {disclaimer}

      {/* Filters and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface-card border border-border-default rounded-xl p-5">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Total</span>
            <span className="text-xl font-bold text-white">{alerts.length}</span>
          </div>
          <div className="w-px bg-border-subtle"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">New</span>
            <span className="text-xl font-bold text-red-400">{alerts.filter(a => a.status === 'NEW').length}</span>
          </div>
          <div className="w-px bg-border-subtle"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">In Review</span>
            <span className="text-xl font-bold text-blue-400">{alerts.filter(a => a.status === 'UNDER_REVIEW').length}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-900 border border-border-default text-sm text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="NEW">New</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onClick={setSelectedAlert}
            />
          ))
        ) : (
          <div className="bg-surface-card border border-border-default rounded-xl p-12 text-center">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No alerts found</h3>
            <p className="text-sm text-slate-400">There are no alerts matching your current filters.</p>
          </div>
        )}
      </div>

      <AlertDetailDrawer 
        alert={selectedAlert} 
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
