import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Camera, Compass, Play, Radar, Sparkles, Square, SquareArrowOutUpRight } from "lucide-react";
import ProjectMini3D from "./ProjectMini3D";
import { getProjectColor } from "../data/projects";
import { getProjectVisualProfile } from "../utils/projectVisuals";
import { getProjectModelSpec } from "../data/projectModels";
import { buildSavedProjectModel } from "../utils/projectModelBuilder";

export default function ProjectARView({ project }) {
  const profile = useMemo(() => getProjectVisualProfile(project), [project]);
  const modelSpec = useMemo(() => getProjectModelSpec(project), [project]);
  const color = getProjectColor(project);
  const mountRef = useRef(null);
  const overlayRef = useRef(null);
  const sessionRef = useRef(null);
  const rendererRef = useRef(null);
  const animationRef = useRef(0);
  const sceneRef = useRef(null);
  const modelRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState("Tap start to launch the WebXR camera session when supported.");

  useEffect(() => {
    let cancelled = false;

    async function checkSupport() {
      try {
        const supported = Boolean(navigator.xr && (await navigator.xr.isSessionSupported("immersive-ar")));
        if (!cancelled) {
          setIsSupported(supported);
          setMessage(
            supported
              ? "WebXR immersive-ar is available on this device."
              : "WebXR immersive-ar is not supported here. The panel will show a simulation fallback."
          );
        }
      } catch {
        if (!cancelled) {
          setIsSupported(false);
          setMessage("WebXR support could not be detected in this browser.");
        }
      }
    }

    checkSupport();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      void stopSession();
    };
  }, []);

  async function stopSession() {
    try {
      if (sessionRef.current && sessionRef.current.visibilityState !== "closed") {
        await sessionRef.current.end();
      }
    } catch {
      // ignore teardown issues
    }

    sessionRef.current = null;
    setIsActive(false);
    setIsStarting(false);

    if (animationRef.current) {
      window.cancelAnimationFrame(animationRef.current);
      animationRef.current = 0;
    }

    rendererRef.current?.setAnimationLoop(null);

    if (rendererRef.current) {
      rendererRef.current.dispose();
      const canvas = rendererRef.current.domElement;
      if (canvas?.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      rendererRef.current = null;
    }

    modelRef.current = null;
    sceneRef.current = null;
  }

  async function startSession() {
    if (isStarting || isActive) {
      return;
    }

    if (!navigator.xr) {
      setMessage("This browser does not expose navigator.xr.");
      return;
    }

    setIsStarting(true);

    try {
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["local-floor"],
        optionalFeatures: ["dom-overlay", "hit-test", "light-estimation"],
        domOverlay: { root: overlayRef.current || undefined },
      });

      const mountNode = mountRef.current;
      if (!mountNode) {
        await session.end();
        return;
      }

      await stopSession();

      const scene = new THREE.Scene();
      scene.background = null;
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 1.6, 4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.xr.enabled = true;
      renderer.xr.setReferenceSpaceType("local-floor");
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(mountNode.clientWidth || 320, mountNode.clientHeight || 420);
      mountNode.innerHTML = "";
      mountNode.appendChild(renderer.domElement);

      const ambient = new THREE.AmbientLight(0xffffff, 1.1);
      scene.add(ambient);
      const keyLight = new THREE.DirectionalLight(new THREE.Color(profile.accent), 1.9);
      keyLight.position.set(2, 4, 2);
      scene.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 0.85);
      fillLight.position.set(-2, 3, -1);
      scene.add(fillLight);

      const { group: model } = buildSavedProjectModel(scene, project, {
        profile,
        materialOptions: {
          emissiveIntensity: 0.1,
          glassOpacity: 0.72,
        },
      });
      modelRef.current = model;

      const reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.18, 0.24, 32),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide })
      );
      reticle.rotation.x = -Math.PI / 2;
      reticle.position.set(0, 0.02, -1.8);
      scene.add(reticle);

      renderer.setAnimationLoop(() => {
        model.rotation.y += modelSpec.turnRate || profile.turnRate || 0.008;
        model.rotation.x = Math.sin(Date.now() * 0.00045 + profile.seed * 0.00001) * 0.05;
        renderer.render(scene, camera);
      });

      session.addEventListener("end", () => {
        if (animationRef.current) {
          window.cancelAnimationFrame(animationRef.current);
          animationRef.current = 0;
        }
        renderer.setAnimationLoop(null);
        setIsActive(false);
        setIsStarting(false);
      });

      sessionRef.current = session;
      rendererRef.current = renderer;
      await renderer.xr.setSession(session);
      setIsActive(true);
      setMessage("AR session active. Use your device to move through the civic overlay.");
    } catch (error) {
      setMessage(error?.message || "Unable to start immersive AR.");
      await stopSession();
    } finally {
      setIsStarting(false);
    }
  }

  const unsupported = !isSupported && !isActive;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950/90 p-4 shadow-[0_30px_80px_rgba(2,6,23,0.4)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.12),transparent_36%),linear-gradient(180deg,rgba(2,6,23,0.3),rgba(2,6,23,0.95))]" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-cyan-300 font-black">AR view</div>
            <h3 className="text-lg font-black text-white">WebXR camera session</h3>
          </div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] uppercase tracking-[0.25em]"
            style={{ color, borderColor: `${color}40`, backgroundColor: `${color}10` }}
          >
            <Camera size={12} />
            {profile.caption}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-white/10 bg-black/40 p-3 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between text-[9px] uppercase tracking-[0.25em] text-white/40">
              <span>Spatial feed</span>
              <span>{profile.theme} / {profile.layoutVariant}</span>
            </div>

            <div
              ref={mountRef}
              className={`relative h-[320px] overflow-hidden rounded-[1.5rem] border border-cyan-500/20 bg-slate-950/80 ${
                isActive ? "ring-1 ring-cyan-400/40" : ""
              }`}
            >
              {unsupported && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 p-6">
                  <div className="max-w-sm text-center">
                    <div className="mx-auto mb-4 w-14 h-14 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 flex items-center justify-center">
                      <SquareArrowOutUpRight size={22} className="text-cyan-300" />
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      WebXR immersive-ar is unavailable here. The same project still renders as a procedural 3D preview below.
                    </p>
                  </div>
                </div>
              )}

              {!isActive && !unsupported && (
                <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_55%)]">
                  <button
                    type="button"
                    onClick={startSession}
                    disabled={isStarting}
                    className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400 bg-cyan-400/10 px-4 py-3 text-[10px] font-black uppercase tracking-[0.25em] text-cyan-100 transition hover:bg-cyan-400/15 disabled:opacity-60"
                  >
                    <Play size={13} />
                    {isStarting ? "Starting AR..." : "Start WebXR AR"}
                  </button>
                </div>
              )}
            </div>

            {!isActive && (
              <div className="mt-3 h-[220px] overflow-hidden rounded-[1.5rem] border border-white/10">
                <ProjectMini3D project={project} />
              </div>
            )}
          </div>

          <div ref={overlayRef} className="flex flex-col gap-3">
            <OverlayCard icon={Radar} label="Geo lock" value={project?.locationLabel || `${project?.city || "unknown"}, ${project?.state || "unknown"}`} />
            <OverlayCard icon={Sparkles} label="Why it matters" value={project?.impactSummary || project?.description || "unknown"} />
            <OverlayCard icon={Compass} label="Who benefits" value={project?.citizens || "local residents"} />
            <OverlayCard icon={Square} label="Structure" value={`${modelSpec.title} • ${modelSpec.family} • saved model`} />
            <OverlayCard icon={Camera} label="AR note" value="The AR session uses WebXR when supported; otherwise the project remains viewable in the same card-based experience." />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/60">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isActive ? "bg-cyan-400 animate-pulse" : "bg-white/20"}`} />
            {message}
          </div>
          <button
            type="button"
            onClick={isActive ? stopSession : startSession}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/70 px-3 py-2 text-[9px] font-black uppercase tracking-[0.25em] text-white/80 hover:border-cyan-400/30 hover:text-white"
          >
            {isActive ? <Square size={12} /> : <Camera size={12} />}
            {isActive ? "Stop AR" : "Launch AR"}
          </button>
        </div>
      </div>
    </div>
  );
}

function OverlayCard(props) {
  const CardIcon = props.icon;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      <div className="mb-1 flex items-center gap-2 text-[8px] uppercase tracking-[0.25em] text-white/40">
        <CardIcon size={11} className="text-cyan-300" />
        {props.label}
      </div>
      <div className="text-xs leading-relaxed text-white/90">{props.value}</div>
    </div>
  );
}
