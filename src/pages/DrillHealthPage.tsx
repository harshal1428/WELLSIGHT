import { useEffect, useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Cylinder, Cone, Box, Bounds, useBounds } from '@react-three/drei';
import { LineChart, Line as RechartsLine, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, Info, Bell, BellOff, Target, Activity, Settings, ChevronRight } from 'lucide-react';
import * as THREE from 'three';
import { drillingDataService } from '../services/drillingDataService';
import type { DrillingDataState, ScenarioType, SensorData, ComponentStatus } from '../services/drillingDataService';

const advisoryDiagnostics = [
  {
    id: 'flow-variation',
    kind: 'ANOMALY',
    title: 'Flow trend variation',
    detail: 'A short-window flow variation is on the watch list for review.',
    component: 'Circulation',
  },
  {
    id: 'torque-variation',
    kind: 'ANOMALY',
    title: 'Torque trend deviation',
    detail: 'Minor torque movement is flagged for trend review; component state is unchanged.',
    component: 'Drill string',
  },
  {
    id: 'bearing-watch',
    kind: 'WARNING',
    title: 'Bearing temperature watch',
    detail: 'Review the temperature trend against the approved operating limit.',
    component: 'Mud motor / bearing',
  },
  {
    id: 'vibration-watch',
    kind: 'WARNING',
    title: 'Vibration trend watch',
    detail: 'Check recent vibration movement alongside the current drilling context.',
    component: 'BHA & sensors',
  },
] as const;

// --- 3D COMPONENTS (HIGH DETAIL) ---

const SensorMarker = ({ sensor, position, onClick }: { sensor: SensorData, position: [number, number, number], onClick: () => void }) => {
  return (
    <Html position={position} center distanceFactor={12} zIndexRange={[100, 0]}>
      <div
        className="relative group cursor-pointer p-2"
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        title="Click to focus"
      >
        <div className={`w-4 h-4 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] border-[2px] border-white transition-all duration-300 ${sensor.status === 'CRITICAL' ? 'bg-red-500 shadow-[0_0_15px_#ef4444] animate-pulse scale-125' : sensor.status === 'WARNING' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-emerald-500 hover:scale-125'}`} />
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{sensor.name}</p>
          <p className="text-sm font-bold text-slate-800 mt-0.5">{sensor.value.toFixed(1)} <span className="text-[10px] text-slate-500 font-normal">{sensor.unit}</span></p>
        </div>
      </div>
    </Html>
  );
};

const DetailedDrillBit = ({ status }: { status: string }) => {
  const isCrit = status === 'CRITICAL';
  const emissiveColor = isCrit ? '#ef4444' : '#000000';
  const emissiveInt = isCrit ? 0.6 : 0;

  const cutters = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => (
      <group key={i} rotation={[0, (i * Math.PI) / 3, 0]}>
        <Cone args={[0.2, 0.5, 8]} position={[0.7, -0.4, 0]} rotation={[0.4, 0, 0]}>
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </Cone>
      </group>
    ));
  }, []);

  return (
    <group position={[0, -4.5, 0]} name="drill-bit">
      {/* Bit body */}
      <Cylinder args={[0.8, 1.0, 1.2, 24]} position={[0, -0.6, 0]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.9} roughness={0.3} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </Cylinder>
      {/* Cutters */}
      {cutters}
      {/* Bit connector */}
      <Cylinder args={[0.6, 0.8, 0.6, 24]} position={[0, 0.3, 0]}>
        <meshStandardMaterial color="#9ca3af" metalness={0.8} roughness={0.4} />
      </Cylinder>
    </group>
  );
};

