// @ts-nocheck
import { useState, useMemo } from 'react';
import { useBases } from '../hooks/useBases';
import { useHospitals } from '../hooks/useHospitals';
import { Activity, Map as MapIcon, Radio, Zap, Fuel, Clock, Send, Terminal } from 'lucide-react';
import TacticalMap from '../components/TacticalMap';

export default function Index() {
  const { bases } = useBases();
  const { hospitals } = useHospitals();
  
  const [selectedBaseId, setSelectedBaseId] = useState<string>("");
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<'dispatch' | 'map' | 'comms' | 'status'>('dispatch');
  const [isUplinkActive, setIsUplinkActive] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  // Telemetry Mock (In real usage, this comes from SimConnect/X-Plane API)
  const [telemetry] = useState({
      alt: 1200,
      spd: 110,
      fuel: 450,
      phase: 'IDLE'
  });

  const activeBase = useMemo(() => bases?.find(b => b.id === selectedBaseId), [bases, selectedBaseId]);
  const activeHospital = useMemo(() => hospitals?.find(h => h.id === selectedHospitalId), [hospitals, selectedHospitalId]);

  const handleDispatch = () => {
    if (activeBase && activeHospital) {
      setIsUplinkActive(true);
      setActiveTab('map');
      setLogs([{ sender: 'SYSTEM', msg: 'MISSION_DATA_SYNC_COMPLETE', time: 'NOW' }]);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#050505] text-[#00ff41] font-mono flex flex-col overflow-hidden selection:bg-[#00ff41]/30">
      {/* Tactical Header */}
      <nav className="border-b border-[#00ff41]/20 bg-black p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <span className="font-black italic tracking-tighter text-sm uppercase">HEMS<span className="text-primary">BRIDGE</span> v5.2</span>
        </div>
        <div className="flex gap-2">
            <div className={`px-2 py-0.5 rounded border border-[#00ff41]/30 text-[8px] font-bold ${isUplinkActive ? 'bg-[#00ff41]/10 text-[#00ff41]' : 'text-zinc-600'}`}>
                LINK_{isUplinkActive ? 'CONNECTED' : 'IDLE'}
            </div>
        </div>
      </nav>

      {/* Main HUD Viewport */}
      <main className="flex-grow flex flex-col min-h-0 relative">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 bg-zinc-900/50 border-b border-[#00ff41]/10 shrink-0">
            {[
                { id: 'dispatch', icon: Zap, label: 'DSCH' },
                { id: 'map', icon: MapIcon, label: 'RECON' },
                { id: 'comms', icon: Radio, label: 'COMMS' },
                { id: 'status', icon: Terminal, label: 'SYS' }
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? 'bg-[#00ff41]/10 border-b-2 border-[#00ff41]' : 'opacity-40 hover:opacity-100'}`}
                >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-[8px] font-black">{tab.label}</span>
                </button>
            ))}
        </div>

        <div className="flex-grow overflow-hidden relative">
            {/* 1. DISPATCH TAB */}
            {activeTab === 'dispatch' && (
                <div className="p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Launch Base</label>
                            <select 
                                value={selectedBaseId}
                                onChange={(e) => setSelectedBaseId(e.target.value)}
                                className="w-full bg-black border border-[#00ff41]/30 rounded p-3 text-xs focus:border-primary outline-none appearance-none"
                            >
                                <option value="">SELECT_STATION...</option>
                                {bases?.map(b => <option key={b.id} value={b.id}>{b.name.toUpperCase()}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest opacity-50">Receiving Node</label>
                            <select 
                                value={selectedHospitalId}
                                onChange={(e) => setSelectedHospitalId(e.target.value)}
                                className="w-full bg-black border border-[#00ff41]/30 rounded p-3 text-xs focus:border-primary outline-none appearance-none"
                            >
                                <option value="">SELECT_DESTINATION...</option>
                                {hospitals?.map(h => <option key={h.id} value={h.id}>{h.name.toUpperCase()}</option>)}
                            </select>
                        </div>
                    </div>
                    <button 
                        onClick={handleDispatch}
                        disabled={!activeBase || !activeHospital}
                        className="w-full h-14 bg-[#00ff41] text-black font-black italic uppercase text-xs rounded shadow-[0_0_20px_rgba(0,255,65,0.2)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
                    >
                        Initialize Tactical Link
                    </button>
                </div>
            )}

            {/* 2. MAP TAB */}
            {activeTab === 'map' && (
                <div className="h-full relative bg-zinc-950">
                    <TacticalMap 
                        baseCoords={activeBase ? [activeBase.latitude, activeBase.longitude] : undefined}
                        hospitalCoords={activeHospital ? [activeHospital.latitude, activeHospital.longitude] : undefined}
                    />
                    {/* HUD Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-2 pointer-events-none">
                        <div className="bg-black/80 backdrop-blur border border-[#00ff41]/20 p-2 rounded flex justify-between items-center">
                            <Fuel className="w-3 h-3 opacity-50" />
                            <span className="text-[10px] font-bold">{telemetry.fuel} LB</span>
                        </div>
                        <div className="bg-black/80 backdrop-blur border border-[#00ff41]/20 p-2 rounded flex justify-between items-center">
                            <Clock className="w-3 h-3 opacity-50" />
                            <span className="text-[10px] font-bold">12:00Z</span>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. COMMS TAB */}
            {activeTab === 'comms' && (
                <div className="h-full flex flex-col p-4">
                    <div className="flex-grow overflow-y-auto space-y-4 mb-4">
                        {logs.map((log, i) => (
                            <div key={i} className="space-y-1">
                                <p className="text-[7px] font-bold opacity-40">[{log.time}] {log.sender}</p>
                                <p className="text-[10px] leading-relaxed border-l-2 border-[#00ff41]/40 pl-2">{log.msg}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <input 
                            placeholder="INPUT_RADIO_MSG..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value.toUpperCase())}
                            className="flex-grow bg-zinc-900 border border-[#00ff41]/20 p-2 text-[10px] outline-none"
                        />
                        <button className="bg-[#00ff41] text-black px-3 rounded font-black"><Send className="w-4 h-4" /></button>
                    </div>
                </div>
            )}

            {/* 4. STATUS TAB */}
            {activeTab === 'status' && (
                <div className="h-full bg-black p-4 font-mono text-[9px] overflow-y-auto space-y-1 opacity-80">
                    <p className="text-primary font-bold">-- BRIDGE_DIAGNOSTICS --</p>
                    <p>SUPABASE_SESSION: VALID</p>
                    <p>SIM_LOCAL_API: PENDING_HANDSHAKE</p>
                    <p>COORDINATE_TRANSFORM: WGS-84</p>
                    <p>DATA_STREAM_RATE: 4.0Hz</p>
                    <p className="pt-4 text-primary animate-pulse">{'>'} LISTENING_FOR_PACKETS...</p>
                </div>
            )}
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="h-6 border-t border-[#00ff41]/10 bg-zinc-950 flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ff41] animate-pulse" />
            <span className="text-[7px] font-bold uppercase tracking-widest">System Nominal</span>
          </div>
          <span className="text-[7px] font-mono opacity-30">BRIDGE_CORE_v5.2.0</span>
      </footer>
    </div>
  );
}