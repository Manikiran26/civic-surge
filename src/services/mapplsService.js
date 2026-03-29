import { mappls, mappls_plugin } from "mappls-web-maps";

export const mapplsClassObject = new mappls();
export const mapplsPluginObject = new mappls_plugin();

function resolveApiBase() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
  return `http://${host}:4000/api`;
}

export const MAPPLS_TOKEN = import.meta.env.VITE_MAPPLS_TOKEN || "";
export const MAPPLS_API_BASE = resolveApiBase();

export const MAP_MODES = {
  standard: {
    label: "2D Map",
    style: "standard",
    properties: {
      zoom: 12,
      tilt: 0,
      heading: 0,
    },
  },
  satellite: {
    label: "Satellite",
    style: "standard-hybrid",
    properties: {
      zoom: 12,
      tilt: 0,
      heading: 0,
    },
  },
  threeD: {
    label: "3D",
    style: "standard-hybrid",
    properties: {
      zoom: 13,
      tilt: 60,
      heading: 120,
    },
  },
};

export function getMapModeConfig(mode = "standard") {
  return MAP_MODES[mode] || MAP_MODES.standard;
}
