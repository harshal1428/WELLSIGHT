// ============================================================
// Mock Data — Synthetic Demo Wells for eRTMAC-NWIS
// ============================================================
// NOTE: All data is SYNTHETIC. No real OIL data is used.

import type {
  Well,
  DrillingParameters,
  RiskAssessment,
  Alert,
  DrillingEvent,
} from '../types';

// ─── Active Well ────────────────────────────────────────────

export const activeWell: Well = {
  id: 'OIL-X23',
  name: 'OIL-X23 — Assam Basin',
  latitude: 26.7509,
  longitude: 94.2037,
  distanceFromActiveWell: 0,
  totalDepth: 4200,
  currentDepth: 3180,
  formation: 'F3',
  reservoir: 'R1',
  status: 'DRILLING',
  drillingDate: '2026-09-10',
  spudDate: '2026-08-15',
  historicalEvents: [],
  relevanceScore: 100,
};

// ─── Current Drilling Parameters ────────────────────────────

export const currentDrillingParameters: DrillingParameters = {
  depth: 3180,
  rop: 12.4,
  wob: 18.5,
  rpm: 120,
  torque: 14.2,
  mudFlow: 850,
  mudWeight: 10.8,
  pressure: 3420,
  ecd: 11.3,
  hookLoad: 185,
  timestamp: '2026-09-26T02:45:00Z',
};

// ─── Helper: Create Drilling Events ─────────────────────────

function makeEvent(
  id: string,
  eventType: DrillingEvent['eventType'],
  depth: number,
  formation: DrillingEvent['formation'],
  severity: DrillingEvent['severity'],
  description: string,
  mitigation: string,
  sourceDocument: string,
  timestamp: string,
  durationHours?: number,
): DrillingEvent {
  return { id, eventType, depth, formation, severity, description, mitigation, sourceDocument, timestamp, durationHours };
}

// ─── Nearby / Historical Wells ──────────────────────────────

