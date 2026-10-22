import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { DoubleSide, Mesh, PerspectiveCamera, Raycaster, Vector2, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { portfolioContent } from "./content";
import { boardCardLayout } from "./boardLayout";
import { monitorOverlayLayout, projectedScreenSize, readMonitorSurface, type MonitorSurface } from "./monitorProjection";
import { ROOM_FOV, ROOM_TRANSITION_SECONDS, roomCameraDistance, roomParallaxOffset } from "./roomCamera";
import type { RoomDestination } from "./roomNavigation";
import type { RoomHotspot, RoomHotspotHover } from "./roomHover";
import RoomUnavailable from "./RoomUnavailable";

type Triple = [number, number, number];

function Block({ position, size, color }: {
  position: Triple;
  size: Triple;
  color: string;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function RoomFurnishings() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/room-furnishings.glb");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = object.name !== "DeskTop";
        object.receiveShadow = true;
      }
    });
    invalidate();
  }, [scene, invalidate]);
  return <primitive object={scene} />;
}

function ArcadeCabinet() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/arcade-cabinet.glb");
  return <primitive object={scene} position={[4.35, 1.9, 0]} scale={[2.6, 2.2, 1.4]} />;
}

function Monitor({ desktopRef }: { desktopRef: RefObject<HTMLDivElement | null> }) {
  const { scene } = useLoader(GLTFLoader, "/assets/models/curved-monitor.glb");
  const invalidate = useThree((state) => state.invalidate);
  const surface = useMemo(() => {
    const screen = scene.getObjectByName("MonitorScreen");
    if (!(screen instanceof Mesh)) throw new Error("The monitor model is missing MonitorScreen");
    scene.updateMatrixWorld(true);
    return readMonitorSurface(screen.geometry, screen.matrixWorld);
  }, [scene]);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = object.name !== "MonitorScreen";
        object.receiveShadow = true;
      }
    });
    invalidate();
  }, [scene, invalidate]);
  return (
    <>
      <primitive object={scene} />
      <MonitorOverlay surface={surface} desktopRef={desktopRef} />
    </>
  );
}

/**
 * Keeps the HTML desktop glued to the physical screen of the monitor: the live camera pose is
 * projected into the canvas, a homography maps the overlay onto that quad and the outline of the
 * screen clips it so it never paints over the bezel.
 */
function MonitorOverlay({ surface, desktopRef }: {
  surface: MonitorSurface;
  desktopRef: RefObject<HTMLDivElement | null>;
}) {
  const { camera, size } = useThree();
  const applied = useRef({ transform: "", clipPath: "", sagTop: -1, sagBottom: -1 });

  const resting = useMemo(() => {
    const pose = destinationPose("monitor", size.width / size.height);
    const restCamera = new PerspectiveCamera(ROOM_FOV, size.width / size.height, 0.1, 100);
    restCamera.position.copy(pose.position);
    restCamera.lookAt(pose.target);
    restCamera.updateMatrixWorld(true);
    restCamera.updateProjectionMatrix();
    return projectedScreenSize(restCamera, size, surface);
  }, [size, surface]);

  useEffect(() => () => {
    if (desktopRef.current) desktopRef.current.dataset.projected = "false";
  }, [desktopRef]);

  useFrame(() => {
    const element = desktopRef.current;
    if (!element) return;
    const layout = monitorOverlayLayout(camera, size, surface, resting);
    if (layout.transform !== applied.current.transform) {
      element.style.transform = layout.transform;
      applied.current.transform = layout.transform;
    }
    if (layout.clipPath !== applied.current.clipPath) {
      element.style.clipPath = layout.clipPath;
      applied.current.clipPath = layout.clipPath;
    }
    if (element.style.width !== `${resting.width}px`) element.style.width = `${resting.width}px`;
    if (element.style.height !== `${resting.height}px`) element.style.height = `${resting.height}px`;
    // The curved edge of the screen dips into the flat overlay, so the desktop keeps its content clear of it.
    if (applied.current.sagTop !== layout.sagTop) {
      element.style.setProperty("--ui-sag-top", `${layout.sagTop}px`);
      applied.current.sagTop = layout.sagTop;
    }
    if (applied.current.sagBottom !== layout.sagBottom) {
      element.style.setProperty("--ui-sag-bottom", `${layout.sagBottom}px`);
      applied.current.sagBottom = layout.sagBottom;
    }
    if (element.dataset.projected !== "true") element.dataset.projected = "true";
  });

  return null;
}

const overviewTarget = new Vector3(0, 3.45, 0);

