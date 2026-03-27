import React from "react";
import { osmCategoryColors } from "../services/osmService";

export default function ProjectNode({ project, onClick }) {
  if (!project) return null;
  const color = osmCategoryColors[project.category] || "#94a3b8";
  return (
    <div
      className="flex flex-col items-center cursor-pointer group"
      onClick={() => onClick(project)}
      title={project.name}
    >
      <div
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg bg-gray-950 group-hover:scale-110 transition-transform"
        style={{ borderColor: color }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <span className="text-[10px] text-gray-400 mt-1 group-hover:text-cyan-400 transition-colors max-w-[60px] truncate text-center">
        {project.name}
      </span>
    </div>
  );
}
