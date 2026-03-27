import { useEffect, useState, useRef } from "react";
import { Bell, X, Navigation, Building2 } from "lucide-react";
import { osmCategoryColors } from "../services/osmService";

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function GeoAlert({ userLocation, infraData = [], onViewDetails }) {
  const [nearbyNode, setNearbyNode] = useState(null);
  const alertedIds = useRef(new Set());
  const isHandlingAlert = useRef(false);
  const sessionKey = "civic_geofence_alerted_ids";

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(sessionKey) || "[]");
      saved.forEach((id) => alertedIds.current.add(id));
    } catch {
      // ignore malformed session storage
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !infraData || infraData.length === 0 || isHandlingAlert.current) return;

    console.log("User Location:", userLocation);

    for (const project of infraData) {
      const distance = getDistance(
        userLocation.lat,
        userLocation.lng,
        project.lat,
        project.lng
      );

      console.log("Nearby check:", project.id, distance);

      if (distance <= 0.3 && !alertedIds.current.has(project.id)) {
        console.log("Notification Project:", project);
        console.log(`GEO-FENCE TRIGGER: ${project.name} @ ${Math.round(distance * 1000)}m`);
        
        isHandlingAlert.current = true;
        alertedIds.current.add(project.id);
        try {
          sessionStorage.setItem(sessionKey, JSON.stringify(Array.from(alertedIds.current)));
        } catch {
          // ignore storage errors
        }
        
        setTimeout(() => {
          setNearbyNode({ ...project, distanceM: Math.round(distance * 1000) });
          isHandlingAlert.current = false;
        }, 1000);
        
        break;
      }
    }
  }, [userLocation, infraData]);

  const clearNotification = () => {
    setNearbyNode(null);
  };

  useEffect(() => {
    if (!nearbyNode) return;

    const timer = setTimeout(() => {
      clearNotification();
    }, 8000);

    return () => clearTimeout(timer);
  }, [nearbyNode]);

  if (!nearbyNode) return null;

  const color = osmCategoryColors[nearbyNode.category] || "#64748b";
  
  const getCategoryMessage = (category) => {
    switch (category?.toLowerCase()) {
      case "healthcare": return "WHY IT MATTERS: Faster care and emergency access. WHO BENEFITS: households, seniors, and nearby clinics.";
      case "education": return "WHY IT MATTERS: Better school access and learning capacity. WHO BENEFITS: students, parents, and teachers.";
      case "transport": return "WHY IT MATTERS: Lower travel time and congestion. WHO BENEFITS: commuters, freight, and local businesses.";
      default: return "WHY IT MATTERS: Better civic service delivery. WHO BENEFITS: residents and public agencies.";
    }
  };

  const getHeaderIcon = (category) => {
    return category?.toLowerCase() === "transport" || category?.toLowerCase() === "infrastructure" ? "🚀 Government Initiative Near You" : "📢 Public Development Update";
  };

  const formatType = (type) => type ? type.charAt(0).toUpperCase() + type.slice(1) : "";

  return (
    <div className="fixed top-24 right-8 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-8 duration-700">
      <div className="bg-gray-900/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50 overflow-hidden relative group">
        {/* Animated Background Glow */}
        <div 
          className="absolute inset-0 opacity-10 blur-3xl -z-10 transition-opacity duration-1000 group-hover:opacity-20"
          style={{ backgroundColor: color }}
        />

        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span 
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: color }}
              ></span>
              <span 
                className="relative inline-flex rounded-full h-3 w-3"
                style={{ backgroundColor: color }}
              ></span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
              {getHeaderIcon(nearbyNode.category)}
            </span>
          </div>
        </div>

        <button
          onClick={() => clearNotification()}
          className="absolute top-2 right-2 p-2 text-white/20 hover:text-white transition-colors z-50"
        >
          <X size={16} />
        </button>

        <div className="mt-5 flex gap-4">
          <div 
            className="w-12 h-12 rounded-2xl bg-gray-950 border flex items-center justify-center flex-shrink-0 shadow-inner"
            style={{ borderColor: `${color}40` }}
          >
            <Building2 size={24} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-black text-white leading-tight mb-1 truncate">
              📍 You are near {nearbyNode.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span 
                className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {formatType(nearbyNode.type || nearbyNode.category)}
              </span>
              {nearbyNode.budget && (
                <span className="text-[9px] text-green-400 font-bold bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded">
                  {nearbyNode.budget}
                </span>
              )}
              <span className="text-[10px] text-white/30 font-mono">
                ({nearbyNode.distanceM}m away)
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 p-3 bg-white/5 rounded-xl border border-white/5 space-y-3">
          <p className="text-[11px] text-white/80 font-medium leading-relaxed">
            This project is currently <span className="font-bold text-cyan-400">{nearbyNode.progress}% complete</span>. It is expected to benefit citizens in your area and reduce the local service gap.
          </p>

          <div className="px-3 py-2 bg-black/40 border border-white/5 rounded-lg">
             <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest italic flex items-center gap-1.5">
               <span className="text-xs">💡</span> {getCategoryMessage(nearbyNode.category)}
             </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">Construction Progress</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">{nearbyNode.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-950 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                 style={{ width: `${nearbyNode.progress}%` }}
               />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-300">
            <div className="rounded-lg border border-white/5 bg-white/5 p-2">
              <div className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">Why it matters</div>
              <div>{getCategoryMessage(nearbyNode.category)}</div>
            </div>
            <div className="rounded-lg border border-white/5 bg-white/5 p-2">
              <div className="text-[8px] uppercase tracking-widest text-gray-500 mb-1">When complete</div>
              <div>{nearbyNode.timeline || "unknown"}</div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onViewDetails) onViewDetails(nearbyNode);
              clearNotification();
            }}
            className="w-full mt-3 bg-cyan-500/10 border border-cyan-500 text-cyan-400 py-2.5 rounded-lg hover:bg-cyan-500/20 transition-all font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-2 active:scale-95"
          >
            View Project Details
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-white/20">
          <span>Personal Civic Intelligence Link Active</span>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <div className="w-1 h-1 rounded-full bg-white/10" />
             <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
