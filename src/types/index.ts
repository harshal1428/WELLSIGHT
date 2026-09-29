// ============================================================
// TypeScript type definitions for WELLSIGHT
// ============================================================

export type WellStatus = 'DRILLING' | 'COMPLETED' | 'SUSPENDED' | 'PLANNED' | 'ABANDONED';

export type EventSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AlertPriority = 'INFO' | 'WARNING' | 'CRITICAL';

export type FormationId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5';

export type ReservoirId = 'R1' | 'R2' | 'R3';

export type EventType =
  | 'Mud Loss'
  | 'Stuck Pipe'
  | 'Kick'
  | 'Torque Spike'
  | 'Cementing Issue'
  | 'Fishing'
  | 'NPT';

export interface Well {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distanceFromActiveWell: number; // km
  totalDepth: number;            // meters
  currentDepth?: number;         // meters (for active wells)
  formation: FormationId;
  reservoir?: ReservoirId;
  status: WellStatus;
  drillingDate: string;          // ISO date
  spudDate: string;              // ISO date
  historicalEvents: DrillingEvent[];
  relevanceScore: number;        // 0–100
  isUnresolved?: boolean;
}

export interface DrillingEvent {
  id: string;
  wellId?: string;
  eventType: EventType;
  depth: number;                 // meters
  formation: FormationId;
  severity: EventSeverity;
  description: string;
  mitigation: string;
  sourceDocument: string;
  timestamp: string;             // ISO date
  durationHours?: number;
  sourceMetadata?: {
    filename: string;
    extractedText: string;
    extractionMethod: 'CSV' | 'JSON' | 'PDF Text' | 'Sample Data';
    importTimestamp: string;
  };
}

export interface DrillingParameters {
  depth: number;                 // meters
  rop: number;                   // m/hr  (Rate of Penetration)
  wob: number;                   // klbs  (Weight on Bit)
  rpm: number;                   // RPM
  torque: number;                // kN·m
  mudFlow: number;               // L/min
  mudWeight: number;             // ppg   (pounds per gallon)
  pressure: number;              // psi
  ecd: number;                   // ppg   (Equivalent Circulating Density)
  hookLoad: number;              // klbs
  timestamp: string;             // ISO date
}

export interface RiskAssessment {
  id: string;
  riskLevel: RiskLevel;
  riskType: string;
  description: string;
  evidenceItems: string[];
  mitigationActions: string[];
  affectedDepthRange: [number, number]; // [startDepth, endDepth]
  formation: FormationId;
  confidence: number;            // 0–100
  matchingWells: string[];       // well IDs
  timestamp: string;
}

export type AlertStatus = 'NEW' | 'ACKNOWLEDGED' | 'UNDER_REVIEW' | 'RESOLVED';

export interface Alert {
  id: string;
  title: string;
  message: string;
  priority: AlertPriority;
  riskAssessment?: RiskAssessment;
  wellId: string;
  depth?: number;
  formation?: FormationId;
  timestamp: string;
  acknowledged: boolean; // Kept for legacy components
  status: AlertStatus;   // Phase 6 status
  evidenceItems?: string[];
  mitigationActions?: string[];
}

export interface HistoricalCase {
  id: string;
  wellId: string;
  wellName: string;
  eventType: EventType;
  depth: number;
  formation: FormationId;
  description: string;
  mitigation: string;
  outcome: string;
  sourceDocument: string;
  lessons: string[];
  similarity: number;            // 0–100
}

export interface Document {
  id: string;
  title: string;
  type: 'Well Report' | 'Drilling Log' | 'Incident Report' | 'Formation Report' | 'Mud Report';
  wellId: string;
  date: string;
  summary: string;
  tags: string[];
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

export interface ActiveWellContext {
  well: Well;
  currentParameters: DrillingParameters;
  risks: RiskAssessment[];
  alerts: Alert[];
}