// Measured from the prepared monitor asset: the display surface is centred at (-0.25, 3.754, -0.25).
const monitorSurface = {
  target: new Vector3(-0.25, 3.754, -0.25),
  width: 4.231,
  height: 2.136,
};

function destinationPose(destination: RoomDestination, aspect: number) {
  if (destination === "room") {
    return { position: new Vector3(0, 3.45, roomCameraDistance(aspect)), target: overviewTarget.clone() };
  }

  const targets = {
    monitor: { target: monitorSurface.target, width: 4.6, height: 2.6 },
    board: { target: new Vector3(-3.5, 3.65, -1.08), width: 6.525, height: 3.05 },
    arcade: { target: new Vector3(4.35, 3.55, -0.38), width: 2.6, height: 3.5 },
  }[destination];
  const tangent = Math.tan((ROOM_FOV * Math.PI) / 360);
  const distance = Math.max(targets.width / (2 * tangent * aspect), targets.height / (2 * tangent)) * 1.32;
  return {
    position: new Vector3(targets.target.x, targets.target.y, targets.target.z + distance),
    target: targets.target,
  };
}

function isRoomHotspot(value: unknown): value is RoomHotspot {
  return value === "monitor" || value === "board" || value === "arcade";
}

function CameraFocus({ destination, onHotspotHover }: {
  destination: RoomDestination;
  onHotspotHover: (hover: RoomHotspotHover | null) => void;
}) {
  const { camera, size, invalidate, gl, scene } = useThree();
  const lookAt = useRef(overviewTarget.clone());
  const hotspotRaycaster = useRef(new Raycaster());
  const pointerPosition = useRef(new Vector2());
  const basePosition = useRef(new Vector3());
  const idleOffset = useRef(new Vector3());
  const idleTarget = useRef({ x: 0, y: 0 });
  const startPosition = useRef(new Vector3());
  const endPosition = useRef(new Vector3());
  const startTarget = useRef(new Vector3());
  const endTarget = useRef(new Vector3());
  const transitionStart = useRef(0);
  const active = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    const pose = destinationPose(destination, size.width / size.height);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const canvas = gl.domElement;
    const preview = canvas.closest("section");
    const hotspots = scene.getObjectsByProperty("name", "focus-hotspot");
    const resetIdle = () => {
      idleTarget.current.x = 0;
      idleTarget.current.y = 0;
      invalidate();
    };
    const clearHover = () => onHotspotHover(null);
    const clearPointerState = () => {
      clearHover();
      resetIdle();
    };

    basePosition.current.copy(pose.position);
    resetIdle();
    if (!initialized.current) {
      camera.position.copy(pose.position);
      lookAt.current.copy(pose.target);
      camera.lookAt(lookAt.current);
      initialized.current = true;
      invalidate();
    } else if (motionPreference.matches) {
      camera.position.copy(pose.position);
      lookAt.current.copy(pose.target);
      camera.lookAt(lookAt.current);
      idleOffset.current.set(0, 0, 0);
      active.current = false;
      invalidate();
    } else {
      // A new destination continues from wherever the camera currently is.
      startPosition.current.copy(camera.position);
      startTarget.current.copy(lookAt.current);
      endPosition.current.copy(pose.position);
      endTarget.current.copy(pose.target);
      idleOffset.current.set(0, 0, 0);
      transitionStart.current = performance.now();
      active.current = true;
      invalidate();
    }

    const onPointerMove = (event: PointerEvent) => {
      if (destination !== "room" || active.current ||
        event.pointerType !== "mouse" || !finePointer.matches) {
        clearPointerState();
        return;
      }

      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) {
        clearHover();
        return;
      }

      const x = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const y = (bounds.top + bounds.height / 2 - event.clientY) / (bounds.height / 2);
      hotspotRaycaster.current.setFromCamera(pointerPosition.current.set(x, y), camera);
      const intersection = hotspotRaycaster.current.intersectObjects(hotspots)[0];
      const hovered = intersection && isRoomHotspot(intersection.object.userData.destination)
        ? intersection.object.userData.destination
        : null;

      onHotspotHover(hovered ? {
        destination: hovered,
        clientX: event.clientX,
        clientY: event.clientY,
      } : null);

      const focused = document.activeElement;
      if (motionPreference.matches ||
        (focused instanceof HTMLElement && preview?.contains(focused) && focused !== canvas)) {
        resetIdle();
        return;
      }

      idleTarget.current = hovered ? { x: 0, y: 0 } : roomParallaxOffset(x, y);
      invalidate();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") clearPointerState();
    };
    const onMotionChange = () => {
      if (!motionPreference.matches) return;
      resetIdle();
      active.current = false;
      idleOffset.current.set(0, 0, 0);
      camera.position.copy(pose.position);
      lookAt.current.copy(pose.target);
      camera.lookAt(lookAt.current);
      invalidate();
    };
    const onVisibilityChange = () => {
      if (document.hidden) clearPointerState();
    };
    const onPointerCapabilityChange = () => {
      if (!finePointer.matches) clearHover();
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", clearPointerState);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointercancel", clearPointerState);
    window.addEventListener("blur", clearPointerState);
    window.addEventListener("focusin", clearPointerState);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionChange);
    finePointer.addEventListener("change", onPointerCapabilityChange);
    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", clearPointerState);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointercancel", clearPointerState);
      window.removeEventListener("blur", clearPointerState);
      window.removeEventListener("focusin", clearPointerState);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionChange);
      finePointer.removeEventListener("change", onPointerCapabilityChange);
      onHotspotHover(null);
    };
  }, [camera, destination, size.width, size.height, gl, scene, invalidate, onHotspotHover]);

  useFrame((_, delta) => {
    if (active.current) {
      // The travel is measured on the wall clock, so an idle frame cannot skip the whole move.
      const progress = Math.min((performance.now() - transitionStart.current) / (ROOM_TRANSITION_SECONDS * 1000), 1);
      const eased = progress * progress * (3 - 2 * progress);
      camera.position.lerpVectors(startPosition.current, endPosition.current, eased);
      lookAt.current.lerpVectors(startTarget.current, endTarget.current, eased);
      camera.lookAt(lookAt.current);
      if (progress === 1) active.current = false;
      else invalidate();
      return;
    }

    if (destination !== "room") return;
    const target = idleTarget.current;
    const step = 1 - Math.exp(-delta / 0.12);
    idleOffset.current.x += (target.x - idleOffset.current.x) * step;
    idleOffset.current.y += (target.y - idleOffset.current.y) * step;
    if (Math.abs(target.x - idleOffset.current.x) < 0.0005) idleOffset.current.x = target.x;
    if (Math.abs(target.y - idleOffset.current.y) < 0.0005) idleOffset.current.y = target.y;
    camera.position.copy(basePosition.current).add(idleOffset.current);
    camera.lookAt(lookAt.current);
    if (idleOffset.current.x !== target.x || idleOffset.current.y !== target.y) invalidate();
  });
  return null;
}

