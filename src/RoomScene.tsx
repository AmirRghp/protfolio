import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  ACESFilmicToneMapping,
  DoubleSide,
  FrontSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  Raycaster,
  SRGBColorSpace,
  Vector2,
  Vector3,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { OutlinePass } from "three/addons/postprocessing/OutlinePass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { monitorOverlayLayout, projectedScreenSize, readMonitorSurface, type MonitorSurface } from "./monitorProjection";
import { ARCADE_SCREEN_SURFACE, arcadeOverlayLayout, projectedArcadeSize } from "./arcadeProjection";
import {
  MONITOR_SCENE_POSITION,
  MONITOR_YAW,
  ROOM_FOV,
  ROOM_OVERVIEW_TARGET_Y,
  ROOM_TRANSITION_SECONDS,
  arcadeFocusPose,
  easeCameraTransition,
  monitorScreenPose,
  roomOverviewPose,
  roomParallaxOffset,
  roomParallaxTargetOffset,
  stepIdleParallax,
  type IdleParallaxState,
} from "./roomCamera";
import type { RoomDestination } from "./roomNavigation";
import type { RoomHotspot, RoomHotspotHover } from "./roomHover";
import RoomUnavailable from "./RoomUnavailable";
import CoffeeMug from "./CoffeeMug";
import BatmanFigure from "./BatmanFigure";
import OiiaCat from "./OiiaCat";

type Triple = [number, number, number];

function RoomFurnishings() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/room-furnishings.glb");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const emptyShelves = scene.getObjectByName("EmptyShelves");
    if (emptyShelves) {
      emptyShelves.position.set(-0.59, 0, 0);
      emptyShelves.scale.set(0.86, 1, 1);
    }
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = object.name !== "DeskTop";
        object.receiveShadow = true;
        if (object.material instanceof MeshStandardMaterial) {
          if (object.name === "DeskTop") {
            object.material.color.set("#15181e");
            object.material.roughness = 0.62;
            object.material.metalness = 0.06;
            object.material.envMapIntensity = 0.85;
          } else if (object.name === "DeskFrontEdge") {
            object.material.color.set("#181b22");
            object.material.roughness = 0.56;
            object.material.metalness = 0.08;
            object.material.envMapIntensity = 0.9;
          } else if (object.name === "Shelf1" || object.name === "Shelf2") {
            object.material.color.set("#1a1824");
            object.material.roughness = 0.65;
            object.material.envMapIntensity = 0.8;
          } else {
            object.material.envMapIntensity = 0.75;
          }
          object.material.needsUpdate = true;
        }
      }
    });
    invalidate();
  }, [scene, invalidate]);
  return <primitive object={scene} />;
}

function ArcadeCabinet({
  arcadeRef,
  onLoaded,
}: {
  arcadeRef?: RefObject<HTMLDivElement | null>;
  onLoaded?: (objs: Object3D[]) => void;
}) {
  const { scene } = useLoader(GLTFLoader, "/assets/models/arcade-machine.glb");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        const parentName = object.parent?.name ?? "";
        object.castShadow = parentName === "Panel_Border_low" || parentName === "Panel_left_low";
        object.receiveShadow = false;
        if (object.material instanceof MeshStandardMaterial) {
          object.material.side = FrontSide;
          object.material.envMapIntensity = 0.95;
          object.material.needsUpdate = true;
        }
      }
    });
    onLoaded?.([scene]);
    invalidate();
  }, [scene, invalidate, onLoaded]);
  return (
    <group name="ArcadeMachine" position={[4.495, 1.95, 0.35]} scale={[3.35, 3.5, 2.75]}>
      <primitive object={scene} rotation={[0, -Math.PI / 2, 0]} />
      {arcadeRef && <ArcadeOverlay arcadeRef={arcadeRef} />}
    </group>
  );
}

