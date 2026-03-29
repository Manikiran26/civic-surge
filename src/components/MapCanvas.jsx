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

function toNumber(value, fallback = null) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getGeoRadiusMeters(project) {
  return (
    toNumber(project?.geofenceRadiusM) ||
    toNumber(project?.geofence_radius_m) ||
    toNumber(project?.geofence_radius) ||
    300
  );
}

function getGeoColor(project) {
  const seed = String(project?.id || project?.name || "civic");
  const palette = ["#f97316", "#22d3ee", "#a855f7", "#f59e0b", "#38bdf8", "#f43f5e"];
  const index = seed.charCodeAt(0) % palette.length;
  return palette[index];
}

function getGeoShape(project) {
  const shape = String(project?.geofenceShape || project?.geofence_shape || "").toLowerCase();
  if (shape === "circle") return "circle";
  if (shape === "pentagon") return "pentagon";
  return "organic";
}

function seededRandom(seed) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function buildGeoFencePolygon(lat, lng, radiusMeters, shape, seedValue) {
  const steps = shape === "circle" ? 36 : shape === "pentagon" ? 5 : 12;
  const coords = [];
  const earthRadius = 6371000;
  const angDist = radiusMeters / earthRadius;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const rand = seededRandom(seedValue || 7);

  for (let i = 0; i <= steps; i += 1) {
    const bearing = (i / steps) * Math.PI * 2;
    const sinLat = Math.sin(latRad);
    const cosLat = Math.cos(latRad);
    const wobble = shape === "organic" ? 0.82 + rand() * 0.4 : 1;
    const sinAng = Math.sin(angDist * wobble);
    const cosAng = Math.cos(angDist * wobble);

    const lat2 = Math.asin(sinLat * cosAng + cosLat * sinAng * Math.cos(bearing));
    const lng2 =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * sinAng * cosLat,
        cosAng - sinLat * Math.sin(lat2)
      );
    coords.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }
  return coords;
}

