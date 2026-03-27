import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import L from "leaflet";
import { getMapStyle, getMarkerPalette, getRasterTileSource } from "../utils/mapStyles";

const DEFAULT_CENTER = [22.5937, 78.9629];
const FALLBACK_TILE = {
  tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
  attribution: "&copy; OpenStreetMap contributors",
  maxZoom: 19,
};
const MAX_TILE_ERRORS = 3;
const MAPLIBRE_LOAD_TIMEOUT = 8000;
const TILE_LOAD_TIMEOUT = 9000;

function buildMarkerElement(status, isSelected) {
  const palette = getMarkerPalette(status);
  const root = document.createElement("div");
  root.className = "civic-marker";
  root.style.setProperty("--marker-fill", palette.fill);
  root.style.setProperty("--marker-stroke", palette.stroke);
  root.style.setProperty("--marker-halo", palette.halo);
  root.dataset.status = status;
  if (isSelected) {
    root.classList.add("is-selected");
  }

  const pulse = document.createElement("span");
  pulse.className = "civic-marker__pulse";
  const core = document.createElement("span");
  core.className = "civic-marker__core";

  root.appendChild(pulse);
  root.appendChild(core);
  return root;
}

function updateMarkerElement(element, status, isSelected) {
  const palette = getMarkerPalette(status);
  element.style.setProperty("--marker-fill", palette.fill);
  element.style.setProperty("--marker-stroke", palette.stroke);
  element.style.setProperty("--marker-halo", palette.halo);
  element.classList.toggle("is-selected", isSelected);
}

