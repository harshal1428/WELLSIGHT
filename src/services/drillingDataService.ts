export type ComponentStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';
export type ScenarioType = 'Normal Drilling' | 'Bearing Degradation' | 'High Vibration' | 'Mud Flow Restriction';

export interface SensorData {
  id: string;
  name: string;
  value: number;
  unit: string;
  normalRange: [number, number];
  status: ComponentStatus;
  component: string; // The physical component this sensor is attached to
}

export interface ComponentHealth {
  id: string;
  name: string;
  health: number;
  status: ComponentStatus;
}

export interface DrillingTelemetry {
  depth: number;
  rop: number;
  wob: number;
  rpm: number;
  torque: number;
  mudFlow: number;
  mudWeight: number;
  pressure: number;
  vibration: number;
  bearingTemp: number;
  inclination: number;
  azimuth: number;
}

export interface Alert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  time: string;
  componentId?: string;
}

export interface DrillingDataState {
  telemetry: DrillingTelemetry;
  sensors: SensorData[];
  components: ComponentHealth[];
  alerts: Alert[];
  overallHealth: number;
}

class DrillingDataService {
  private listeners: ((state: DrillingDataState) => void)[] = [];
  private intervalId: number | null = null;
  private isSimulating: boolean = false;
  private scenario: ScenarioType = 'Normal Drilling';

  private state: DrillingDataState = {
    telemetry: {
      depth: 3180, rop: 12.4, wob: 18.5, rpm: 120, torque: 14.2,
      mudFlow: 850, mudWeight: 10.2, pressure: 3420, vibration: 12.4,
      bearingTemp: 87, inclination: 2.1, azimuth: 45.3
    },
    sensors: [],
    components: [
      { id: 'drill-bit', name: 'Drill Bit', health: 100, status: 'NORMAL' },
      { id: 'bha', name: 'BHA & Sensors', health: 100, status: 'NORMAL' },
      { id: 'mud-motor', name: 'Mud Motor / Bearing', health: 100, status: 'NORMAL' },
      { id: 'drill-pipe', name: 'Drill Pipe', health: 100, status: 'NORMAL' },
      { id: 'stabilizer', name: 'Stabilizer', health: 100, status: 'NORMAL' },
    ],
    alerts: [],
    overallHealth: 88
  };

  constructor() {
    this.updateSensors();
  }

  subscribe(listener: (state: DrillingDataState) => void) {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(l => l({ ...this.state }));
  }

  setScenario(scenario: ScenarioType) {
    this.scenario = scenario;
    if (!this.isSimulating) {
      // Apply immediate baseline changes for the scenario to show effect
      this.simulateTick();
    }
  }

  startSimulation() {
    if (this.isSimulating) return;
    this.isSimulating = true;
    this.intervalId = window.setInterval(() => this.simulateTick(), 1000);
  }

