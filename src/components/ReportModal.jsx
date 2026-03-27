import { useState, useEffect } from "react";
import { X, Camera, MapPin, Send, Zap, Star } from "lucide-react";

export default function ReportModal({ isOpen, onClose, type, project }) {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [location, setLocation] = useState(null);
  const [rating, setRating] = useState(0);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (isOpen && type === "report") {
      navigator.geolocation?.getCurrentPosition(
        (pos) => setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`),
        () => setLocation("28.6139, 77.2090 (Fallback)")
      );
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (type === "report" && !image) {
      alert("Please upload an image");
      return;
    }

    if (type === "report") {
      console.log("Report submitted:", image);
      alert("Report sent to authorities");
    } else {
      console.log("Feedback submitted");
      alert("Feedback submitted to Civic Authority Dashboard");
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2500);
    }, 1500);
  };

  const renderFields = () => {
    switch(type) {
      case "report":
        return (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Issue Type</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-red-500/50">
                <option>Safety Hazard</option>
                <option>Damage</option>
                <option>Delay</option>
                <option>Corruption Suspicion</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Evidence (Optional)</label>
              <div className="w-full h-24 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-gray-500 hover:border-white/20 hover:text-white transition-colors cursor-pointer relative overflow-hidden">
                {image ? (
                  <span className="text-[10px] text-green-400 uppercase font-black tracking-widest bg-green-500/20 px-3 py-1 rounded">IMAGE ATTACHED SECURELY</span>
                ) : (
                  <>
                    <Camera size={24} className="mb-2" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">Upload Photo</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="absolute inset-0 opacity-0 cursor-pointer" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Description</label>
              <textarea 
                required rows="3" 
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-red-500/50 resize-none" 
                placeholder="Describe the issue observed..."
              />
            </div>

            <div className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/5">
              <MapPin size={12} className="text-gray-400" />
              <span className="text-[10px] font-mono text-gray-400">
                {location || "Acquiring GPS..."}
              </span>
            </div>
          </>
        );

      case "progress":
        return (
          <>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Observation Category</label>
              <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-yellow-500/50">
                <option>Work Quality</option>
                <option>Traffic Issues</option>
                <option>Noise Issues</option>
                <option>Delay Concerns</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Feedback Details</label>
              <textarea 
                required rows="4" 
                className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-yellow-500/50 resize-none" 
                placeholder="Provide details about the local impact..."
              />
            </div>
          </>
        );

      case "rate":
        return (
          <>
            <div className="flex flex-col items-center gap-3 py-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rate this infrastructure</span>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} type="button" 
                    onClick={() => setRating(star)}
                    className="hover:scale-110 transition-transform"
                  >
                    <Star size={28} className={star <= rating ? "fill-green-400 text-green-400" : "text-gray-600"} />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Was this project useful?</label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-green-500/50">
                    <option>Very Useful</option>
                    <option>Somewhat Useful</option>
                    <option>Not Useful</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Did it improve daily life?</label>
                  <select className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-green-500/50">
                    <option>Yes, significantly</option>
                    <option>Partially</option>
                    <option>No noticeable change</option>
                  </select>
               </div>
            </div>
          </>
        );
      
      case "feedback":
      default:
        return (
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">General Feedback</label>
            <textarea 
              required rows="5" 
              className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-blue-500/50 resize-none" 
              placeholder="What are your thoughts on this project?"
            />
          </div>
        );
    }
  };

  const getTheme = () => {
    switch(type) {
      case "report": return "red";
      case "progress": return "yellow";
      case "rate": return "green";
      default: return "blue";
    }
  };

  const theme = getTheme();

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-gray-900 border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300 max-h-[90vh]">
        
        {submitted ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-4 bg-green-500/10 h-full">
             <div className="w-16 h-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Input Registered</h3>
             <p className="text-[10px] text-green-400 uppercase tracking-widest font-bold">✅ Your input has been submitted successfully.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className={`p-6 border-b border-white/5 flex items-start justify-between bg-${theme}-500/5`}>
              <div>
                <h2 className="text-lg font-black italic tracking-tighter uppercase text-white">
                  {type === "report" && "Report Quality Issue"}
                  {type === "progress" && "Progress Feedback"}
                  {type === "rate" && "Rate Project"}
                  {type === "feedback" && "General Feedback"}
                </h2>
                <p className={`text-[10px] text-${theme}-400 font-bold uppercase tracking-widest mt-1`}>
                  {project?.name}
                </p>
              </div>
              <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
              {renderFields()}

              <button 
                type="submit" disabled={loading}
                className="submit-btn flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-t-2 border-white animate-spin" />
                ) : (
                  <>
                    <Send size={14} className="fill-white text-white" />
                    <span>{type === "report" ? "Report to Civic Authority" : "Send to Government Dashboard"}</span>
                  </>
                )}
              </button>

              <div className="flex items-start gap-2 pt-4 px-2">
                <Zap size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider leading-relaxed">
                  🤖 AI will analyze and prioritize your input for faster action.
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
