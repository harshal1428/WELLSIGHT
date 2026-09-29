import { useMemo, useState } from 'react';
import { MessageSquare, Save } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useWellContext } from '../../hooks/useWellContext';
import { collectCases } from '../../data/intelligenceCasework';
import { IntelligenceFeatureLayout, Panel, SelectField } from '../../components/intelligence/IntelligenceUI';

type FeedbackKind = 'Relevant' | 'Not relevant' | 'Insufficient data' | 'Incorrect';
interface FeedbackRecord { id: string; wellId: string; caseId: string; eventWell: string; category: FeedbackKind; reviewer: string; note: string; timestamp: string }
const STORAGE_KEY = 'nwis.engineer-feedback.v1';
function readRecords(): FeedbackRecord[] { try { const data: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); return Array.isArray(data) ? data as FeedbackRecord[] : []; } catch { return []; } }

export function EngineerFeedbackPage() {
  const { activeWell, nearbyWells } = useWellContext();
  const [searchParams] = useSearchParams();
  const cases = useMemo(() => collectCases([activeWell, ...nearbyWells]), [activeWell, nearbyWells]);
  const [selectedId, setSelectedId] = useState(searchParams.get('eventId') ?? cases[0]?.event.id ?? '');
  const selected = cases.find(({ event }) => event.id === selectedId) ?? cases[0];
  const [category, setCategory] = useState<FeedbackKind>('Relevant');
  const [reviewer, setReviewer] = useState('');
  const [note, setNote] = useState('');
  const [records, setRecords] = useState<FeedbackRecord[]>(readRecords);
  const [status, setStatus] = useState('');
  const submit = () => {
    if (!selected) return;
    const record: FeedbackRecord = { id: crypto.randomUUID?.() ?? `${Date.now()}`, wellId: activeWell.id, caseId: selected.event.id, eventWell: selected.well.id, category, reviewer: reviewer.trim(), note: note.trim(), timestamp: new Date().toISOString() };
    try { const next = [record, ...records]; localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setRecords(next); setNote(''); setStatus('Saved locally. Feedback does not change ranking or safety rules.'); }
    catch { setStatus('Could not save: browser storage is unavailable or full.'); }
  };
  return <IntelligenceFeatureLayout featureId="feedback" title="Engineer Feedback Loop" summary="Record whether a historical case is relevant, misleading, or missing context. Feedback is auditable within this browser only.">
    <Panel title="Review a result" subtitle="Select a historical case, add a category, and optionally identify the reviewer and reason." icon={MessageSquare}>
      <div className="grid gap-3 lg:grid-cols-2"><SelectField label="Historical case" value={selected?.event.id ?? ''} onChange={setSelectedId}>{cases.map(({ well, event }) => <option key={event.id} value={event.id}>{well.id} · {event.eventType} · {event.depth} m</option>)}</SelectField><SelectField label="Feedback category" value={category} onChange={(value) => setCategory(value as FeedbackKind)}>{(['Relevant', 'Not relevant', 'Insufficient data', 'Incorrect'] as FeedbackKind[]).map((value) => <option key={value}>{value}</option>)}</SelectField><label className="text-xs font-medium text-slate-500">Reviewer name or initials (optional)<input value={reviewer} onChange={(event) => setReviewer(event.target.value)} className="mt-1 block w-full rounded-md border border-border-default bg-surface-elevated px-3 py-2 text-sm text-white" placeholder="Initials" /></label><label className="text-xs font-medium text-slate-500">Reason / note (optional)<textarea value={note} onChange={(event) => setNote(event.target.value)} rows={3} className="mt-1 block w-full resize-y rounded-md border border-border-default bg-surface-elevated px-3 py-2 text-sm text-white" placeholder="Explain what should be corrected or reviewed" /></label></div>
      <div className="mt-4 flex flex-wrap items-center gap-3"><button onClick={submit} disabled={!selected} className="inline-flex items-center gap-2 rounded-md bg-accent-600 px-4 py-2 text-xs font-semibold text-white hover:bg-accent-500 disabled:opacity-50"><Save size={14} /> Record feedback</button>{status && <span role="status" className="text-xs text-slate-500">{status}</span>}</div>
    </Panel>
    <Panel title="Audit trail" subtitle={`${records.length} record(s) stored in this browser. Identity is optional and is not authenticated.`}>
      {records.length ? <div className="space-y-2">{records.map((record) => <article key={record.id} className="rounded-lg border border-border-default bg-surface-elevated p-3"><div className="flex flex-wrap justify-between gap-2"><p className="text-xs font-semibold text-white">{record.category} · {record.caseId} · {record.eventWell} → {record.wellId}</p><time className="text-[10px] text-slate-500">{new Date(record.timestamp).toLocaleString()}</time></div>{(record.reviewer || record.note) && <p className="mt-1 text-xs text-slate-500">{record.reviewer && `${record.reviewer} · `}{record.note}</p>}</article>)}</div> : <p className="text-sm text-slate-500">No feedback recorded in this browser.</p>}
    </Panel>
    <div className="rounded-lg border border-border-default bg-surface-card p-4 text-xs text-slate-500">Feedback is stored locally and can be cleared with this browser’s site data. There is no authenticated user or shared server audit log; feedback never auto-trains an operational model.</div>
  </IntelligenceFeatureLayout>;
}
