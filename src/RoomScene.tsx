import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { CanvasTexture, SRGBColorSpace, DoubleSide, Vector3 } from "three";
import { portfolioContent } from "./content";
import { boardCardLayout } from "./boardLayout";
import { ROOM_FOV, roomCameraDistance } from "./roomCamera";
import type { RoomDestination } from "./roomNavigation";
import RoomUnavailable from "./RoomUnavailable";

type Triple = [number, number, number];

function Block({ position, size, color, rotation, glow }: {
  position: Triple;
  size: Triple;
  color: string;
  rotation?: Triple;
  glow?: string;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} roughness={0.8} emissive={glow} emissiveIntensity={glow ? 0.6 : 0} />
    </mesh>
  );
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
  return <mesh position={[-0.25, 2.82, -0.22]}>
    <planeGeometry args={[2.75, 1.38]} />
    <meshBasicMaterial ref={material} toneMapped={false} />
  </mesh>;
}

const overviewTarget = new Vector3(0, 2.7, 0);

function destinationPose(destination: RoomDestination, aspect: number) {
  if (destination === "room") {
    return { position: new Vector3(0, 2.7, roomCameraDistance(aspect)), target: overviewTarget.clone() };
  }

  const targets = {
    monitor: { target: new Vector3(-0.25, 2.82, -0.25), width: 4, height: 3 },
    board: { target: new Vector3(-2.8, 3.65, -1.08), width: 4.5, height: 3.05 },
    arcade: { target: new Vector3(4.35, 2.5, 0.25), width: 2, height: 5 },
  }[destination];
  const tangent = Math.tan((ROOM_FOV * Math.PI) / 360);
  const distance = Math.max(targets.width / (2 * tangent * aspect), targets.height / (2 * tangent)) * 1.32;
  return {
    position: new Vector3(targets.target.x, targets.target.y, targets.target.z + distance),
    target: targets.target,
  };
}

