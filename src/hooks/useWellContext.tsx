// ============================================================
// Global Active Well Context — React Context + Provider
// ============================================================

import { createContext, useContext, useState, useMemo, useEffect, type ReactNode } from 'react';
import type { Well, DrillingParameters, RiskAssessment, Alert, AlertStatus, DrillingEvent } from '../types';
import {
  activeWell as defaultActiveWell,
  currentDrillingParameters,
  currentRisks,
  currentAlerts,
  nearbyWells, parameterTimeSeries,
} from '../data/mockData';
import { generateAlertsForWell } from '../utils/alertGeneration';

interface ReportNotes {
  wellId: string;
  notes: string;
  observations: string;
  actions: string;
  status: string;
  reviewer: string;
}

interface WellContextType {
  playbackControls?: {
    isPlaying: boolean;
    play: () => void;
    pause: () => void;
    stepBackward: () => void;
    stop: () => void;
  };
  activeWell: Well;
  setActiveWell: (well: Well) => void;
  currentParameters: DrillingParameters | null;
  timeSeries: DrillingParameters[];
  risks: RiskAssessment[];
  alerts: Alert[];
  unacknowledgedAlertCount: number;
  nearbyWells: Well[];
  acknowledgeAlert: (alertId: string) => void;
  updateAlertStatus: (alertId: string, status: AlertStatus) => void;
  reportNotes: Record<string, ReportNotes>;
  updateReportNotes: (wellId: string, notes: ReportNotes) => void;
  importedRecords: DrillingEvent[];
  addImportedRecords: (records: DrillingEvent[]) => void;
  clearImportedRecords: () => void;
}

const WellContext = createContext<WellContextType | undefined>(undefined);