export const nearbyWells: Well[] = [
  {
    id: 'OIL-X11',
    name: 'OIL-X11 — Geleki Field',
    latitude: 26.7312,
    longitude: 94.1893,
    distanceFromActiveWell: 2.4,
    totalDepth: 3850,
    formation: 'F3',
    reservoir: 'R1',
    status: 'COMPLETED',
    drillingDate: '2024-03-15',
    spudDate: '2024-01-10',
    historicalEvents: [
      makeEvent('EV-X11-01', 'Mud Loss', 3050, 'F3', 'HIGH', 'Severe mud loss at 3050m while entering F3 formation. Losses exceeded 40 bbl/hr.', 'Switched to LCM pill, reduced mud weight from 11.2 to 10.6 ppg. Lost circulation material pumped.', 'WR-X11-2024-07', '2024-02-28T14:30:00Z', 8),
      makeEvent('EV-X11-02', 'Stuck Pipe', 3210, 'F3', 'CRITICAL', 'Differential sticking at 3210m. Pipe stuck for 14 hours before freeing.', 'Applied jar operations, reduced mud weight, spotted oil-based pill around stuck zone.', 'IR-X11-2024-03', '2024-03-02T09:15:00Z', 14),
      makeEvent('EV-X11-03', 'Torque Spike', 3150, 'F3', 'MEDIUM', 'Sudden torque increase from 12 to 19 kN·m at 3150m.', 'Reduced WOB, increased RPM, circulated to clean hole.', 'DL-X11-2024-02', '2024-02-26T11:00:00Z', 2),
    ],
    relevanceScore: 92,
  },
  {
    id: 'OIL-X14',
    name: 'OIL-X14 — Rudrasagar',
    latitude: 26.7680,
    longitude: 94.2215,
    distanceFromActiveWell: 3.1,
    totalDepth: 4100,
    formation: 'F4',
    reservoir: 'R1',
    status: 'COMPLETED',
    drillingDate: '2023-11-20',
    spudDate: '2023-09-05',
    historicalEvents: [
      makeEvent('EV-X14-01', 'Kick', 3320, 'F3', 'CRITICAL', 'Gas kick detected at 3320m. Pit volume increased by 12 bbl within 3 minutes.', 'Shut-in well, applied Driller\'s Method. Circulated kick out with weighted mud 11.4 ppg.', 'IR-X14-2023-11', '2023-11-01T06:45:00Z', 6),
      makeEvent('EV-X14-02', 'Mud Loss', 3100, 'F3', 'MEDIUM', 'Partial mud loss at 3100m. Losses approximately 15 bbl/hr.', 'Added fine LCM material. Monitored returns closely.', 'DL-X14-2023-10', '2023-10-18T16:20:00Z', 4),
    ],
    relevanceScore: 87,
  },
  {
    id: 'OIL-X17',
    name: 'OIL-X17 — Lakwa Field',
    latitude: 26.7150,
    longitude: 94.1750,
    distanceFromActiveWell: 4.8,
    totalDepth: 3600,
    formation: 'F3',
    reservoir: 'R2',
    status: 'COMPLETED',
    drillingDate: '2024-06-10',
    spudDate: '2024-04-20',
    historicalEvents: [
      makeEvent('EV-X17-01', 'Stuck Pipe', 3180, 'F3', 'HIGH', 'Pack-off at 3180m during connection. Formation collapse suspected.', 'Worked pipe with jar, circulated heavy sweep. Hole cleaned and resumed drilling.', 'IR-X17-2024-05', '2024-05-28T08:30:00Z', 10),
      makeEvent('EV-X17-02', 'NPT', 3200, 'F3', 'MEDIUM', 'Non-productive time of 18 hours due to equipment failure at 3200m.', 'Replaced top drive motor. Resumed drilling after repairs.', 'WR-X17-2024-06', '2024-06-02T12:00:00Z', 18),
      makeEvent('EV-X17-03', 'Torque Spike', 3170, 'F3', 'MEDIUM', 'Gradual torque increase observed between 3160-3180m.', 'Increased flow rate, adjusted mud properties. Maintained reaming operations.', 'DL-X17-2024-05', '2024-05-25T14:45:00Z', 3),
    ],
    relevanceScore: 85,
  },
  {
    id: 'OIL-X19',
    name: 'OIL-X19 — Moran Field',
    latitude: 26.7830,
    longitude: 94.2400,
    distanceFromActiveWell: 5.2,
    totalDepth: 3920,
    formation: 'F4',
    reservoir: 'R1',
    status: 'COMPLETED',
    drillingDate: '2025-01-08',
    spudDate: '2024-11-15',
    historicalEvents: [
      makeEvent('EV-X19-01', 'Cementing Issue', 3400, 'F4', 'HIGH', 'Poor cement bond at 3400m. CBL indicated channeling behind casing.', 'Performed squeeze cementing operation. Verified with repeat CBL.', 'WR-X19-2025-01', '2025-01-05T10:00:00Z', 24),
      makeEvent('EV-X19-02', 'Mud Loss', 3150, 'F3', 'MEDIUM', 'Moderate mud losses at F3 entry. Approximately 20 bbl/hr.', 'Increased LCM concentration. Losses reduced to manageable levels.', 'DL-X19-2024-12', '2024-12-20T09:30:00Z', 5),
    ],
    relevanceScore: 78,
  },
  {
    id: 'OIL-X21',
    name: 'OIL-X21 — Nazira Block',
    latitude: 26.7420,
    longitude: 94.1600,
    distanceFromActiveWell: 5.8,
    totalDepth: 3750,
    formation: 'F3',
    reservoir: 'R2',
    status: 'SUSPENDED',
    drillingDate: '2023-07-22',
    spudDate: '2023-05-10',
    historicalEvents: [
      makeEvent('EV-X21-01', 'Fishing', 3280, 'F3', 'CRITICAL', 'Lost BHA at 3280m. Twist-off at drill collar connection.', 'Multiple fishing attempts with overshot. Successfully recovered after 72 hours.', 'IR-X21-2023-07', '2023-07-15T03:00:00Z', 72),
      makeEvent('EV-X21-02', 'Kick', 3350, 'F3', 'HIGH', 'Minor gas influx at 3350m. Detected by flow check.', 'Shut-in, circulated weighted mud. Increased mud weight by 0.3 ppg.', 'IR-X21-2023-07-2', '2023-07-18T15:30:00Z', 4),
      makeEvent('EV-X21-03', 'Torque Spike', 3250, 'F3', 'LOW', 'Slight torque fluctuations at 3250m.', 'Monitored trend. No immediate action required.', 'DL-X21-2023-07', '2023-07-12T10:00:00Z', 1),
    ],
    relevanceScore: 74,
  },
  {
    id: 'OIL-X25',
    name: 'OIL-X25 — Jorhat East',
    latitude: 26.7650,
    longitude: 94.2580,
    distanceFromActiveWell: 6.3,
    totalDepth: 4050,
    formation: 'F4',
    reservoir: 'R1',
    status: 'DRILLING',
    drillingDate: '2026-08-01',
    spudDate: '2026-07-05',
    currentDepth: 2850,
    historicalEvents: [],
    relevanceScore: 71,
  },
  {
    id: 'OIL-X27',
    name: 'OIL-X27 — Cinnamara Block',
    latitude: 26.7050,
    longitude: 94.1500,
    distanceFromActiveWell: 7.1,
    totalDepth: 3500,
    formation: 'F3',
    reservoir: 'R3',
    status: 'COMPLETED',
    drillingDate: '2024-09-14',
    spudDate: '2024-07-20',
    historicalEvents: [
      makeEvent('EV-X27-01', 'Mud Loss', 3080, 'F3', 'HIGH', 'Total mud losses at 3080m. Complete loss of returns for 6 hours.', 'Pumped cement plug, drilled out, resumed with optimized LCM program.', 'IR-X27-2024-09', '2024-09-08T07:00:00Z', 16),
      makeEvent('EV-X27-02', 'Stuck Pipe', 3120, 'F3', 'MEDIUM', 'Mechanical sticking at 3120m due to key-seating.', 'Reamed through key-seat section. Modified BHA design for subsequent run.', 'DL-X27-2024-08', '2024-08-30T11:45:00Z', 6),
    ],
    relevanceScore: 68,
  },
  {
    id: 'OIL-X31',
    name: 'OIL-X31 — Duliajan South',
    latitude: 26.6900,
    longitude: 94.1350,
    distanceFromActiveWell: 8.9,
    totalDepth: 3680,
    formation: 'F3',
    reservoir: 'R2',
    status: 'COMPLETED',
    drillingDate: '2022-12-05',
    spudDate: '2022-10-01',
    historicalEvents: [
      makeEvent('EV-X31-01', 'Kick', 3200, 'F3', 'HIGH', 'Gas kick while drilling at 3200m. Detected by flow increase and pit gain.', 'Shut-in. Applied weighted mud. Well control regained in 5 hours.', 'IR-X31-2022-12', '2022-11-28T04:00:00Z', 5),
      makeEvent('EV-X31-02', 'NPT', 3050, 'F3', 'LOW', 'Weather-related NPT. Operations suspended for 24 hours.', 'Resumed operations after weather cleared.', 'WR-X31-2022-11', '2022-11-15T00:00:00Z', 24),
    ],
    relevanceScore: 62,
  },
];