function ArcadeOverlay({ arcadeRef }: { arcadeRef: RefObject<HTMLDivElement | null> }) {
  const { camera, size } = useThree();
  const applied = useRef({ transform: "" });

  const resting = useMemo(() => {
    const pose = arcadeFocusPose(size.width / size.height);
    const restCamera = new PerspectiveCamera(ROOM_FOV, size.width / size.height, 0.1, 100);
    restCamera.position.set(...pose.position);
    restCamera.lookAt(new Vector3(...pose.target));
    restCamera.updateMatrixWorld(true);
    restCamera.updateProjectionMatrix();
    return projectedArcadeSize(restCamera, size, ARCADE_SCREEN_SURFACE);
  }, [size]);

  useEffect(() => () => {
    if (arcadeRef.current) arcadeRef.current.dataset.projected = "false";
  }, [arcadeRef]);

  useFrame(() => {
    const element = arcadeRef.current;
    if (!element) return;
    camera.updateMatrixWorld();
    const layout = arcadeOverlayLayout(camera, size, ARCADE_SCREEN_SURFACE, resting);
    if (layout.transform !== applied.current.transform) {
      element.style.transform = layout.transform;
      applied.current.transform = layout.transform;
    }
    if (element.style.width !== `${resting.width}px`) element.style.width = `${resting.width}px`;
    if (element.style.height !== `${resting.height}px`) element.style.height = `${resting.height}px`;
    if (element.dataset.projected !== "true") element.dataset.projected = "true";
  });

  return null;
}

function MousePad() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/mouse-pad.glb");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = false;
        object.receiveShadow = true;
        if (object.material instanceof MeshStandardMaterial) {
          if (object.material.name === "Material.001") {
            object.material.color.set("#15181b");
            object.material.roughness = 0.78;
            object.material.metalness = 0.04;
            object.material.envMapIntensity = 0.85;
          } else if (object.material.name === "Material.002") {
            object.material.color.set("#00e5ff");
            object.material.emissive.set("#00e5ff");
            object.material.emissiveIntensity = 0.8;
            object.material.roughness = 0.45;
            object.material.metalness = 0.1;
            object.material.envMapIntensity = 0.9;
          }
          object.material.needsUpdate = true;
        }
      }
    });
    invalidate();
  }, [scene, invalidate]);

  const scaleY = 0.08;
  const scaleXZ = 0.138;

  return (
    <group name="MousePad" position={[-1.55, 1.89, 1.76]} rotation={[0, 0.32, 0]}>
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.92, 1.92]} />
        <meshBasicMaterial color="#090706" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <primitive
        object={scene}
        position={[0, -1.60794 * scaleY, 0]}
        scale={[scaleXZ, scaleY, scaleXZ]}
      />
    </group>
  );
}

function CompactKeyboard() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/compact-keyboard.glb");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const createdMaterials: MeshStandardMaterial[] = [];
    scene.traverse((object) => {
      if (object.name === "Sketchfab_model") {
        // Clear the Sketchfab showcase tilt matrix so the keyboard rests flat on the desk plane.
        object.matrixAutoUpdate = true;
        object.position.set(0, 0, 0);
        object.rotation.set(0, 0, 0);
        object.scale.set(1, 1, 1);
        object.updateMatrix();
      }
      if (object instanceof Mesh) {
        // The desk top does not cast a shadow onto the lower wall, so desk props use a grounded
        // tabletop contact shadow instead of projecting through the desk onto the wall below.
        object.castShadow = false;
        object.receiveShadow = true;
        if (object.material instanceof MeshBasicMaterial) {
          const oldMat = object.material;
          const isBase = oldMat.name === "base";
          const upgraded = new MeshStandardMaterial({
            name: oldMat.name,
            map: oldMat.map,
            color: oldMat.color.clone(),
            roughness: isBase ? 0.46 : 0.54,
            metalness: isBase ? 0.18 : 0.04,
            envMapIntensity: 0.9,
            side: DoubleSide,
          });
          createdMaterials.push(upgraded);
          object.material = upgraded;
          oldMat.dispose();
        } else if (object.material instanceof MeshStandardMaterial) {
          object.material.envMapIntensity = 0.9;
          object.material.needsUpdate = true;
        }
      }
    });
    invalidate();
    return () => {
      for (const mat of createdMaterials) {
        mat.dispose();
      }
    };
  }, [scene, invalidate]);

  return (
    <group name="CompactKeyboard" position={[-2.25, 1.906, 2.02]} rotation={[0, 0.38, 0]}>
      <mesh position={[0.02, 0.003, 0.03]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.12, 0.86]} />
        <meshBasicMaterial color="#090706" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <primitive
        object={scene}
        position={[0, 0.095, 0]}
        rotation={[-Math.PI / 2 + 0.06, 0, 0]}
        scale={[0.112, 0.112, 0.38]}
      />
    </group>
  );
}

