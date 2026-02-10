/**
 * VirtualHEMS X-Plane Plugin Types
 */

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export type MissionPhase = 
  | 'Standby'
  | 'Dispatch'
  | 'Enroute to Scene'
  | 'On Scene'
  | 'Patient Loaded'
  | 'Enroute to Hospital'
  | 'At Hospital'
  | 'Returning to Base'
  | 'Mission Complete';

export interface TelemetryUpdate {
  latitude: number;
  longitude: number;
  altitudeFt: number;
  groundSpeedKts: number;
  headingDeg: number;
  verticalSpeedFtMin: number;
  fuelRemainingLbs: number;
  timeEnrouteMinutes?: number;
  engineStatus: 'Running' | 'Shutdown';
  onGround?: boolean;
  phase?: MissionPhase;
  missionId?: string;
  paused?: boolean;
}

export interface PluginStatus {
  connected: boolean;
  simulator: 'xplane' | 'msfs' | null;
  version: string;
  lastUpdate: number;
  missionActive: boolean;
}
