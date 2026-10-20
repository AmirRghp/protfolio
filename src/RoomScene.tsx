import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, DoubleSide, Raycaster, Vector2, Vector3 } from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { portfolioContent } from "./content";
import { boardCardLayout } from "./boardLayout";
import { ROOM_FOV, roomCameraDistance, roomParallaxOffset } from "./roomCamera";
import type { RoomDestination } from "./roomNavigation";
import RoomUnavailable from "./RoomUnavailable";

type Triple = [number, number, number];

function Block({ position, size, color, rotation, glow, roughness = 0.8, metalness = 0, castShadow = true, receiveShadow = true }: {
  position: Triple;
  size: Triple;
  color: string;
  rotation?: Triple;
  glow?: string;
  roughness?: number;
  metalness?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow={castShadow} receiveShadow={receiveShadow}>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={roughness} metalness={metalness} emissive={glow} emissiveIntensity={glow ? 0.6 : 0} />
    </mesh>
  );
}

function ArcadeCabinet() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/arcade-cabinet.glb");
  return <primitive object={scene} position={[4.35, 1.9, 0]} scale={[2.6, 2.2, 1.4]} />;
}

function MonitorText() {
  const material = useRef<import("three").MeshBasicMaterial>(null);
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.fillStyle = "#17303b";
    context.fillRect(0, 0, 1024, 512);
    context.fillStyle = "#f1efe8";
    context.font = "48px system-ui";
    context.fillText(portfolioContent.owner.name, 64, 220, 896);
    context.fillStyle = "#d6bc87";
    context.font = "32px system-ui";
    context.fillText(portfolioContent.owner.role, 64, 290, 896);
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    const target = material.current!;
    target.map = texture;
    target.needsUpdate = true;
    invalidate();
    return () => { target.map = null; texture.dispose(); };
  }, [invalidate]);
  return <mesh position={[-0.25, 3.25, -0.22]}>
    <planeGeometry args={[4.8, 2.6]} />
    <meshBasicMaterial ref={material} toneMapped={false} />
  </mesh>;
}

const overviewTarget = new Vector3(0, 3.45, 0);