function ComputerMouse() {
  const { scene } = useLoader(GLTFLoader, "/assets/models/computer-mouse.glb");
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = false;
        object.receiveShadow = true;
        if (object.material instanceof MeshStandardMaterial) {
          if (object.material.name === "Material") {
            object.material.color.set("#282c32");
            object.material.roughness = 0.42;
            object.material.metalness = 0.18;
            object.material.envMapIntensity = 1.05;
          } else if (object.material.name === "Material.001") {
            object.material.color.set("#191c20");
            object.material.roughness = 0.62;
            object.material.metalness = 0.12;
            object.material.envMapIntensity = 0.85;
          } else if (object.material.name === "Material.002") {
            object.material.emissiveIntensity = 0.9;
            object.material.roughness = 0.38;
            object.material.envMapIntensity = 0.95;
          }
          object.material.needsUpdate = true;
        }
      }
    });
    invalidate();
  }, [scene, invalidate]);

  return (
    <group name="ComputerMouse" position={[-0.68, 1.906, 1.44]} rotation={[0, 0.48, 0]}>
      <mesh position={[0, 0.003, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.26, 24]} />
        <meshBasicMaterial color="#090706" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <primitive object={scene} scale={[4.4, 5.5, 5.5]} />
    </group>
  );
}

function Monitor({
  desktopRef,
  onLoaded,
}: {
  desktopRef: RefObject<HTMLDivElement | null>;
  onLoaded?: (objs: Object3D[]) => void;
}) {
  const { scene } = useLoader(GLTFLoader, "/assets/models/curved-monitor.glb");
  const invalidate = useThree((state) => state.invalidate);
  const surface = useMemo(() => {
    scene.position.set(...MONITOR_SCENE_POSITION);
    scene.rotation.set(0, MONITOR_YAW, 0);
    const screen = scene.getObjectByName("MonitorScreen");
    if (!(screen instanceof Mesh)) throw new Error("The monitor model is missing MonitorScreen");
    scene.updateMatrixWorld(true);
    return readMonitorSurface(screen.geometry, screen.matrixWorld);
  }, [scene]);
  useEffect(() => {
    scene.position.set(...MONITOR_SCENE_POSITION);
    scene.rotation.set(0, MONITOR_YAW, 0);
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = object.name !== "MonitorScreen";
        object.receiveShadow = true;
        if (object.material instanceof MeshStandardMaterial && object.name !== "MonitorScreen") {
          object.material.roughness = 0.38;
          object.material.metalness = 0.28;
          object.material.envMapIntensity = 1.05;
          object.material.needsUpdate = true;
        }
      }
    });
    const body = scene.getObjectByName("MonitorBody");
    const screen = scene.getObjectByName("MonitorScreen");
    const monitorMeshes: Object3D[] = [];
    if (body) monitorMeshes.push(body);
    if (screen) monitorMeshes.push(screen);
    onLoaded?.(monitorMeshes.length > 0 ? monitorMeshes : [scene]);
    invalidate();
  }, [scene, invalidate, onLoaded]);
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
    // The camera pose may have changed earlier in this frame; its world matrix is otherwise
    // only refreshed by the renderer after these callbacks, which would leave the overlay a
    // frame behind at the end of a camera move.
    camera.updateMatrixWorld();
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

const overviewTarget = new Vector3(0, ROOM_OVERVIEW_TARGET_Y, 0);

