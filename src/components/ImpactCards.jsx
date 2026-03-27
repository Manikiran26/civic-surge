// src/components/ImpactCards.jsx
// Civic impact visualization with summary cards and per-project progress

import { BarChart2, Users, IndianRupee, Zap, Droplets, TreePine, HeartPulse, Train } from "lucide-react";
import { projects, categoryColors } from "../data/projects";

const summaryStats = [
  { icon: IndianRupee, label: "Total Budget", value: "₹6,283 Cr", sub: "Across 6 projects", color: "#f59e0b" },
  { icon: Users, label: "Lives Impacted", value: "4.5M+", sub: "Citizens benefited", color: "#06b6d4" },
  { icon: Zap, label: "Avg. Progress", value: "59.8%", sub: "Portfolio completion", color: "#8b5cf6" },
  { icon: BarChart2, label: "Active Projects", value: "6", sub: "Across 5 categories", color: "#10b981" },
];

const categoryIcons = {
  Transport: Train,
  Utilities: Droplets,
  Energy: Zap,
  Infrastructure: BarChart2,
  Healthcare: HeartPulse,
  Environment: TreePine,
};

export default function ImpactCards() {
  const totalBudget = 6283;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-cyan-400 text-[10px] uppercase tracking-widest mb-2">
          <BarChart2 size={11} />
          <span>Civic Impact Dashboard</span>
        </div>
        <h1 className="text-2xl font-bold text-white">Infrastructure Impact Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Real-time portfolio status of government projects in your city</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {summaryStats.map(({ icon: Icon, label, value, sub, color }) => (
          <div
            key={label}
            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 relative overflow-hidden"
          >
            <div className="absolute -right-3 -top-3 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: color }} />
            <Icon size={18} style={{ color }} className="mb-3" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs font-medium text-gray-300 mt-0.5">{label}</p>
            <p className="text-[10px] text-gray-600 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Category budget distribution */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Budget Distribution by Category</h2>
        <div className="space-y-4">
          {projects.map((p) => {
            const color = categoryColors[p.category];
            const pct = ((parseInt(p.budget.replace(/[^\d]/g, "")) / (totalBudget * 10)) * 100).toFixed(1);
            const Icon = categoryIcons[p.category] || BarChart2;

            return (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon size={12} style={{ color }} />
                    <span className="text-xs text-gray-300">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{p.budget}</span>
                    <span className="text-xs font-bold" style={{ color }}>{p.completion}%</span>
                  </div>
                </div>
                <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                  {/* Allocation bar */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full opacity-20"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                  {/* Completion bar */}
                  <div
                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                    style={{ width: `${(p.completion / 100) * parseFloat(pct)}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project impact cards grid */}
      <h2 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Project Impact Cards</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const color = categoryColors[p.category];
          const Icon = categoryIcons[p.category] || BarChart2;

          return (
            <div
              key={p.id}
              className="bg-gray-900 border border-gray-800 hover:border-opacity-60 rounded-2xl p-5 transition-all hover:shadow-lg group"
              style={{ "--hover-color": color }}
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: color + "18" }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <span
                  className="text-[9px] uppercase tracking-widest px-2 py-1 rounded font-bold"
                  style={{ color, backgroundColor: color + "18" }}
                >
                  {p.category}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white leading-snug mb-1">{p.name}</h3>
              <p className="text-[10px] text-gray-500 mb-4">{p.agency}</p>

              {/* Completion ring-style indicator */}
              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#1f2937" strokeWidth="4" />
                    <circle
                      cx="24" cy="24" r="20" fill="none"
                      stroke={color} strokeWidth="4"
                      strokeDasharray={`${(p.completion / 100) * 125.6} 125.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold" style={{ color }}>
                    {p.completion}%
                  </span>
                </div>
                <div className="text-xs">
                  <p className="text-gray-500">Budget</p>
                  <p className="font-bold text-white">{p.budget}</p>
                  <p className="text-gray-500 mt-1">Timeline</p>
                  <p className="text-gray-300">{p.startDate} → {p.endDate}</p>
                </div>
              </div>

              {/* Impact badge */}
              <div
                className="rounded-lg px-3 py-2 text-[10px] leading-snug"
                style={{ backgroundColor: color + "10", color: color + "cc" }}
              >
                🎯 {p.impact}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-center text-[10px] text-gray-700 mt-8">
        Data updated daily · Source: Municipal Civic Dashboard API · Last sync: {new Date().toLocaleDateString("en-IN")}
      </p>
    </div>
  );
}
