import { getProjectColor } from "../data/projects";
import { getProjectVisualProfile } from "../utils/projectVisuals";

export default function ProjectBlueprint2D({ project }) {
  const color = getProjectColor(project);
  const profile = getProjectVisualProfile(project);

  return (
    <div className="rounded-3xl border border-cyan-500/20 bg-slate-950/80 p-4 shadow-[0_30px_80px_rgba(2,6,23,0.35)]">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300 font-black">2D blueprint</div>
          <h3 className="text-lg font-black text-white">{profile.title}</h3>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className="rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.25em]"
            style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
          >
            {project?.status || "unknown"}
          </span>
          <span className="text-[8px] uppercase tracking-[0.3em] text-white/35">{profile.structurePattern}</span>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#08111f]">
        <svg viewBox="0 0 100 100" className="h-64 w-full">
          <defs>
            <pattern id={`grid-${profile.seed}`} width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
            </pattern>
            <linearGradient id={`fillGlow-${profile.seed}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={profile.accent} stopOpacity="0.95" />
              <stop offset="100%" stopColor={profile.secondary} stopOpacity="0.25" />
            </linearGradient>
          </defs>

          <rect width="100" height="100" fill={`url(#grid-${profile.seed})`} />
          <rect x="4" y="4" width="92" height="92" rx="4" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />

          {profile.blocks.map((block, index) => (
            <g key={`${block.label}-${index}`}>
              <rect
                x={block.x}
                y={block.y}
                width={block.w}
                height={block.h}
                rx="2"
                fill="rgba(255,255,255,0.05)"
                stroke={`url(#fillGlow-${profile.seed})`}
                strokeWidth="1.25"
              />
              <text
                x={block.x + block.w / 2}
                y={block.y + block.h / 2 + 1.5}
                fill="rgba(226,232,240,0.88)"
                fontSize="3"
                textAnchor="middle"
                fontWeight="700"
              >
                {block.label}
              </text>
            </g>
          ))}

          {[0, 1, 2].map((index) => (
            <circle
              key={index}
              cx={26 + index * 24}
              cy={18 + ((profile.seed + index * 7) % 18)}
              r={3 + ((profile.seed + index) % 3)}
              fill={index % 2 === 0 ? profile.accent : profile.secondary}
              fillOpacity="0.2"
              stroke={index % 2 === 0 ? profile.accent : profile.secondary}
              strokeOpacity="0.55"
            />
          ))}

          <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeOpacity="0.25" strokeWidth="0.7" strokeDasharray="2 2" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        </svg>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
        <Stat label="Budget" value={project?.budgetDisplay || "unknown"} />
        <Stat label="Timeline" value={project?.timelineDisplay || "unknown"} />
        <Stat label="Geo radius" value={`${project?.geofenceRadiusM || 1500}m`} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-[8px] uppercase tracking-[0.25em] text-white/40">{label}</div>
      <div className="mt-1 font-mono text-xs text-white">{value}</div>
    </div>
  );
}