const DetailedMudMotor = ({ status }: { status: string }) => {
  const isCrit = status === 'CRITICAL';
  const isWarn = status === 'WARNING';
  const emissiveColor = isCrit ? '#ef4444' : isWarn ? '#f59e0b' : '#000000';
  const emissiveInt = (isCrit || isWarn) ? 0.5 : 0;

  return (
    <group position={[0, -2.5, 0]} name="mud-motor">
      {/* Bearing Housing */}
      <Cylinder args={[0.7, 0.7, 1.5, 24]} position={[0, -0.75, 0]}>
        <meshStandardMaterial color="#1d4ed8" metalness={0.5} roughness={0.6} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </Cylinder>
      {/* Power Section (Stator housing) */}
      <Cylinder args={[0.75, 0.75, 2, 24]} position={[0, 1, 0]}>
        <meshStandardMaterial color="#1e40af" metalness={0.4} roughness={0.7} />
      </Cylinder>
      {/* Connection threads */}
      <Cylinder args={[0.65, 0.65, 0.4, 24]} position={[0, -1.7, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
      </Cylinder>
      <Cylinder args={[0.65, 0.65, 0.4, 24]} position={[0, 2.2, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.2} />
      </Cylinder>
    </group>
  );
};

const DetailedBHA = ({ status }: { status: string }) => {
  const isCrit = status === 'CRITICAL';
  const emissiveColor = isCrit ? '#ef4444' : '#000000';
  const emissiveInt = isCrit ? 0.5 : 0;

  const blades = useMemo(() => {
    return Array.from({ length: 4 }).map((_, i) => (
      <Box key={i} args={[0.3, 1.8, 2.0]} position={[0, 0, 0]} rotation={[0, (i * Math.PI) / 4, 0.1]}>
        <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.4} />
      </Box>
    ));
  }, []);

  return (
    <group position={[0, 1.5, 0]} name="bha">
      {/* Collar body */}
      <Cylinder args={[0.8, 0.8, 4.5, 24]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </Cylinder>
      {/* Stabilizer 1 */}
      <group position={[0, -1.5, 0]}>
        {blades}
      </group>
      {/* Stabilizer 2 */}
      <group position={[0, 1.5, 0]}>
        {blades}
      </group>
    </group>
  );
};

const DetailedDrillPipe = ({ status }: { status: string }) => {
  const isWarn = status === 'WARNING';
  const emissiveColor = isWarn ? '#f59e0b' : '#000000';
  const emissiveInt = isWarn ? 0.3 : 0;

  return (
    <group position={[0, 8, 0]} name="drill-pipe">
      {/* Pipe body 1 */}
      <Cylinder args={[0.5, 0.5, 9, 24]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.5} emissive={emissiveColor} emissiveIntensity={emissiveInt} />
      </Cylinder>
      {/* Tool Joint (Box) */}
      <Cylinder args={[0.7, 0.7, 0.8, 24]} position={[0, -4.75, 0]}>
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </Cylinder>
    </group>
  );
};

const AssemblyModel = ({ rpm, state, onComponentClick }: { rpm: number, state: DrillingDataState, onComponentClick: (name: string) => void }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current && rpm > 0) {
      groupRef.current.rotation.y -= (rpm / 60) * delta * 2;
    }
  });

  const getCompStatus = (id: string) => state.components.find(c => c.id === id)?.status || 'NORMAL';

  return (
    <group name="assembly">
      <group ref={groupRef}>
        <DetailedDrillPipe status={getCompStatus('drill-pipe')} />
        <DetailedBHA status={getCompStatus('bha')} />
        <DetailedMudMotor status={getCompStatus('mud-motor')} />
        <DetailedDrillBit status={getCompStatus('drill-bit')} />
      </group>

      {/* Static Sensor Attachments */}
      {state.sensors.map(sensor => {
        let pos: [number, number, number] = [0, 0, 0];
        // Note: Position them slightly outside the rotating components
        if (sensor.component === 'drill-bit') pos = [1.1, -4.8, 0];
        if (sensor.component === 'mud-motor') pos = [0.8, -2.5, 0.8];
        if (sensor.component === 'bha') pos = [0.9, 1.5, -0.9];
        if (sensor.component === 'drill-pipe') pos = [-0.7, 6, 0];

        return (
          <SensorMarker
            key={sensor.id}
            sensor={sensor}
            position={pos}
            onClick={() => onComponentClick(sensor.component)}
          />
        );
      })}
    </group>
  );
};