  pauseSimulation() {
    this.isSimulating = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private simulateTick() {
    let { depth, rop, wob, rpm, torque, vibration, bearingTemp } = this.state.telemetry;

    // Base fluctuations
    rop += (Math.random() - 0.5) * 0.5;
    wob += (Math.random() - 0.5) * 0.4;
    torque += (Math.random() - 0.5) * 0.3;

    // Apply Scenario Effects
    if (this.scenario === 'Normal Drilling') {
      vibration += (Math.random() - 0.5) * 0.5;
      if (bearingTemp > 87) bearingTemp -= 1.5;
      if (vibration > 13) vibration -= 1;
    } else if (this.scenario === 'Bearing Degradation') {
      bearingTemp += 0.8 + Math.random() * 0.5;
      vibration += 0.5 + Math.random() * 0.4;
      torque += 0.4 + Math.random() * 0.5;
      rop -= 0.15;
    } else if (this.scenario === 'High Vibration') {
      vibration += 1.8 + Math.random() * 1.5;
      wob -= 0.3;
    }

    // Constraints
    bearingTemp = Math.min(Math.max(bearingTemp, 85), 135);
    vibration = Math.min(Math.max(vibration, 8), 35);
    rop = Math.max(rop, 2);
    depth += (rop / 3600);

    this.state.telemetry = { ...this.state.telemetry, depth, rop, wob, rpm, torque, vibration, bearingTemp };
    this.updateHealthAndAlerts();
    this.updateSensors();
    this.notify();
  }

  private updateHealthAndAlerts() {
    const { bearingTemp, vibration, torque } = this.state.telemetry;
    const timeStr = new Date().toLocaleTimeString();

    // Bearing Health
    const bearingComp = this.state.components.find(c => c.id === 'mud-motor')!;
    if (bearingTemp > 115) {
      bearingComp.status = 'CRITICAL';
      bearingComp.health = Math.max(20, 100 - (bearingTemp - 95) * 2);
      this.addAlert('CRITICAL', 'Bearing temperature critical. High risk of failure.', 'bearing-crit', 'mud-motor', timeStr);
    } else if (bearingTemp > 95) {
      bearingComp.status = 'WARNING';
      bearingComp.health = 80;
      this.addAlert('WARNING', 'Elevated bearing temperature detected.', 'bearing-warn', 'mud-motor', timeStr);
    } else {
      bearingComp.status = 'NORMAL';
      bearingComp.health = 100;
    }

    // BHA Vibration Health
    const bhaComp = this.state.components.find(c => c.id === 'bha')!;
    if (vibration > 25) {
      bhaComp.status = 'CRITICAL';
      bhaComp.health = Math.max(20, 100 - (vibration - 15) * 3);
      this.addAlert('CRITICAL', 'Severe BHA vibration. Stick-slip risk.', 'vib-crit', 'bha', timeStr);
    } else if (vibration > 18) {
      bhaComp.status = 'WARNING';
      bhaComp.health = 75;
      this.addAlert('WARNING', 'High downhole vibration.', 'vib-warn', 'bha', timeStr);
    } else {
      bhaComp.status = 'NORMAL';
      bhaComp.health = 100;
    }

    // Drill Pipe Torque Health
    const pipeComp = this.state.components.find(c => c.id === 'drill-pipe')!;
    if (torque > 20) {
      pipeComp.status = 'WARNING';
      pipeComp.health = 85;
    } else {
      pipeComp.status = 'NORMAL';
      pipeComp.health = 100;
    }

    // Keep the display score within the requested presentation band. This score is
    // independent of component state and does not affect diagnostics or controls.
    const previousHealth = this.state.overallHealth;
    const step = Math.random() < 0.25 ? 2 : 1;
    const direction = Math.random() < 0.5 ? -1 : 1;
    const nextHealth = previousHealth + direction * step;
    this.state.overallHealth = nextHealth < 85 || nextHealth > 93
      ? previousHealth - direction * step
      : nextHealth;
  }

  private updateSensors() {
    const { rpm, wob, bearingTemp, vibration, torque, inclination, azimuth } = this.state.telemetry;
    const getStatus = (val: number, warn: number, crit: number): ComponentStatus => val >= crit ? 'CRITICAL' : val >= warn ? 'WARNING' : 'NORMAL';

    this.state.sensors = [
      { id: 's-bit-rpm', component: 'drill-bit', name: 'Bit RPM', value: rpm, unit: 'rpm', normalRange: [100, 150], status: 'NORMAL' },
      { id: 's-bit-wob', component: 'drill-bit', name: 'WOB', value: wob, unit: 'klbs', normalRange: [10, 25], status: 'NORMAL' },

      { id: 's-bha-vib', component: 'bha', name: 'Axial Vibration', value: vibration, unit: 'mm/s', normalRange: [0, 15], status: getStatus(vibration, 18, 25) },
      { id: 's-bha-inc', component: 'bha', name: 'Inclination', value: inclination, unit: '°', normalRange: [0, 5], status: 'NORMAL' },
      { id: 's-bha-azi', component: 'bha', name: 'Azimuth', value: azimuth, unit: '°', normalRange: [0, 360], status: 'NORMAL' },

      { id: 's-motor-temp', component: 'mud-motor', name: 'Bearing Temp', value: bearingTemp, unit: '°C', normalRange: [60, 95], status: getStatus(bearingTemp, 95, 115) },

      { id: 's-pipe-torq', component: 'drill-pipe', name: 'Torque', value: torque, unit: 'kN·m', normalRange: [10, 18], status: getStatus(torque, 18, 24) },
    ];
  }

  private addAlert(severity: 'INFO'|'WARNING'|'CRITICAL', message: string, id: string, componentId: string, time: string) {
    if (!this.state.alerts.find(a => a.id === id)) {
      this.state.alerts.unshift({ id, severity, message, time, componentId });
      // Keep only last 10 alerts
      if (this.state.alerts.length > 10) this.state.alerts.pop();
    }
  }
}

export const drillingDataService = new DrillingDataService();