// ─── All Wells (active + nearby) ────────────────────────────

export const allWells: Well[] = [activeWell, ...nearbyWells];

// ─── Risk Assessments ───────────────────────────────────────

export const currentRisks: RiskAssessment[] = [
  {
    id: 'RISK-001',
    riskLevel: 'HIGH',
    riskType: 'Stuck Pipe',
    description: 'High probability of stuck pipe event in current drilling interval',
    evidenceItems: [
      'Current depth (3,180m) matches historical stuck-pipe interval in F3 formation',
      'OIL-X11 experienced differential sticking at 3,210m in same formation',
      'OIL-X17 reported pack-off at 3,180m — identical depth',
      'Current torque trend shows gradual increase from 12.8 to 14.2 kN·m over last 50m',
      'Mud weight (10.8 ppg) is near upper limit for F3 formation pore pressure window',
    ],
    mitigationActions: [
      'Increase circulation rate to maintain hole cleaning',
      'Consider reducing mud weight to 10.5 ppg if pore pressure permits',
      'Perform regular wiper trips every 100m',
      'Monitor torque and drag trends closely — alert if torque exceeds 16 kN·m',
      'Maintain overpull margin of at least 50 klbs',
      'Reference: IR-X11-2024-03, IR-X17-2024-05',
    ],
    affectedDepthRange: [3150, 3250],
    formation: 'F3',
    confidence: 84,
    matchingWells: ['OIL-X11', 'OIL-X17', 'OIL-X27'],
    timestamp: '2026-09-26T02:30:00Z',
  },
  {
    id: 'RISK-002',
    riskLevel: 'MEDIUM',
    riskType: 'Mud Loss',
    description: 'Moderate risk of mud losses when entering deeper F3 interval',
    evidenceItems: [
      '4 out of 8 offset wells experienced mud losses in F3 between 3,050–3,150m',
      'Current depth approaching known fractured zone identified in OIL-X27',
      'ECD of 11.3 ppg approaching fracture gradient estimated at 11.8 ppg',
    ],
    mitigationActions: [
      'Prepare LCM materials on standby',
      'Monitor return flow continuously',
      'Reduce surge pressures during connections',
      'Consider managed pressure drilling if losses escalate',
    ],
    affectedDepthRange: [3050, 3200],
    formation: 'F3',
    confidence: 72,
    matchingWells: ['OIL-X11', 'OIL-X14', 'OIL-X19', 'OIL-X27'],
    timestamp: '2026-09-26T02:30:00Z',
  },
  {
    id: 'RISK-003',
    riskLevel: 'MEDIUM',
    riskType: 'Kick',
    description: 'Elevated kick risk approaching F3-F4 transition zone',
    evidenceItems: [
      'OIL-X14 experienced gas kick at 3,320m in F3',
      'OIL-X21 had minor gas influx at 3,350m',
      'OIL-X31 had kick event at 3,200m in F3',
      'Pore pressure ramp expected between 3,200–3,400m based on offset data',
    ],
    mitigationActions: [
      'Maintain trip margin of minimum 0.5 ppg',
      'Ensure well control equipment is tested and ready',
      'Perform flow checks before and after connections',
      'Monitor pit volume continuously',
    ],
    affectedDepthRange: [3200, 3400],
    formation: 'F3',
    confidence: 68,
    matchingWells: ['OIL-X14', 'OIL-X21', 'OIL-X31'],
    timestamp: '2026-09-26T02:30:00Z',
  },
];

