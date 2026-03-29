const rasterTiles = {
  minimal: {
    tiles: ["https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"],
    attribution:
      '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  dark: {
    tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
    attribution:
      '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  infra: {
    tiles: ["https://basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
    attribution:
      '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
  },
  satellite: {
    tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
    labelTiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
    attribution: "Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 18,
  },
};

export function getRasterTileConfig(mode) {
  const source = rasterTiles[mode] || rasterTiles.infra;
  return {
    tiles: source.tiles,
    attribution: source.attribution,
    maxZoom: source.maxZoom,
  };
}

export function getMapStyle(mode) {
  const source = rasterTiles[mode] || rasterTiles.infra;
  const isDark = mode === "dark" || mode === "infra";

  const basemapLayer = {
    id: "basemap",
    type: "raster",
    source: "basemap",
    paint: {
      "raster-fade-duration": 0,
      "raster-resampling": "nearest",
    },
  };
  const layers = [basemapLayer];

  if (mode === "infra") {
    basemapLayer.paint = {
      "raster-fade-duration": 0,
      "raster-resampling": "nearest",
      "raster-opacity": 0.96,
      "raster-brightness-max": 0.86,
      "raster-saturation": -0.2,
      "raster-contrast": 0.08,
    };
  }

  if (source.labelTiles && source.labelTiles.length) {
    layers.push({
      id: "labels",
      type: "raster",
      source: "labels",
      paint: {
        "raster-opacity": 0.92,
        "raster-fade-duration": 0,
        "raster-resampling": "nearest",
      },
    });
  }

  return {
    version: 8,
    name: `civic-${mode}`,
    sources: {
      basemap: {
        type: "raster",
        tiles: source.tiles,
        tileSize: 256,
        attribution: source.attribution,
        maxzoom: source.maxZoom,
      },
      ...(source.labelTiles && source.labelTiles.length
        ? {
            labels: {
              type: "raster",
              tiles: source.labelTiles,
              tileSize: 256,
              attribution: source.attribution,
              maxzoom: source.maxZoom,
            },
          }
        : {}),
    },
    layers,
    light: {
      anchor: "viewport",
      color: isDark ? "#bfd8ff" : "#ffffff",
      intensity: 0.28,
    },
    fog: isDark
      ? {
          "range": [0.5, 8],
          "color": "#060911",
          "high-color": "#131d2c",
          "space-color": "#010203",
          "horizon-blend": 0.1,
        }
      : undefined,
  };
}

export function getMarkerPalette(status) {
  if (status === "completed") {
    return {
      fill: "#67e8a5",
      stroke: "#0a8f5b",
      halo: "rgba(103, 232, 165, 0.32)",
    };
  }

  if (status === "ongoing") {
    return {
      fill: "#ffd166",
      stroke: "#b97013",
      halo: "rgba(255, 209, 102, 0.28)",
    };
  }

  return {
    fill: "#f87171",
    stroke: "#991b1b",
    halo: "rgba(248, 113, 113, 0.28)",
  };
}

export function getRasterTileSource(mode) {
  return rasterTiles[mode] || rasterTiles.infra;
}