function destinationPose(destination: RoomDestination, aspect: number) {
  if (destination === "room") {
    return { position: new Vector3(0, 3.45, roomCameraDistance(aspect)), target: overviewTarget.clone() };
  }

  const targets = {
    monitor: { target: new Vector3(-0.25, 3.25, -0.25), width: 5, height: 3.1 },
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

function CameraFocus({ destination }: { destination: RoomDestination }) {
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
  const elapsed = useRef(0);
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
      startPosition.current.copy(camera.position);
      startTarget.current.copy(lookAt.current);
      endPosition.current.copy(pose.position);
      endTarget.current.copy(pose.target);
      idleOffset.current.set(0, 0, 0);
      elapsed.current = 0;
      active.current = true;
      invalidate();
    }

    const onPointerMove = (event: PointerEvent) => {
      const focused = document.activeElement;
      if (destination !== "room" || active.current || motionPreference.matches ||
        event.pointerType !== "mouse" || !finePointer.matches ||
        (focused instanceof HTMLElement && preview?.contains(focused) && focused !== canvas)) {
        resetIdle();
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const x = (event.clientX - bounds.left - bounds.width / 2) / (bounds.width / 2);
      const y = (bounds.top + bounds.height / 2 - event.clientY) / (bounds.height / 2);
      hotspotRaycaster.current.setFromCamera(pointerPosition.current.set(x, y), camera);
      idleTarget.current = hotspotRaycaster.current.intersectObjects(hotspots).length
        ? { x: 0, y: 0 }
        : roomParallaxOffset(x, y);
      invalidate();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") resetIdle();
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
    const onVisibilityChange = () => { if (document.hidden) resetIdle(); };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", resetIdle);
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("blur", resetIdle);
    window.addEventListener("focusin", resetIdle);
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionChange);
    return () => {
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", resetIdle);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("blur", resetIdle);
      window.removeEventListener("focusin", resetIdle);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, [camera, destination, size.width, size.height, gl, scene, invalidate]);

  useFrame((_, delta) => {
    if (active.current) {
      elapsed.current = Math.min(elapsed.current + delta, 0.28);
      const progress = elapsed.current / 0.28;
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

function FocusHotspot({ destination, position, size, onNavigate }: {
  destination: Exclude<RoomDestination, "room">;
  position: Triple;
  size: [number, number];
  onNavigate: (destination: RoomDestination) => void;
}) {
  return (
    <mesh
      name="focus-hotspot"
      position={position}
      onClick={(event) => { event.stopPropagation(); onNavigate(destination); }}
    >
      <planeGeometry args={size} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} side={DoubleSide} />
    </mesh>
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

function Study({ onNavigate }: { onNavigate: (destination: RoomDestination) => void }) {
  const boardCards = boardCardLayout(portfolioContent.projects.length);

  return (
    <>
      <color attach="background" args={["#151718"]} />
      <ambientLight intensity={0.5} color="#d6cfbf" />
      <directionalLight position={[1, 7, 6]} intensity={1.15} color="#e6d9bf" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={6} shadow-camera-bottom={-4} />
      <pointLight position={[1.5, 3.2, 0.7]} color="#ffb45d" intensity={12} distance={7} decay={2} />
      <pointLight position={[3, 1.6, 0.7]} color="#467dff" intensity={2.5} distance={5} decay={2} />

      <group name="room">
        <Block position={[0, 3.2, -1.5]} size={[30, 24, 0.2]} color="#292a2b" castShadow={false} receiveShadow={false} />
        <Block position={[2.55, 5.45, -1.16]} size={[2.8, 0.16, 0.52]} color="#89552e" />
        <Block position={[2.55, 4.2, -1.16]} size={[2.8, 0.16, 0.52]} color="#89552e" />
      </group>

      <group name="board" position={[-3.5, 3.65, -1.18]} scale={[1.45, 1, 1]}>
        <Block position={[0, 0, 0]} size={[4.7, 3.25, 0.16]} color="#51321d" />
        <Block position={[0, 0, 0.1]} size={[4.5, 3.05, 0.08]} color="#91603b" />
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
      <FocusHotspot destination="board" position={[-3.5, 3.65, -1.06]} size={[6.525, 3.05]} onNavigate={onNavigate} />

      <group name="workstation">
        <Block position={[0, 1.8, 0.2]} size={[11.6, 0.18, 2.2]} color="#89552e" roughness={0.68} castShadow={false} />
        <Block position={[-0.25, 3.25, -0.35]} size={[5.1, 2.9, 0.16]} color="#11181b" roughness={0.42} metalness={0.42} />
        <Block position={[-0.25, 3.25, -0.25]} size={[4.8, 2.6, 0.04]} color="#17303b" glow="#1e5261" />
        <Block position={[-0.25, 2.15, -0.35]} size={[0.15, 0.4, 0.16]} color="#272c2d" />
        <Block position={[-0.25, 1.94, -0.25]} size={[0.8, 0.06, 0.45]} color="#22272a" />
      </group>
      <MonitorText />
      <FocusHotspot destination="monitor" position={[-0.25, 3.25, -0.19]} size={[4.8, 2.6]} onNavigate={onNavigate} />

      <Suspense fallback={null}>
        <ArcadeCabinet />
      </Suspense>
      <FocusHotspot destination="arcade" position={[4.35, 4, 0.82]} size={[3.4, 4.5]} onNavigate={onNavigate} />
    </>
  );
}

export default function RoomScene({ destination, onNavigate }: {
  destination: RoomDestination;
  onNavigate: (destination: RoomDestination) => void;
}) {
  const [contextLost, setContextLost] = useState(false);
  if (contextLost) return <RoomUnavailable />;
  return (
    <Canvas shadows="percentage" frameloop="demand" dpr={[1, 1.5]} camera={{ fov: ROOM_FOV, near: 0.1, far: 100, position: [0, 2.7, 15] }} fallback={<RoomUnavailable />} aria-label="Frontal study with project board, workstation and arcade">
      <CameraFocus destination={destination} />
      <ContextGuard onLost={() => setContextLost(true)} />
      <Study onNavigate={onNavigate} />
    </Canvas>
  );
}
