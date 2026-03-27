import { useState } from "react";
import { X, Building2, MapPin, Activity, Shield, Info, AlertTriangle, MessageSquare, Star } from "lucide-react";
import { osmCategoryColors } from "../services/osmService";
import ReportModal from "./ReportModal";
import ProjectMini3D from "./ProjectMini3D";

export default function ProjectDetail({ project, onClose }) {
  console.log("DETAIL PROJECT:", project);
  const [modalType, setModalType] = useState(null);

  if (!project) return <div className="text-white p-5 font-bold">No project selected</div>;
  const color = osmCategoryColors[project.category] || "#64748b";

  return (
    <div className="w-80 border-l border-gray-800 bg-gray-900 flex flex-col overflow-y-auto animate-fadeIn shadow-2xl">
      {/* Header */}
      <div className="p-5 border-b border-gray-800 bg-gray-900/80 sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div
              className="inline-flex items-center gap-1.5 text-[9px] uppercase tracking-widest px-2 py-0.5 rounded mb-2 font-bold"
              style={{ color, backgroundColor: color + "18" }}
            >
              <Activity size={9} />
              {project.category}
            </div>
            <h2 className="text-sm font-bold text-white leading-tight">{project.name}</h2>
            <p className="text-[10px] text-gray-500 mt-1.5 flex items-center gap-1">
              <Building2 size={10} className="text-gray-600" />
              {project.agency}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-white mt-0.5 flex-shrink-0 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4">
          <ProjectMini3D project={project} />
        </div>

        <div className="flex gap-2 mt-4">
          <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            ID: {project.id}
          </span>
          <span className="text-[9px] px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
            {project.type.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Location Stats */}
      <div className="p-5 border-b border-gray-800 grid grid-cols-2 gap-3">
        <StatBox icon={MapPin} label="Latitude" value={project.lat.toFixed(4)} color={color} />
        <StatBox icon={MapPin} label="Longitude" value={project.lng.toFixed(4)} color={color} />
      </div>

      {/* Analysis Section */}
      <div className="p-5 border-b border-gray-800 bg-gray-900/40">
        <div className="flex items-center gap-2 text-[9px] text-cyan-400 uppercase tracking-widest mb-3 font-bold">
          <Shield size={10} />
          Strategic Impact Analysis
        </div>
        <p className="text-[10px] text-gray-300 leading-relaxed font-medium">
          "{project.impact}"
        </p>
        <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3 text-[10px] text-cyan-100 leading-relaxed">
          {buildInsight(project)}
        </div>
      </div>

      {/* Live Status Section */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest font-bold">
            <Activity size={10} />
            Live Project Status
          </div>
          <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold uppercase ${
            project.status === "Completed" ? "bg-green-500/20 text-green-400" : 
            project.status === "Ongoing" ? "bg-blue-500/20 text-blue-400 animate-pulse" : 
            "bg-yellow-500/20 text-yellow-400"
          }`}>
            {project.status}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1 text-[9px] font-mono">
            <span className="text-gray-500">CONSTRUCTION PROGRESS</span>
            <span className="text-white">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden border border-white/5">
            <div 
              className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-1000"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Details List */}
      <div className="p-5 space-y-4">
        <div>
          <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-widest mb-3 font-bold border-b border-white/5 pb-2">
            <Info size={10} />
            Project Specification
          </div>
          <div className="space-y-2">
            <InfoRow label="Estimated Budget" value={project.budget} highlight />
            <InfoRow label="Project Timeline" value={project.timeline} />
            <InfoRow label="Project Status" value={`${project.status} (${project.progress}%)`} />
            <InfoRow label="Implementing Agency" value={project.agency} />
            <InfoRow label="Asset Class" value={project.type.toUpperCase()} />
            <InfoRow label="Source" value={project.source?.name || "unknown"} />
            <InfoRow label="Source URL" value={project.source?.url || "unknown"} />
            <InfoRow label="Description" value={project.description || "unknown"} />
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-5 mt-auto flex flex-col gap-2">
        {project.status === "Completed" ? (
          <>
            <button 
              onClick={() => setModalType("rate")}
              className="w-full bg-green-500/10 border border-green-500 text-green-400 py-2.5 rounded-lg hover:bg-green-500/20 transition font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-2"
            >
              <Star size={12} className="fill-green-400" /> Rate Project
            </button>
            <button 
              onClick={() => setModalType("feedback")}
              className="w-full bg-blue-500/10 border border-blue-500 text-blue-400 py-2.5 rounded-lg hover:bg-blue-500/20 transition font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-2"
            >
              <MessageSquare size={12} /> Give Feedback
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setModalType("report")}
              className="w-full bg-red-500/10 border border-red-500 text-red-400 py-2.5 rounded-lg hover:bg-red-500/20 transition font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-2"
            >
              <AlertTriangle size={12} /> Report Issue
            </button>
            <button 
              onClick={() => setModalType("progress")}
              className="w-full bg-yellow-500/10 border border-yellow-500 text-yellow-400 py-2.5 rounded-lg hover:bg-yellow-500/20 transition font-black uppercase tracking-widest text-[9px] shadow-lg flex items-center justify-center gap-2"
            >
              <Activity size={12} /> Progress Feedback
            </button>
          </>
        )}
        <div className="mt-2 text-[8px] text-gray-400 text-center font-bold tracking-widest uppercase bg-white/5 py-1.5 rounded">
          📊 12 reports • ⭐ 85% satisfaction
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

function StatBox({ icon: Icon, label, value, color }) {
  const IconComponent = Icon;
  return (
    <div className="bg-gray-800/40 border border-gray-800 rounded-lg p-2.5">
      <div className="flex items-center gap-1.5 text-[8px] text-gray-500 mb-1 font-bold uppercase tracking-widest">
        <IconComponent size={9} style={{ color }} />
        {label}
      </div>
      <p className="text-[10px] font-mono text-white">{value}</p>
    </div>
  );
}

function InfoRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between items-center text-[10px] py-1 border-b border-gray-800/50 transition-colors hover:bg-white/5 px-1 rounded">
      <span className="text-gray-500 uppercase tracking-tighter text-[8px]">{label}</span>
      <span className={`font-mono ${highlight ? 'text-cyan-400 font-bold' : 'text-gray-300'}`}>
        {value}
      </span>
    </div>
  );
}

function buildInsight(project) {
  const type = (project.category || project.type || "").toLowerCase();
  const status = (project.status || "unknown").toLowerCase();
  const progress = Number(project.progress) || 0;
  const target = project.citizens || "local residents";

  if (status.includes("delay")) {
    return `WHY IT MATTERS: This ${type} project affects daily mobility and service access. WHO BENEFITS: ${target}. WHEN: completion depends on recovery from current delay.`;
  }

  if (type.includes("hospital") || type.includes("health")) {
    return `WHY IT MATTERS: It expands emergency and outpatient care. WHO BENEFITS: ${target}. WHEN: ${progress}% complete, with staged service rollout on completion.`;
  }

  if (type.includes("transport") || type.includes("road") || type.includes("bridge") || type.includes("rail")) {
    return `WHY IT MATTERS: It reduces travel time, congestion, and logistics friction. WHO BENEFITS: commuters, freight users, and nearby businesses. WHEN: ${progress}% complete, with benefits scaling as each section opens.`;
  }

  return `WHY IT MATTERS: It improves civic access and public service quality. WHO BENEFITS: ${target}. WHEN: ${progress}% complete, with impact increasing as delivery progresses.`;
}