const ControlsHelper = ({ target }: { target: string | null }) => {
  const bounds = useBounds();

  useEffect(() => {
    try {
      if (target) {
        bounds.refresh().clip().fit();
      } else {
        bounds.refresh().clip().fit();
      }
    } catch(e) {
      console.warn("Bounds error", e);
    }
  }, [target, bounds]);

  return null;
};

// --- PAGE COMPONENT ---
export function DrillHealthPage() {
  const [dataState, setDataState] = useState<DrillingDataState>(drillingDataService['state']);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [activeScenario, setActiveScenario] = useState<ScenarioType>('Normal Drilling');
  const [focusTarget, setFocusTarget] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const beepIntervalRef = useRef<number | null>(null);

  // Subscription
  useEffect(() => {
    const unsub = drillingDataService.subscribe((newState) => {
      setDataState(newState);
      setHistory(prev => {
        const next = [...prev, {
          time: new Date().toLocaleTimeString(),
          rop: newState.telemetry.rop,
          torque: newState.telemetry.torque,
          vibration: newState.telemetry.vibration,
          temp: newState.telemetry.bearingTemp
        }];
        return next.slice(-60);
      });
    });
    return unsub;
  }, []);

  // Start simulation automatically on mount
  useEffect(() => {
    drillingDataService.startSimulation();
    return () => drillingDataService.pauseSimulation();
  }, []);

  const changeScenario = (s: ScenarioType) => {
    setActiveScenario(s);
    drillingDataService.setScenario(s);
  };

  // Audio Alerts
  useEffect(() => {
    const isCritical = dataState.components.some(c => c.status === 'CRITICAL');
    if (isCritical && alertsEnabled) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (!beepIntervalRef.current) {
        beepIntervalRef.current = window.setInterval(() => {
          if (!audioCtxRef.current) return;
          const osc = audioCtxRef.current.createOscillator();
          const gain = audioCtxRef.current.createGain();
          osc.connect(gain);
          gain.connect(audioCtxRef.current.destination);
          osc.type = 'square';
          osc.frequency.setValueAtTime(1200, audioCtxRef.current.currentTime);
          gain.gain.setValueAtTime(0.05, audioCtxRef.current.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + 0.1);
          osc.start();
          osc.stop(audioCtxRef.current.currentTime + 0.1);
        }, 400);
      }
    } else {
      if (beepIntervalRef.current) {
        clearInterval(beepIntervalRef.current);
        beepIntervalRef.current = null;
      }
    }
    return () => {
      if (beepIntervalRef.current) clearInterval(beepIntervalRef.current);
    };
  }, [dataState.components, alertsEnabled]);


  return (
    <div className="flex flex-col h-[calc(100vh-96px)] min-h-[700px] overflow-hidden bg-surface-primary text-slate-300">

      {/* HEADER */}
      <header className="flex-none bg-surface-card border-b border-border-default px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-accent-500/10 flex items-center justify-center border border-accent-500/20">
            <Target className="w-5 h-5 text-accent-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              3D Drill Health
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-500 text-navy-950 uppercase tracking-widest animate-pulse">Digital Twin Active</span>
            </h1>
            <p className="text-xs text-slate-400">OIL-X23 | Assam Basin | Depth: {dataState.telemetry.depth.toFixed(1)} m</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-surface-card border border-border-default rounded-lg px-2 py-1 shadow-sm">
            <Settings size={14} className="text-slate-500" />
            <select
              value={activeScenario}
              onChange={(e) => changeScenario(e.target.value as ScenarioType)}
              className="bg-transparent text-sm text-slate-700 outline-none cursor-pointer"
            >
              <option value="Normal Drilling">Normal Drilling</option>
              <option value="Bearing Degradation">Bearing Degradation</option>
              <option value="High Vibration">High Vibration</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Data Feed
          </div>

          <button
            onClick={() => setAlertsEnabled(!alertsEnabled)}
            className={`p-2 rounded-lg border transition-colors ${alertsEnabled ? 'bg-surface-card border-border-default text-slate-500 hover:text-slate-700 hover:bg-slate-50' : 'bg-red-50 text-red-500 border-red-200'}`}
            title={alertsEnabled ? 'Mute Alerts' : 'Enable Alerts'}
          >
            {alertsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">

        {/* LEFT: 3D VISUALIZATION */}
        <div className="flex-1 flex flex-col bg-surface-primary border-r border-border-default overflow-hidden">

          <div className="flex-1 relative min-h-[400px]">
            <div className="absolute top-4 left-4 z-10">
              <div className={`px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg ${dataState.overallHealth > 80 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : dataState.overallHealth > 60 ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <p className="text-[10px] uppercase font-bold tracking-wider opacity-80 flex items-center gap-1.5"><Activity size={12}/> Overall Health</p>
                <p className="text-3xl font-bold mt-1">{dataState.overallHealth}%</p>
              </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 z-10 text-center pointer-events-none">
              <p className="text-xs font-medium text-slate-500 bg-white/90 inline-block px-4 py-1.5 rounded-full backdrop-blur-sm border border-slate-200 shadow-sm">
                Drag to Rotate • Right-Drag to Pan • Scroll to Zoom
              </p>
            </div>

            <Canvas camera={{ position: [0, 0, 25], fov: 40 }} gl={{ antialias: true }}>
              <color attach="background" args={['#ffffff']} />
              <fog attach="fog" args={['#ffffff', 20, 80]} />

              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 20, 15]} intensity={2.0} />
              <pointLight position={[-10, -10, -10]} intensity={1.0} />

              <Bounds fit clip observe margin={1.2}>
                <ControlsHelper target={focusTarget} />
                <group position={[0, (dataState.telemetry.depth % 10), 0]}>
                  <AssemblyModel
                    rpm={dataState.telemetry.rpm}
                    state={dataState}
                    onComponentClick={(id) => setFocusTarget(id)}
                  />
                </group>
              </Bounds>

              <OrbitControls
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={50}
              />
            </Canvas>
          </div>
        </div>

        {/* RIGHT: ANALYTICS & INSPECTION */}
        <div className="w-full lg:w-[500px] xl:w-[580px] flex flex-col min-h-0 bg-surface-primary overflow-y-auto border-l border-border-default">

          {/* Inspect Component */}
          <div className="p-5 border-b border-border-default flex flex-col gap-4 bg-surface-primary">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2"><Target size={14} /> Inspect Component</h2>

            <div className="flex flex-col md:flex-row gap-4">
              {/* List */}
              <div className="w-full md:w-[45%] flex flex-col gap-2">
                {dataState.components.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => setFocusTarget(comp.id)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 ${focusTarget === comp.id ? 'bg-accent-500/10 border-accent-500/50 !text-navy-50 shadow-sm' : 'bg-surface-card border-border-default !text-slate-300 hover:bg-surface-elevated hover:border-accent-500/40'}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${comp.status === 'CRITICAL' ? 'bg-red-500' : comp.status === 'WARNING' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      {comp.name}
                    </span>
                    <ChevronRight size={14} className="opacity-50" />
                  </button>
                ))}
                <button
                  onClick={() => setFocusTarget(null)}
                  className="w-full flex justify-center items-center gap-2 px-3 py-2 mt-1 rounded-xl text-[10px] font-semibold uppercase tracking-wider bg-surface-card border border-border-default !text-slate-300 hover:bg-surface-elevated hover:border-accent-500/40 hover:!text-accent-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500/40 transition-colors"
                >
                  Reset View
                </button>
              </div>

              {/* Details */}
              <div className="w-full md:w-[55%] flex flex-col">
                {focusTarget ? (
                  <div className="p-4 bg-surface-card border border-border-default rounded-xl flex-1 flex flex-col justify-start">
                    <p className="text-xs font-extrabold !text-navy-50 mb-1.5 uppercase tracking-wide">{dataState.components.find(c => c.id === focusTarget)?.name}</p>
                    <p className="text-xs !text-slate-300 leading-relaxed font-medium">
                      {focusTarget === 'drill-bit' && "The drill bit physically cuts the rock. It experiences high torque and RPM, requiring constant cooling and monitoring."}
                      {focusTarget === 'bha' && "The Bottom Hole Assembly contains heavy drill collars and critical measurement-while-drilling (MWD) sensors."}
                      {focusTarget === 'mud-motor' && "The mud motor converts fluid pressure into mechanical rotation, utilizing a sealed bearing assembly that is vulnerable to overheating."}
                      {focusTarget === 'drill-pipe' && "The drill pipe transmits rotation and fluid to the BHA. Subject to immense tensile and torsional stress."}
                      {focusTarget === 'stabilizer' && "Stabilizers keep the BHA centered in the wellbore, reducing harmful vibrations and ensuring a straight hole."}
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-xl flex-1 flex flex-col justify-start">
                    <p className="text-xs font-extrabold text-[#1d4ed8] uppercase tracking-wide mb-1.5 flex items-center gap-2">
                      <Info size={14}/> Sensor Markers
                    </p>
                    <p className="text-xs text-[#3b82f6] leading-relaxed font-medium">
                      The glowing dots on the 3D model represent physical sensor locations. Hover for real-time telemetry or click to focus.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Live Parameters Grid */}
          <div className="p-5 border-b border-border-default">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Activity size={14} /> Telemetry Feed</h2>
            <div className="grid grid-cols-3 gap-3">
              <ParamCard label="Depth" value={dataState.telemetry.depth.toFixed(1)} unit="m" />
              <ParamCard label="ROP" value={dataState.telemetry.rop.toFixed(1)} unit="m/hr" />
              <ParamCard label="WOB" value={dataState.telemetry.wob.toFixed(1)} unit="klbs" />
              <ParamCard label="RPM" value={dataState.telemetry.rpm.toFixed(0)} unit="rpm" />
              <ParamCard label="Torque" value={dataState.telemetry.torque.toFixed(1)} unit="kN·m" status={dataState.sensors.find(s => s.name === 'Torque')?.status} />
              <ParamCard label="Flow" value={dataState.telemetry.mudFlow.toFixed(0)} unit="L/min" />
              <ParamCard label="Bearing Temp" value={dataState.telemetry.bearingTemp.toFixed(1)} unit="°C" status={dataState.sensors.find(s => s.name === 'Bearing Temp')?.status} />
              <ParamCard label="Vibration" value={dataState.telemetry.vibration.toFixed(1)} unit="mm/s" status={dataState.sensors.find(s => s.name === 'Axial Vibration')?.status} />
              <ParamCard label="Pressure" value={dataState.telemetry.pressure.toFixed(0)} unit="psi" />
            </div>
          </div>

          {/* Live Charts */}
          <div className="p-5 border-b border-border-default">
             <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Real-time Analytics</h2>
             <div className="h-40 bg-surface-card rounded-xl border border-border-default p-3 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wider ml-2">Temperature & Vibration Trend</p>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis yAxisId="left" stroke="#64748b" tick={{fontSize: 9}} width={35} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#64748b" tick={{fontSize: 9}} width={35} domain={[0, 'auto']} />
                    <RechartsTooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '12px', borderRadius: '8px'}} />
                    <RechartsLine yAxisId="left" type="monotone" dataKey="temp" name="Temp °C" stroke="#f59e0b" strokeWidth={2} dot={false} isAnimationActive={false} />
                    <RechartsLine yAxisId="right" type="monotone" dataKey="vibration" name="Vib mm/s" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Alerts & Recommendations */}
          <div className="p-5 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Diagnostics & Alerts</h2>

            {dataState.alerts.filter(a => a.severity === 'CRITICAL').length > 0 && (
              <div className="mb-5 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-sm">
                <h3 className="text-sm font-bold text-red-700 flex items-center gap-2"><AlertTriangle size={18} /> CRITICAL ANOMALY DETECTED</h3>
                <p className="text-xs text-red-600 mt-2 leading-relaxed">
                  Multiple sensor thresholds exceeded on {dataState.components.filter(c => c.status === 'CRITICAL').map(c => c.name).join(', ')}. Immediate action required to prevent catastrophic failure.
                </p>
                <div className="mt-4 bg-white rounded-lg p-3 border border-red-100 shadow-sm">
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5"><Info size={12}/> Recommended Action</p>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">Reduce WOB by 15-20% and decrease RPM immediately. Circulate bottoms up. Monitor shakers for metal debris. If condition persists for &gt;5 mins, prepare to trip out.</p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {dataState.alerts.map(alert => (
                  <div key={alert.id + alert.time} className={`p-4 rounded-xl border-2 text-xs flex gap-3 shadow-sm ${alert.severity === 'CRITICAL' ? 'bg-red-50 border-red-200 text-red-800' : alert.severity === 'WARNING' ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-white border-slate-200 text-slate-700'}`}>
                    <div className={`mt-1 w-2.5 h-2.5 shrink-0 rounded-full shadow-sm ${alert.severity === 'CRITICAL' ? 'bg-red-500' : alert.severity === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                    <div className="flex-1">
                      <p className={`font-bold text-sm mb-1 ${alert.severity === 'CRITICAL' ? 'text-red-700' : alert.severity === 'WARNING' ? 'text-amber-700' : 'text-slate-700'}`}>{alert.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-[10px] font-bold opacity-70 uppercase tracking-wider bg-white/50 px-2 py-1 rounded">{dataState.components.find(c => c.id === alert.componentId)?.name}</p>
                        <p className="text-[10px] opacity-70 font-medium">{alert.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="mt-5">
              <div className="flex items-center mb-3">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Monitoring observations</h3>
              </div>
              <div className="space-y-2">
                {advisoryDiagnostics.map((item) => {
                  const isWarning = item.kind === 'WARNING';
                  return (
                    <div key={item.id} className={`rounded-lg border p-3 ${isWarning ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50'}`}>
                      <div className="flex items-start gap-2.5">
                        {isWarning
                          ? <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                          : <Info size={15} className="mt-0.5 shrink-0 text-sky-600" />}
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className={`text-xs font-bold ${isWarning ? 'text-amber-800' : 'text-sky-800'}`}>{item.title}</p>
                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isWarning ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'}`}>{item.kind}</span>
                          </div>
                          <p className={`mt-1 text-[11px] leading-relaxed ${isWarning ? 'text-amber-900' : 'text-sky-900'}`}>{item.detail}</p>
                          <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-wider text-slate-500">{item.component}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ParamCard({ label, value, unit, status = 'NORMAL' }: { label: string, value: string, unit: string, status?: ComponentStatus }) {
  const isCrit = status === 'CRITICAL';
  const isWarn = status === 'WARNING';

  const color = isCrit ? 'text-red-400' : isWarn ? 'text-amber-400' : 'text-white';
  const bg = isCrit ? 'bg-red-500/10 border-red-500/30 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]' : isWarn ? 'bg-amber-500/10 border-amber-500/30' : 'bg-surface-card border-border-default hover:border-slate-600';

  return (
    <div className={`p-3 rounded-xl border ${bg} transition-all duration-300`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider ${isCrit ? 'text-red-500' : isWarn ? 'text-amber-500' : 'text-slate-500'}`}>{label}</p>
      <p className={`text-xl font-bold mt-1 ${color} tracking-tight`}>{value} <span className="text-[10px] font-medium text-slate-500 ml-0.5 tracking-normal">{unit}</span></p>
    </div>
  );
}
