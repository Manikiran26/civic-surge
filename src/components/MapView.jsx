import { useEffect, useMemo, useRef, useState } from "react";
import { Cuboid, Layers, Loader2, MapPin, Navigation, Satellite } from "lucide-react";
import ProjectDetail from "./ProjectDetail";
import { MAPPLS_TOKEN, getMapModeConfig, mapplsClassObject } from "../services/mapplsService";
import { normalizeProject } from "../utils/projectNormalization";

function statusColor(status = "") {
  const value = status.toLowerCase();
  if (value.includes("complete")) return "#22c55e";
  if (value.includes("delay")) return "#ef4444";
  if (value.includes("ongoing") || value.includes("progress")) return "#f59e0b";
  return "#38bdf8";
}

function markerIconSvg(color) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </feMerge>
      </defs>
      <circle cx="22" cy="22" r="13" fill="${color}" fill-opacity="0.18"/>
      <circle cx="22" cy="22" r="8" fill="${color}" filter="url(#glow)"/>
      <circle cx="22" cy="22" r="3" fill="#ffffff"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildPopupHtml(project) {
  return `
    <div style="padding:12px 14px;max-width:260px;background:rgba(3,7,18,.92);color:#fff;border:1px solid rgba(255,255,255,.08);border-radius:16px;font-family:system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;">
      <div style="font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#67e8f9;font-weight:800;margin-bottom:6px;">${project.category}</div>
      <div style="font-size:15px;font-weight:800;line-height:1.2;margin-bottom:10px;">${project.name}</div>
      <div style="font-size:12px;color:rgba(255,255,255,.78);margin-bottom:6px;">Impact: ${project.impact}</div>
      <div style="font-size:11px;color:rgba(255,255,255,.56);">Budget: ${project.budget}</div>
    </div>
  `;
}

