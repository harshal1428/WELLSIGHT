import type { Well, DrillingEvent, RiskLevel, EventType } from '../types';


export interface RiskFactor {
  name: string;
  matched: boolean;
  scoreContribution: number;
  description: string;
}

export interface CalculatedRisk {
  riskType: EventType;
  score: number; // 0-100
  level: RiskLevel;
  supportingCases: DrillingEvent[];
  comparableWellsCount: number;
  factors: RiskFactor[];
  mitigations: string[];
}

export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export function calculateRiskForType(
  riskType: EventType,
  activeWell: Well,
  allOffsetWells: Well[]
): CalculatedRisk {
  const currentDepth = activeWell.currentDepth || activeWell.totalDepth;
  const currentFormation = activeWell.formation;
  

  let totalScore = 0;
  const factors: RiskFactor[] = [];
  const supportingCases: DrillingEvent[] = [];
  const comparableWells = new Set<string>();
  const mitigations = new Set<string>();

  // 1. Find all relevant historical events
  allOffsetWells.forEach((well) => {
    const matchingEvents = well.historicalEvents.filter((ev) => ev.eventType === riskType);
    if (matchingEvents.length > 0) {
      comparableWells.add(well.id);
      matchingEvents.forEach(ev => {
        supportingCases.push(ev);
        if (ev.mitigation) {
          mitigations.add(ev.mitigation);
        }
      });
    }
  });

  // Base factor: Has historical cases
  const hasCases = supportingCases.length > 0;
  const casesContribution = hasCases ? Math.min(supportingCases.length * 5, 20) : 0;
  totalScore += casesContribution;
  factors.push({
    name: 'Historical Frequency',
    matched: hasCases,
    scoreContribution: casesContribution,
    description: hasCases ? `Found ${supportingCases.length} supporting cases in offset wells` : 'No historical cases found'
  });

  // Formation Match
  const formationMatches = supportingCases.filter(ev => ev.formation === currentFormation);
  const hasFormationMatch = formationMatches.length > 0;
  const formationContribution = hasFormationMatch ? 25 : 0;
  totalScore += formationContribution;
  factors.push({
    name: 'Formation Match',
    matched: hasFormationMatch,
    scoreContribution: formationContribution,
    description: hasFormationMatch ? `Events occurred in the current formation (${currentFormation})` : 'No events in current formation'
  });

  // Depth Proximity (within 100m)
  const depthProximityMatches = supportingCases.filter(ev => Math.abs(ev.depth - currentDepth) <= 100);
  const hasDepthProximity = depthProximityMatches.length > 0;
  const depthContribution = hasDepthProximity ? 30 : 0;
  totalScore += depthContribution;
  factors.push({
    name: 'Depth Proximity',
    matched: hasDepthProximity,
    scoreContribution: depthContribution,
    description: hasDepthProximity ? `Events occurred within 100m of current depth (${currentDepth}m)` : 'No events near current depth'
  });

  // Severity Impact (Are there HIGH or CRITICAL historical cases?)
  const highSeverityMatches = supportingCases.filter(ev => ev.severity === 'HIGH' || ev.severity === 'CRITICAL');
  const hasHighSeverity = highSeverityMatches.length > 0;
  const severityContribution = hasHighSeverity ? 25 : 0;
  totalScore += severityContribution;
  factors.push({
    name: 'Historical Severity',
    matched: hasHighSeverity,
    scoreContribution: severityContribution,
    description: hasHighSeverity ? 'Previous events had HIGH or CRITICAL severity' : 'No high severity historical events'
  });

  // Normalize score to 100
  const finalScore = Math.min(Math.round(totalScore), 100);

  return {
    riskType,
    score: finalScore,
    level: getRiskLevel(finalScore),
    supportingCases: supportingCases.sort((a, b) => Math.abs(a.depth - currentDepth) - Math.abs(b.depth - currentDepth)),
    comparableWellsCount: comparableWells.size,
    factors,
    mitigations: Array.from(mitigations)
  };
}

export const RISK_CATEGORIES: EventType[] = [
  'Mud Loss',
  'Stuck Pipe',
  'Torque Spike',
  'Kick',
  'Cementing Issue',
  'NPT'
];