const initialMonitorPose = monitorScreenPose();
const monitorSurface = {
  target: new Vector3(...initialMonitorPose.center),
  normal: new Vector3(...initialMonitorPose.normal),
  width: 4.231,
  height: 2.136,
};
const monitorHotspotPosition: Triple = [
  initialMonitorPose.center[0] + initialMonitorPose.normal[0] * 0.12,
  initialMonitorPose.center[1],
  initialMonitorPose.center[2] + initialMonitorPose.normal[2] * 0.12,
];

function destinationPose(destination: RoomDestination, aspect: number) {
  if (destination === "room") {
    const pose = roomOverviewPose(aspect);
    return { position: new Vector3(...pose.position), target: new Vector3(...pose.target) };
  }

  const tangent = Math.tan((ROOM_FOV * Math.PI) / 360);
  if (destination === "monitor") {
    const distance = Math.max(4.45 / (2 * tangent * aspect), 2.32 / (2 * tangent)) * 1.05;
    return {
      position: monitorSurface.target.clone().addScaledVector(monitorSurface.normal, distance),
      target: monitorSurface.target.clone(),
    };
  }

  const pose = arcadeFocusPose(aspect);
  return {
    position: new Vector3(...pose.position),
    target: new Vector3(...pose.target),
  };
}

function isRoomHotspot(value: unknown): value is RoomHotspot {
  return value === "monitor" || value === "arcade";
}

function CameraFocus({ destination, onHotspotHover }: {
  destination: RoomDestination;
  onHotspotHover: (hover: RoomHotspotHover | null) => void;
}) {
  const { camera, size, invalidate, gl, scene, raycaster } = useThree();
  const lookAt = useRef(overviewTarget.clone());
  const baseTarget = useRef(overviewTarget.clone());
  const hotspotRaycaster = useRef(new Raycaster());
  const pointerPosition = useRef(new Vector2());
  const basePosition = useRef(new Vector3());
  const idleOffset = useRef(new Vector3());
  const idleState = useRef<IdleParallaxState>({ x: 0, y: 0, vx: 0, vy: 0 });
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
    raycaster.layers.enable(1);
    hotspotRaycaster.current.layers.enable(1);

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
    baseTarget.current.copy(pose.target);
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
      idleState.current = { x: 0, y: 0, vx: 0, vy: 0 };
      active.current = false;
      invalidate();
    } else {
      // A new destination continues smoothly from wherever the camera currently is.
      startPosition.current.copy(camera.position);
      startTarget.current.copy(lookAt.current);
      endPosition.current.copy(pose.position);
      endTarget.current.copy(pose.target);
      idleOffset.current.set(0, 0, 0);
      idleState.current = { x: 0, y: 0, vx: 0, vy: 0 };
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

      if (motionPreference.matches) {

        resetIdle();
        return;
      }

      // Smoothly track the cursor across the entire room overview, including across hotspots.
      idleTarget.current = roomParallaxOffset(x, y);
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
      idleState.current = { x: 0, y: 0, vx: 0, vy: 0 };
      camera.position.copy(pose.position);
      lookAt.current.copy(pose.target);
      camera.lookAt(lookAt.current);
      invalidate();
    };
    const onVisibilityChange = () => {
      if (document.hidden) clearPointerState();
    };
    const onPointerCapabilityChange = () => {
      clearPointerState();
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
  }, [camera, destination, size.width, size.height, gl, scene, raycaster, invalidate, onHotspotHover]);

  useFrame((_, delta) => {
    if (active.current) {
      // The travel is measured on the wall clock, so an idle frame cannot skip the whole move.
      const progress = Math.min((performance.now() - transitionStart.current) / (ROOM_TRANSITION_SECONDS * 1000), 1);
      const eased = easeCameraTransition(progress);
      camera.position.lerpVectors(startPosition.current, endPosition.current, eased);
      lookAt.current.lerpVectors(startTarget.current, endTarget.current, eased);
      camera.lookAt(lookAt.current);
      if (progress === 1) active.current = false;
      // Keep rendering one more frame after the last step so the projected HTML overlay is
      // recomputed from the parked camera instead of the previous frame's pose.
      invalidate();
      return;
    }

    if (destination !== "room") return;
    const nextState = stepIdleParallax(idleState.current, idleTarget.current, delta);
    idleState.current = nextState;
    idleOffset.current.set(nextState.x, nextState.y, 0);
    const targetShift = roomParallaxTargetOffset(nextState);
    camera.position.copy(basePosition.current).add(idleOffset.current);
    lookAt.current.set(
      baseTarget.current.x + targetShift.x,
      baseTarget.current.y + targetShift.y,
      baseTarget.current.z,
    );
    camera.lookAt(lookAt.current);
    if (!nextState.settled) invalidate();
  });
  return null;
}

