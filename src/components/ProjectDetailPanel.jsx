import React from "react";
import { X } from "lucide-react";

export default function ProjectDetailPanel({ project, onClose }) {
  if (!project) return null;
  return (
    <div className="w-96 border-l border-white/10 bg-gray-950/80 backdrop-blur-2xl flex flex-col p-8 animate-fadeIn shadow-2xl relative">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        title="Close"
      >
        <X size={18} />
      </button>
      <h2 className="text-xl font-black text-cyan-400 mb-2 uppercase tracking-widest">
        {project.name}
      </h2>
      <div className="text-xs text-gray-400 mb-4">{project.category}</div>
      <div className="mb-4">
        <span className="font-bold text-gray-300">Status:</span> {project.status} ({project.progress}%)
      </div>
      <div className="mb-4">
        <span className="font-bold text-gray-300">Budget:</span> {project.budget}
      </div>
      <div className="mb-4">
        <span className="font-bold text-gray-300">Timeline:</span> {project.timeline}
      </div>
      <div className="mb-4">
        <span className="font-bold text-gray-300">Impact:</span> <span className="italic text-cyan-300">{project.impact}</span>
      </div>
      <div className="mt-auto text-[10px] text-gray-500 pt-6 border-t border-white/10">
        Project ID: {project.id}
      </div>
    </div>
  );
}