function buildGeoFenceFeatures(projects) {
  return {
    type: "FeatureCollection",
    features: projects
      .filter(hasValidCoordinates)
      .map((project) => {
        const radius = getGeoRadiusMeters(project);
        const shape = getGeoShape(project);
        const polygon =
          project?.geofencePolygon ||
          project?.geofence_polygon ||
          project?.geofence_points ||
          null;
        const seed = String(project?.id || project?.name || "civic").charCodeAt(0);
        const coords =
          polygon && Array.isArray(polygon)
            ? polygon
            : buildGeoFencePolygon(project.latitude, project.longitude, radius, shape, seed);
        return {
          type: "Feature",
          properties: {
            id: project.id,
            radius,
            shape,
            color: getGeoColor(project),
            active: Boolean(project.activeGeoFence),
          },
          geometry: {
            type: "Polygon",
            coordinates: [
              coords,
            ],
          },
        };
      }),
  };
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
  geoFenceProjects = projects,
  loginFocusToken = 0,
  userLocation,
  locationPermission,
  onRequestLocation,
  onStartTracking,
  onStopTracking,
  locationError,
  isLocating,
  hasRequestedLocation,
  isTracking,
  mapCenter,
  mapZoom,
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
  const geoFenceRef = useRef(new Map());
  const centerRef = useRef(DEFAULT_CENTER);
  const zoomRef = useRef(4.4);
  const fallbackTimerRef = useRef(null);
  const leafletFocusTimerRef = useRef(null);
  const startupAnimationTimerRef = useRef(null);
  const errorCountRef = useRef(0);
  const leafletErrorCountRef = useRef(0);
  const hasCenteredOnUserRef = useRef(false);
  const lastLoginFocusTokenRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [provider, setProvider] = useState(() =>
    maplibregl.supported?.() ? "maplibre" : "leaflet"
  );
  const [tileOverride, setTileOverride] = useState(null);
  const [offlineTiles, setOfflineTiles] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [showLoadingOverlay, setShowLoadingOverlay] = useState(false);
  const style = useMemo(() => getMapStyle(mapMode), [mapMode]);

  useEffect(() => {
    if (!mapCenter || !ready) return;
    const targetZoom = typeof mapZoom === "number" ? mapZoom : 11.5;
    if (provider === "maplibre" && mapRef.current) {
      mapRef.current.flyTo({
        center: [mapCenter.lng, mapCenter.lat],
        zoom: targetZoom,
        speed: 0.8,
        curve: 1.2,
        essential: true,
      });
      centerRef.current = [mapCenter.lat, mapCenter.lng];
      zoomRef.current = targetZoom;
    }
    if (provider === "leaflet" && leafletMapRef.current) {
      leafletMapRef.current.setView([mapCenter.lat, mapCenter.lng], targetZoom, { animate: true });
      centerRef.current = [mapCenter.lat, mapCenter.lng];
      zoomRef.current = targetZoom;
    }
  }, [mapCenter, mapZoom, provider, ready]);

  useEffect(() => {
    setTileOverride(null);
    setOfflineTiles(false);
    leafletErrorCountRef.current = 0;
  }, [mapMode]);

  useEffect(() => {
    if (!tileOverride) return;
    leafletErrorCountRef.current = 0;
  }, [tileOverride]);

  useEffect(() => {
    if (provider !== "maplibre") return undefined;
    if (!containerRef.current) return undefined;

    setReady(false);
    setIsLoading(false);
    setLoadingLabel("");
    setShowLoadingOverlay(false);
    errorCountRef.current = 0;
    let loadTimeout;
    let tileTimeout;
    let slowLoadTimer;
    let hasTiles = false;

    let map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: getMapStyle(mapMode),
        center: [centerRef.current[1], centerRef.current[0]],
        zoom: zoomRef.current,
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
      setShowLoadingOverlay(false);
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
    map.on("moveend", () => {
      const center = map.getCenter();
      centerRef.current = [center.lat, center.lng];
      zoomRef.current = map.getZoom();
    });

    fallbackTimerRef.current = window.setTimeout(() => {
      if (!map.loaded()) {
        setProvider("leaflet");
      }
    }, 5000);

    slowLoadTimer = window.setTimeout(() => {
      if (!map.loaded()) {
        setShowLoadingOverlay(true);
        setLoadingLabel("Loading map...");
      }
    }, 1200);

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
      window.clearTimeout(leafletFocusTimerRef.current);
      window.clearTimeout(startupAnimationTimerRef.current);
      window.clearTimeout(loadTimeout);
      window.clearTimeout(tileTimeout);
      window.clearTimeout(slowLoadTimer);
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      geoFenceRef.current.forEach((circle) => circle.remove());
      geoFenceRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.off("load", handleLoad);
      map.off("error", handleError);
      map.remove();
      mapRef.current = null;
    };
  }, [provider, userLocation, mapMode]);

  useEffect(() => {
    if (provider !== "maplibre") return;
    const map = mapRef.current;
    if (!map) return;
    const current = map.getCenter();
    const currentZoom = map.getZoom();
    map.setStyle(getMapStyle(mapMode));
    map.once("style.load", () => {
      map.jumpTo({
        center: current,
        zoom: currentZoom,
        pitch: getInitialPitch(mapMode),
        bearing: mapMode === "infra" ? 12 : 0,
      });
    });
  }, [mapMode, provider]);

  useEffect(() => {
    if (provider !== "leaflet") return undefined;
    if (!containerRef.current) return undefined;

    setIsLoading(false);
    setLoadingLabel("");
    setShowLoadingOverlay(false);

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    containerRef.current.innerHTML = "";

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
      zoomSnap: 0.25,
    }).setView(centerRef.current, zoomRef.current);

    leafletMapRef.current = map;
    setReady(true);

    let hasTileLoad = false;
    const tileLoadTimeout = window.setTimeout(() => {
      if (!hasTileLoad) {
        setOfflineTiles(true);
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
      setShowLoadingOverlay(false);
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
      window.clearTimeout(leafletFocusTimerRef.current);
      window.clearTimeout(startupAnimationTimerRef.current);
      resizeObserver.disconnect();
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current.clear();
      geoFenceRef.current.forEach((circle) => circle.remove());
      geoFenceRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      leafletLayerRef.current?.remove();
      leafletLabelRef.current?.remove();
      leafletLayerRef.current = null;
      leafletLabelRef.current = null;
      map.remove();
      leafletMapRef.current = null;
    };
  }, [provider, userLocation]);

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
    if (!ready) return;

    if (provider === "maplibre") {
      const map = mapRef.current;
      if (!map) return;
      const data = buildGeoFenceFeatures(geoFenceProjects);
      const existing = map.getSource?.("geofences");
      if (existing && existing.setData) {
        existing.setData(data);
      } else {
        map.addSource("geofences", {
          type: "geojson",
          data,
        });
        map.addLayer({
          id: "geofences-fill",
          type: "fill",
          source: "geofences",
          paint: {
            "fill-color": ["get", "color"],
            "fill-antialias": true,
            "fill-opacity": [
              "case",
              ["boolean", ["get", "active"], false],
              0.3,
              0.16,
            ],
            "fill-outline-color": ["get", "color"],
          },
        });
        map.addLayer({
          id: "geofences-outline",
          type: "line",
          source: "geofences",
          paint: {
            "line-color": [
              "case",
              ["boolean", ["get", "active"], false],
              "#f8fafc",
              "rgba(255,255,255,0.42)",
            ],
            "line-width": [
              "case",
              ["boolean", ["get", "active"], false],
              5.6,
              3.2,
            ],
            "line-opacity": [
              "case",
              ["boolean", ["get", "active"], false],
              0.62,
              0.34,
            ],
            "line-blur": 0,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
        });
        map.addLayer({
          id: "geofences-line",
          type: "line",
          source: "geofences",
          paint: {
            "line-color": ["get", "color"],
            "line-width": [
              "case",
              ["boolean", ["get", "active"], false],
              3.4,
              2.1,
            ],
            "line-opacity": [
              "case",
              ["boolean", ["get", "active"], false],
              1,
              0.92,
            ],
            "line-blur": 0,
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
        });
      }
      return;
    }

    if (provider === "leaflet") {
      const map = leafletMapRef.current;
      if (!map) return;

      const nextIds = new Set();
      geoFenceProjects.forEach((project) => {
        if (!hasValidCoordinates(project)) return;
        const radius = getGeoRadiusMeters(project);
        const shape = getGeoShape(project);
        const color = getGeoColor(project);
        const polygon =
          project?.geofencePolygon ||
          project?.geofence_polygon ||
          project?.geofence_points ||
          null;
        nextIds.add(project.id);
        const existing = geoFenceRef.current.get(project.id);
        if (existing) {
          existing.remove();
          geoFenceRef.current.delete(project.id);
        }
        const seed = String(project?.id || project?.name || "civic").charCodeAt(0);
        const points =
          polygon && Array.isArray(polygon)
            ? polygon
            : buildGeoFencePolygon(project.latitude, project.longitude, radius, shape, seed);
        const shapeLayer = L.polygon(points.map(([lng, lat]) => [lat, lng]), {
          color,
          className: project.activeGeoFence ? "geofence-shape is-active" : "geofence-shape",
          weight: project.activeGeoFence ? 4 : 2.2,
          fillColor: color,
          opacity: project.activeGeoFence ? 1 : 0.92,
          fillOpacity: project.activeGeoFence ? 0.3 : 0.16,
          smoothFactor: 0,
        }).addTo(map);
        geoFenceRef.current.set(project.id, shapeLayer);
      });

      geoFenceRef.current.forEach((circle, id) => {
        if (!nextIds.has(id)) {
          circle.remove();
          geoFenceRef.current.delete(id);
        }
      });
    }
  }, [geoFenceProjects, provider, ready, mapMode]);

  useEffect(() => {
    if (!ready || !userLocation || !loginFocusToken || lastLoginFocusTokenRef.current === loginFocusToken) {
      return;
    }

    lastLoginFocusTokenRef.current = loginFocusToken;
    hasCenteredOnUserRef.current = true;
    centerRef.current = [userLocation.lat, userLocation.lng];
    zoomRef.current = 13.6;

    if (provider === "maplibre" && mapRef.current) {
      mapRef.current.jumpTo({
        center: [DEFAULT_CENTER[1], DEFAULT_CENTER[0]],
        zoom: 4,
        pitch: 0,
        bearing: 0,
      });
      startupAnimationTimerRef.current = window.setTimeout(() => {
        if (!mapRef.current) {
          return;
        }
        mapRef.current.easeTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 13.6,
          pitch: 0,
          bearing: 0,
          duration: 5600,
          easing: (value) => value * value * (3 - 2 * value),
          essential: true,
        });
      }, 360);
      return;
    }

    if (provider === "leaflet" && leafletMapRef.current) {
      leafletMapRef.current.setView(DEFAULT_CENTER, 4, { animate: false });
      startupAnimationTimerRef.current = window.setTimeout(() => {
        if (!leafletMapRef.current) {
          return;
        }
        leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 13.6, {
          animate: true,
          duration: 5.6,
        });
      }, 360);
    }
  }, [loginFocusToken, provider, ready, userLocation]);

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
      return;
    }

    if (provider === "leaflet" && leafletMapRef.current) {
      userMarkerRef.current?.remove();
      const marker = L.marker([userLocation.lat, userLocation.lng], {
        icon: buildLeafletUserIcon(),
      }).addTo(leafletMapRef.current);
      userMarkerRef.current = marker;
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
        mapRef.current.easeTo({
          center: [userLocation.lng, userLocation.lat],
          zoom: 13.6,
          duration: 900,
          essential: true,
        });
        return;
      }
      if (provider === "leaflet" && leafletMapRef.current) {
        leafletMapRef.current.flyTo([userLocation.lat, userLocation.lng], 13.6, {
          animate: true,
          duration: 0.9,
        });
        return;
      }
    }
    onStartTracking?.();
    onRequestLocation?.();
  };

  return (
    <div className="map-shell">
      <div ref={containerRef} className="map-shell__canvas" />
      {showLoadingOverlay && (
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
