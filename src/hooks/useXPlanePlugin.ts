/**
 * React Hook for X-Plane Plugin Integration
 */
import { useState, useEffect, useCallback, useRef } from 'react';
import { XPlanePlugin, TelemetryUpdate, ConnectionStatus, MissionPhase } from '@/plugins/xplane';

interface UseXPlanePluginOptions {
  host?: string;
  port?: number;
  autoConnect?: boolean;
}

export function useXPlanePlugin(options: UseXPlanePluginOptions = {}) {
  const { host = 'localhost', port = 8787, autoConnect = false } = options;
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [telemetry, setTelemetry] = useState<TelemetryUpdate | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const pluginRef = useRef<XPlanePlugin | null>(null);

  // Initialize plugin
  useEffect(() => {
    pluginRef.current = new XPlanePlugin({
      host,
      port,
      onTelemetry: setTelemetry,
      onStatusChange: setStatus,
      onError: (err) => setError(err.message)
    });

    if (autoConnect) {
      pluginRef.current.connect();
    }

    return () => {
      pluginRef.current?.disconnect();
    };
  }, [host, port, autoConnect]);

  const connect = useCallback(async () => {
    setError(null);
    return pluginRef.current?.connect() ?? false;
  }, []);

  const disconnect = useCallback(() => {
    pluginRef.current?.disconnect();
  }, []);

  const startMission = useCallback((missionId: string) => {
    pluginRef.current?.startMission(missionId);
  }, []);

  const endMission = useCallback(() => {
    pluginRef.current?.endMission();
  }, []);

  const setPhase = useCallback((phase: MissionPhase) => {
    pluginRef.current?.setPhase(phase);
  }, []);

  return {
    status,
    telemetry,
    error,
    isConnected: status === 'connected',
    connect,
    disconnect,
    startMission,
    endMission,
    setPhase
  };
}

export default useXPlanePlugin;
