import type { DrillingEvent, Well } from '../types';

export interface WellCase {
  well: Well;
  event: DrillingEvent;
}

export function collectCases(wells: Well[]): WellCase[] {
  return wells.flatMap((well) => well.historicalEvents.map((event) => ({ well, event })));
}

export function qualitativeMatch(match: boolean | null): string {
  if (match === null) return 'Unavailable';
  return match ? 'Match' : 'No match';
}

export function sourceEvidence(event: DrillingEvent) {
  const text = event.sourceMetadata?.extractedText?.trim();
  return {
    text: text || null,
    filename: event.sourceMetadata?.filename || null,
    method: event.sourceMetadata?.extractionMethod || null,
    reference: event.sourceDocument || null,
    verified: false,
  };
}
