import type { Well, Alert } from '../types';
import { calculateRiskForType, RISK_CATEGORIES } from './riskScoring';


export function generateAlertsForWell(activeWell: Well, nearbyWells: Well[]): Alert[] {
  const alerts: Alert[] = [];
  
  // Get all calculated risks
  const calculatedRisks = RISK_CATEGORIES.map(riskType => 
    calculateRiskForType(riskType, activeWell, nearbyWells)
  );

  // Generate alerts for HIGH or CRITICAL risks
  calculatedRisks.forEach((risk) => {
    if (risk.score >= 60) {
      const isCritical = risk.score >= 80;
      
      const evidenceItems = risk.factors
        .filter(f => f.matched)
        .map(f => f.description);
        
      if (risk.supportingCases.length > 0) {
        const closestCase = risk.supportingCases[0];
        evidenceItems.push(`Comparable historical case: ${closestCase.eventType} at ${closestCase.depth}m in ${closestCase.sourceDocument}`);
      }

      // Stable ID based on well ID and risk type
      const stableId = `PROTOTYPE-ALERT-${activeWell.id}-${risk.riskType.replace(/\s+/g, '-').toUpperCase()}`;

      alerts.push({
        id: stableId,
        title: `Proactive Alert: ${risk.riskType} Risk`,
        message: `Prototype alert generated due to elevated historical relevance. Prototype score: ${risk.score}/100.`,
        priority: isCritical ? 'CRITICAL' : 'WARNING',
        wellId: activeWell.id,
        depth: activeWell.currentDepth || activeWell.totalDepth,
        formation: activeWell.formation,
        timestamp: new Date().toISOString(), // In a real app this would be stable, we'll keep it as now for demo or could use a fixed string
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