export default function MapView({
  userLocation,
  mapMode,
  infraData = [],
  selectedProject,
  setSelectedProject,
  loading,
}) {
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [sdkReady, setSdkReady] = useState(false);
  const [mapError] = useState(() => (MAPPLS_TOKEN ? "" : "Set VITE_MAPPLS_TOKEN to render Mappls maps."));

  const center = useMemo(
    () => [userLocation?.lat ?? 28.6139, userLocation?.lng ?? 77.209],
    [userLocation]
  );

  const modeConfig = useMemo(() => getMapModeConfig(mapMode), [mapMode]);
  const normalizedProjects = useMemo(
    () => infraData.map(normalizeProject).filter(Boolean),
    [infraData]
  );

  useEffect(() => {
    if (!MAPPLS_TOKEN) return undefined;

    try {
      mapplsClassObject.initialize(MAPPLS_TOKEN, { map: true, version: "3.0" }, () => {
        setSdkReady(true);
      });
    } catch (error) {
      console.error(error);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (!sdkReady || !MAPPLS_TOKEN) return undefined;

    const cleanupMarkers = () => {
      for (const marker of markersRef.current) {
        if (marker?.remove) marker.remove();
      }
      markersRef.current = [];
    };

    cleanupMarkers();

    if (mapRef.current?.remove) {
      mapRef.current.remove();
    }

    const map = mapplsClassObject.Map({
      id: "mappls-map",
      properties: {
        center,
        zoom: modeConfig.properties.zoom,
        zoomControl: true,
        location: Boolean(userLocation),
        clickableIcons: true,
        tilt: modeConfig.properties.tilt,
        heading: modeConfig.properties.heading,
      },
    });

    mapRef.current = map;

    const onLoad = () => {
      mapplsClassObject.setStyle(modeConfig.style);

      normalizedProjects.forEach((project) => {
        if (!Number.isFinite(project.lat) || !Number.isFinite(project.lng)) return;

        const marker = mapplsClassObject.Marker({
          map,
          position: { lat: project.lat, lng: project.lng },
          icon: markerIconSvg(statusColor(project.status)),
          width: 34,
          height: 34,
          clusters: true,
          popupHtml: buildPopupHtml(project),
          popupOptions: { openPopup: false },
        });

        if (marker?.addListener) {
          marker.addListener("click", () => setSelectedProject(project));
        }

        markersRef.current.push(marker);
      });

      if (userLocation) {
        const userMarker = mapplsClassObject.Marker({
          map,
          position: { lat: userLocation.lat, lng: userLocation.lng },
          icon: markerIconSvg("#22d3ee"),
          width: 40,
          height: 40,
          zIndex: 1000,
          popupHtml: `
            <div style="padding:10px 12px;background:rgba(3,7,18,.92);color:#fff;border:1px solid rgba(255,255,255,.08);border-radius:14px;font-family:system-ui;">Your location</div>
          `,
        });

        markersRef.current.push(userMarker);
      }
    };

    if (map?.on) {
      map.on("load", onLoad);
    } else if (map?.addListener) {
      map.addListener("load", onLoad);
    } else {
      onLoad();
    }

    return () => {
      cleanupMarkers();
      if (map?.remove) map.remove();
      mapRef.current = null;
    };
  }, [center, modeConfig, normalizedProjects, sdkReady, setSelectedProject, userLocation]);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <div id="mappls-map" className="h-full w-full" />
        </div>

        {!sdkReady && !mapError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950/70 backdrop-blur-md">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/40 px-5 py-4 text-white shadow-2xl">
              <Loader2 className="animate-spin text-cyan-400" size={18} />
              <div>
                <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Loading Mappls</div>
                <div className="text-[10px] text-gray-400">Initializing satellite and 3D layers</div>
              </div>
            </div>
          </div>
        )}

        {mapError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-950 p-6">
            <div className="max-w-md rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-white">
              <Satellite className="mx-auto mb-3 text-cyan-400" size={28} />
              <h2 className="text-lg font-black uppercase tracking-widest mb-2">Mappls token required</h2>
              <p className="text-sm text-gray-300">{mapError}</p>
              <p className="mt-3 text-[11px] text-gray-500">Set VITE_MAPPLS_TOKEN in your local env to enable the real map.</p>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-4">
          <div className="bg-gray-950/80 backdrop-blur-md border border-cyan-500/30 p-4 rounded-xl shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/20 blur-md rounded-full animate-pulse" />
                {mapMode === "threeD" ? (
                  <Cuboid className="text-cyan-400 relative" size={20} />
                ) : (
                  <MapPin className="text-cyan-400 relative" size={20} />
                )}
              </div>
              <div>
                <h1 className="text-xs font-black tracking-[0.2em] text-cyan-400 uppercase">
                  Mappls {modeConfig.label} Active
                </h1>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={10} className="animate-spin text-cyan-400" />
                      Updating live civic feed...
                    </span>
                  ) : (
                    `Tracking ${normalizedProjects.length} site nodes`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-950/80 backdrop-blur-md border border-white/10 p-4 rounded-xl shadow-2xl w-52">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
              View Modes
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-gray-300">
                <Navigation size={12} className="text-cyan-400" />
                2D map
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-300">
                <Satellite size={12} className="text-cyan-400" />
                Satellite
              </div>
              <div className="flex items-center gap-2 text-[10px] text-gray-300">
                <Cuboid size={12} className="text-cyan-400" />
                3D tilt view
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 z-[1000]">
          <div className="bg-gray-950/80 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full shadow-xl flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
              <Navigation size={12} className="text-cyan-500" />
              <span>
                LOC_VEC: {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : "WAITING GPS..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {selectedProject ? (
        <ProjectDetail project={selectedProject} onClose={() => setSelectedProject(null)} />
      ) : (
        <div className="w-96 border-l border-white/5 bg-gray-950/50 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[120px] rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[120px] rounded-full -ml-32 -mb-32" />

          <div className="relative">
            <div className="w-20 h-20 rounded-[2.5rem] bg-gray-900 border border-white/10 flex items-center justify-center mb-8 shadow-2xl group transition-all duration-500 hover:border-cyan-500/40">
              <Layers size={32} className="text-gray-600 group-hover:text-cyan-400 transition-colors duration-500" />
            </div>
          </div>

          <h2 className="text-lg font-black tracking-tight text-white mb-2 uppercase tracking-[0.1em]">
            Hyper-Local Engine
          </h2>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-[0.2em] mb-4">
            Civic Transparency
          </p>
          <p className="text-gray-400 text-xs leading-relaxed max-w-[240px] font-mono opacity-80">
            {MAPPLS_TOKEN ? "SATELLITE AND 3D MODES ARE ACTIVE. SELECT A PROJECT TO OPEN ITS DETAILS PANEL." : "SET VITE_MAPPLS_TOKEN TO ENABLE THE MAPPLS MAP."}
          </p>

          <div className="mt-10 pt-10 border-t border-white/5 w-full flex flex-col gap-3">
            <div className="flex justify-between text-[10px] text-gray-600">
              <span className="uppercase tracking-widest">Data Source</span>
              <span className="font-bold text-gray-400 uppercase">Mappls / civic API</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-600">
              <span className="uppercase tracking-widest">View Modes</span>
              <span className="font-bold text-cyan-500 uppercase tracking-tighter">Satellite + 3D</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
