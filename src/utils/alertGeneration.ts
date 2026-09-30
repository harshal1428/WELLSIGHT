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
      const closestCase = [...relevantCases].sort((a, b) => Math.abs(a.depth - currentDepth) - Math.abs(b.depth - currentDepth))[0];
      const isCritical = getHighestRecordedSeverity(relevantCases) === 'CRITICAL';
      
      const evidenceItems = risk.factors
        .filter(f => f.matched)
        .map(f => f.description);
        
      evidenceItems.push(`Comparable historical case: ${closestCase.eventType} at ${closestCase.depth}m in ${closestCase.sourceDocument}`);

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
        timestamp: closestCase.timestamp,
        acknowledged: false,
        status: 'NEW',
        evidenceItems,
        mitigationActions: risk.mitigations.length > 0 ? risk.mitigations : ['No specific historical mitigations recorded.'],
      });
    }
  });

  return alerts;
}
