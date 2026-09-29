import { X, ShieldAlert, GitCommit, FileText } from 'lucide-react';
import type { DrillingEvent, Well } from '../../types';
import { SeverityBadge } from '../ui/Badges';

interface HistoricalCaseDrawerProps {
  event: DrillingEvent;
  well: Well;
  relatedCases: { event: DrillingEvent, well: Well, relevanceScore: number }[];
  onClose: () => void;
  onOpenCase: (ev: DrillingEvent, w: Well) => void;
}

export function HistoricalCaseDrawer({ event, well, relatedCases, onClose, onOpenCase }: HistoricalCaseDrawerProps) {
  const depthRange = `${event.depth} - ${event.depth + (event.durationHours ? event.durationHours * 2 : 20)}m`;

  return (
    <div className="fixed inset-y-0 right-0 w-[500px] bg-surface-secondary border-l border-border-default shadow-2xl z-50 flex flex-col transform transition-transform duration-300">
      
      {/* Header */}
      <div className="p-5 border-b border-border-default bg-navy-900 flex justify-between items-center shrink-0">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Historical Case</p>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-500" />
            {event.eventType}
          </h2>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-white hover:bg-navy-800 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 text-sm">
        
        {/* Case Overview */}
        <div className="grid grid-cols-2 gap-4">
          <DetailItem label="Well" value={well.id} />
          <DetailItem label="Depth" value={depthRange} />
          <DetailItem label="Formation" value={event.formation} />
          <DetailItem label="Reservoir" value={well.reservoir} />
          <DetailItem label="Distance" value={`${well.distanceFromActiveWell} km`} />
          <DetailItem label="Severity" value={<SeverityBadge severity={event.severity} />} />
          <div className="col-span-2 text-[10px] text-slate-500 text-right italic">
            Synthetic historical record • {new Date(event.timestamp).toLocaleDateString()}
          </div>
        </div>

        {/* Case Description */}
        <div>
           <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Case Description</h3>
           <p className="text-slate-300 leading-relaxed bg-navy-900 p-4 rounded-lg border border-border-subtle">
             {event.description}
           </p>
           <p className="text-[10px] text-slate-500 mt-2 italic">Synthetic historical case</p>
        </div>

        {/* Historical Mitigation */}
        <div>
           <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
             <ShieldAlert size={14} /> Historical Mitigation
           </h3>
           <div className="bg-emerald-950/20 p-4 rounded-lg border border-emerald-900/50">
             <p className="text-emerald-100/80 leading-relaxed">
               {event.mitigation}
             </p>
             <p className="text-[10px] text-emerald-500/60 mt-3 italic">
               Operational response documented in the synthetic historical case.
             </p>
           </div>
        </div>

        {/* Evidence Section */}
        <div>
           <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
             <FileText size={14} /> Historical Evidence
           </h3>
           <div className="bg-navy-900 rounded-lg border border-border-subtle p-4">
             <div className="grid grid-cols-2 gap-4 text-xs mb-4">
               <div><span className="text-slate-500">Source Document:</span> <span className="text-accent-400">{event.sourceMetadata ? event.sourceMetadata.filename : event.sourceDocument}</span></div>
               <div><span className="text-slate-500">Document Type:</span> <span className="text-white">{event.sourceMetadata ? event.sourceMetadata.extractionMethod : 'DDR'}</span></div>
               <div><span className="text-slate-500">Referenced Well:</span> <span className="text-white">{event.wellId || well.id}</span></div>
               <div><span className="text-slate-500">Depth Interval:</span> <span className="text-white">{depthRange}</span></div>
               <div><span className="text-slate-500">Extracted Event:</span> <span className="text-white">{event.eventType}</span></div>
               <div><span className="text-slate-500">Confidence:</span> <span className="text-accent-400">Prototype extraction</span></div>
             </div>

             {/* Document Preview Area */}
             <div className="bg-navy-950 p-4 rounded border border-border-default font-mono text-[11px] text-slate-400 leading-relaxed relative overflow-hidden h-48 overflow-y-auto whitespace-pre-wrap">
                <div className="absolute top-0 right-0 p-1 bg-navy-800 text-[9px] text-slate-500 rounded-bl">{event.sourceMetadata ? 'Imported Source Text' : 'Synthetic Demo Document'}</div>
                {event.sourceMetadata ? (
                  <p>{event.sourceMetadata.extractedText}</p>
                ) : (
                  <>
                    <p className="text-center mb-3">-----------------------------------------<br/>HISTORICAL DRILLING RECORD<br/>-----------------------------------------</p>
                    <p>Well: {well.id}</p>
                    <p>Formation: {event.formation}</p>
                    <p>Depth: {depthRange}</p>
                    <br/>
                    <p>EVENT:</p>
                    <p className="text-white">{event.eventType}</p>
                    <br/>
                    <p>OBSERVATION:</p>
                    <p className="text-white">{event.description}</p>
                    <br/>
                    <p>HISTORICAL RESPONSE:</p>
                    <p className="text-white">Operational response documented.</p>
                    <p className="text-center mt-3">-----------------------------------------</p>
                  </>
                )}
             </div>
           </div>
        </div>

        {/* Related Cases */}
        {relatedCases.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <GitCommit size={14} /> Related Historical Cases
            </h3>
            <div className="space-y-3">
              {relatedCases.slice(0, 3).map((rc, i) => (
                <div 
                  key={i} 
                  onClick={() => onOpenCase(rc.event, rc.well)}
                  className="bg-navy-900 border border-border-subtle p-3 rounded-lg flex items-center justify-between cursor-pointer hover:border-accent-500/50 hover:bg-navy-800 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">{rc.well.id}</p>
                    <p className="text-xs text-slate-400">{rc.event.eventType} • {rc.event.depth}m</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500">Prototype Relevance</p>
                    <p className="text-sm font-bold text-accent-400">{rc.relevanceScore}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <div className="text-sm font-medium text-white">{value}</div>
    </div>
  );
}