function buildLeafletIcon(status, isSelected) {
  const palette = getMarkerPalette(status);
  const classes = ["civic-marker", isSelected ? "is-selected" : ""].join(" ");
  const html = `
    <div class="${classes}" style="--marker-fill:${palette.fill};--marker-stroke:${palette.stroke};--marker-halo:${palette.halo}">
      <span class="civic-marker__pulse"></span>
      <span class="civic-marker__core"></span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "leaflet-marker-wrapper",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function buildUserMarkerElement() {
  const root = document.createElement("div");
  root.className = "user-location-marker";
  const dot = document.createElement("span");
  root.appendChild(dot);
  return root;
}

function buildLeafletUserIcon() {
  const html = `
    <div class="user-location-marker"><span></span></div>
  `;
  return L.divIcon({
    html,
    className: "leaflet-marker-wrapper",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function hasValidCoordinates(project) {
  return Number.isFinite(project?.latitude) && Number.isFinite(project?.longitude);
}

function getInitialPitch(mode) {
  if (mode === "satellite") return 48;
  if (mode === "dark") return 38;
  if (mode === "infra") return 34;
  return 18;
}

export default function MapCanvas({
  mapMode,
  mapModes = [],
  projects,
  userLocation,
  locationPermission,
  onRequestLocation,
  onStartTracking,
  onStopTracking,
  locationError,
  isLocating,
  hasRequestedLocation,
  isTracking,
  selectedProjectId,
  onSelectProject,
  onMapModeChange,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletLayerRef = useRef(null);
  const leafletLabelRef = useRef(null);
  const markersRef = useRef(new Map());
  const userMarkerRef = useRef(null);
  const fallbackTimerRef = useRef(null);
  const errorCountRef = useRef(0);
  const leafletErrorCountRef = useRef(0);
  const hasCenteredOnUserRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [provider, setProvider] = useState(() =>
    maplibregl.supported?.() ? "maplibre" : "leaflet"
  );
  const [tileOverride, setTileOverride] = useState(null);
  const [offlineTiles, setOfflineTiles] = useState(false);
  const [isTilted, setIsTilted] = useState(mapMode !== "minimal");
  const [isLoading, setIsLoading] = useState(true);
  const [loadingLabel, setLoadingLabel] = useState("Initializing map engine...");
  const style = useMemo(() => getMapStyle(mapMode), [mapMode]);

  useEffect(() => {
    setIsTilted(mapMode !== "minimal");
    setTileOverride(null);
    setOfflineTiles(false);
    leafletErrorCountRef.current = 0;
    setIsLoading(true);
  }, [mapMode]);

  useEffect(() => {
    if (!tileOverride) return;
    leafletErrorCountRef.current = 0;
  }, [tileOverride]);

  useEffect(() => {
    if (provider !== "maplibre") return undefined;
    if (!containerRef.current) return undefined;

    setReady(false);
    setIsLoading(true);
    setLoadingLabel("Loading WebGL map...");
    errorCountRef.current = 0;
    let loadTimeout;
    let tileTimeout;
    let hasTiles = false;

    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: [DEFAULT_CENTER[1], DEFAULT_CENTER[0]],
        zoom: 4.4,
        maxZoom: mapMode === "satellite" ? 18 : 20,
        pitch: getInitialPitch(mapMode),
        bearing: mapMode === "infra" ? 12 : 0,
        attributionControl: false,
        pitchWithRotate: true,
        dragRotate: true,
        touchZoomRotate: true,
      });
    } catch {
      setProvider("leaflet");
      return undefined;
    }

    mapRef.current = map;

    const handleLoad = () => {
      setReady(true);
      setIsLoading(false);
      setLoadingLabel("");
    };

    const handleError = (event) => {
      const message = event?.error?.message?.toLowerCase() || "";
      if (message.includes("webgl")) {
        setProvider("leaflet");
        return;
      }
      errorCountRef.current += 1;
      if (errorCountRef.current >= 4) {
        setProvider("leaflet");
      }
    };

    map.on("load", handleLoad);
    map.on("error", handleError);
    map.on("sourcedata", () => {
      if (!hasTiles && map.areTilesLoaded?.()) {
        hasTiles = true;
      }
    });

    fallbackTimerRef.current = window.setTimeout(() => {
      if (!map.loaded()) {
        setProvider("leaflet");
      }
    }, 5000);

    loadTimeout = window.setTimeout(() => {
      if (!map.loaded()) {
        setProvider("leaflet");
      }
    }, MAPLIBRE_LOAD_TIMEOUT);

    tileTimeout = window.setTimeout(() => {
      if (!hasTiles && map.areTilesLoaded?.() === false) {
        setProvider("leaflet");
      }
    }, MAPLIBRE_LOAD_TIMEOUT);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      window.clearTimeout(fallbackTimerRef.current);
      window.clearTimeout(loadTimeout);
      window.clearTimeout(tileTimeout);
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.off("load", handleLoad);
      map.off("error", handleError);
      map.remove();
      mapRef.current = null;
    };
  }, [provider, style, mapMode]);

  useEffect(() => {
    if (provider !== "leaflet") return undefined;
    if (!containerRef.current) return undefined;

    setIsLoading(true);
    setLoadingLabel("Loading lightweight map...");

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    containerRef.current.innerHTML = "";

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
    }).setView(DEFAULT_CENTER, 4.4);

    leafletMapRef.current = map;
    setReady(true);

    let hasTileLoad = false;
    const tileLoadTimeout = window.setTimeout(() => {
      if (!hasTileLoad) {
        setOfflineTiles(true);
        setIsLoading(false);
      }
    }, TILE_LOAD_TIMEOUT);

    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    resizeObserver.observe(containerRef.current);
    const sizeTimer = window.setTimeout(() => {
      map.invalidateSize({ animate: false });
    }, 60);

    const source = tileOverride || getRasterTileSource(mapMode);
    leafletLayerRef.current = L.tileLayer(source.tiles[0], {
      maxZoom: source.maxZoom,
      attribution: source.attribution,
    });
    leafletLayerRef.current.on("tileerror", () => {
      leafletErrorCountRef.current += 1;
      if (leafletErrorCountRef.current < MAX_TILE_ERRORS) return;
      if (!tileOverride) {
        setTileOverride(FALLBACK_TILE);
        return;
      }
      setOfflineTiles(true);
    });
    leafletLayerRef.current.on("load", () => {
      hasTileLoad = true;
      window.clearTimeout(tileLoadTimeout);
      setIsLoading(false);
      setLoadingLabel("");
    });
    leafletLayerRef.current.addTo(map);
    if (!tileOverride && source.labelTiles?.length) {
      leafletLabelRef.current = L.tileLayer(source.labelTiles[0], {
        maxZoom: source.maxZoom,
        attribution: source.attribution,
        opacity: 0.9,
      });
      leafletLabelRef.current.addTo(map);
    }

    return () => {
      window.clearTimeout(sizeTimer);
      window.clearTimeout(tileLoadTimeout);
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      leafletLayerRef.current?.remove();
      leafletLabelRef.current?.remove();
      leafletLayerRef.current = null;
      leafletLabelRef.current = null;
      map.remove();
      leafletMapRef.current = null;
    };
  }, [provider, mapMode]);

  useEffect(() => {
    if (provider !== "leaflet") return;
    const map = leafletMapRef.current;
    if (!map) return;

    const source = tileOverride || getRasterTileSource(mapMode);
    leafletLayerRef.current?.remove();
    leafletLayerRef.current = L.tileLayer(source.tiles[0], {
      maxZoom: source.maxZoom,
      attribution: source.attribution,
    });
    leafletLayerRef.current.on("tileerror", () => {
      leafletErrorCountRef.current += 1;
      if (leafletErrorCountRef.current < MAX_TILE_ERRORS) return;
      if (!tileOverride) {
        setTileOverride(FALLBACK_TILE);
        return;
      }
      setOfflineTiles(true);
    });
    leafletLayerRef.current.addTo(map);
    leafletLabelRef.current?.remove();
    leafletLabelRef.current = null;
    if (!tileOverride && source.labelTiles?.length) {
      leafletLabelRef.current = L.tileLayer(source.labelTiles[0], {
        maxZoom: source.maxZoom,
        attribution: source.attribution,
        opacity: 0.9,
      });
      leafletLabelRef.current.addTo(map);
    }
  }, [mapMode, provider, tileOverride]);

  useEffect(() => {
    if (!ready) return;

    if (provider === "maplibre") {
      const map = mapRef.current;
      if (!map) return;

      const markers = markersRef.current;
      const nextIds = new Set();

      projects.forEach((project) => {
        if (!hasValidCoordinates(project)) return;
        nextIds.add(project.id);
        const existing = markers.get(project.id);
        if (existing) {
          existing.setLngLat([project.longitude, project.latitude]);
          updateMarkerElement(existing.getElement(), project.status, project.id === selectedProjectId);
          return;
        }

        const element = buildMarkerElement(project.status, project.id === selectedProjectId);
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectProject?.(project.id);
        });

        const marker = new maplibregl.Marker({ element })
          .setLngLat([project.longitude, project.latitude])
          .addTo(map);
        markers.set(project.id, marker);
      });

      markers.forEach((marker, id) => {
        if (!nextIds.has(id)) {
          marker.remove();
          markers.delete(id);
        }
      });
      return;
    }

    if (provider === "leaflet") {
      const map = leafletMapRef.current;
      if (!map) return;

      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();

      projects.forEach((project) => {
        if (!hasValidCoordinates(project)) return;
        const icon = buildLeafletIcon(project.status, project.id === selectedProjectId);
        const marker = L.marker([project.latitude, project.longitude], { icon }).addTo(map);
        marker.on("click", () => onSelectProject?.(project.id));
        markersRef.current.set(project.id, marker);
      });
    }
  }, [projects, selectedProjectId, provider, ready, onSelectProject]);

  useEffect(() => {
    if (!selectedProjectId || !ready) return;
    const project = projects.find((candidate) => candidate.id === selectedProjectId);
    if (!project || !hasValidCoordinates(project)) return;

    if (provider === "maplibre" && mapRef.current) {
      mapRef.current.flyTo({
        center: [project.longitude, project.latitude],
        zoom: mapMode === "satellite" ? 12.5 : 11.2,
        speed: 0.8,
        curve: 1.15,
        pitch: getInitialPitch(mapMode),
        bearing: mapMode === "infra" ? 18 : 0,
        essential: true,
      });
    }

    if (provider === "leaflet" && leafletMapRef.current) {
      leafletMapRef.current.setView([project.latitude, project.longitude], 11.2, { animate: true });
    }
  }, [selectedProjectId, projects, mapMode, provider, ready]);

  useEffect(() => {
    if (!userLocation || !ready) return;

    if (provider === "maplibre" && mapRef.current) {
      userMarkerRef.current?.remove();
      const element = buildUserMarkerElement();
      const marker = new maplibregl.Marker({ element })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(mapRef.current);
      userMarkerRef.current = marker;
      if (!hasCenteredOnUserRef.current) {
        mapRef.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 12.8,
          speed: 0.8,
          curve: 1.2,
          essential: true,
        });
        hasCenteredOnUserRef.current = true;
      }
      return;
    }

    if (provider === "leaflet" && leafletMapRef.current) {
      userMarkerRef.current?.remove();
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: buildLeafletUserIcon(),
      }).addTo(leafletMapRef.current);
      userMarkerRef.current = marker;
      if (!hasCenteredOnUserRef.current) {
        leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 12.8, { animate: true });
        hasCenteredOnUserRef.current = true;
      }
    }
  }, [userLocation, provider, ready]);

  useEffect(() => {
    if (userLocation) return;
    hasCenteredOnUserRef.current = false;
  }, [userLocation]);

  const handleZoomIn = () => {
    if (provider === "maplibre") mapRef.current?.zoomIn({ duration: 400 });
    if (provider === "leaflet") leafletMapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    if (provider === "maplibre") mapRef.current?.zoomOut({ duration: 400 });
    if (provider === "leaflet") leafletMapRef.current?.zoomOut();
  };

  const handleLocateClick = () => {
    if (userLocation && ready) {
      if (provider === "maplibre" && mapRef.current) {
        mapRef.current.flyTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 12.8,
          speed: 0.8,
          curve: 1.2,
          essential: true,
        });
        return;
      }
      if (provider === "leaflet" && leafletMapRef.current) {
        leafletMapRef.current.setView([userLocation.lat, userLocation.lng], 12.8, { animate: true });
        return;
      }
    }
    onStartTracking?.();
    onRequestLocation?.();
  };

  const handleTilt = () => {
    if (provider !== "maplibre") return;
    const map = mapRef.current;
    if (!map) return;
    const nextPitch = map.getPitch() > 10 ? 0 : getInitialPitch(mapMode);
    map.easeTo({ pitch: nextPitch, duration: 500 });
    setIsTilted(nextPitch > 0);
  };

  return (
    <div className="map-shell">
      <div ref={containerRef} className="map-shell__canvas" />
      {!userLocation && locationPermission === "prompt" && !hasRequestedLocation && (
        <div className="map-shell__location-gate">
          <div className="map-shell__location-gate-card">
            <div className="map-shell__location-gate-title">Enable location</div>
            <div className="map-shell__location-gate-subtitle">
              Allow location access to show nearby project alerts.
            </div>
            {onRequestLocation && (
              <button type="button" className="map-shell__location-btn" onClick={handleLocateClick}>
                Allow location
              </button>
            )}
          </div>
        </div>
      )}
      {isLoading && (
        <div className="map-shell__loading">
          <div className="map-shell__loading-card">
            <div className="map-shell__loading-title">Map loading</div>
            <div className="map-shell__loading-subtitle">{loadingLabel || "Fetching tiles..."}</div>
          </div>
        </div>
      )}
      <div className="map-shell__controls">
        <div className="map-zoom">
          <button type="button" onClick={handleZoomIn} aria-label="Zoom in">+</button>
          <button type="button" onClick={handleZoomOut} aria-label="Zoom out">−</button>
        </div>
        <button type="button" className="map-locate" onClick={handleLocateClick} aria-label="Go to my location">
          <span className="map-locate__icon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className={isTilted ? "map-tilt is-active" : "map-tilt"}
          onClick={handleTilt}
          disabled={provider !== "maplibre"}
        >
          Tilt
        </button>
      </div>
      <div className="map-shell__modes">
        {mapModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={mapMode === mode.id ? "map-mode is-active" : "map-mode"}
            onClick={() => onMapModeChange?.(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <div className="map-shell__note">
        {provider === "leaflet"
          ? "Fallback map engine active to keep tiles online."
          : "Interactive geospatial layer with verified civic project anchors."}
      </div>
    </div>
  );
}
