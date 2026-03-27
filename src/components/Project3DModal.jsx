import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RotateCcw, RotateCw, X, ZoomIn, ZoomOut } from "lucide-react";
import { buildSavedProjectModel } from "../utils/projectModelBuilder";
import { getProjectVisualProfile } from "../utils/projectVisuals";

export default function Project3DModal({ open, project, onClose }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const modelRef = useRef(null);
  const autoRotateRef = useRef(true);
  const isDraggingRef = useRef(false);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [zoom, setZoom] = useState(7.5);
  const profile = useMemo(() => getProjectVisualProfile(project), [project]);

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
    scene.fog = new THREE.Fog(0x05070c, 6, 18);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 3.2, zoom);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mountNode.innerHTML = "";
    mountNode.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x67e8f9, 1.8);
    keyLight.position.set(4, 6, 2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
    fillLight.position.set(-3, 3, -2);
    scene.add(fillLight);

    const { group: model, spec } = buildSavedProjectModel(scene, project, {
      profile,
      includeBeacons: true,
      materialOptions: { emissiveIntensity: 0.12, glassOpacity: 0.78 },
    });
    modelRef.current = model;

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(spec.floorRadius || 4.4, 48),
      new THREE.MeshStandardMaterial({ color: 0x0b1526, roughness: 1, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.05;
    scene.add(floor);

    let raf = 0;
    const tick = () => {
      if (autoRotateRef.current && modelRef.current) {
        modelRef.current.rotation.y += 0.009;
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
      if (mountNode.contains(renderer.domElement)) {
        mountNode.removeChild(renderer.domElement);
      }
    };
  }, [open, project, profile]);

  useEffect(() => {
    if (!open) return;
    setZoom(7.5);
    setAutoRotate(true);
  }, [open, project]);

  useEffect(() => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(0, 3.2, zoom);
    cameraRef.current.lookAt(0, 0, 0);
  }, [zoom]);

  if (!open || !project) return null;

  const handleZoomIn = () => setZoom((value) => Math.max(4.8, value - 0.8));
  const handleZoomOut = () => setZoom((value) => Math.min(12, value + 0.8));
  const handleRotateToggle = () => setAutoRotate((value) => !value);
  const handleReset = () => {
    setZoom(7.5);
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
