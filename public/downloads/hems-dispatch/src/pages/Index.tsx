import { useState, useMemo } from 'react';
import { useBases } from '../hooks/useBases';
import { useHospitals } from '../hooks/useHospitals';
import { HemsBase, Hospital } from '../types/models';
import { Activity, Map as MapIcon, Plane, Info } from 'lucide-react';
import TacticalMap from '../components/TacticalMap';

export default function Index() {
  const { bases } = useBases();
  const { hospitals } = useHospitals();
  
  const [selectedBaseName, setSelectedBaseName] = useState<string>("");
  const [selectedHospitalName, setSelectedHospitalName] = useState<string>("");
  const [isMissionActive, setIsMissionActive] = useState(false);

  const activeBase = useMemo(() => 
    bases?.find((b: HemsBase) => b.name === selectedBaseName), 
  [bases, selectedBaseName]);

  const activeHospital = useMemo(() => 
    hospitals?.find((h: Hospital) => h.name === selectedHospitalName), 
  [hospitals, selectedHospitalName]);

  const handleGenerateFlightPlan = () => {
    if (activeBase && activeHospital) {
      setIsMissionActive(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-slate-200 font-sans">
      <nav className="border-b border-slate-800 bg-[#0f1117] px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-1.5 rounded-md">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold tracking-tight text-lg uppercase">HEMS<span className="text-orange-500">DYAD</span> Dispatch</span>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-800/50 rounded text-[10px] font-bold border border-slate-700 tracking-widest uppercase">
            <div className={`w-2 h-2 rounded-full ${isMissionActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`} />
            SIMLINK: {isMissionActive ? 'ACTIVE' : 'IDLE'}
          </div>
        </div>
      </nav>

      <div className="p-6 max-w-[1800px] mx-auto">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-6 text-orange-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                <MapIcon className="w-4 h-4" />
                Mission Parameters
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">Launch Base</label>
                  <select 
                    value={selectedBaseName}
                    onChange={(e) => setSelectedBaseName(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none transition-colors text-white"
                  >
                    <option value="">Select Base</option>
                    {bases?.map((b: HemsBase) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">Receiving Facility</label>
                  <select 
                    value={selectedHospitalName}
                    onChange={(e) => setSelectedHospitalName(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-lg p-3 text-sm focus:border-orange-500 outline-none transition-colors text-white"
                  >
                    <option value="">Select Hospital</option>
                    {hospitals?.map((h: Hospital) => (
                      <option key={h.id} value={h.name}>{h.name}</option>
                    ))}
                  </select>
                </div>
                
                <button 
                  onClick={handleGenerateFlightPlan}
                  disabled={!activeBase || !activeHospital}
                  className="w-full bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 hover:bg-orange-600 text-black font-black py-4 rounded-lg transition-all flex items-center justify-center gap-2 mt-4 text-xs tracking-widest uppercase"
                >
                  <Plane className="w-4 h-4" />
                  Generate Flight Plan
                </button>
              </div>
            </div>

            <div className="bg-[#161b22] border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-4">
                <h3 className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Selection Status</h3>
                <Info className="w-3 h-3 text-slate-600" />
              </div>
              <div className="space-y-4 font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Base</span>
                  <span className="text-orange-400 text-xs">{selectedBaseName || "---"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-[10px] uppercase">Destination</span>
                  <span className="text-orange-400 text-xs">{selectedHospitalName || "---"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8 bg-[#161b22] border border-slate-800 rounded-xl p-1 relative overflow-hidden shadow-2xl min-h-[700px]">
            {activeBase && activeHospital ? (
              <TacticalMap 
                baseCoords={[activeBase.latitude, activeBase.longitude]}
                hospitalCoords={[activeHospital.latitude, activeHospital.longitude]}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 bg-[#0d1117]">
                <MapIcon className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-xs font-bold opacity-30 uppercase tracking-[0.3em]">Awaiting Dispatch Data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}