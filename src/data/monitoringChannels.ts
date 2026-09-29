import type { DrillingParameters } from '../types';

export type NumericReadingKey = Exclude<keyof DrillingParameters, 'timestamp'>;

export interface MonitoringChannel {
  id: string;
  label: string;
  unit: string;
  field?: NumericReadingKey;
  referenceValue?: number;
}

export interface MonitoringSection {
  id: string;
  title: string;
  description: string;
  channels: MonitoringChannel[];
}

// Common surface, MWD, and LWD channels. Actual channel names, units, and
// availability depend on the rig, sensor package, and telemetry provider.
// Reference values fill the dashboard layout and must not be treated as sensor measurements.
export const monitoringSections: MonitoringSection[] = [
  {
    id: 'progress',
    title: 'Depth & drilling progress',
    description: 'Bit position and penetration rate channels.',
    channels: [
      { id: 'measured-depth', label: 'Measured depth', unit: 'm', field: 'depth' },
      { id: 'true-vertical-depth', label: 'True vertical depth', unit: 'm', referenceValue: 3150 },
      { id: 'bit-depth', label: 'Bit depth', unit: 'm', referenceValue: 3180 },
      { id: 'hole-depth', label: 'Hole depth', unit: 'm', referenceValue: 3180 },
      { id: 'rop', label: 'Rate of penetration', unit: 'm/hr', field: 'rop' },
      { id: 'average-rop', label: 'Average ROP', unit: 'm/hr', referenceValue: 12.8 },
      { id: 'rop-five-minute', label: '5 min average ROP', unit: 'm/hr', referenceValue: 12.4 },
    ],
  },
  {
    id: 'mechanical',
    title: 'Drilling mechanics',
    description: 'Loads, rotary speed, and mechanical response.',
    channels: [
      { id: 'wob', label: 'Weight on bit', unit: 'klbf', field: 'wob' },
      { id: 'surface-torque', label: 'Surface torque', unit: 'kN·m', field: 'torque' },
      { id: 'rotary-rpm', label: 'Rotary speed', unit: 'rpm', field: 'rpm' },
      { id: 'hook-load', label: 'Hook load', unit: 'klbf', field: 'hookLoad' },
      { id: 'top-drive-torque', label: 'Top drive torque', unit: 'kN·m', referenceValue: 14.2 },
      { id: 'top-drive-rpm', label: 'Top drive speed', unit: 'rpm', referenceValue: 120 },
      { id: 'downhole-rpm', label: 'Downhole speed', unit: 'rpm', referenceValue: 120 },
      { id: 'bit-torque', label: 'Torque at bit', unit: 'kN·m', referenceValue: 13.5 },
      { id: 'mechanical-specific-energy', label: 'Mechanical specific energy', unit: 'kJ/m³', referenceValue: 42 },
    ],
  },
  {
    id: 'circulation',
    title: 'Circulation & pressure',
    description: 'Flow, pressure, density, and pit measurements.',
    channels: [
      { id: 'mud-flow-in', label: 'Mud flow in', unit: 'L/min', field: 'mudFlow' },
      { id: 'mud-flow-out', label: 'Mud flow out', unit: 'L/min', referenceValue: 850 },
      { id: 'mud-weight-in', label: 'Mud weight in', unit: 'ppg', field: 'mudWeight' },
      { id: 'mud-weight-out', label: 'Mud weight out', unit: 'ppg', referenceValue: 10.8 },
      { id: 'surface-pressure', label: 'Surface pressure', unit: 'psi', field: 'pressure' },
      { id: 'standpipe-pressure', label: 'Standpipe pressure', unit: 'psi', referenceValue: 3420 },
      { id: 'annular-pressure', label: 'Annular pressure', unit: 'psi', referenceValue: 1100 },
      { id: 'ecd', label: 'Equivalent circulating density', unit: 'ppg', field: 'ecd' },
      { id: 'pit-volume', label: 'Active pit volume', unit: 'm³', referenceValue: 72 },
    ],
  },
  {
    id: 'temperature-fluid',
    title: 'Temperature & fluid properties',
    description: 'Surface and downhole thermal and fluid channels.',
    channels: [
      { id: 'mud-temperature-in', label: 'Mud temperature in', unit: '°C', referenceValue: 28 },
      { id: 'mud-temperature-out', label: 'Mud temperature out', unit: '°C', referenceValue: 45 },
      { id: 'downhole-temperature', label: 'Downhole temperature', unit: '°C', referenceValue: 95 },
      { id: 'bit-temperature', label: 'Bit temperature', unit: '°C', referenceValue: 96 },
      { id: 'annular-temperature', label: 'Annular temperature', unit: '°C', referenceValue: 78 },
      { id: 'flowline-temperature', label: 'Flowline temperature', unit: '°C', referenceValue: 43 },
      { id: 'mud-ph', label: 'Mud pH', unit: 'pH', referenceValue: 9.5 },
    ],
  },
  {
    id: 'vibration',
    title: 'Vibration & dynamics',
    description: 'Downhole vibration and drilling dysfunction indicators.',
    channels: [
      { id: 'axial-vibration', label: 'Axial vibration', unit: 'g', referenceValue: 0.4 },
      { id: 'lateral-vibration', label: 'Lateral vibration', unit: 'g', referenceValue: 0.5 },
      { id: 'torsional-vibration', label: 'Torsional vibration', unit: 'g', referenceValue: 0.3 },
      { id: 'stick-slip', label: 'Stick-slip severity', unit: '%', referenceValue: 8 },
      { id: 'shock-count', label: 'Shock count', unit: 'count/min', referenceValue: 1 },
    ],
  },
  {
    id: 'directional',
    title: 'Directional & MWD',
    description: 'Survey and measured-while-drilling orientation channels.',
    channels: [
      { id: 'inclination', label: 'Inclination', unit: '°', referenceValue: 2 },
      { id: 'azimuth', label: 'Azimuth', unit: '°', referenceValue: 95 },
      { id: 'toolface', label: 'Toolface', unit: '°', referenceValue: 0 },
      { id: 'dogleg-severity', label: 'Dogleg severity', unit: '°/30 m', referenceValue: 0.3 },
    ],
  },
  {
    id: 'formation',
    title: 'Formation evaluation & LWD',
    description: 'Logging-while-drilling formation response channels.',
    channels: [
      { id: 'gamma-ray', label: 'Gamma ray', unit: 'API', referenceValue: 85 },
      { id: 'deep-resistivity', label: 'Deep resistivity', unit: 'Ω·m', referenceValue: 12 },
      { id: 'shallow-resistivity', label: 'Shallow resistivity', unit: 'Ω·m', referenceValue: 8 },
      { id: 'sonic-slowness', label: 'Sonic slowness', unit: 'µs/ft', referenceValue: 90 },
      { id: 'bulk-density', label: 'Bulk density', unit: 'g/cm³', referenceValue: 2.45 },
      { id: 'neutron-porosity', label: 'Neutron porosity', unit: '%', referenceValue: 22 },
    ],
  },
  {
    id: 'pumps-gas',
    title: 'Pumps & gas monitoring',
    description: 'Pump activity and mud gas channels.',
    channels: [
      { id: 'pump-strokes', label: 'Pump stroke rate', unit: 'strokes/min', referenceValue: 80 },
      { id: 'pump-two-pressure', label: 'Pump 2 pressure', unit: 'psi', referenceValue: 3420 },
      { id: 'total-gas', label: 'Total gas', unit: '%', referenceValue: 0.2 },
    ],
  },
];
