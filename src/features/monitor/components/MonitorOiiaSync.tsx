import { getAssetUrl } from "@/core/utils/assetUrl";
import { useEffect, useRef } from "react";
import {
  AmbientLight,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { oiiaAudio } from "@/features/room/audio/oiiaAudio";
import {
  calculateCatBounce,
  calculateMonitorRaveColor,
  calculateSpinVelocity,
} from "@/features/room/utils/oiiaCatLogic";
import styles from "./MonitorDesktop.module.css";

function disposeSceneObjects(root: Group | Scene) {
  root.traverse((obj) => {
    if (obj instanceof Mesh) {
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) {
        for (const mat of obj.material) {
          mat?.dispose();
        }
      } else {
        obj.material?.dispose();
      }
    }
  });
}

export default function MonitorOiiaSync({ active }: { active: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let destroyed = false;
    let animId = 0;
    let renderer: WebGLRenderer | null = null;
    let modelGroup: Group | null = null;
    let spinAngle = 0;
    let lastTime = performance.now();

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      destroyed = true;
      cancelAnimationFrame(animId);
    };
    canvas.addEventListener("webglcontextlost", handleContextLost);

    // Check WebGL availability safely (e.g. In headless/test environments)
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    } catch {
      renderer = null;
    }

    const scene = new Scene();
    const camera = new OrthographicCamera(-0.45, 0.45, 0.45, -0.45, 0.1, 20);
    camera.position.set(0, 0.23, 1.8);
    camera.lookAt(0, 0.23, 0);

    const ambientLight = new AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const keyLight = new DirectionalLight(0xffffff, 2.4);
    keyLight.position.set(1, 2, 2.5);
    scene.add(keyLight);
    const fillLight = new DirectionalLight(0xffffff, 1.2);
    fillLight.position.set(-1.5, 0.5, 1.5);
    scene.add(fillLight);

    const resize = () => {
      if (!renderer || !canvas) return;
      const width = canvas.clientWidth || 400;
      const height = canvas.clientHeight || 400;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const frustumSize = 0.54;
      camera.left = (-frustumSize * aspect) / 2;
      camera.right = (frustumSize * aspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
    };

    resize();
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
    }

    // Load glTF cat model
    const loader = new GLTFLoader();
    loader.load(
      getAssetUrl("assets/models/oiia-cat.glb"),
      (gltf) => {
        if (destroyed) {
          disposeSceneObjects(gltf.scene);
          return;
        }
        const root = gltf.scene;
        modelGroup = new Group();

        root.traverse((child) => {
          if (child instanceof Mesh) {
            if (child.material instanceof MeshStandardMaterial) {
              child.material.roughness = 0.45;
              child.material.metalness = 0.05;
              child.material.needsUpdate = true;
            }
            if (child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
              // Fold legs into loaf form for drop dance
              child.morphTargetInfluences[0] = 1.0;
            }
          }
        });

        const scale = 1.0;
        root.scale.set(scale, scale, scale);
        root.position.set(0.006 * scale, 0.01101 * scale, -0.059 * scale);
        modelGroup.add(root);
        scene.add(modelGroup);
      },
      undefined,
      (err) => {
        console.warn("Oiia cat sync model load warning:", err);
      },
    );

    const tick = (now: number) => {
      if (destroyed) return;
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const audioState = oiiaAudio.getState();
      const color = calculateMonitorRaveColor(audioState.currentTime, reducedMotion);
      container.style.backgroundColor = color;

      if (modelGroup && renderer) {
        // Spin synchronized with drop
        const spinVel = calculateSpinVelocity(
          audioState.currentTime,
          true,
          reducedMotion,
        );
        spinAngle += spinVel * delta;
        modelGroup.rotation.y = spinAngle;

        // Bounce up and down to the beat
        const { bounceY } = calculateCatBounce(
          audioState.currentTime,
          audioState.bassEnergy,
          true,
          true,
          reducedMotion,
        );
        modelGroup.position.y = bounceY * 0.55;
        const squash = 1 + bounceY * 0.4;
        modelGroup.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

        renderer.render(scene, camera);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      destroyed = true;
      cancelAnimationFrame(animId);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      resizeObserver?.disconnect();
      disposeSceneObjects(scene);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={containerRef}
      className={styles.oiiaDropSyncOverlay}
      data-testid="oiia-monitor-drop-sync"
      aria-label="Oiia Cat Drop Sync"
      role="region"
    >
      <canvas
        ref={canvasRef}
        className={styles.oiiaDropSyncCanvas}
        data-testid="oiia-drop-canvas"
      />
    </div>
  );
}
