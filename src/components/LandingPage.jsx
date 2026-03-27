import { Activity, Shield, MapPin, ArrowRight } from "lucide-react";

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-cyan-500/20 rounded-[2rem] blur-xl animate-pulse" />
          <div className="w-full h-full bg-gray-900 border border-white/10 rounded-[2rem] shadow-2xl flex items-center justify-center relative">
            <Activity className="text-cyan-400" size={40} />
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500">
          Hyper-Local Engine
        </h1>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-12 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
           <Shield size={14} className="text-cyan-400" />
           <p className="text-xs text-gray-400 uppercase tracking-[0.2em] font-bold">
             Civic Transparency Platform
           </p>
        </div>

        <div className="flex flex-col gap-4 mt-8 w-full">
          <button 
            onClick={() => onNavigate("login")}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition active:scale-[0.98]"
          >
            Login
          </button>
          
          <button 
            onClick={() => onNavigate("signup")}
            className="w-full border border-gray-500 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition active:scale-[0.98]"
          >
            Sign Up
          </button>
        </div>
      </div>
      
      <div className="absolute bottom-8 text-[10px] text-gray-600 font-mono uppercase tracking-widest flex items-center gap-2">
        <MapPin size={10} /> Secure Spatial Node
      </div>
    </div>
  );
}
