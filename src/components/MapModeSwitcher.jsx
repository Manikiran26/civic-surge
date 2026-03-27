import React from "react";

const MODES = [
  { id: "standard", label: "2D Map" },
  { id: "satellite", label: "Satellite" },
  { id: "threeD", label: "3D" },
];

export default function MapModeSwitcher({ mode, setMode }) {
  return (
    <div className="fixed top-24 right-8 z-50 flex gap-2 bg-white/10 backdrop-blur rounded-xl p-2 shadow-lg border border-cyan-400/30">
      {MODES.map((m) => (
        <button
          key={m.id}
          onClick={() => setMode(m.id)}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all duration-200 ${
            mode === m.id
              ? "bg-cyan-500 text-gray-950 shadow"
              : "text-cyan-200 hover:bg-cyan-900/30"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}
