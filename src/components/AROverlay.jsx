// src/components/AROverlay.jsx
// Immersive Video-Based AR View for Future-State Infrastructure Simulation

import { useState, useRef, useEffect } from "react";
import { Camera, Layers, Navigation, Wifi, WifiOff, Boxes, Info, ArrowLeft, Zap, Play, Maximize2 } from "lucide-react";
import { projects, categoryColors } from "../data/projects";
import { demoProjects } from "../data/demoProjects";

// Video Mapping for Future Visions
const videoMap = {
  hospital_001: "/videos/hospital.mp4",
  school_001: "/videos/school.mp4",
  bridge_001: "/videos/bridge.mp4",
  metro_001: "/videos/metro.mp4"
};

const arCards = [
  { id: "hospital_001", x: "15%", y: "25%", distance: "280m" },
  { id: "school_001", x: "65%", y: "20%", distance: "450m" },
  { id: "bridge_001", x: "25%", y: "65%", distance: "1.8km" },
  { id: "metro_001", x: "50%", y: "55%", distance: "2.5km" },
];

export default function AROverlay({ initialProjectId, onClearProject }) {
  const [active, setActive] = useState(!!initialProjectId);
  const [selectedCardId, setSelectedCardId] = useState(initialProjectId);
  const [videoError, setVideoError] = useState(false);

  const startAR = () => {
    setActive(true);
  };

  const stopAR = () => {
    setActive(false);
    setSelectedCardId(null);
    if (onClearProject) onClearProject();
  };

  useEffect(() => {
    if (initialProjectId) {
      startAR();
      setSelectedCardId(initialProjectId);
    }
  }, [initialProjectId]);

  const params = new URLSearchParams(window.location.search);
  const urlId = params.get("id");
  const projectId = urlId || selectedCardId;
  const currentProject = demoProjects.find(p => p.id === projectId) || projects.find(p => p.id === projectId);
  const videoSource = currentProject?.video || videoMap[projectId];

  console.log("Loaded Project:", currentProject);
  console.log("Video Path:", currentProject?.video);

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col font-sans">
      {!active ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gray-950">
          <div className="w-24 h-24 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
            <Boxes size={48} className="text-cyan-400" />
          </div>
          <h1 className="text-3xl font-black text-white mb-4 tracking-tighter italic uppercase">Video AR Engine</h1>
          <p className="text-gray-500 text-xs max-w-xs mb-10 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Experience immersive "Future Visions" through real-time physical site mapping.
          </p>
          <button
            onClick={startAR}
            className="flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-black rounded-2xl transition-all hover:scale-105 active:scale-95 text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(6,182,212,0.3)]"
          >
            <Camera size={18} strokeWidth={2.5} />
            Initialize AR View
          </button>
        </div>
      ) : (
        <div className="relative flex-1 bg-black overflow-hidden font-mono">
          {/* Simulated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-0" />
          <div className="absolute inset-0 backdrop-blur-sm z-0" />

          {/* Scanning Lines HUD */}
          <div className="absolute inset-0 pointer-events-none border-[30px] border-white/5 opacity-20" />
          <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.5)] animate-scan" />

          {/* HUD Header */}
          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-6 bg-gradient-to-b from-black/80 to-transparent z-30">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] mb-1">
                <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(6,182,212,1)]" />
                <span>Simulation Mode (No Live Camera)</span>
              </div>
              <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Targeting v2.4a // Spatial Locked</span>
            </div>
            <button
              onClick={stopAR}
              className="px-6 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 text-white text-[9px] font-black rounded-xl uppercase tracking-widest hover:bg-white/10 transition-all active:scale-90"
            >
              Exit AR
            </button>
          </div>

          {/* Immersive Video Overlay */}
          {selectedCardId && (
            <div className="absolute inset-0 flex items-center justify-center p-6 z-20 animate-in fade-in zoom-in-95 duration-700">
              <div className="w-full max-w-lg bg-black/40 backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.8)] flex flex-col">
                {/* Video Stage */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden group">
                  {videoSource && !videoError ? (
                    <video
                      src={videoSource}
                      autoPlay
                      loop
                      muted
                      controls
                      playsInline
                      onError={() => setVideoError(true)}
                      className="rounded-xl w-full h-full object-cover"
                    />
                  ) : !videoSource ? (
                    <div className="w-full h-full bg-gray-950 flex flex-col items-center justify-center gap-4">
                      <WifiOff size={32} className="text-yellow-500/50" />
                      <span className="text-[10px] font-black text-yellow-500/70 uppercase tracking-widest italic tracking-tighter">No video available for this project</span>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-950 flex flex-col items-center justify-center gap-4">
                      <WifiOff size={32} className="text-red-500/50" />
                      <span className="text-[10px] font-black text-red-500/70 uppercase tracking-widest italic tracking-tighter">Video Simulation Unavailable</span>
                    </div>
                  )}
                  
                  {/* Floating Video Labels */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg flex items-center gap-2 shadow-[0_4px_15px_rgba(0,0,0,0.5)] transition-transform hover:scale-105">
                       <Play size={10} className="text-cyan-400 fill-cyan-400" />
                       <span className="text-[9px] text-white font-black uppercase tracking-widest">🏗️ FUTURE VISION (2026)</span>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 animate-bounce">
                    <div className="px-3 py-1.5 bg-cyan-500 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400">
                       <span className="text-[8px] text-black font-black uppercase tracking-widest">Live Infrastructure Simulation</span>
                    </div>
                  </div>
                </div>

                {/* Project Metadata Layer */}
                {currentProject && (
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-[9px] text-cyan-400 font-black uppercase tracking-[0.3em] mb-1">Live Future Simulation</div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{currentProject.name}</h3>
                        <div className="flex items-center gap-2 text-white/30 text-[9px] font-bold tracking-widest uppercase">
                           <Navigation size={10} strokeWidth={2.5} />
                           <span>Target: {currentProject.agency} // Project ID: {currentProject.id}</span>
                        </div>
                      </div>
                      <div className="px-4 py-3 bg-white/5 border border-white/5 rounded-2xl text-center min-w-[80px]">
                         <div className="text-[10px] font-black text-white mb-1">{currentProject.completion}%</div>
                         <div className="text-[7px] text-gray-500 uppercase font-bold tracking-widest">Progress</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="px-5 py-4 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-1">Budget Allocation</div>
                        <div className="text-sm font-black text-white italic">{currentProject.budget}</div>
                      </div>
                      <div className="px-5 py-4 bg-white/5 border border-white/5 rounded-2xl">
                        <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-1">Societal Impact</div>
                        <div className="text-sm font-black text-indigo-400 italic">{currentProject.impact}</div>
                      </div>
                    </div>

                    <p className="text-white/60 text-xs leading-relaxed font-medium italic border-l-2 border-cyan-500 pl-4 py-1">
                      "{currentProject.description}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AR Floating Cards (Spatial Context) */}
          {!selectedCardId && arCards.map(({ id, x, y, distance }) => {
             const p = projects.find(pr => pr.id === id) || { name: id, category: 'Transport', completion: 0 };
             const color = categoryColors[p.category] || "#06b6d4";

             return (
               <div
                 key={id}
                 className="absolute transition-all duration-700"
                 style={{ left: x, top: y, transform: `translate(-50%, -50%)` }}
               >
                 <button
                   onClick={() => setSelectedCardId(id)}
                   className="group relative flex flex-col items-center gap-3 animate-float"
                 >
                   {/* Marker Node */}
                   <div className="relative">
                      <div className="w-12 h-12 rounded-full bg-black/80 backdrop-blur-xl border-2 border-white/20 flex items-center justify-center group-hover:border-cyan-500 group-hover:scale-110 transition-all duration-300">
                         <Boxes size={20} className="text-white group-hover:text-cyan-400" />
                      </div>
                      <div className="absolute -inset-2 bg-cyan-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>

                   {/* Floating Label */}
                   <div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl min-w-[120px] group-hover:translate-y-[-4px] transition-transform">
                     <div className="text-[8px] font-black uppercase tracking-widest opacity-40 mb-0.5" style={{ color }}>{p.category}</div>
                     <div className="text-[10px] font-black text-white uppercase italic tracking-tighter mb-1">{p.name}</div>
                     <div className="flex justify-between items-center text-[8px] font-bold text-gray-500">
                       <span className="flex items-center gap-1"><Navigation size={8} /> {distance}</span>
                       <span className="text-cyan-400">{p.completion}%</span>
                     </div>
                   </div>
                 </button>
               </div>
             );
          })}

          {/* HUD Bottom Bar */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-6 z-30">
            <div className="flex items-center gap-4 px-10 py-3 bg-black/80 backdrop-blur-3xl rounded-full border border-white/5 shadow-2xl">
               <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/40">
                  <Wifi size={12} className="text-green-500" />
                  <span>Cloud Link: Stable</span>
               </div>
               <div className="h-4 w-px bg-white/10" />
               <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-white/40">
                  <Maximize2 size={12} className="text-cyan-400" />
                  <span>Sensor Mesh: Online</span>
               </div>
            </div>

            {initialProjectId && (
              <div className="flex flex-col gap-4 mt-6 items-center w-full px-6">
                <button 
                  onClick={stopAR}
                  className="w-full max-w-md bg-gray-800 text-white py-3 rounded-xl hover:bg-gray-700 transition shadow-[0_10px_30px_rgba(0,0,0,0.5)] font-black uppercase tracking-widest text-[11px]"
                >
                  ← Exit AR View
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
