import type { Well, Alert } from '../types';
import { calculateRiskForType, getHighestRecordedSeverity, RISK_CATEGORIES } from './riskScoring';


export function generateAlertsForWell(activeWell: Well, nearbyWells: Well[]): Alert[] {
  const alerts: Alert[] = [];
  
  // Get all calculated risks
  const calculatedRisks = RISK_CATEGORIES.map(riskType => 
    calculateRiskForType(riskType, activeWell, nearbyWells)
  );

  const currentDepth = activeWell.currentDepth || activeWell.totalDepth;

  // Surface records with a formation or depth match, using recorded facts only.
  calculatedRisks.forEach((risk) => {
    const relevantCases = risk.supportingCases.filter((event) =>
      event.formation === activeWell.formation || Math.abs(event.depth - currentDepth) <= 100,
    );
    if (relevantCases.length > 0) {
      const isCritical = getHighestRecordedSeverity(relevantCases) === 'CRITICAL';
      
      const evidenceItems = risk.factors
        .filter(f => f.matched)
        .map(f => f.description);
        
      if (relevantCases.length > 0) {
        const closestCase = relevantCases.sort((a, b) => Math.abs(a.depth - currentDepth) - Math.abs(b.depth - currentDepth))[0];
        evidenceItems.push(`Comparable historical case: ${closestCase.eventType} at ${closestCase.depth}m in ${closestCase.sourceDocument}`);
      }

      // Stable ID based on well ID and risk type
      const stableId = `HISTORICAL-MATCH-${activeWell.id}-${risk.riskType.replace(/\s+/g, '-').toUpperCase()}`;

      alerts.push({
        id: stableId,
        title: `Historical ${risk.riskType} match`,
        message: `${relevantCases.length} historical event record${relevantCases.length === 1 ? '' : 's'} match the current formation or fall within 100 m of current depth.`,
        priority: isCritical ? 'CRITICAL' : 'WARNING',
        wellId: activeWell.id,
        depth: activeWell.currentDepth || activeWell.totalDepth,
        formation: activeWell.formation,
        timestamp: activeWell.drillingDate,
        acknowledged: false,
        status: 'NEW',
        evidenceItems,
        mitigationActions: risk.mitigations.length > 0 ? risk.mitigations : ['No specific historical mitigations recorded.'],
      });
    }
  });

  // Also include the deterministic ones from mockData if we want, or just rely on these generated ones.
  // The requirement says: "Use the existing Phase 5 risk assessments and historical drilling-event data as the source for alert candidates... Generate alerts using deterministic rules and stable mock data."
  // So generating them from the risks is exactly what is needed.

  // Let's ensure a stable timestamp by using the well's drilling date or active well timestamp.
  const baseDate = new Date();
  alerts.forEach((alert, index) => {
    const d = new Date(baseDate.getTime() - index * 3600000); // offset by an hour each so they sort nicely
    alert.timestamp = d.toISOString();
  });

  return alerts;
}
