import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getProjectVisualProfile } from "../utils/projectVisuals";
import { buildSavedProjectModel } from "../utils/projectModelBuilder";

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
    scene.fog = new THREE.Fog(0x020617, 7, 20);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.6, 6.8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    mountNode.innerHTML = "";
    mountNode.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0x67e8f9, 2.2);
    keyLight.position.set(3, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
    fillLight.position.set(-4, 3, -2);
    scene.add(fillLight);

    const { group: model, spec } = buildSavedProjectModel(scene, project, { profile });

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(spec.floorRadius || 4.2, 48),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 1, metalness: 0 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.01;
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
