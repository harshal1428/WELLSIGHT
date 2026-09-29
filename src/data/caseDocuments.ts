import type { DrillingEvent, Well } from '../types';

export interface CaseDocument {
  reference: string;
  title: string;
  kind: string;
  well: Well;
  events: DrillingEvent[];
  content: string;
}

function documentKind(reference: string): string {
  if (reference.startsWith('WR-')) return 'Well Record';
  if (reference.startsWith('DL-')) return 'Drilling Log';
  if (reference.startsWith('IR-')) return 'Incident Record';
  return 'Historical Drilling Record';
}

export function buildCaseDocument(well: Well, event: DrillingEvent): CaseDocument {
  const reference = event.sourceDocument || `SEED-${event.id}`;
  const kind = documentKind(reference);
  const content = [
    'WELLSIGHT CASE RECORD SUMMARY',
    'Prepared from the case details stored in this application. This is not an original field report or verified operational evidence.',
    '',
    `Document reference: ${reference}`,
    `Document type: ${kind}`,
    `Well: ${well.id} — ${well.name}`,
    `Record locator: ${event.id}`,
    `Recorded date: ${new Date(event.timestamp).toISOString()}`,
    `Event: ${event.eventType}`,
    `Severity: ${event.severity}`,
    `Depth: ${event.depth} m`,
    `Formation: ${event.formation}`,
    '',
    'Recorded description',
    event.description,
    '',
    'Recorded response (not an instruction)',
    event.mitigation,
    '',
    'Source status: Original file, page number, and external source passage are not attached. This summary is not independently verified.',
  ].join('\n');
  return { reference, title: `${kind} · ${reference}`, kind, well, events: [event], content };
}

export function downloadCaseDocument(document: CaseDocument): void {
  const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = `${document.reference.replace(/[^a-zA-Z0-9._-]/g, '_')}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