export function WellProvider({ children }: { children: ReactNode }) {
  const [well, setWell] = useState<Well>(defaultActiveWell);
  
  // Active Well Live State
  const [liveParameters, setLiveParameters] = useState<DrillingParameters>(currentDrillingParameters);
  const [liveTimeSeries, setLiveTimeSeries] = useState<DrillingParameters[]>(parameterTimeSeries);

  // Playback State (for other wells)
  const [playbackSeries, setPlaybackSeries] = useState<DrillingParameters[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Generate mock series when a completed well is selected
  useEffect(() => {
    if (well.id === defaultActiveWell.id) return;
    const endDepth = well.currentDepth || well.totalDepth || 3000;
    const series = [];
    let baseTimestamp = new Date(well.drillingDate || new Date().toISOString()).getTime();
    for (let i = 0; i < 50; i++) {
      series.push({
        depth: Number((endDepth - 500 + i * 10).toFixed(2)),
        rop: Number((10 + Math.random() * 5).toFixed(1)),
        wob: Number((15 + Math.random() * 5).toFixed(1)),
        rpm: 100 + Math.floor(Math.random() * 40),
        torque: Number((10 + Math.random() * 5).toFixed(1)),
        mudFlow: 800 + Math.floor(Math.random() * 100),
        mudWeight: Number((10 + Math.random() * 1.5).toFixed(2)),
        pressure: Number((3000 + Math.random() * 500).toFixed(0)),
        ecd: Number((10.5 + Math.random() * 1.5).toFixed(2)),
        hookLoad: Number((150 + Math.random() * 50).toFixed(1)),
        timestamp: new Date(baseTimestamp + i * 3600000).toISOString(),
      });
    }
    setPlaybackSeries(series);
    setPlaybackIndex(0);
    setIsPlaying(false);
  }, [well.id]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (well.id === defaultActiveWell.id) {
        setLiveParameters((prev) => {
          const newDepth = prev.depth + (prev.rop / 3600);
          const newParams = { 
            ...prev, 
            depth: Number(newDepth.toFixed(2)), 
            rop: Number((prev.rop + (Math.random() - 0.5)).toFixed(1)), 
            wob: Number((prev.wob + (Math.random() - 0.5)).toFixed(1)), 
            torque: Number((prev.torque + (Math.random() - 0.5)).toFixed(1)), 
            pressure: Math.floor(prev.pressure + (Math.random() - 0.5) * 5),
            mudFlow: Math.floor(prev.mudFlow + (Math.random() - 0.5) * 2),
            mudWeight: Number((prev.mudWeight + (Math.random() - 0.5) * 0.1).toFixed(2)),
            ecd: Number((prev.ecd + (Math.random() - 0.5) * 0.1).toFixed(2)),
            hookLoad: Number((prev.hookLoad + (Math.random() - 0.5) * 2).toFixed(1)),
            rpm: Math.max(0, Math.floor(prev.rpm + (Math.random() - 0.5) * 3)),
            timestamp: new Date().toISOString() 
          };
          setLiveTimeSeries(series => {
            if (series.length === 0 || new Date(newParams.timestamp).getTime() - new Date(series[series.length - 1].timestamp).getTime() > 2000) {
              const newSeries = [...series, newParams];
              if (newSeries.length > 50) newSeries.shift();
              return newSeries;
            }
            return series;
          });
          return newParams;
        });
      } else {
        if (isPlaying) {
          setPlaybackIndex(prev => {
             if (prev < playbackSeries.length - 1) return prev + 1;
             setIsPlaying(false);
             return prev;
          });
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [well.id, isPlaying, playbackSeries.length]);

  const playbackControls = well.id === defaultActiveWell.id ? undefined : {
    isPlaying,
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    stepBackward: () => {
      setIsPlaying(false);
      setPlaybackIndex(prev => Math.max(0, prev - 1));
    },
    stop: () => {
      setIsPlaying(false);
      setPlaybackIndex(0);
    }
  };

  
  const [alertStatuses, setAlertStatuses] = useState<Record<string, AlertStatus>>(() => {
    try { return JSON.parse(localStorage.getItem('wellsight.alert-statuses.v1') ?? '{}') as Record<string, AlertStatus>; }
    catch { return {}; }
  });
  const [reportNotes, setReportNotes] = useState<Record<string, ReportNotes>>(() => {
    try { return JSON.parse(localStorage.getItem('wellsight.report-notes.v1') ?? '{}') as Record<string, ReportNotes>; }
    catch { return {}; }
  });
  
  // Session storage for imported records
  const [importedRecords, setImportedRecords] = useState<DrillingEvent[]>(() => {
    try {
      const saved = sessionStorage.getItem('nwis_imported_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addImportedRecords = (records: DrillingEvent[]) => {
    setImportedRecords((prev) => {
      // Deduplicate by ID
      const existingIds = new Set(prev.map(r => r.id));
      const newRecords = records.filter(r => !existingIds.has(r.id));
      const updated = [...prev, ...newRecords];
      try {
        sessionStorage.setItem('nwis_imported_records', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save to session storage', e);
      }
      return updated;
    });
  };
  const clearImportedRecords = () => {
    setImportedRecords([]);
    try {
      sessionStorage.removeItem('nwis_imported_records');
    } catch (e) {
      console.error('Failed to clear session storage', e);
    }
  };

  const updateAlertStatus = (alertId: string, status: AlertStatus) => {
    setAlertStatuses((previous) => {
      const updated = { ...previous, [alertId]: status };
      try { localStorage.setItem('wellsight.alert-statuses.v1', JSON.stringify(updated)); } catch { /* Keep this update for the current session. */ }
      return updated;
    });
  };
  const acknowledgeAlert = (alertId: string) => updateAlertStatus(alertId, 'ACKNOWLEDGED');

  const updateReportNotes = (wellId: string, notes: ReportNotes) => {
    setReportNotes((previous) => {
      const updated = { ...previous, [wellId]: notes };
      try { localStorage.setItem('wellsight.report-notes.v1', JSON.stringify(updated)); } catch { /* Keep this update for the current session. */ }
      return updated;
    });
  };

  const extendedNearbyWells = useMemo(() => {
    if (importedRecords.length === 0) return nearbyWells.filter((record) => record.id !== well.id);

    const importedByWell: Record<string, DrillingEvent[]> = {};
    importedRecords.forEach(event => {
      const wId = event.wellId || 'UNKNOWN-WELL';
      if (!importedByWell[wId]) importedByWell[wId] = [];
      importedByWell[wId].push(event);
    });

    const knownWellIds = new Set<string>([well.id]);

    const mergedWells = nearbyWells.filter((record) => record.id !== well.id).map(record => {
      knownWellIds.add(record.id);
      if (importedByWell[record.id]) {
        return {
          ...record,
          historicalEvents: [...record.historicalEvents, ...importedByWell[record.id]]
        };
      }
      return record;
    });

    const unresolvedWells: Well[] = Object.keys(importedByWell)
      .filter(wId => !knownWellIds.has(wId))
      .map(wId => ({
        id: wId,
        name: `Location unavailable: ${wId}`,
        latitude: Number.NaN,
        longitude: Number.NaN,
        distanceFromActiveWell: Number.NaN,
        totalDepth: 0,
        formation: well.formation,
        status: 'COMPLETED',
        drillingDate: '',
        spudDate: '',
        historicalEvents: importedByWell[wId],
        relevanceScore: 0,
        isUnresolved: true,
      }));

    return [...mergedWells, ...unresolvedWells];
  }, [nearbyWells, importedRecords, well]);

  const activeWellRecord = useMemo(() => {
    const wellEvents = importedRecords.filter((event) => event.wellId === well.id);
    return wellEvents.length ? { ...well, historicalEvents: [...well.historicalEvents, ...wellEvents] } : well;
  }, [well, importedRecords]);

  const alerts = useMemo(() => {
    const base = well.id === defaultActiveWell.id && importedRecords.length === 0
      ? currentAlerts
      : generateAlertsForWell(well, extendedNearbyWells);
    return base.map((alert) => {
      const status = alertStatuses[alert.id] ?? alert.status;
      return { ...alert, status, acknowledged: status !== 'NEW' };
    });
  }, [well, importedRecords.length, extendedNearbyWells, alertStatuses]);
  const unacknowledgedAlertCount = alerts.filter((alert) => !alert.acknowledged && alert.status === 'NEW').length;
  const risks = well.id === defaultActiveWell.id ? currentRisks : [];

  return (
    <WellContext.Provider
      value={{
        activeWell: activeWellRecord,
        setActiveWell: setWell,
        currentParameters: well.id === defaultActiveWell.id ? liveParameters : (playbackSeries.length > 0 ? playbackSeries[playbackIndex] : null),
        timeSeries: well.id === defaultActiveWell.id ? liveTimeSeries : playbackSeries.slice(0, playbackIndex + 1),
        playbackControls,
        risks,
        alerts,
        unacknowledgedAlertCount,
        nearbyWells: extendedNearbyWells,
        acknowledgeAlert,
        updateAlertStatus,
        reportNotes,
        updateReportNotes,
        importedRecords,
        addImportedRecords,
        clearImportedRecords,
      }}
    >
      {children}
    </WellContext.Provider>
  );
}

export function useWellContext(): WellContextType {
  const ctx = useContext(WellContext);
  if (!ctx) {
    throw new Error('useWellContext must be used within a WellProvider');
  }
  return ctx;
}