const HIGHLIGHT_STROKE = 0.035;

function HotspotHighlight({ size }: { size: [number, number] }) {
  const [width, height] = size;
  const borders: { position: Triple; size: Triple }[] = [
    { position: [0, height / 2, 0.004], size: [width, HIGHLIGHT_STROKE, 0.008] },
    { position: [0, -height / 2, 0.004], size: [width, HIGHLIGHT_STROKE, 0.008] },
    { position: [width / 2, 0, 0.004], size: [HIGHLIGHT_STROKE, height, 0.008] },
    { position: [-width / 2, 0, 0.004], size: [HIGHLIGHT_STROKE, height, 0.008] },
  ];

  return (
    <>
      <mesh raycast={() => {}} renderOrder={2}>
        <planeGeometry args={size} />
        <meshBasicMaterial color="#d6bc87" transparent opacity={0.07} depthWrite={false} toneMapped={false} />
      </mesh>
      {borders.map((border, index) => (
        <mesh key={index} position={border.position} raycast={() => {}} renderOrder={3}>
          <boxGeometry args={border.size} />
          <meshBasicMaterial color="#d6bc87" transparent opacity={0.9} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

function FocusHotspot({ destination, position, size, highlighted, onNavigate }: {
  destination: RoomHotspot;
  position: Triple;
  size: [number, number];
  highlighted: boolean;
  onNavigate: (destination: RoomDestination) => void;
}) {
  return (
    <>
      <mesh
        name="focus-hotspot"
        position={position}
        userData={{ destination }}
        onClick={(event) => { event.stopPropagation(); onNavigate(destination); }}
      >
        <planeGeometry args={size} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={DoubleSide} />
      </mesh>
      {highlighted && (
        <group position={[position[0], position[1], position[2] + 0.02]}>
          <HotspotHighlight size={size} />
        </group>
      )}
    </>
  );
}

function ContextGuard({ onLost }: { onLost: () => void }) {
  const canvas = useThree((state) => state.gl.domElement);
  useLayoutEffect(() => {
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [canvas, onLost]);
  return null;
}

function Study({ onNavigate, desktopRef, highlightedHotspot }: {
  onNavigate: (destination: RoomDestination) => void;
  desktopRef: RefObject<HTMLDivElement | null>;
  highlightedHotspot: RoomHotspot | null;
}) {
  const boardCards = boardCardLayout(portfolioContent.projects.length);

  return (
    <>
      <color attach="background" args={["#151718"]} />
      <ambientLight intensity={0.8} color="#d6cfbf" />
      <directionalLight position={[1, 7, 6]} intensity={1.6} color="#e6d9bf" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={6} shadow-camera-bottom={-4} />
      <pointLight position={[1.5, 3.2, 0.7]} color="#ffb45d" intensity={10} distance={7} decay={2} />
      <pointLight position={[3, 1.6, 0.7]} color="#467dff" intensity={3} distance={5} decay={2} />
      <pointLight position={[-2, 4.5, 1.6]} color="#f4b56a" intensity={4} distance={5} decay={2} />
      <pointLight position={[5.8, 6.5, -0.8]} color="#ef9a47" intensity={3} distance={5.5} decay={2} />

      <mesh position={[0, 3.2, -1.4]}>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial color="#292a2b" roughness={0.9} />
      </mesh>

      <group name="board" position={[-3.5, 3.65, -1.18]} scale={[1.45, 1, 1]}>
        {portfolioContent.projects.map((project, index) => {
          const pose = boardCards[index];
          const accents = ["#344a57", "#38413b", "#4a3e50"];
          return (
            <group key={project.id} position={pose.position} rotation={pose.rotation}>
              <Block position={[0, 0, 0]} size={[0.76, 0.58, 0.035]} color="#d6c3a0" />
              <Block position={[0, 0.035, 0.03]} size={[0.62, 0.27, 0.02]} color={accents[index % accents.length]} />
              <Block position={[0, -0.2, 0.03]} size={[0.48, 0.035, 0.02]} color="#8b7557" />
              <Block position={[0, 0.27, 0.04]} size={[0.1, 0.1, 0.06]} color="#22282a" />
            </group>
          );
        })}
      </group>
      <FocusHotspot destination="board" position={[-3.5, 3.65, -1.06]} size={[6.525, 3.05]} highlighted={highlightedHotspot === "board"} onNavigate={onNavigate} />

      <FocusHotspot destination="monitor" position={[-0.25, 3.754, -0.1]} size={[4.231, 2.136]} highlighted={highlightedHotspot === "monitor"} onNavigate={onNavigate} />

      <Suspense fallback={null}>
        <RoomFurnishings />
        <Monitor desktopRef={desktopRef} />
        <ArcadeCabinet />
      </Suspense>
      <FocusHotspot destination="arcade" position={[4.35, 4, 0.82]} size={[3.4, 4.5]} highlighted={highlightedHotspot === "arcade"} onNavigate={onNavigate} />
    </>
  );
}

export default function RoomScene({ destination, onNavigate, onHotspotHover, desktopRef, onUnavailable }: {
  destination: RoomDestination;
  onNavigate: (destination: RoomDestination) => void;
  onHotspotHover: (hover: RoomHotspotHover | null) => void;
  desktopRef: RefObject<HTMLDivElement | null>;
  onUnavailable?: () => void;
}) {
  const [contextLost, setContextLost] = useState(false);
  const [highlightedHotspot, setHighlightedHotspot] = useState<RoomHotspot | null>(null);
  const highlightedHotspotRef = useRef<RoomHotspot | null>(null);
  const reportHotspotHover = useCallback((hover: RoomHotspotHover | null) => {
    const next = hover?.destination ?? null;
    if (highlightedHotspotRef.current !== next) {
      highlightedHotspotRef.current = next;
      setHighlightedHotspot(next);
    }
    onHotspotHover(hover);
  }, [onHotspotHover]);

  useEffect(() => {
    if (destination !== "room") reportHotspotHover(null);
  }, [destination, reportHotspotHover]);

  if (contextLost) return <RoomUnavailable />;
  return (
    <Canvas shadows="percentage" frameloop="demand" dpr={[1, 1.5]} camera={{ fov: ROOM_FOV, near: 0.1, far: 100, position: [0, 2.7, 15] }} fallback={<RoomUnavailable />} aria-label="Frontal study with project board, workstation and arcade">
      <CameraFocus destination={destination} onHotspotHover={reportHotspotHover} />
      <ContextGuard onLost={() => {
        setContextLost(true);
        onUnavailable?.();
      }} />
      <Study onNavigate={onNavigate} desktopRef={desktopRef} highlightedHotspot={destination === "room" ? highlightedHotspot : null} />
    </Canvas>
  );
}
