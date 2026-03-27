import * as THREE from "three";
import { getProjectModelSpec } from "../data/projectModels";
import { getProjectVisualProfile } from "./projectVisuals";

function buildMaterialLibrary(profile, options = {}) {
  const accent = profile?.accent || "#22d3ee";
  const secondary = profile?.secondary || "#67e8f9";
  const emissiveIntensity = options.emissiveIntensity ?? 0.08;

  return {
    accent: new THREE.MeshStandardMaterial({
      color: new THREE.Color(accent),
      roughness: 0.35,
      metalness: 0.16,
      emissive: new THREE.Color(accent),
      emissiveIntensity,
    }),
    secondary: new THREE.MeshStandardMaterial({
      color: new THREE.Color(secondary),
      roughness: 0.4,
      metalness: 0.12,
    }),
    neutral: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.82,
      metalness: 0.05,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.96,
      metalness: 0.02,
    }),
    warning: new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.72,
      metalness: 0.05,
    }),
    danger: new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.68,
      metalness: 0.05,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: 0xbde7ff,
      roughness: 0.16,
      metalness: 0.24,
      transparent: true,
      opacity: options.glassOpacity ?? 0.78,
    }),
  };
}

function buildGeometry(element) {
  switch (element.shape) {
    case "box":
      return new THREE.BoxGeometry(...element.size);
    case "cylinder":
      return new THREE.CylinderGeometry(
        element.radiusTop,
        element.radiusBottom,
        element.height,
        element.radialSegments ?? 16,
        1,
        element.openEnded ?? false
      );
    case "cone":
      return new THREE.ConeGeometry(element.radius, element.height, element.radialSegments ?? 16);
    case "sphere":
      return new THREE.SphereGeometry(element.radius, element.widthSegments ?? 16, element.heightSegments ?? 16);
    case "torus":
      return new THREE.TorusGeometry(
        element.radius,
        element.tube,
        element.radialSegments ?? 12,
        element.tubularSegments ?? 32,
        element.arc ?? Math.PI * 2
      );
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function applyTransform(mesh, element) {
  const [x = 0, y = 0, z = 0] = element.position || [];
  mesh.position.set(x, y, z);

  if (element.rotation) {
    const [rx = 0, ry = 0, rz = 0] = element.rotation;
    mesh.rotation.set(rx, ry, rz);
  }
}

function addSignatureBeacons(group, spec, materials, profile) {
  const beaconCount = profile?.markerCount || 3;

  for (let index = 0; index < beaconCount; index += 1) {
    const angle = ((profile?.seed || 1) * (index + 1) * 19) % 360;
    const radius = (spec.floorRadius || 4.2) * (0.42 + (index % 3) * 0.07);
    const x = Math.cos((angle * Math.PI) / 180) * radius;
    const z = Math.sin((angle * Math.PI) / 180) * radius;
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.08 + index * 0.015, 12, 12),
      index % 2 === 0 ? materials.accent : materials.secondary
    );
    beacon.position.set(x, 0.82 + index * 0.08, z);
    group.add(beacon);
  }
}

export function buildSavedProjectModel(scene, project, options = {}) {
  const profile = options.profile || getProjectVisualProfile(project);
  const spec = getProjectModelSpec(project);
  const materials = buildMaterialLibrary(profile, options.materialOptions);
  const group = new THREE.Group();

  spec.elements.forEach((element) => {
    const geometry = buildGeometry(element);
    const material = materials[element.role] || materials.neutral;
    const mesh = new THREE.Mesh(geometry, material);
    applyTransform(mesh, element);
    group.add(mesh);
  });

  if (options.includeBeacons !== false) {
    addSignatureBeacons(group, spec, materials, profile);
  }

  group.scale.setScalar(spec.scale || profile?.scale || 1);
  scene.add(group);

  return { group, spec, profile };
}
