import type { LucideIcon } from 'lucide-react';
import { Compass, History, FileSearch, Database, MessageSquare, Fingerprint, Map, GitBranch, ShieldAlert, GitCompareArrows } from 'lucide-react';

export interface IntelligenceFeature {
  id: string;
  title: string;
  summary: string;
  route: string;
  icon: LucideIcon;
  group: string;
}

export const intelligenceFeatures: IntelligenceFeature[] = [
  { id: 'offsets', title: 'Explainable Offset Intelligence', summary: 'See why each offset is relevant across distance, formation, depth, event context, and evidence.', route: '/intelligence/offsets', icon: Compass, group: 'Compare' },
  { id: 'timeline', title: 'Depth-Based Historical Timeline', summary: 'Align historical event records around a selected comparison depth and filter the cases.', route: '/intelligence/timeline', icon: History, group: 'Explore' },
  { id: 'evidence', title: 'Evidence Chain · Show Me Why', summary: 'Trace an insight to the well, event, source reference, and attached extracted text.', route: '/intelligence/evidence', icon: FileSearch, group: 'Trace' },
  { id: 'quality', title: 'Data Quality & Confidence', summary: 'Inspect field completeness, source, freshness, evidence quality, and uncertainty.', route: '/intelligence/quality', icon: Database, group: 'Trust' },
  { id: 'feedback', title: 'Engineer Feedback Loop', summary: 'Record a relevance decision and reviewer note for a selected historical case.', route: '/intelligence/feedback', icon: MessageSquare, group: 'Review' },
  { id: 'fingerprint', title: 'Historical Case Fingerprint', summary: 'Compare one historical case using explicit qualitative factors and available evidence.', route: '/intelligence/fingerprint', icon: Fingerprint, group: 'Compare' },
  { id: 'shadow-well', title: 'Historical Projection · Shadow Well', summary: 'Compare stored well locations and historical context on the existing well map.', route: '/intelligence/shadow-well', icon: Map, group: 'Explore' },
  { id: 'graph', title: 'Knowledge Graph', summary: 'Explore connected well, formation, depth, event, report, and evidence records.', route: '/intelligence/graph', icon: GitBranch, group: 'Explore' },
  { id: 'warnings', title: 'Contextual Early Warning', summary: 'Review changing scenario indicators beside historical context and data quality.', route: '/intelligence/warnings', icon: ShieldAlert, group: 'Review' },
  { id: 'counterfactual', title: 'Counterfactual Historical Comparison', summary: 'Compare event records with wells that have no event recorded in the selected interval.', route: '/intelligence/counterfactual', icon: GitCompareArrows, group: 'Compare' },
];
