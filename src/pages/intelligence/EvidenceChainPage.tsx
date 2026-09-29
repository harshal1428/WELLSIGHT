import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileSearch } from 'lucide-react';
import { useWellContext } from '../../hooks/useWellContext';
import { collectCases, sourceEvidence } from '../../data/intelligenceCasework';
import { buildCaseDocument, downloadCaseDocument } from '../../data/caseDocuments';
import { EmptyNotice, IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';

export function EvidenceChainPage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const cases = useMemo(() => collectCases([activeWell, ...nearbyWells]), [activeWell, nearbyWells]);
  const eventId = searchParams.get('eventId') ?? cases[0]?.event.id ?? '';
  const selectEvent = (nextEventId: string) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('eventId', nextEventId);
    setSearchParams(nextParams);
  };
  const selected = cases.find(({ event }) => event.id === eventId) ?? cases[0];
  const evidence = selected ? sourceEvidence(selected.event) : null;
  const caseDocument = selected && !evidence?.text ? buildCaseDocument(selected.well, selected.event) : null;
  return <IntelligenceFeatureLayout featureId="evidence" title="Evidence Chain · Show Me Why" summary="Trace the selected comparison from the active well to a historical event and its attached source evidence.">
    <Panel title="Select evidence record" subtitle="Choose a historical case. Source identifiers are not treated as attached documents." icon={FileSearch}><SelectField label="Historical event" value={selected?.event.id ?? ''} onChange={selectEvent}>{cases.map(({ well, event }) => <option key={event.id} value={event.id}>{well.id} · {event.eventType} · {event.depth} m · {event.id}</option>)}</SelectField></Panel>
    {!selected ? <EmptyNotice>No historical evidence records are available for the active well context.</EmptyNotice> : <>
      <Panel title="Why this case is connected" subtitle="Evidence path based on stored project relationships.">
        <ol className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[
          ['CURRENT WELL', `${activeWell.id} · ${activeWell.currentDepth ?? 'Depth unavailable'} m · ${activeWell.formation}`],
          ['COMPARABLE WELL', `${selected.well.id} · ${selected.well.formation} · ${selected.well.distanceFromActiveWell} km stored distance`],
          ['HISTORICAL EVENT', `${selected.event.eventType} · ${selected.event.severity}`],
          ['EVENT DEPTH', `${selected.event.depth.toLocaleString()} m · ${selected.event.formation}`],
          ['SOURCE REFERENCE', evidence?.reference ?? 'Unavailable'],
          ['ORIGINAL EXCERPT', evidence?.text ? 'Attached extracted text' : 'Unavailable'],
        ].map(([label, value], index) => <li key={label} className="relative rounded-lg border border-border-default bg-surface-elevated p-4"><span className="absolute right-3 top-3 text-[10px] font-bold text-accent-600">STEP {index + 1}</span><p className="text-[10px] font-bold tracking-widest text-slate-500">{label}</p><p className="mt-2 pr-12 text-sm font-medium text-white">{value}</p></li>)}</ol>
        <div className="mt-4 rounded-lg border border-border-default bg-surface-card p-4"><p className="text-xs font-semibold text-white">Selection reasons</p><ul className="mt-2 list-inside list-disc space-y-1 text-xs text-slate-500"><li>{selected.well.formation === activeWell.formation ? `Same formation code (${activeWell.formation})` : `Different formation codes (${activeWell.formation} vs ${selected.well.formation})`}</li><li>{Math.abs(selected.event.depth - (activeWell.currentDepth ?? 0))} m between event and active well depth</li><li>{selected.well.distanceFromActiveWell} km recorded distance</li><li>Historical event exists in the selected well record</li></ul></div>
      </Panel>
      <Panel title={evidence?.text ? 'Attached source evidence' : 'Case record summary'} subtitle="Review the stored case details and source availability.">
        {evidence?.text ? <div className="space-y-2"><div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500"><span>File: {evidence.filename ?? 'Not provided'}</span><span>Extraction: {evidence.method ?? 'Not provided'}</span><span>Page / record: Not provided</span><span>Verification: Not independently verified</span></div><blockquote className="whitespace-pre-wrap rounded-lg border border-border-default bg-surface-elevated p-4 text-sm leading-relaxed text-white">{evidence.text}</blockquote></div> : caseDocument && <div className="rounded-lg border border-amber-300/40 bg-amber-500/5 p-4 text-sm text-white">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-semibold text-amber-300">Case record summary · {caseDocument.reference}</p><p className="mt-1 text-xs text-slate-400">Built from stored case details; the original report is not attached and these details are not independently verified.</p></div><button type="button" onClick={() => downloadCaseDocument(caseDocument)} className="rounded-md border border-border-default px-3 py-2 text-xs font-semibold text-white hover:border-accent-500">Download .txt</button></div>
          <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2"><span>Type: {caseDocument.kind}</span><span>Well: {selected.well.id}</span><span>Record locator: {selected.event.id}</span><span>Page number: Not available</span></div>
          <pre className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg border border-border-default bg-surface-elevated p-4 font-sans text-sm leading-relaxed text-white">{caseDocument.content}</pre>
        </div>}
      </Panel>
    </>}
  </IntelligenceFeatureLayout>;
}