function HotspotOutlinePass({ selectedObjects }: { selectedObjects: Object3D[] }) {
  const { gl, scene, camera, size, invalidate } = useThree();

  const passesRef = useRef<{
    composer: EffectComposer;
    outlinePass: OutlinePass;
  } | null>(null);

  if (passesRef.current == null) {
    const composer = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const outlinePass = new OutlinePass(
      new Vector2(size.width, size.height),
      scene,
      camera,
    );
    outlinePass.edgeStrength = 4.2;
    outlinePass.edgeGlow = 0.7;
    outlinePass.edgeThickness = 2.0;
    outlinePass.pulsePeriod = 0;
    outlinePass.visibleEdgeColor.set("#ffffff");
    outlinePass.hiddenEdgeColor.set("#000000");
    composer.addPass(outlinePass);

    const outputPass = new OutputPass();
    composer.addPass(outputPass);

    passesRef.current = { composer, outlinePass };
  }

  useEffect(() => {
    const passes = passesRef.current;
    if (!passes) return;
    const pr = gl.getPixelRatio();
    passes.composer.setPixelRatio(pr);
    passes.composer.setSize(size.width, size.height);
    passes.outlinePass.resolution.set(size.width * pr, size.height * pr);
    invalidate();
  }, [size.width, size.height, gl, invalidate]);

  useEffect(() => {
    const passes = passesRef.current;
    if (!passes) return;
    passes.outlinePass.selectedObjects = selectedObjects;
    invalidate();
  }, [selectedObjects, invalidate]);

  useEffect(() => {
    return () => {
      passesRef.current?.composer.dispose();
      passesRef.current = null;
    };
  }, []);

  useFrame(() => {
    passesRef.current?.composer.render();
  }, 1);

  return null;
}

