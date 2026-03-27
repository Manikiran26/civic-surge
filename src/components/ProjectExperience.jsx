import { useState, useEffect } from "react";
import { Navigation, Users, Zap, Calendar, IndianRupee, Rocket, MessageSquare, FileText, ArrowLeft, Boxes, Activity, BarChart3, Star, AlertTriangle } from "lucide-react";
import ReportModal from "./ReportModal";

export default function ProjectExperience({ projectId, infraData = [], onNavigateToAR, onNavigateToFeedback, onBack }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    // Simulate loading for premium feel
    setTimeout(() => {
      const found = infraData.find(p => p.id === projectId);
      setProject(found || null);
      setLoading(false);
    }, 600);
  }, [projectId, infraData]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans animate-pulse">
        <div className="w-16 h-16 rounded-full border-t-2 border-cyan-500 animate-spin mb-4 shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        <div className="text-xs uppercase tracking-widest text-cyan-400 font-black">Initializing Civic Intelligence...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans">
        <div className="text-red-500 mb-4 scale-150">⚠️</div>
        <h2 className="text-xl font-black uppercase tracking-widest mb-2">Invalid Project QR</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all uppercase text-[10px] font-black tracking-widest">
          Return to Scanner
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-950 text-white font-sans overflow-y-auto overflow-x-hidden animate-in fade-in zoom-in-95 duration-700 pb-24">
      
      {/* Background accents */}
      <div className="fixed top-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Top Navbar */}
      <div className="sticky top-0 z-50 px-6 py-4 bg-gray-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between">
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase font-black tracking-widest">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)]">
           <Zap size={10} className="text-cyan-400 fill-cyan-400 animate-pulse" />
           <span className="text-[8px] uppercase tracking-widest font-black text-white/60">Live Intelligence</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 relative z-10">
        
        {/* SECTION 1: HEADER */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[9px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <Boxes size={12} /> {project.type}
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[1.1] text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-200 to-gray-500 text-shadow-glow">
            {project.name}
          </h1>
          <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold tracking-widest font-mono bg-white/5 inline-flex px-3 py-1.5 rounded-lg border border-white/5">
            <Navigation size={12} />
            <span>Target ID: {project.id.toUpperCase()}</span>
          </div>
        </section>

        {/* SECTION 2: LIVE STATUS */}
        <section className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-md shadow-2xl relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-cyan-400" />
              <h3 className="text-[10px] text-white/60 uppercase font-black tracking-widest">Live Status</h3>
            </div>
            <div className="px-3 py-1 bg-green-500/20 text-green-400 text-[8px] font-black uppercase tracking-widest rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
              {project.status}
            </div>
          </div>
          
          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <span className="text-3xl font-black italic text-white">{project.progress}%</span>
                <span className="text-[9px] text-white/40 uppercase font-black tracking-widest mb-1">Completion</span>
             </div>
             <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden shadow-inner border border-white/5 relative">
                <div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                  style={{ width: `${project.progress}%` }}
                />
             </div>
          </div>
        </section>

        {/* SECTION 3: CIVIC IMPACT */}
        <section className="bg-gradient-to-br from-indigo-900/20 to-blue-900/10 border border-indigo-500/20 rounded-3xl p-6 backdrop-blur-md shadow-2xl hover:border-indigo-500/40 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-indigo-400" />
            <h3 className="text-[10px] text-indigo-200/60 uppercase font-black tracking-widest">Civic Impact</h3>
          </div>
          <div className="mb-2">
             <span className="text-3xl font-black text-indigo-400 italic shadow-indigo-500/20 drop-shadow-lg">{project.citizens}</span>
             <span className="text-[10px] text-indigo-300/60 uppercase font-black tracking-widest ml-2">Citizens Impacted</span>
          </div>
          <p className="text-sm text-indigo-100/80 font-medium leading-relaxed italic border-l-2 border-indigo-500/50 pl-3 py-1">
            "{project.impact}"
          </p>
        </section>

        {/* SECTION 4: PROJECT INTELLIGENCE PANEL */}
        <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={16} className="text-gray-400" />
            <h3 className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Project Intelligence</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <IndianRupee size={10} />
                  <span className="text-[8px] uppercase font-black tracking-widest">Budget</span>
                </div>
                <div className="text-lg font-black text-white">{project.budget}</div>
             </div>
             <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <Calendar size={10} />
                  <span className="text-[8px] uppercase font-black tracking-widest">Timeline</span>
                </div>
                <div className="text-sm font-black text-white">{project.timeline}</div>
             </div>
             <div className="col-span-2 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <div className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Implementing Agency</div>
                <div className="text-sm font-black text-white">{project.agency}</div>
             </div>
          </div>
        </section>

        {/* SECTION 5: ACTION BUTTONS */}
        <div className="flex flex-col gap-3 mt-6">
          {project.status === "Completed" ? (
            <>
              <button 
                onClick={() => setModalType("rate")}
                className="w-full bg-green-500/10 border border-green-500 text-green-400 py-3 rounded-xl hover:bg-green-500/20 transition font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center gap-2"
              >
                <Star size={14} className="fill-green-400" /> Rate Project
              </button>
              <button 
                onClick={() => setModalType("feedback")}
                className="w-full bg-blue-500/10 border border-blue-500 text-blue-400 py-3 rounded-xl hover:bg-blue-500/20 transition font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> Give Feedback
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setModalType("report")}
                className="w-full bg-red-500/10 border border-red-500 text-red-400 py-3 rounded-xl hover:bg-red-500/20 transition font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center gap-2"
              >
                <AlertTriangle size={14} /> Report Issue
              </button>
              <button 
                onClick={() => setModalType("progress")}
                className="w-full bg-yellow-500/10 border border-yellow-500 text-yellow-400 py-3 rounded-xl hover:bg-yellow-500/20 transition font-black uppercase tracking-widest text-[11px] shadow-lg flex items-center justify-center gap-2"
              >
                <Activity size={14} /> Give Progress Feedback
              </button>
            </>
          )}

          <div className="my-2 p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest shadow-inner">
             <span>📊 12 reports logged</span>
             <span>⭐ 85% satisfaction</span>
          </div>

          <button 
            onClick={() => onNavigateToAR()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl hover:opacity-90 transition font-black uppercase tracking-widest text-[11px] shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            <Rocket size={14} /> View AR Simulation
          </button>
        </div>

      </div>

      <ReportModal 
        isOpen={!!modalType} 
        onClose={() => setModalType(null)} 
        type={modalType} 
        project={project}
      />
    </div>
  );
}
