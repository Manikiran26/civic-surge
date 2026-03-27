// src/components/Navbar.jsx
import { MapPin, QrCode, Layers, MessageSquare, BarChart2 } from "lucide-react";

const navItems = [
  { id: "map", label: "Map", icon: MapPin },
  { id: "ar", label: "AR View", icon: Layers },
  { id: "qr", label: "QR Scan", icon: QrCode },
  { id: "impact", label: "Impact", icon: BarChart2 },
  { id: "feedback", label: "Feedback", icon: MessageSquare },
];

export default function Navbar({ activePage, setActivePage, onLogout }) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur border-b border-cyan-500/20">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-20">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-cyan-500 flex items-center justify-center">
            <MapPin size={18} className="text-gray-950" />
          </div>
          <span className="text-lg font-bold tracking-widest text-cyan-400 uppercase">
            HyperLocal
          </span>
          <span className="hidden sm:inline text-xs text-gray-500 ml-1">
            Targeting Engine
          </span>
        </div>

        {/* Nav items */}
        <div className="flex items-center gap-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActivePage(id)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded text-sm font-medium transition-all duration-200
                ${activePage === id
                  ? "bg-cyan-500 text-gray-950"
                  : "text-gray-400 hover:text-cyan-400 hover:bg-gray-800"
                }`}
            >
              <Icon size={17} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-5 py-2 rounded text-sm font-medium transition-all duration-200 text-red-500 hover:text-white hover:bg-red-500/20 ml-2 border border-red-500/20 uppercase tracking-widest"
            >
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