// ─── Alerts ─────────────────────────────────────────────────

export const currentAlerts: Alert[] = [
  {
    id: 'ALERT-001',
    title: 'Stuck Pipe Risk — Depth Correlation Match',
    message: 'Current drilling depth (3,180m) matches 2 historical stuck-pipe events in offset wells at F3 formation. Torque is trending upward.',
    priority: 'CRITICAL',
    riskAssessment: currentRisks[0],
    wellId: 'OIL-X23',
    depth: 3180,
    formation: 'F3',
    timestamp: '2026-09-26T02:35:00Z',
    acknowledged: false,
    status: 'NEW',
    evidenceItems: [
      'OIL-X17: Pack-off at 3,180m (exact depth match)',
      'OIL-X11: Differential sticking at 3,210m (30m offset)',
      'Current torque: 14.2 kN·m (trending up from 12.8)',
    ],
    mitigationActions: [
      'Increase circulation time before next connection',
      'Monitor torque threshold: alert at 16 kN·m',
      'Review IR-X11-2024-03 for mitigation details',
    ],
  },
  {
    id: 'ALERT-002',
    title: 'Mud Loss Risk — Approaching Fractured Zone',
    message: 'ECD approaching fracture gradient. 4 offset wells experienced losses in F3 between 3,050–3,150m.',
    priority: 'WARNING',
    wellId: 'OIL-X23',
    depth: 3180,
    formation: 'F3',
    timestamp: '2026-09-26T01:50:00Z',
    acknowledged: false,
    status: 'NEW',
    evidenceItems: [
      'OIL-X27: Total losses at 3,080m in F3',
      'OIL-X11: Severe losses at 3,050m in F3',
      'Current ECD: 11.3 ppg (fracture gradient ~11.8 ppg)',
    ],
    mitigationActions: [
      'Prepare LCM pill on standby',
      'Reduce pump rate during connections to minimize surge',
    ],
  },
  {
    id: 'ALERT-003',
    title: 'Torque Trend Advisory',
    message: 'Torque has increased 11% over the last 50m of drilling. Pattern matches pre-stuck-pipe signatures from OIL-X11.',
    priority: 'WARNING',
    wellId: 'OIL-X23',
    depth: 3180,
    formation: 'F3',
    timestamp: '2026-09-26T02:10:00Z',
    acknowledged: true,
    status: 'ACKNOWLEDGED',
    evidenceItems: [
      'Torque increase: 12.8 → 14.2 kN·m over 50m interval',
      'OIL-X11 showed similar torque ramp before stuck pipe at 3,210m',
    ],
  },
  {
    id: 'ALERT-004',
    title: 'Drilling Parameter Optimization Suggestion',
    message: 'Based on offset well data, reducing WOB to 16 klbs and increasing RPM to 130 may improve ROP while reducing torque risk.',
    priority: 'INFO',
    wellId: 'OIL-X23',
    depth: 3180,
    formation: 'F3',
    timestamp: '2026-09-26T00:30:00Z',
    acknowledged: true,
    status: 'ACKNOWLEDGED',
    evidenceItems: [
      'OIL-X17 achieved optimal ROP of 14.2 m/hr at WOB 16 klbs in F3',
      'Current WOB 18.5 klbs exceeds offset average of 16.8 klbs for F3',
    ],
  },
];

