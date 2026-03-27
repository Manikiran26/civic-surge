import { useState, useRef, useEffect } from "react";
import { QrCode, Camera, CheckCircle, Scan, MapPin, Info, ArrowRight, MessageSquare, Clock, Users, Zap, TrendingUp, Boxes, Upload } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";
import { demoProjects } from "../data/demoProjects";

function getDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 999999;
  const R = 6371e3;
  const toRad = (x) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export default function QRScanner({ userLocation, infraData = [], onNavigateToAR, onNavigateToProject }) {
  const [scanning, setScanning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const getCategoryInfo = (type, p) => {
    switch (type?.toLowerCase()) {
      case "education": return { label: "🏫 School", color: "text-amber-400" };
      case "healthcare": return { label: "🏥 Hospital", color: "text-red-400" };
      case "transport": 
        if (p?.id?.includes("bridge")) return { label: "🌉 Bridge", color: "text-orange-400" };
        return { label: "🚇 Metro", color: "text-indigo-400" };
      default: return { label: "📍 Infrastructure", color: "text-gray-400" };
    }
  };

  const normalize = (text) => text.trim().toLowerCase();

  const handleScanSuccess = (decodedText) => {
    console.log("Scanned ID:", decodedText);

    const project = demoProjects.find(
      (p) => p.id === normalize(decodedText)
    );

    if (project) {
      console.log("Matched Project:", project.id);
      setShowSuccess(true);
      stopScanner();

      setTimeout(() => {
        onNavigateToProject(project.id);
        setShowSuccess(false);
      }, 800);
    } else {
      console.warn("Invalid QR");
      alert("Invalid QR");
    }
  };

  const startScanner = () => {
    if (scannerRef.current) return;
    
    setScanning(true);
    
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("reader");
        scannerRef.current = scanner;
        
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => handleScanSuccess(decodedText),
          () => {} // ignore scan errors
        );
      } catch (err) {
        console.error("Scanner failed to start:", err);
        setScanning(false);
        scannerRef.current = null;
      }
    }, 100);
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error("Scanner failed to stop:", err);
      }
    }
    setScanning(false);
  };

  const simulateScan = () => {
    const demoIds = ["metro_001", "hospital_001", "school_001", "bridge_001"];
    const randomId = demoIds[Math.floor(Math.random() * demoIds.length)];
    handleScanSuccess(randomId);
  };

  const scanImage = async (file) => {
    try {
      const scanner = new Html5Qrcode("reader");
      const result = await scanner.scanFile(file, true);
      console.log("Image Scan Result:", result);
      handleScanSuccess(result);
    } catch (err) {
      console.error("Image scan failed:", err);
      alert("QR not detected. Use clear image.");
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
     return () => stopScanner();
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 pb-32 font-sans">
      {/* Header Section */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <QrCode size={12} />
          <span>On-Site Intelligence Mode</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase text-shadow-glow">Civic Intelligence Scan</h1>
        <p className="text-gray-500 text-xs mt-3 font-medium max-w-[280px] mx-auto leading-relaxed">
          Access real-time site intelligence by scanning verified project markers.
        </p>
      </div>

      {/* Scanner Window */}
      <div className="relative group max-w-sm mx-auto mb-12">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        
        <div className="relative bg-black border border-white/10 rounded-[2.5rem] overflow-hidden aspect-square flex flex-col items-center justify-center shadow-2xl">
          <div id="reader" className={`absolute inset-0 w-full h-full object-cover ${scanning ? "block" : "hidden"}`} />
          
          {!scanning && showSuccess ? (
            <div className="flex flex-col items-center animate-out zoom-out-95 duration-1000 z-10">
              <div className="w-20 h-20 rounded-full bg-cyan-500 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                <CheckCircle size={40} className="text-black" strokeWidth={3} />
              </div>
              <span className="text-white font-black text-lg uppercase tracking-widest italic text-shadow-glow">Target Locked</span>
            </div>
          ) : !scanning ? (
            <div className="flex flex-col items-center gap-6 text-white/10 group-hover:text-cyan-500/30 transition-colors z-10">
              <Scan size={80} strokeWidth={1} />
              <span className="text-[10px] uppercase font-black tracking-[0.4em] translate-y-1">Awaiting Site Scan</span>
            </div>
          ) : null}
          
          {/* Corner Accents */}
          <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20 rounded-br-lg" />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 items-center mt-12 mb-16">
        <div className="flex gap-4 justify-center">
          <button
            onClick={scanning ? stopScanner : startScanner}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl ${
              scanning 
                ? "bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500/20" 
                : "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <Camera size={16} />
            {scanning ? "Abort Camera" : "Launch Real Scan"}
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning || showSuccess}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 border border-dashed border-white/20 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:border-cyan-500/50 transition-all disabled:opacity-50"
          >
            <Upload size={16} className="text-cyan-400" />
            Upload Image
          </button>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files[0]) {
                scanImage(e.target.files[0]);
              }
            }}
          />
        </div>

        <button
          onClick={simulateScan}
          disabled={scanning || showSuccess}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-cyan-500 text-black text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] disabled:opacity-50 mt-2"
        >
          <Zap size={16} />
          Instant Discovery
        </button>
      </div>

      {/* Registry */}
      <div className="mt-16 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <div className="text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">Linked Project Registry</div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {demoProjects.map((p) => {
            const info = getCategoryInfo(p.type, p);
            return (
              <button
                key={p.id}
                onClick={() => handleScanSuccess(p.id)}
                className="group relative bg-white/[0.02] border border-white/5 hover:border-cyan-500/50 p-6 rounded-3xl transition-all text-left flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className={`text-[8px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity ${info.color}`}>
                    {info.label}
                  </div>
                  <div className="text-sm text-white font-bold tracking-tight uppercase italic">{p.name}</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 group-hover:bg-cyan-500 group-hover:text-black transition-all">
                  <QrCode size={20} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
