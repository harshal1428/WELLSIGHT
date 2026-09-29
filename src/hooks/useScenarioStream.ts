import { useEffect, useState } from 'react';
import { parameterTimeSeries } from '../data/mockData';

export interface ScenarioReading {
  depth: number;
  rop: number;
  wob: number;
  rpm: number;
  torque: number;
  pressure: number;
  ecd: number;
  mudFlow: number;
  temperature: number;
  tick: number;
  timestamp: Date;
}

/** Local reference playback; it is not rig telemetry. */
export function useScenarioStream() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setTick((current) => current + 1), 3000);
    return () => window.clearInterval(timer);
  }, []);

  const anchor = parameterTimeSeries[parameterTimeSeries.length - 1];
  const phase = tick % 20;
  const reading: ScenarioReading = {
    depth: anchor.depth + Math.floor(tick / 10),
    rop: Number((anchor.rop + Math.sin(phase / 3) * 0.35).toFixed(1)),
    wob: Number((anchor.wob + Math.sin(phase / 4) * 0.25).toFixed(1)),
    rpm: Math.round(anchor.rpm + Math.sin(phase / 2) * 2),
    torque: Number((anchor.torque + phase * 0.035).toFixed(1)),
    pressure: Math.round(anchor.pressure + Math.sin(phase / 3) * 18),
    ecd: Number((anchor.ecd + Math.sin(phase / 5) * 0.03).toFixed(2)),
    mudFlow: Math.round(anchor.mudFlow + Math.sin(phase / 4) * 4),
    temperature: Number((42 + Math.sin(phase / 6) * 1.2).toFixed(1)),
    tick,
    timestamp: new Date(),
  };
  return { reading, label: 'LOCAL REFERENCE PLAYBACK · 3s' };
}