// ─── Drilling Parameter Time Series (deterministic) ─────────

export const parameterTimeSeries: DrillingParameters[] = [
  { depth: 3100, rop: 14.2, wob: 17.0, rpm: 125, torque: 11.5, mudFlow: 860, mudWeight: 10.6, pressure: 3280, ecd: 11.0, hookLoad: 190, timestamp: '2026-09-25T18:00:00Z' },
  { depth: 3110, rop: 13.8, wob: 17.2, rpm: 124, torque: 11.8, mudFlow: 855, mudWeight: 10.6, pressure: 3300, ecd: 11.1, hookLoad: 189, timestamp: '2026-09-25T18:45:00Z' },
  { depth: 3120, rop: 13.5, wob: 17.5, rpm: 123, torque: 12.1, mudFlow: 852, mudWeight: 10.7, pressure: 3320, ecd: 11.1, hookLoad: 188, timestamp: '2026-09-25T19:30:00Z' },
  { depth: 3130, rop: 13.1, wob: 17.8, rpm: 122, torque: 12.5, mudFlow: 850, mudWeight: 10.7, pressure: 3340, ecd: 11.1, hookLoad: 187, timestamp: '2026-09-25T20:15:00Z' },
  { depth: 3140, rop: 12.9, wob: 18.0, rpm: 121, torque: 12.8, mudFlow: 848, mudWeight: 10.7, pressure: 3360, ecd: 11.2, hookLoad: 187, timestamp: '2026-09-25T21:00:00Z' },
  { depth: 3150, rop: 12.7, wob: 18.2, rpm: 121, torque: 13.2, mudFlow: 850, mudWeight: 10.8, pressure: 3380, ecd: 11.2, hookLoad: 186, timestamp: '2026-09-25T22:00:00Z' },
  { depth: 3160, rop: 12.5, wob: 18.3, rpm: 120, torque: 13.6, mudFlow: 850, mudWeight: 10.8, pressure: 3395, ecd: 11.3, hookLoad: 186, timestamp: '2026-09-25T23:00:00Z' },
  { depth: 3170, rop: 12.5, wob: 18.4, rpm: 120, torque: 13.9, mudFlow: 850, mudWeight: 10.8, pressure: 3410, ecd: 11.3, hookLoad: 185, timestamp: '2026-09-26T00:00:00Z' },
  { depth: 3180, rop: 12.4, wob: 18.5, rpm: 120, torque: 14.2, mudFlow: 850, mudWeight: 10.8, pressure: 3420, ecd: 11.3, hookLoad: 185, timestamp: '2026-09-26T02:45:00Z' },
];

// ─── Formation Data ─────────────────────────────────────────

export interface FormationInfo {
  id: string;
  name: string;
  topDepth: number;
  bottomDepth: number;
  lithology: string;
  color: string;
}

export const formations: FormationInfo[] = [
  { id: 'F1', name: 'Alluvial / Top Soil', topDepth: 0, bottomDepth: 800, lithology: 'Clay, Sand, Gravel', color: '#8B7355' },
  { id: 'F2', name: 'Tipam Sandstone', topDepth: 800, bottomDepth: 2200, lithology: 'Sandstone, Shale', color: '#C4A35A' },
  { id: 'F3', name: 'Barail Formation', topDepth: 2200, bottomDepth: 3500, lithology: 'Shale, Siltstone, Coal', color: '#5B7F5B' },
  { id: 'F4', name: 'Kopili Shale', topDepth: 3500, bottomDepth: 3900, lithology: 'Marine Shale, Limestone', color: '#4A6B8A' },
  { id: 'F5', name: 'Sylhet Limestone', topDepth: 3900, bottomDepth: 4500, lithology: 'Limestone, Dolomite', color: '#7A8B99' },
];
