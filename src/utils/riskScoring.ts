import type { Well, DrillingEvent, EventSeverity, EventType } from '../types';

export interface RiskFactor {
  name: string;
  matched: boolean;
  matchedEventCount: number;
  description: string;
}

export interface CalculatedRisk {
  riskType: EventType;
  supportingCases: DrillingEvent[];
  comparableWellsCount: number;
  factors: RiskFactor[];
  mitigations: string[];
}

const severityOrder: EventSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export function getHighestRecordedSeverity(events: DrillingEvent[]): EventSeverity | null {
  return events.reduce<EventSeverity | null>((highest, event) => {
    if (!highest || severityOrder.indexOf(event.severity) > severityOrder.indexOf(highest)) return event.severity;
    return highest;
  }, null);
}

export function calculateRiskForType(
  riskType: EventType,
  activeWell: Well,
  allOffsetWells: Well[],
): CalculatedRisk {
  const currentDepth = activeWell.currentDepth || activeWell.totalDepth;
  const currentFormation = activeWell.formation;
  const supportingCases: DrillingEvent[] = [];
  const comparableWells = new Set<string>();
  const mitigations = new Set<string>();

  allOffsetWells.forEach((well) => {
    const matchingEvents = well.historicalEvents.filter((event) => event.eventType === riskType);
    if (matchingEvents.length) comparableWells.add(well.id);
    matchingEvents.forEach((event) => {
      supportingCases.push(event);
      if (event.mitigation) mitigations.add(event.mitigation);
    });
  });

  const sameFormation = supportingCases.filter((event) => event.formation === currentFormation);
  const nearbyDepth = supportingCases.filter((event) => Math.abs(event.depth - currentDepth) <= 100);
  const highSeverity = supportingCases.filter((event) => event.severity === 'HIGH' || event.severity === 'CRITICAL');
  const factors: RiskFactor[] = [
    {
      name: 'Historical events',
      matched: supportingCases.length > 0,
      matchedEventCount: supportingCases.length,
      description: supportingCases.length ? `${supportingCases.length} matching ${riskType} event${supportingCases.length === 1 ? '' : 's'} in ${comparableWells.size} offset well${comparableWells.size === 1 ? '' : 's'}` : `No matching ${riskType} events in the available offset wells`,
    },
    {
      name: 'Formation match',
      matched: sameFormation.length > 0,
      matchedEventCount: sameFormation.length,
      description: sameFormation.length ? `${sameFormation.length} event${sameFormation.length === 1 ? '' : 's'} recorded in formation ${currentFormation}` : `No matching events recorded in formation ${currentFormation}`,
    },
    {
      name: 'Depth proximity',
      matched: nearbyDepth.length > 0,
      matchedEventCount: nearbyDepth.length,
      description: nearbyDepth.length ? `${nearbyDepth.length} event${nearbyDepth.length === 1 ? '' : 's'} recorded within 100 m of ${currentDepth} m` : `No matching events recorded within 100 m of ${currentDepth} m`,
    },
    {
      name: 'Recorded severity',
      matched: highSeverity.length > 0,
      matchedEventCount: highSeverity.length,
      description: highSeverity.length ? `${highSeverity.length} matching event${highSeverity.length === 1 ? '' : 's'} recorded as high or critical severity` : 'No matching events recorded as high or critical severity',
    },
  ];

  return {
    riskType,
    supportingCases: supportingCases.sort((a, b) => Math.abs(a.depth - currentDepth) - Math.abs(b.depth - currentDepth)),
    comparableWellsCount: comparableWells.size,
    factors,
    mitigations: Array.from(mitigations),
  };
}

export const RISK_CATEGORIES: EventType[] = [
  'Mud Loss',
  'Stuck Pipe',
  'Torque Spike',
  'Kick',
  'Cementing Issue',
  'NPT',
];
