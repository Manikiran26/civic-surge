import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getProjectVisualProfile } from "../utils/projectVisuals";
import { buildSavedProjectModel } from "../utils/projectModelBuilder";

function getCameraPreset(family) {
  switch (family) {
    case "metro":
    case "station":
    case "railway":
    case "rrts":
      return { position: [0, 2.3, 8.6], target: [0, -0.08, 0] };
    case "road":
    case "highway":
      return { position: [0, 1.9, 8.6], target: [0, -0.18, 0] };
    case "airport":
      return { position: [0, 3.3, 8.9], target: [0, -0.22, 0.06] };
    case "port":
      return { position: [0, 3.5, 8.7], target: [0, -0.3, -0.15] };
    case "wastewater":
      return { position: [0, 4.2, 6.1], target: [0, -0.2, 0.25] };
    case "hospital":
      return { position: [0, 3.5, 6.6], target: [0, 0.05, 0.1] };
    case "education":
    case "civic":
      return { position: [0, 3.3, 7.1], target: [0, -0.02, 0.15] };
    default:
      return { position: [0, 2.8, 6.8], target: [0, 0, 0] };
  }
}

export default function ProjectMini3D({ project }) {
  const mountRef = useRef(null);
  const profile = useMemo(() => getProjectVisualProfile(project), [project]);

  useEffect(() => {
    const mountNode = mountRef.current;
    if (!mountNode) return undefined;

    const width = mountNode.clientWidth || 320;
    const height = mountNode.clientHeight || 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.Fog(0x08101b, 8, 22);

    const previewSpec = buildSavedProjectModel(scene, project, {
      profile,
      includeBeacons: false,
      materialOptions: { emissiveIntensity: 0.05, glassOpacity: 0.76 },
    });
    const cameraPreset = previewSpec.spec.previewCamera || getCameraPreset(previewSpec.spec.family);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...cameraPreset.position);
    camera.lookAt(...cameraPreset.target);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mountNode.innerHTML = "";
    mountNode.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight(0xdbeafe, 0x0b1220, 1.2);
    scene.add(hemisphere);

    const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.2);
    sunLight.position.set(4, 6, 4);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0x67e8f9, 0.75);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const { group: model, spec } = previewSpec;

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(spec.floorRadius || 4.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 1, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.01;
    floor.receiveShadow = true;
    scene.add(floor);

    let raf = 0;
    const tick = () => {
      model.rotation.y += spec.turnRate || profile.turnRate || 0.008;
      model.rotation.x = Math.sin(Date.now() * 0.0007 + profile.seed * 0.0001) * 0.035;
      renderer.render(scene, camera);
      raf = window.requestAnimationFrame(tick);
    };

    tick();

    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = mountNode.clientWidth || width;
      const nextHeight = mountNode.clientHeight || height;
      camera.aspect = nextWidth / nextHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(nextWidth, nextHeight);
    });
    resizeObserver.observe(mountNode);

    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      renderer.dispose();
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [project, profile]);

  return <div ref={mountRef} className="h-full w-full rounded-2xl overflow-hidden border border-white/10 bg-slate-950/90" />;
}
