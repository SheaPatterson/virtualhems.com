/**
 * VirtualHEMS X-Plane Plugin Client
 * Professional WebSocket-based communication with X-Plane
 */

import { TelemetryUpdate, ConnectionStatus, MissionPhase } from './types';

const WS_PORT = 8787;
const RECONNECT_INTERVAL = 3000;
const HEARTBEAT_INTERVAL = 5000;

export interface XPlanePluginConfig {
  host?: string;
  port?: number;
  onTelemetry?: (data: TelemetryUpdate) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  onError?: (error: Error) => void;
}

export class XPlanePlugin {
  private ws: WebSocket | null = null;
  private config: Required<XPlanePluginConfig>;
  private status: ConnectionStatus = 'disconnected';
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private missionId: string | null = null;

  constructor(config: XPlanePluginConfig = {}) {
    this.config = {
      host: config.host || 'localhost',
      port: config.port || WS_PORT,
      onTelemetry: config.onTelemetry || (() => {}),
      onStatusChange: config.onStatusChange || (() => {}),
      onError: config.onError || ((e) => console.error('[XPlane]', e)),
    };
  }

  async connect(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        this.setStatus('connecting');
        const url = `ws://${this.config.host}:${this.config.port}`;
        
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          console.log('[XPlane] Connected to X-Plane bridge');
          this.setStatus('connected');
          this.startHeartbeat();
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };
        
        this.ws.onerror = (error) => {
          console.error('[XPlane] WebSocket error:', error);
          this.config.onError(new Error('WebSocket connection failed'));
        };
        
        this.ws.onclose = () => {
          console.log('[XPlane] Connection closed');
          this.setStatus('disconnected');
          this.stopHeartbeat();
          this.scheduleReconnect();
        };
        
        // Timeout for initial connection
        setTimeout(() => {
          if (this.status === 'connecting') {
            this.ws?.close();
            resolve(false);
          }
        }, 5000);
        
      } catch (error) {
        this.setStatus('error');
        this.config.onError(error as Error);
        resolve(false);
      }
    });
  }

  disconnect(): void {
    this.clearReconnect();
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.setStatus('disconnected');
  }

  // Start a mission
  startMission(missionId: string): void {
    this.missionId = missionId;
    this.send({
      type: 'start_mission',
      missionId,
      timestamp: Date.now()
    });
  }

  // End current mission
  endMission(): void {
    this.send({
      type: 'end_mission',
      missionId: this.missionId,
      timestamp: Date.now()
    });
    this.missionId = null;
  }

  // Update mission phase
  setPhase(phase: MissionPhase): void {
    this.send({
      type: 'set_phase',
      phase,
      missionId: this.missionId,
      timestamp: Date.now()
    });
  }

  // Get current status
  getStatus(): ConnectionStatus {
    return this.status;
  }

  // Check if connected
  isConnected(): boolean {
    return this.status === 'connected' && this.ws?.readyState === WebSocket.OPEN;
  }

  private handleMessage(data: string): void {
    try {
      const msg = JSON.parse(data);
      
      switch (msg.type) {
        case 'telemetry':
          this.config.onTelemetry(msg.data as TelemetryUpdate);
          break;
        case 'status':
          console.log('[XPlane] Status:', msg);
          break;
        case 'error':
          this.config.onError(new Error(msg.message));
          break;
        case 'pong':
          // Heartbeat response
          break;
        default:
          console.log('[XPlane] Unknown message:', msg);
      }
    } catch (error) {
      console.error('[XPlane] Failed to parse message:', error);
    }
  }

  private send(data: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private setStatus(status: ConnectionStatus): void {
    if (this.status !== status) {
      this.status = status;
      this.config.onStatusChange(status);
    }
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping', timestamp: Date.now() });
    }, HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private scheduleReconnect(): void {
    if (!this.reconnectTimer) {
      this.reconnectTimer = window.setTimeout(() => {
        this.reconnectTimer = null;
        if (this.status === 'disconnected') {
          console.log('[XPlane] Attempting reconnection...');
          this.connect();
        }
      }, RECONNECT_INTERVAL);
    }
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

export default XPlanePlugin;