function FocusHotspot({ destination, position, rotation = [0, 0, 0], size, onNavigate }: {
  destination: RoomHotspot;
  position: Triple;
  rotation?: Triple;
  size: [number, number];
  onNavigate: (destination: RoomDestination) => void;
}) {
  const meshRef = useRef<Mesh>(null);

  useLayoutEffect(() => {
    if (meshRef.current) {
      meshRef.current.layers.set(1);
    }
  }, []);

  return (
    <group position={position} rotation={rotation}>
      <mesh
        ref={meshRef}
        name="focus-hotspot"
        userData={{ destination }}
        onClick={(event) => { event.stopPropagation(); onNavigate(destination); }}
      >
        <planeGeometry args={size} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={DoubleSide} />
      </mesh>
    </group>
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

function Study({ destination, onNavigate, desktopRef, arcadeRef, highlightedHotspot }: {
  destination: RoomDestination;
  onNavigate: (destination: RoomDestination) => void;
  desktopRef: RefObject<HTMLDivElement | null>;
  arcadeRef?: RefObject<HTMLDivElement | null>;
  highlightedHotspot: RoomHotspot | null;
}) {
  const [monitorObjects, setMonitorObjects] = useState<Object3D[]>([]);
  const [arcadeObjects, setArcadeObjects] = useState<Object3D[]>([]);

  const selectedObjects = useMemo<Object3D[]>(() => {
    if (highlightedHotspot === "monitor") return monitorObjects;
    if (highlightedHotspot === "arcade") return arcadeObjects;
    return [];
  }, [highlightedHotspot, monitorObjects, arcadeObjects]);

  return (
    <>
      <color attach="background" args={["#080614"]} />
      <ambientLight intensity={0.38} color="#1b1532" />
      <hemisphereLight args={["#38bdf8", "#120e24", 0.45]} />
      <directionalLight
        position={[1.8, 7.5, 6.2]}
        intensity={1.4}
        color="#dbeafe"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={6}
        shadow-camera-bottom={-4}
      />
      <pointLight position={[-2.4, 5.8, 3.2]} color="#c084fc" intensity={4.5} distance={11} decay={2} />
      <pointLight position={[2.4, 5.8, 3.2]} color="#38bdf8" intensity={4.5} distance={11} decay={2} />

      {/* Under-shelf neon LED illumination (cyan to magenta) */}
      <pointLight position={[1.0, 4.05, -1.0]} color="#00e5ff" intensity={5.5} distance={6} decay={2} />
      <pointLight position={[2.2, 4.05, -1.0]} color="#d946ef" intensity={5.5} distance={6} decay={2} />
      <pointLight position={[1.0, 5.30, -1.0]} color="#00e5ff" intensity={5.5} distance={6} decay={2} />
      <pointLight position={[2.2, 5.30, -1.0]} color="#d946ef" intensity={5.5} distance={6} decay={2} />

      <mesh position={[0, 3.2, -1.4]} receiveShadow>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial color="#120e24" roughness={0.92} metalness={0.02} />
      </mesh>

      <FocusHotspot
        destination="monitor"
        position={monitorHotspotPosition}
        rotation={[0, MONITOR_YAW, 0]}
        size={[4.231, 2.136]}
        onNavigate={onNavigate}
      />

      <Suspense fallback={null}>
        <RoomFurnishings />
        <Monitor desktopRef={desktopRef} onLoaded={setMonitorObjects} />
        <MousePad />
        <CompactKeyboard />
        <ComputerMouse />
        <CoffeeMug active={destination === "room"} />
        <OiiaCat destination={destination} />
        <BatmanFigure />
        <ArcadeCabinet arcadeRef={arcadeRef} onLoaded={setArcadeObjects} />
      </Suspense>
      <FocusHotspot destination="arcade" position={[4.495, 2.5, 1.65]} size={[3.1, 6.4]} onNavigate={onNavigate} />

      <HotspotOutlinePass selectedObjects={selectedObjects} />
    </>
  );
}

const isSoftwareGl = (() => {
  if (typeof document === "undefined") return false;
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
})();

export default function RoomScene({
  destination,
  onNavigate,
  onHotspotHover,
  desktopRef,
  arcadeRef,
  onUnavailable,
}: {
  destination: RoomDestination;
  onNavigate: (destination: RoomDestination) => void;
  onHotspotHover: (hover: RoomHotspotHover | null) => void;
  desktopRef: RefObject<HTMLDivElement | null>;
  arcadeRef?: RefObject<HTMLDivElement | null>;
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
    <Canvas
      shadows={isSoftwareGl ? false : "percentage"}
      frameloop="demand"
      dpr={isSoftwareGl ? 1 : [1, 1.5]}
      camera={{ fov: ROOM_FOV, near: 0.1, far: 100, position: [0, 2.7, 15] }}
      onCreated={({ gl, scene, invalidate }) => {
        gl.outputColorSpace = SRGBColorSpace;
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        if (!isSoftwareGl) {
          const pmremGenerator = new PMREMGenerator(gl);
          const roomEnv = new RoomEnvironment();
          const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
          pmremGenerator.dispose();
          roomEnv.dispose();
          scene.environment = envTarget.texture;
          scene.environmentIntensity = 0.45;
        }
        invalidate();
      }}
      fallback={<RoomUnavailable />}
      aria-label="Frontal study with workstation and arcade"
    >
      <CameraFocus destination={destination} onHotspotHover={reportHotspotHover} />
      <ContextGuard onLost={() => {
        setContextLost(true);
        onUnavailable?.();
      }} />
      <Study
        destination={destination}
        onNavigate={onNavigate}
        desktopRef={desktopRef}
        arcadeRef={arcadeRef}
        highlightedHotspot={destination === "room" ? highlightedHotspot : null}
      />
    </Canvas>
  );
}
