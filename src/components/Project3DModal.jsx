import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { buildSavedProjectModel } from "../utils/projectModelBuilder";
import { getProjectVisualProfile } from "../utils/projectVisuals";

const INITIAL_ZOOM = 7.5;

function getModalCameraPreset(family, zoom, override = null) {
  if (override?.position) {
    const [x = 0, y = 3.4, baseZ = zoom] = override.position;
    const delta = zoom - INITIAL_ZOOM;
    return {
      position: [x, y, baseZ + delta],
      target: override.target || [0, 0, 0],
    };
  }

  switch (family) {
    case "metro":
    case "station":
    case "railway":
    case "rrts":
      return { position: [0, 2.8, zoom + 1.7], target: [0, -0.08, 0] };
    case "road":
    case "highway":
      return { position: [0, 2.3, zoom + 1.8], target: [0, -0.2, 0] };
    case "airport":
      return { position: [0, 4, zoom + 1.25], target: [0, -0.24, 0.08] };
    case "port":
      return { position: [0, 4.1, zoom + 1.15], target: [0, -0.36, -0.12] };
    case "wastewater":
      return { position: [0, 4.4, zoom - 0.2], target: [0, -0.18, 0.25] };
    case "hospital":
      return { position: [0, 3.9, zoom - 0.1], target: [0, 0.1, 0.08] };
    case "education":
    case "civic":
      return { position: [0, 3.8, zoom + 0.2], target: [0, -0.02, 0.15] };
    default:
      return { position: [0, 3.4, zoom], target: [0, 0, 0] };
  }
}

export default function Project3DModal({ open, project, onClose }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const profile = useMemo(() => getProjectVisualProfile(project), [project]);
  const previewFamilyRef = useRef("civic");
  const modalCameraRef = useRef(null);

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    if (!open || !project) return undefined;

    const mountNode = mountRef.current;
    if (!mountNode) return undefined;

    const width = mountNode.clientWidth || 800;
    const height = mountNode.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070c);
    scene.fog = new THREE.Fog(0x08101b, 8, 22);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    mountNode.innerHTML = "";
    mountNode.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight(0xdbeafe, 0x0b1220, 1.35);
    scene.add(hemisphere);

    const ambient = new THREE.AmbientLight(0xffffff, 0.22);
    scene.add(ambient);

    const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.6);
    sunLight.position.set(6, 8, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(2048, 2048);
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 30;
    sunLight.shadow.camera.left = -8;
    sunLight.shadow.camera.right = 8;
    sunLight.shadow.camera.top = 8;
    sunLight.shadow.camera.bottom = -8;
    sunLight.shadow.bias = -0.0004;
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x67e8f9, 1.1);
    rimLight.position.set(-5, 4, -6);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x93c5fd, 0.9, 18);
    fillLight.position.set(0, 2.2, 4.4);
    scene.add(fillLight);

    const { group: model, spec } = buildSavedProjectModel(scene, project, {
      profile,
      includeBeacons: false,
      materialOptions: { emissiveIntensity: 0.08, glassOpacity: 0.72 },
    });
    previewFamilyRef.current = spec.family;
    modalCameraRef.current = spec.modalCamera || null;
    const preset = getModalCameraPreset(spec.family, INITIAL_ZOOM, spec.modalCamera);
    camera.position.set(...preset.position);
    camera.lookAt(...preset.target);
    modelRef.current = model;

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry((spec.floorRadius || 4.4) + 1.2, 72),
      new THREE.MeshStandardMaterial({ color: 0x111c2c, roughness: 0.98, metalness: 0.02 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.02;
    floor.receiveShadow = true;
    scene.add(floor);

    const floorGlow = new THREE.Mesh(
      new THREE.RingGeometry((spec.floorRadius || 4.4) + 0.65, (spec.floorRadius || 4.4) + 1.45, 64),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(profile.secondary),
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
      })
    );
    floorGlow.rotation.x = -Math.PI / 2;
    floorGlow.position.y = -1.015;
    scene.add(floorGlow);

    const backdrop = new THREE.Mesh(
      new THREE.CylinderGeometry((spec.floorRadius || 4.4) + 2.2, (spec.floorRadius || 4.4) + 2.9, 5.8, 48, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x09111d,
        roughness: 1,
        metalness: 0,
        side: THREE.BackSide,
      })
    );
    backdrop.position.y = 1.2;
    scene.add(backdrop);

    let raf = 0;
    const tick = () => {
      if (autoRotateRef.current && modelRef.current) {
        modelRef.current.rotation.y += spec.turnRate || profile.turnRate || 0.0042;
      }
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

    const canvas = renderer.domElement;
    const handleContextMenu = (event) => event.preventDefault();
    const handlePointerDown = (event) => {
      if (event.button !== 2) return;
      event.preventDefault();
      isDraggingRef.current = true;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      setAutoRotate(false);
    };
    const handlePointerMove = (event) => {
      if (!isDraggingRef.current || !modelRef.current) return;
      const deltaX = event.clientX - lastPointerRef.current.x;
      const deltaY = event.clientY - lastPointerRef.current.y;
      lastPointerRef.current = { x: event.clientX, y: event.clientY };
      modelRef.current.rotation.y += deltaX * 0.01;
      modelRef.current.rotation.x += deltaY * 0.005;
      modelRef.current.rotation.x = Math.max(-0.6, Math.min(0.6, modelRef.current.rotation.x));
    };
    const handlePointerUp = () => {
      isDraggingRef.current = false;
    };

    canvas.addEventListener("contextmenu", handleContextMenu);
    canvas.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);

    return () => {
      window.cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      canvas.removeEventListener("contextmenu", handleContextMenu);
      canvas.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      renderer.dispose();
      modelRef.current = null;
      cameraRef.current = null;
      modalCameraRef.current = null;
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [open, project, profile]);

  useEffect(() => {
    if (!open) return undefined;
    const resetTimer = window.setTimeout(() => {
      setZoom(INITIAL_ZOOM);
      setAutoRotate(true);
    }, 0);
    return () => window.clearTimeout(resetTimer);
  }, [open, project]);

  useEffect(() => {
    if (!cameraRef.current) return;
    const preset = getModalCameraPreset(previewFamilyRef.current, zoom, modalCameraRef.current);
    cameraRef.current.position.set(...preset.position);
    cameraRef.current.lookAt(...preset.target);
  }, [zoom]);

  if (!open || !project) return null;

  const handleZoomIn = () => setZoom((value) => Math.max(4.8, value - 0.8));
  const handleZoomOut = () => setZoom((value) => Math.min(12, value + 0.8));
  const handleRotateToggle = () => setAutoRotate((value) => !value);
  const handleReset = () => {
    setZoom(INITIAL_ZOOM);
    setAutoRotate(true);
    if (modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <div>
            <div className="modal__eyebrow">3D Visualization</div>
            <h3>{project.name}</h3>
            <p>{project.locationLabel}</p>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="modal__viewer" ref={mountRef} />
        <div className="modal__controls">
          <button type="button" onClick={handleZoomIn}>
            <ZoomIn size={16} />
            Zoom in
          </button>
          <button type="button" onClick={handleZoomOut}>
            <ZoomOut size={16} />
            Zoom out
          </button>
          <button type="button" onClick={handleRotateToggle}>
            <RotateCw size={16} />
            {autoRotate ? "Pause rotation" : "Rotate"}
          </button>
          <button type="button" onClick={handleReset}>
            <RotateCcw size={16} />
            Reset view
          </button>
        </div>
      </div>
    </div>
  );
}
