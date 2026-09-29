import { useState, useEffect } from 'react';
import { FileBarChart, Printer, Save, CheckCircle2 } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { ReportPreview } from '../components/reports/ReportPreview';

export function ReportsPage() {
  const { activeWell, reportNotes, updateReportNotes } = useWellContext();
  
  // Local state for the form so we don't update context on every keystroke
  const [localNotes, setLocalNotes] = useState({
    observations: '',
    notes: '',
    actions: '',
    status: 'Pending review',
    reviewer: ''
  });

  const [isSaved, setIsSaved] = useState(false);

  // Sync with context when active well changes
  useEffect(() => {
    const existing = reportNotes[activeWell.id];
    if (existing) {
      setLocalNotes({
        observations: existing.observations || '',
        notes: existing.notes || '',
        actions: existing.actions || '',
        status: existing.status || 'Pending review',
        reviewer: existing.reviewer || ''
      });
    } else {
      setLocalNotes({
        observations: '',
        notes: '',
        actions: '',
        status: 'Pending review',
        reviewer: ''
      });
    }
    setIsSaved(false);
  }, [activeWell.id, reportNotes]);

  const handleSave = () => {
    updateReportNotes(activeWell.id, {
      wellId: activeWell.id,
      ...localNotes
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePrint = () => {
    // Before printing, save notes to context so Preview gets them
    updateReportNotes(activeWell.id, {
      wellId: activeWell.id,
      ...localNotes
    });
    // Add a tiny delay so React renders the updated context into the Preview
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return (
    <div className="max-w-[1200px] mx-auto pb-12">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #report-preview, #report-preview * {
              visibility: visible;
            }
            #report-preview {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            /* Hide the rest of the layout */
            .sidebar, header, nav, .print-hide {
              display: none !important;
            }
          }
        `}
      </style>

      {/* Screen only elements */}
      <div className="space-y-6 print-hide">
        <div className="bg-surface-card border border-border-default rounded-xl p-5">
          <SectionHeader
            title="Reports & Decision Support"
            subtitle="Compile and export structured intelligence summaries."
            icon={FileBarChart}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Col: Controls & Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Report Context</h3>
              <div className="p-3 bg-navy-900 border border-border-subtle rounded-lg flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-slate-500 block mb-1">Active Well</span>
                  <span className="text-sm font-bold text-white">{activeWell.id}</span>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] rounded font-medium uppercase tracking-wider">
                  Data Synced
                </span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-navy-900 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Printer size={16} />
                  Print / PDF
                </button>
              </div>
            </div>

            <div className="bg-surface-card border border-border-default rounded-xl p-5">
              <h3 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-4">Engineer Review Notes</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Observations</label>
                  <textarea 
                    value={localNotes.observations}
                    onChange={e => setLocalNotes({...localNotes, observations: e.target.value})}
                    className="w-full bg-navy-900 border border-border-subtle rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors min-h-[80px]"
                    placeholder="Enter key observations from historical data..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">General Notes</label>
                  <textarea 
                    value={localNotes.notes}
                    onChange={e => setLocalNotes({...localNotes, notes: e.target.value})}
                    className="w-full bg-navy-900 border border-border-subtle rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors min-h-[80px]"
                    placeholder="Enter additional contextual notes..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Follow-up Actions</label>
                  <textarea 
                    value={localNotes.actions}
                    onChange={e => setLocalNotes({...localNotes, actions: e.target.value})}
                    className="w-full bg-navy-900 border border-border-subtle rounded-lg p-3 text-sm text-white focus:outline-none focus:border-accent-500 transition-colors min-h-[80px]"
                    placeholder="E.g., Monitor torque, prepare LCM..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Review Status</label>
                    <select 
                      value={localNotes.status}
                      onChange={e => setLocalNotes({...localNotes, status: e.target.value})}
                      className="w-full bg-navy-900 border border-border-subtle rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-accent-500"
                    >
                      <option value="Pending review">Pending review</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Further investigation required">Further investigation</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Reviewer Name/Initials</label>
                    <input 
                      type="text"
                      value={localNotes.reviewer}
                      onChange={e => setLocalNotes({...localNotes, reviewer: e.target.value})}
                      className="w-full bg-navy-900 border border-border-subtle rounded-lg p-2.5 text-sm text-white focus:outline-none focus:border-accent-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                  {isSaved ? (
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 size={14} /> Saved
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Unsaved changes</span>
                  )}
                  
                  <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-navy-800 hover:bg-navy-700 text-white border border-border-subtle px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    <Save size={16} />
                    Apply to Report
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* Right Col: Preview */}
          <div className="lg:col-span-7 bg-navy-900 rounded-xl overflow-hidden border border-border-default h-full relative group">
            {/* Dark mode overlay covering the bright white report in the UI slightly */}
            <div className="absolute top-0 left-0 right-0 bg-surface-card border-b border-border-default px-4 py-2 flex items-center justify-between z-10 shadow-sm">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Live Preview (A4/Letter)</span>
            </div>
            
            <div className="p-4 pt-12 max-h-[800px] overflow-y-auto bg-slate-200 custom-scrollbar">
              <ReportPreview />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