function CameraFocus({ destination }: { destination: RoomDestination }) {
  const { camera, size, invalidate } = useThree();
  const lookAt = useRef(overviewTarget.clone());
  const startPosition = useRef(new Vector3());
  const endPosition = useRef(new Vector3());
  const startTarget = useRef(new Vector3());
  const endTarget = useRef(new Vector3());
  const elapsed = useRef(0);
  const active = useRef(false);
  const initialized = useRef(false);

  useEffect(() => {
    const pose = destinationPose(destination, size.width / size.height);
    if (!initialized.current) {
      camera.position.copy(pose.position);
      lookAt.current.copy(pose.target);
      camera.lookAt(lookAt.current);
      initialized.current = true;
      invalidate();
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      camera.position.copy(pose.position);
      lookAt.current.copy(pose.target);
      camera.lookAt(lookAt.current);
      active.current = false;
      invalidate();
      return;
    }

    startPosition.current.copy(camera.position);
    startTarget.current.copy(lookAt.current);
    endPosition.current.copy(pose.position);
    endTarget.current.copy(pose.target);
    elapsed.current = 0;
    active.current = true;
    invalidate();
  }, [camera, destination, size.width, size.height, invalidate]);

  useFrame((_, delta) => {
    if (!active.current) return;
    elapsed.current = Math.min(elapsed.current + delta, 0.28);
    const progress = elapsed.current / 0.28;
    const eased = progress * progress * (3 - 2 * progress);
    camera.position.lerpVectors(startPosition.current, endPosition.current, eased);
    lookAt.current.lerpVectors(startTarget.current, endTarget.current, eased);
    camera.lookAt(lookAt.current);
    if (progress === 1) active.current = false;
    else invalidate();
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
  useEffect(() => {
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
      <ambientLight intensity={0.65} color="#d6cfbf" />
      <directionalLight position={[1, 7, 6]} intensity={1.4} color="#e6d9bf" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={6} shadow-camera-bottom={-4} />
      <pointLight position={[1.5, 3.2, 0.7]} color="#ffb45d" intensity={22} distance={7} decay={2} />
      <pointLight position={[3, 1.6, 0.7]} color="#467dff" intensity={7} distance={5} decay={2} />

      <group name="room">
        <Block position={[0, -0.12, 0.1]} size={[12, 0.24, 5]} color="#513726" />
        <Block position={[0, 2.8, -1.5]} size={[12, 5.6, 0.2]} color="#292a2b" />
        <Block position={[-5.9, 2.8, 0.1]} size={[0.2, 5.6, 3.2]} color="#303030" />
        <Block position={[5.9, 2.8, 0.1]} size={[0.2, 5.6, 3.2]} color="#24272d" />
        <Block position={[0, 0.12, -1.32]} size={[11.8, 0.24, 0.12]} color="#171b20" />
      </group>

      <group name="board" position={[-2.8, 3.65, -1.18]}>
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
      <FocusHotspot destination="board" position={[-2.8, 3.65, -1.06]} size={[4.5, 3.05]} onNavigate={onNavigate} />

      <group name="workstation">
        <Block position={[-1.05, 1.8, 0]} size={[8.5, 0.18, 1.85]} color="#89552e" />
        {[-5, 2.9].map((x) => <Block key={x} position={[x, 0.85, 0.45]} size={[0.16, 1.7, 0.9]} color="#252a2d" />)}
        <Block position={[-0.25, 2.82, -0.35]} size={[2.95, 1.58, 0.16]} color="#11181b" />
        <Block position={[-0.25, 2.82, -0.25]} size={[2.75, 1.38, 0.04]} color="#17303b" glow="#1e5261" />
        <Block position={[-0.25, 2.15, -0.35]} size={[0.15, 0.6, 0.16]} color="#272c2d" />
        <Block position={[-0.25, 1.94, -0.25]} size={[0.8, 0.06, 0.45]} color="#22272a" />
        <Block position={[-0.25, 1.94, 0.55]} size={[1.65, 0.07, 0.45]} color="#363d3e" />
        <Block position={[0.9, 1.94, 0.55]} size={[0.2, 0.09, 0.3]} color="#1b2429" />
        <Block position={[2.35, 2.4, -0.2]} size={[0.8, 1.05, 0.95]} color="#171f2a" />
        <Block position={[2.35, 2.4, 0.3]} size={[0.57, 0.8, 0.025]} color="#253d60" glow="#285bce" />
        <Block position={[1.3, 2.45, -0.45]} size={[0.08, 1.1, 0.08]} color="#2a2c29" />
        <Block position={[1.05, 3.05, -0.35]} size={[0.65, 0.1, 0.12]} color="#272b29" rotation={[0, 0, -0.35]} />
        <mesh position={[0.75, 3.08, -0.25]} rotation={[0, 0, 0.4]}>
          <coneGeometry args={[0.24, 0.3, 16, 1, true]} />
          <meshStandardMaterial color="#c4a15b" emissive="#ed9e3c" emissiveIntensity={0.5} side={DoubleSide} />
        </mesh>
      </group>
      <MonitorText />
      <FocusHotspot destination="monitor" position={[-0.25, 2.82, -0.19]} size={[2.75, 1.38]} onNavigate={onNavigate} />

      <group name="cabinet" position={[-4.35, 0.78, 0]}>
        <Block position={[0, 0, 0]} size={[1.1, 1.5, 1.25]} color="#303638" />
        {[-0.48, 0, 0.48].map((y) => (
          <group key={y}>
            <Block position={[0, y, 0.64]} size={[1, 0.44, 0.035]} color="#3b4040" />
            <Block position={[0, y + 0.07, 0.68]} size={[0.34, 0.04, 0.04]} color="#1c2327" />
          </group>
        ))}
      </group>

      <group name="chair" position={[-2.15, 0, 1.25]} rotation={[0, -0.15, 0]}>
        <Block position={[0, 1.75, 0.1]} size={[1.1, 1.35, 0.18]} color="#202b2b" rotation={[-0.12, 0, 0]} />
        <Block position={[0, 1.04, 0.4]} size={[1.15, 0.18, 0.9]} color="#293332" />
        <Block position={[0, 0.55, 0.35]} size={[0.12, 0.9, 0.12]} color="#3d4241" />
        <Block position={[0, 0.13, 0.35]} size={[1.5, 0.12, 0.12]} color="#202629" />
        <Block position={[0, 0.13, 0.35]} size={[0.12, 0.12, 1.3]} color="#202629" />
        {[-0.65, 0.65].map((x) => <Block key={x} position={[x, 1.27, 0.4]} size={[0.12, 0.12, 0.7]} color="#202629" />)}
      </group>

      <group name="arcade" position={[4.35, 0, 0]}>
        <Block position={[0, 1.1, 0.1]} size={[1.85, 2.2, 1.45]} color="#423329" />
        {[-0.92, 0.92].map((x) => <Block key={x} position={[x, 2.65, -0.2]} size={[0.14, 3.1, 1.45]} color="#714827" />)}
        <Block position={[0, 3.2, -0.5]} size={[1.8, 1.65, 0.18]} color="#1b252a" rotation={[-0.15, 0, 0]} />
        <Block position={[0, 3.2, -0.38]} size={[1.5, 1.3, 0.04]} color="#1e4953" rotation={[-0.15, 0, 0]} glow="#306d86" />
        <Block position={[0, 4.3, -0.12]} size={[2, 0.62, 1.5]} color="#9e612b" />
        <Block position={[0, 4.3, 0.65]} size={[1.75, 0.4, 0.035]} color="#e1b45b" glow="#d39836" />
        <Block position={[0, 2.2, 0.4]} size={[2, 0.18, 1]} color="#6d4c2b" rotation={[0.12, 0, 0]} />
        <Block position={[-0.45, 2.43, 0.6]} size={[0.06, 0.35, 0.06]} color="#20282b" />
        <mesh position={[-0.45, 2.62, 0.6]}><sphereGeometry args={[0.12, 12, 8]} /><meshStandardMaterial color="#b95134" /></mesh>
        {[0.15, 0.45, 0.75].map((x) => <Block key={x} position={[x, 2.33, 0.6]} size={[0.17, 0.09, 0.17]} color="#d3a14b" />)}
        <Block position={[0, 1.35, 0.85]} size={[0.35, 0.48, 0.04]} color="#1e272b" />
      </group>
      <FocusHotspot destination="arcade" position={[4.35, 3.2, -0.31]} size={[1.5, 1.3]} onNavigate={onNavigate} />
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
