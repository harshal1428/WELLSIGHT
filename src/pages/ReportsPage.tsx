import { useEffect, useMemo, useState } from 'react';
import { Activity, Check, ClipboardList, Download, FileBarChart, FileJson2, FileSpreadsheet, FileText, Printer, Save } from 'lucide-react';
import { useWellContext } from '../hooks/useWellContext';
import { SectionHeader } from '../components/ui';
import { ReportPreview } from '../components/reports/ReportPreview';
import { calculateRiskForType, getHighestRecordedSeverity, RISK_CATEGORIES } from '../utils/riskScoring';

type Notes = { observations: string; notes: string; actions: string; status: string; reviewer: string };
const EMPTY_NOTES: Notes = { observations: '', notes: '', actions: '', status: 'Pending review', reviewer: '' };

export function ReportsPage() {
  const { activeWell, nearbyWells, alerts, importedRecords, reportNotes, updateReportNotes } = useWellContext();
  const [localNotes, setLocalNotes] = useState<Notes>(EMPTY_NOTES);
  const [isSaved, setIsSaved] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState('');
  const offsetWells = useMemo(() => nearbyWells.filter((well) => well.id !== activeWell.id), [activeWell.id, nearbyWells]);
  const calculatedRisks = useMemo(
    () => RISK_CATEGORIES.map((riskType) => calculateRiskForType(riskType, activeWell, offsetWells)),
    [activeWell, offsetWells],
  );
  const historicalCases = useMemo(
    () => Array.from(new Map(calculatedRisks.flatMap((risk) => risk.supportingCases).map((event) => [event.id, event])).values()),
    [calculatedRisks],
  );
  const wellAlerts = alerts.filter((alert) => alert.wellId === activeWell.id);

  useEffect(() => {
    const existing = reportNotes[activeWell.id];
    setLocalNotes(existing ? { ...EMPTY_NOTES, ...existing } : EMPTY_NOTES);
    setIsSaved(Boolean(existing));
  }, [activeWell.id, reportNotes]);

  const persistNotes = () => {
    updateReportNotes(activeWell.id, { wellId: activeWell.id, ...localNotes });
    setIsSaved(true);
  };

  const reportPayload = () => ({
    reportTitle: 'Well Intelligence and Decision Support',
    generatedAt: new Date().toISOString(),
    reportBasis: {
      importedEventCount: importedRecords.length,
      evidenceNote: 'Event counts are historical record totals, not likelihood estimates.',
    },
    activeWell,
    nearbyWells: offsetWells.map((well) => ({ id: well.id, name: well.name, distanceKm: well.distanceFromActiveWell, formation: well.formation, status: well.status })),
    riskSummary: calculatedRisks.map((risk) => ({ riskType: risk.riskType, supportingEventCount: risk.supportingCases.length, highestRecordedSeverity: getHighestRecordedSeverity(risk.supportingCases), comparableWellCount: risk.comparableWellsCount, matchingFactors: risk.factors.filter((factor) => factor.matched).map((factor) => factor.name) })),
    historicalCases,
    alerts: wellAlerts,
    engineerReview: localNotes,
  });

  const download = (format: 'json' | 'csv' | 'md') => {
    persistNotes();
    const payload = reportPayload();
    const date = new Date().toISOString().slice(0, 10);
    const safeId = activeWell.id.replace(/[^a-z0-9-]/gi, '-');
    let content = '';
    let mime = 'text/plain;charset=utf-8';
    let extension = format;

    if (format === 'json') {
      content = JSON.stringify(payload, null, 2);
      mime = 'application/json;charset=utf-8';
    } else if (format === 'csv') {
      const rows: string[][] = [['record_type', 'name', 'description_or_count', 'severity_or_status', 'depth_m', 'formation', 'source']];
      rows.push(['well', activeWell.id, activeWell.name, activeWell.status, String(activeWell.currentDepth || activeWell.totalDepth), activeWell.formation, 'well context']);
      calculatedRisks.forEach((risk) => rows.push(['event_category', risk.riskType, String(risk.supportingCases.length), getHighestRecordedSeverity(risk.supportingCases) || 'No records', '', '', `${risk.comparableWellsCount} offset wells`]));
      historicalCases.forEach((event) => rows.push(['historical_event', event.eventType, event.description, event.severity, String(event.depth), event.formation, event.sourceDocument]));
      wellAlerts.forEach((alert) => rows.push(['alert', alert.title, alert.message, alert.status, alert.depth ? String(alert.depth) : '', alert.formation || '', 'application alert']));
      content = rows.map((row) => row.map((field) => `"${field.replaceAll('"', '""')}"`).join(',')).join('\r\n');
      mime = 'text/csv;charset=utf-8';
    } else {
      content = [
        '# Well Intelligence and Decision Support',
        '',
        `**Well:** ${activeWell.id} — ${activeWell.name}  `,
        `**Generated:** ${new Date().toLocaleString()}  `,
        `**Imported event records:** ${importedRecords.length}`,
        '',
        '> Decision support summary. Historical record counts are not likelihood estimates or operational instructions.',
        '',
        '## Well context',
        `- Depth: ${activeWell.currentDepth || activeWell.totalDepth} m`,
        `- Formation / reservoir: ${activeWell.formation} / ${activeWell.reservoir}`,
        `- Status: ${activeWell.status}`,
        '',
        '## Risk summary',
        '| Event type | Recorded events | Highest recorded severity | Offset wells |',
        '| --- | ---: | --- | ---: |',
        ...calculatedRisks.map((risk) => `| ${risk.riskType} | ${risk.supportingCases.length} | ${getHighestRecordedSeverity(risk.supportingCases) || 'None'} | ${risk.comparableWellsCount} |`),
        '',
        '## Historical cases',
        ...(historicalCases.length ? historicalCases.map((event) => `- **${event.eventType}**, ${event.severity} — ${event.depth} m, ${event.formation}: ${event.description} (source: ${event.sourceDocument})`) : ['No historical cases available.']),
        '',
        '## Engineer review',
        `**Observations:** ${localNotes.observations || 'None recorded'}`,
        `**Notes:** ${localNotes.notes || 'None recorded'}`,
        `**Follow-up actions:** ${localNotes.actions || 'None recorded'}`,
        `**Review status:** ${localNotes.status}${localNotes.reviewer ? ` — ${localNotes.reviewer}` : ''}`,
      ].join('\n');
    }

    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `well-report-${safeId}-${date}.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setDownloadMessage(`${format.toUpperCase()} report downloaded`);
    window.setTimeout(() => setDownloadMessage(''), 3000);
  };

  const printReport = () => {
    persistNotes();
    window.setTimeout(() => window.print(), 100);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-12 space-y-6">
      <style>{`@media print {
        @page { size: A4; margin: 12mm; }
        html, body, #root { height: auto !important; width: auto !important; overflow: visible !important; }
        .app-layout { display: block !important; height: auto !important; width: 100% !important; overflow: visible !important; }
        .app-layout aside, .app-layout .app-header { display: none !important; }
        .app-layout > div, .app-main { display: block !important; width: 100% !important; min-width: 0 !important; height: auto !important; overflow: visible !important; padding: 0 !important; }
        body * { visibility: hidden !important; }
        #report-preview, #report-preview * { visibility: visible !important; }
        #report-preview { position: relative; left: auto; top: auto; width: 100%; max-width: none; margin: 0; box-shadow: none; }
        nav, .print-hide { display: none !important; }
        .report-layout { display: block !important; width: 100% !important; }
        .report-preview-shell, .report-preview-scroll { position: static !important; display: block !important; width: 100% !important; max-height: none !important; height: auto !important; overflow: visible !important; border: 0 !important; padding: 0 !important; background: #fff !important; }
        .report-preview-toolbar { display: none !important; }
      }`}</style>

      <div className="print-hide bg-surface-card border border-border-default rounded-xl p-5">
        <SectionHeader title="Reports & Decision Support" subtitle="Build a clear, traceable well report and export it in the format your team needs." icon={FileBarChart} />
      </div>

      <div className="report-layout grid grid-cols-1 xl:grid-cols-[minmax(320px,0.78fr)_minmax(0,1.22fr)] gap-6 items-start">
        <div className="print-hide space-y-5">
          <section className="bg-surface-card border border-border-default rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4"><ClipboardList className="w-4 h-4 text-accent-500" /><h2 className="text-sm font-semibold text-white">Report contents</h2></div>
            <p className="text-xs text-slate-500 mb-4">This engineering review includes the active well, nearby offsets, historical event counts, cases, alerts, and your review notes.</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Well context', `${activeWell.id} · ${activeWell.formation}`],
                ['Nearby offsets', `${offsetWells.length} wells`],
                ['Risk categories', `${calculatedRisks.length} assessed`],
                ['Historical cases', `${historicalCases.length} events`],
              ].map(([label, value]) => <div key={label} className="rounded-lg bg-navy-900 border border-border-subtle p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p><p className="text-sm font-medium text-white mt-1">{value}</p></div>)}
            </div>
          </section>

          <section className="bg-surface-card border border-border-default rounded-xl p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div><h2 className="text-sm font-semibold text-white">Engineer review</h2><p className="text-xs text-slate-500 mt-1">Add context before exporting.</p></div>
              <button onClick={persistNotes} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border-default text-xs font-medium text-white hover:bg-navy-800"><Save size={14} />{isSaved ? 'Saved' : 'Save notes'}</button>
            </div>
            <div className="space-y-3">
              {([
                ['observations', 'Observations', 'What stands out in the source data?'],
                ['notes', 'Context and limitations', 'Add context, assumptions, or data gaps.'],
                ['actions', 'Follow-up actions', 'Record actions for engineering review.'],
              ] as const).map(([key, label, placeholder]) => <label key={key} className="block"><span className="block text-xs font-medium text-slate-500 mb-1.5">{label}</span><textarea value={localNotes[key]} onChange={(event) => { setLocalNotes({ ...localNotes, [key]: event.target.value }); setIsSaved(false); }} placeholder={placeholder} className="w-full min-h-[76px] resize-y bg-surface-primary border border-border-default rounded-lg p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-accent-500" /></label>)}
              <div className="grid grid-cols-2 gap-3">
                <label><span className="block text-xs font-medium text-slate-500 mb-1.5">Review status</span><select value={localNotes.status} onChange={(event) => { setLocalNotes({ ...localNotes, status: event.target.value }); setIsSaved(false); }} className="w-full bg-surface-primary border border-border-default rounded-lg p-2.5 text-sm text-white"><option>Pending review</option><option>Reviewed</option><option>Further investigation required</option></select></label>
                <label><span className="block text-xs font-medium text-slate-500 mb-1.5">Reviewer</span><input value={localNotes.reviewer} onChange={(event) => { setLocalNotes({ ...localNotes, reviewer: event.target.value }); setIsSaved(false); }} placeholder="Name or initials" className="w-full bg-surface-primary border border-border-default rounded-lg p-2.5 text-sm text-white placeholder:text-slate-500" /></label>
              </div>
            </div>
          </section>

          <section className="bg-surface-card border border-border-default rounded-xl p-5">
            <div className="flex items-center gap-2 mb-1"><Download className="w-4 h-4 text-accent-500" /><h2 className="text-sm font-semibold text-white">Generate report</h2></div>
            <p className="text-xs text-slate-500 mb-4">Choose the format that fits your workflow. Each export includes the report sections shown in the preview.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={printReport} className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-primary p-3 text-left hover:border-accent-500"><Printer size={17} className="text-accent-500" /><span><b className="block text-xs text-white">Print / PDF</b><small className="text-[10px] text-slate-500">Print dialog → save as PDF</small></span></button>
              <button onClick={() => download('csv')} className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-primary p-3 text-left hover:border-accent-500"><FileSpreadsheet size={17} className="text-emerald-600" /><span><b className="block text-xs text-white">CSV</b><small className="text-[10px] text-slate-500">Rows for spreadsheet analysis</small></span></button>
              <button onClick={() => download('json')} className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-primary p-3 text-left hover:border-accent-500"><FileJson2 size={17} className="text-amber-600" /><span><b className="block text-xs text-white">JSON</b><small className="text-[10px] text-slate-500">Structured report data</small></span></button>
              <button onClick={() => download('md')} className="flex items-center gap-3 rounded-lg border border-border-default bg-surface-primary p-3 text-left hover:border-accent-500"><FileText size={17} className="text-violet-600" /><span><b className="block text-xs text-white">Markdown</b><small className="text-[10px] text-slate-500">Readable portable document</small></span></button>
            </div>
            {downloadMessage && <p role="status" className="mt-3 text-xs text-emerald-600 flex items-center gap-1.5"><Check size={14} />{downloadMessage}</p>}
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-start gap-2"><Activity size={14} className="text-slate-500 mt-0.5" /><p className="text-[11px] text-slate-500">Counts show available historical records, not likelihood estimates. Review the underlying evidence before use.</p></div>
          </section>
        </div>

        <section className="report-preview-shell bg-surface-card border border-border-default rounded-xl overflow-hidden xl:sticky xl:top-4">
          <div className="report-preview-toolbar px-5 py-3 border-b border-border-default flex items-center justify-between"><div><h2 className="text-sm font-semibold text-white">Report preview</h2><p className="text-xs text-slate-500 mt-0.5">Well Intelligence and Decision Support</p></div><span className="text-[10px] uppercase tracking-wider text-slate-500">Print layout</span></div>
          <div className="report-preview-scroll p-3 sm:p-5 max-h-[calc(100vh-180px)] overflow-y-auto bg-[#ffffff]">
            <ReportPreview notesOverride={localNotes} />
          </div>
        </section>
      </div>
    </div>
  );
}
