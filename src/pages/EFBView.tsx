import { useState, useEffect } from 'react';
import { 
  Plane, MapPin, Fuel, Clock, Gauge, Navigation, 
  Activity, Radio, AlertTriangle, CheckCircle,
  Wifi, WifiOff, Battery, BatteryLow
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useXPlanePlugin } from '@/hooks/useXPlanePlugin';
import { useMSFSPlugin } from '@/hooks/useMSFSPlugin';
import { useActiveMissions } from '@/hooks/useMissions';

/**
 * iPad EFB (Electronic Flight Bag) View
 * Optimized for landscape cockpit use with large touch targets
 */
const EFBView = () => {
  const [simulator, setSimulator] = useState<'xplane' | 'msfs' | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const xplane = useXPlanePlugin({ autoConnect: false });
  const msfs = useMSFSPlugin({ autoConnect: false });
  const { data: missions } = useActiveMissions();
  
  const activeMission = missions?.[0];
  const isConnected = xplane.isConnected || msfs.isConnected;
  const telemetry = xplane.telemetry || msfs.telemetry;

  // Update clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-detect simulator
  useEffect(() => {
    const tryConnect = async () => {
      if (await xplane.connect()) {
        setSimulator('xplane');
      } else if (await msfs.connect()) {
        setSimulator('msfs');
      }
    };
    tryConnect();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: false 
    });
  };

  const formatZulu = (date: Date) => {
    return date.toISOString().slice(11, 19) + 'Z';
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 select-none">
      {/* Top Status Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm font-mono">
              {simulator ? simulator.toUpperCase() : 'NO SIM'}
            </span>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="font-mono">
            {isConnected ? 'CONNECTED' : 'OFFLINE'}
          </Badge>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-black tracking-tight text-orange-500">HEMS EFB</h1>
        </div>
        
        <div className="flex items-center gap-6 font-mono text-sm">
          <div className="text-right">
            <div className="text-muted-foreground text-xs">LOCAL</div>
            <div className="text-lg font-bold">{formatTime(currentTime)}</div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-xs">ZULU</div>
            <div className="text-lg font-bold text-blue-400">{formatZulu(currentTime)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
        {/* Left Panel - Primary Flight Data */}
        <div className="col-span-4 space-y-4">
          {/* Airspeed & Altitude */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">GND SPEED</div>
                <div className="text-5xl font-black font-mono text-green-400">
                  {telemetry?.groundSpeedKts || '---'}
                </div>
                <div className="text-xs text-muted-foreground">KTS</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">ALTITUDE</div>
                <div className="text-5xl font-black font-mono text-cyan-400">
                  {telemetry?.altitudeFt || '---'}
                </div>
                <div className="text-xs text-muted-foreground">FT MSL</div>
              </div>
            </div>
          </Card>

          {/* Heading & VS */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">HEADING</div>
                <div className="text-4xl font-black font-mono text-yellow-400">
                  {telemetry?.headingDeg?.toString().padStart(3, '0') || '---'}°
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-muted-foreground mb-1">V/S</div>
                <div className={`text-4xl font-black font-mono ${
                  (telemetry?.verticalSpeedFtMin || 0) > 0 ? 'text-green-400' : 
                  (telemetry?.verticalSpeedFtMin || 0) < 0 ? 'text-red-400' : 'text-white'
                }`}>
                  {telemetry?.verticalSpeedFtMin || '---'}
                </div>
                <div className="text-xs text-muted-foreground">FPM</div>
              </div>
            </div>
          </Card>

          {/* Position */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4">
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-3 h-3" /> POSITION
            </div>
            <div className="font-mono text-sm space-y-1">
              <div>LAT: {telemetry?.latitude?.toFixed(5) || '---'}</div>
              <div>LON: {telemetry?.longitude?.toFixed(5) || '---'}</div>
            </div>
          </Card>

          {/* Fuel */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Fuel className="w-3 h-3" /> FUEL REMAINING
              </div>
              <Badge variant="outline" className="font-mono">
                {telemetry?.engineStatus || 'UNKNOWN'}
              </Badge>
            </div>
            <div className="text-3xl font-black font-mono text-orange-400">
              {telemetry?.fuelRemainingLbs || '---'} <span className="text-lg">LBS</span>
            </div>
            <Progress 
              value={telemetry?.fuelRemainingLbs ? (telemetry.fuelRemainingLbs / 1500) * 100 : 0} 
              className="mt-2 h-3"
            />
          </Card>
        </div>

        {/* Center Panel - Mission Info */}
        <div className="col-span-5 space-y-4">
          {/* Mission Card */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4 h-full">
            {activeMission ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-muted-foreground">ACTIVE MISSION</div>
                    <div className="text-2xl font-black text-orange-500">{activeMission.callsign}</div>
                  </div>
                  <Badge className="text-lg px-4 py-1 bg-green-600">{activeMission.tracking?.phase || 'DISPATCH'}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">ORIGIN</div>
                    <div className="font-bold">{activeMission.origin?.name || 'N/A'}</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">SCENE</div>
                    <div className="font-bold text-red-400">{activeMission.pickup?.name || 'N/A'}</div>
                  </div>
                  <div className="bg-zinc-800 rounded-xl p-3 text-center">
                    <div className="text-xs text-muted-foreground mb-1">DESTINATION</div>
                    <div className="font-bold text-blue-400">{activeMission.destination?.name || 'N/A'}</div>
                  </div>
                </div>

                {/* Patient Info */}
                {activeMission.patientDetails && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
                    <div className="text-xs text-red-400 mb-1 flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" /> PATIENT INFO
                    </div>
                    <div className="text-sm">{activeMission.patientDetails}</div>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span>Age: {activeMission.patientAge || 'UNK'}</span>
                      <span>Gender: {activeMission.patientGender || 'UNK'}</span>
                      <span>Weight: {activeMission.patientWeightLbs || 'UNK'} lbs</span>
                    </div>
                  </div>
                )}

                {/* Phase Buttons */}
                <div className="mt-auto grid grid-cols-3 gap-2">
                  {['Enroute to Scene', 'On Scene', 'Patient Loaded', 'Enroute to Hospital', 'At Hospital', 'Mission Complete'].map((phase) => (
                    <Button
                      key={phase}
                      variant={activeMission.tracking?.phase === phase ? "default" : "outline"}
                      className="h-12 text-xs font-bold"
                      onClick={() => {
                        if (xplane.isConnected) xplane.setPhase(phase as any);
                        if (msfs.isConnected) msfs.setPhase(phase as any);
                      }}
                    >
                      {phase.replace('Enroute to ', '→ ')}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <Plane className="w-16 h-16 mb-4 opacity-30" />
                <div className="text-lg font-bold">NO ACTIVE MISSION</div>
                <div className="text-sm">Start a mission from the web app</div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Panel - Quick Actions & Status */}
        <div className="col-span-3 space-y-4">
          {/* Connection Controls */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4">
            <div className="text-xs text-muted-foreground mb-3">SIMULATOR</div>
            <div className="space-y-2">
              <Button 
                variant={simulator === 'xplane' ? "default" : "outline"} 
                className="w-full h-14 text-lg font-bold"
                onClick={async () => {
                  msfs.disconnect();
                  if (await xplane.connect()) setSimulator('xplane');
                }}
              >
                <Plane className="w-5 h-5 mr-2" />
                X-PLANE
              </Button>
              <Button 
                variant={simulator === 'msfs' ? "default" : "outline"} 
                className="w-full h-14 text-lg font-bold"
                onClick={async () => {
                  xplane.disconnect();
                  if (await msfs.connect()) setSimulator('msfs');
                }}
              >
                <Activity className="w-5 h-5 mr-2" />
                MSFS
              </Button>
            </div>
          </Card>

          {/* Quick Status */}
          <Card className="bg-zinc-900/80 border-zinc-700 p-4">
            <div className="text-xs text-muted-foreground mb-3">SYSTEM STATUS</div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Simulator</span>
                {isConnected ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Telemetry</span>
                {telemetry ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Mission</span>
                {activeMission ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                )}
              </div>
            </div>
          </Card>

          {/* Aircraft Info */}
          {activeMission?.helicopter && (
            <Card className="bg-zinc-900/80 border-zinc-700 p-4">
              <div className="text-xs text-muted-foreground mb-2">AIRCRAFT</div>
              <div className="font-bold text-lg">{activeMission.helicopter.model}</div>
              <div className="text-muted-foreground">{activeMission.helicopter.registration}</div>
            </Card>
          )}

          {/* Navigation Link */}
          <Button 
            variant="outline" 
            className="w-full h-12"
            onClick={() => window.location.href = '/dashboard'}
          >
            ← Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EFBView;
