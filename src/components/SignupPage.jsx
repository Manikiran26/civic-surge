import { useState } from "react";
import { Lock, Mail, ArrowLeft, UserPlus, User } from "lucide-react";

export default function SignupPage({ onLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-white font-sans relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="w-full max-w-sm relative z-10">
        <button 
          onClick={onBack}
          className="mb-8 text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-[10px] uppercase font-black tracking-widest"
        >
          <ArrowLeft size={14} /> Return
        </button>

        <div className="bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <div className="mb-8 flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
               <UserPlus size={20} />
             </div>
             <div>
                <h2 className="text-xl font-black italic uppercase tracking-wider text-white">Create ID</h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Join the Civic Network</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-500/50 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-700 outline-none transition-colors"
                  placeholder="Citizen Name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Grid ID (Email)</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-500/50 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-700 outline-none transition-colors"
                  placeholder="citizen@network.org"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Passcode</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 focus:border-cyan-500/50 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-700 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-4 mt-6 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <UserPlus size={16} className="fill-black" />
              <span>Register Authorization</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
