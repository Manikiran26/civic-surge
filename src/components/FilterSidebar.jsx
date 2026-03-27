import React, { useState } from "react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "healthcare", label: "Healthcare" },
  { id: "education", label: "Education" },
  { id: "transport", label: "Transport" },
  { id: "utilities", label: "Utilities" },
  { id: "other", label: "Other" },
];

export default function FilterSidebar({ activeFilter, setActiveFilter }) {
  return (
    <aside className="w-56 bg-gray-950/80 border-r border-white/10 p-6 flex flex-col gap-4 min-h-full">
      <h3 className="text-cyan-400 font-black text-xs uppercase tracking-widest mb-4">Filter Projects</h3>
      <div className="flex flex-col gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 text-left ${
              activeFilter === f.id
                ? "bg-cyan-500 text-gray-950 shadow"
                : "text-cyan-200 hover:bg-cyan-900/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </aside>
  );
}
