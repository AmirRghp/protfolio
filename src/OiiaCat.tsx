import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PointLight,
  Points,
  PointsMaterial,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { oiiaAudio } from "./oiiaAudio";
import {
  calculateCatBounce,
  calculateHoverHeight,
  calculateMorphInfluence,
  calculatePartyLight,
  calculateShadowProperties,
  calculateShortestAngleDiff,
  calculateSpinVelocity,
  createLoafShadowTexture,
} from "./oiiaCatLogic";
import type { RoomDestination } from "./roomNavigation";

export const DESK_SURFACE_Y = 1.906;
export const CAT_SCALE = 1.40;
export const CAT_REST_ROTATION_Y = 0.45;
export const CAT_MODEL_OFFSET_X = 0.006 * CAT_SCALE;
export const CAT_MODEL_OFFSET_Y = 0.01101 * CAT_SCALE;
export const CAT_MODEL_OFFSET_Z = -0.059 * CAT_SCALE;

function CatSparkles({ active }: { active: boolean }) {
  const pointsRef = useRef<Points>(null);
  const [particles] = useState(() => {
    const count = 32;
    const geo = new BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
      new Color("#00e5ff"),
      new Color("#ff007f"),
      new Color("#fde047"),
      new Color("#a855f7"),
    ];

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.32 + (i % 5) * 0.06;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = 0.12 + (i % 7) * 0.07;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      const col = palette[i % palette.length];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }
    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("color", new BufferAttribute(colors, 3));

    const mat = new PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    return { geo, mat };
  });

  useEffect(() => {
    return () => {
      particles.geo.dispose();
      particles.mat.dispose();
    };
  }, [particles]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const audioState = oiiaAudio.getState();
    const isDrop = audioState.isDrop;
    const mat = pointsRef.current.material as PointsMaterial;
    const targetOpacity = active ? (isDrop ? 0.95 : 0.60) : 0;
    mat.opacity += (targetOpacity - mat.opacity) * Math.min(1, delta * 6);
    mat.size = isDrop ? 0.055 : 0.038;

    if (active) {
      pointsRef.current.rotation.y += delta * (isDrop ? 6.5 : 2.5);
    }
  });

  return <points ref={pointsRef} geometry={particles.geo} material={particles.mat} />;
}

function CatPartyLight({
  active,
  reducedMotion,
}: {
  active: boolean;
  reducedMotion: boolean;
}) {
  const lightRef = useRef<PointLight>(null);
  const colorObj = useMemo(() => new Color(), []);

  useFrame(() => {
    if (!lightRef.current) return;
    const audioState = oiiaAudio.getState();
    const { color, intensity } = calculatePartyLight(
      audioState.currentTime,
      audioState.bassEnergy,
      audioState.isDrop,
      active,
      reducedMotion,
    );
    colorObj.set(color);
    lightRef.current.color.copy(colorObj);
    lightRef.current.intensity = intensity;
  });

  return (
    <pointLight
      ref={lightRef}
      position={[0, 0.85, 0]}
      distance={4.8}
      decay={2}
      intensity={0}
    />
  );
}

export default function OiiaCat({
  destination = "room",
  onLoaded,
}: {
  destination?: RoomDestination;
  onLoaded?: (objs: Object3D[]) => void;
}) {
  const gltf = useLoader(GLTFLoader, "/assets/models/oiia-cat.glb");
  const invalidate = useThree((state) => state.invalidate);

  const catGroupRef = useRef<Group>(null);
  const modelGroupRef = useRef<Group>(null);
  const shadowGroupRef = useRef<Group>(null);
  const shadowMeshRef = useRef<Mesh>(null);
  const shadowMatRef = useRef<MeshBasicMaterial>(null);
  const catMeshRef = useRef<Mesh | null>(null);

  const currentMorphRef = useRef(0);
  const spinAngleRef = useRef(CAT_REST_ROTATION_Y);
  const danceTimeRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Soft ambient occlusion contact shadow texture conforming to loaf footprint
  const shadowTexture = useMemo(() => createLoafShadowTexture(), []);
  useEffect(() => {
    return () => {
      shadowTexture.dispose();
    };
  }, [shadowTexture]);

  // Clone scene so morph targets and instances stay isolated
  const clonedScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  useEffect(() => {
    const catMeshes: Object3D[] = [];
    let foundMesh: Mesh | null = null;
    clonedScene.traverse((child) => {
      if (child instanceof Mesh) {
        catMeshes.push(child);
        child.castShadow = false;
        child.receiveShadow = true;
        if (child.material instanceof MeshStandardMaterial) {
          child.material.side = DoubleSide;
          child.material.roughness = 0.52;
          child.material.metalness = 0.04;
          child.material.envMapIntensity = 0.95;
          child.material.needsUpdate = true;
        }
        if (child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
          foundMesh = child;
          child.morphTargetInfluences[0] = 0;
        }
      }
    });
    catMeshRef.current = foundMesh;
    onLoaded?.(catMeshes.length > 0 ? catMeshes : [clonedScene]);
    invalidate();
  }, [clonedScene, invalidate, onLoaded]);

  // Subscribe to audio state
  useEffect(() => {
    const unsubscribe = oiiaAudio.subscribe((state) => {
      setIsPlaying(state.isPlaying);
      invalidate();
    });
    return () => {
      unsubscribe();
    };
  }, [invalidate]);

  // CRITICAL USER REQUIREMENT:
  // Whenever the camera leaves the room overview (destination !== "room"),
  // the cat must completely reset to its original idle standing state.
  useEffect(() => {
    if (destination !== "room") {
      oiiaAudio.reset();
      currentMorphRef.current = 0;
      spinAngleRef.current = CAT_REST_ROTATION_Y;
      danceTimeRef.current = 0;
      if (catMeshRef.current?.morphTargetInfluences) {
        catMeshRef.current.morphTargetInfluences[0] = 0;
      }
      if (catGroupRef.current) {
        catGroupRef.current.position.y = DESK_SURFACE_Y;
        catGroupRef.current.rotation.set(0, 0, 0);
      }
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.set(0, CAT_REST_ROTATION_Y, 0);
        modelGroupRef.current.scale.set(1, 1, 1);
      }
      if (shadowGroupRef.current) {
        shadowGroupRef.current.rotation.y = CAT_REST_ROTATION_Y;
      }
      if (shadowMeshRef.current && shadowMatRef.current) {
        shadowMeshRef.current.scale.set(1, 1, 1);
        shadowMatRef.current.opacity = 0.55;
      }
      invalidate();
    }
  }, [destination, invalidate]);

  // Reset audio on unmount
  useEffect(() => {
    return () => {
      oiiaAudio.reset();
      document.body.style.cursor = "auto";
    };
  }, []);

  useFrame((state, delta) => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Strict clamp when out of room overview
    if (destination !== "room") {
      if (catMeshRef.current?.morphTargetInfluences) {
        catMeshRef.current.morphTargetInfluences[0] = 0;
      }
      if (catGroupRef.current) {
        catGroupRef.current.position.y = DESK_SURFACE_Y;
        catGroupRef.current.rotation.set(0, 0, 0);
      }
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.set(0, CAT_REST_ROTATION_Y, 0);
        modelGroupRef.current.scale.set(1, 1, 1);
      }
      if (shadowGroupRef.current) {
        shadowGroupRef.current.rotation.y = CAT_REST_ROTATION_Y;
      }
      if (shadowMeshRef.current && shadowMatRef.current) {
        shadowMeshRef.current.scale.set(1, 1, 1);
        shadowMatRef.current.opacity = 0.46;
      }
      return;
    }

    const audioState = oiiaAudio.getState();

    if (audioState.isPlaying) {
      danceTimeRef.current += delta;

      if (modelGroupRef.current) {
        modelGroupRef.current.scale.set(1, 1, 1);
      }

      // 1. Morph target progression (smoothly tuck paws into loaf)
      const morph = calculateMorphInfluence(currentMorphRef.current, true, delta);
      currentMorphRef.current = morph;
      if (catMeshRef.current?.morphTargetInfluences) {
        catMeshRef.current.morphTargetInfluences[0] = morph;
      }

      // 2. Spin velocity and rotation around vertical center of mass
      const spinVel = calculateSpinVelocity(
        danceTimeRef.current,
        audioState.isDrop,
        reducedMotion,
      );
      spinAngleRef.current += spinVel * delta;
      if (modelGroupRef.current) {
        modelGroupRef.current.rotation.y = spinAngleRef.current;
      }
      if (shadowGroupRef.current) {
        shadowGroupRef.current.rotation.y = spinAngleRef.current;
      }

      // 3. Hover elevation and rhythmic bounce (pure vertical, no off-axis tilts)
      const hoverY = calculateHoverHeight(
        danceTimeRef.current,
        audioState.isDrop,
        true,
        reducedMotion,
      );
      const { bounceY } = calculateCatBounce(
        audioState.currentTime,
        audioState.bassEnergy,
        audioState.isDrop,
        true,
        reducedMotion,
      );

      if (catGroupRef.current) {
        catGroupRef.current.position.y = DESK_SURFACE_Y + hoverY + bounceY;
        catGroupRef.current.rotation.x = 0;
        catGroupRef.current.rotation.z = 0;
      }

      // 4. Contact shadow adaptation
      const { scale, opacity } = calculateShadowProperties(hoverY + bounceY);
      if (shadowMeshRef.current && shadowMatRef.current) {
        shadowMeshRef.current.scale.set(scale, scale, 1);
        shadowMatRef.current.opacity = opacity;
      }

      invalidate();
    } else {
      // Idle / stopped transition
      let needsInvalidate = false;

      // Smoothly unfold paws back to standing
      if (currentMorphRef.current > 0.001) {
        const morph = calculateMorphInfluence(currentMorphRef.current, false, delta);
        currentMorphRef.current = morph;
        if (catMeshRef.current?.morphTargetInfluences) {
          catMeshRef.current.morphTargetInfluences[0] = morph;
        }
        needsInvalidate = true;
      }

      // Smoothly settle height and rotation back to resting pose
      if (catGroupRef.current) {
        if (Math.abs(catGroupRef.current.position.y - DESK_SURFACE_Y) > 0.001) {
          catGroupRef.current.position.y +=
            (DESK_SURFACE_Y - catGroupRef.current.position.y) * Math.min(1, delta * 8);
          needsInvalidate = true;
        }
        if (Math.abs(catGroupRef.current.rotation.x) > 0.001) {
          catGroupRef.current.rotation.x = 0;
          needsInvalidate = true;
        }
        if (Math.abs(catGroupRef.current.rotation.z) > 0.001) {
          catGroupRef.current.rotation.z = 0;
          needsInvalidate = true;
        }
      }

      if (modelGroupRef.current) {
        // Normalize rotation angle towards resting pose along shortest arc
        const diff = calculateShortestAngleDiff(
          modelGroupRef.current.rotation.y,
          CAT_REST_ROTATION_Y,
        );
        if (Math.abs(diff) > 0.005) {
          modelGroupRef.current.rotation.y += diff * Math.min(1, delta * 6);
          spinAngleRef.current = modelGroupRef.current.rotation.y;
          needsInvalidate = true;
        } else {
          modelGroupRef.current.rotation.y = CAT_REST_ROTATION_Y;
          spinAngleRef.current = CAT_REST_ROTATION_Y;
        }

        // Very subtle idle breathing when fully resting
        if (!reducedMotion && currentMorphRef.current < 0.05) {
          const breathe = Math.sin(state.clock.getElapsedTime() * 2.2) * 0.004;
          modelGroupRef.current.scale.set(1 + breathe * 0.5, 1 + breathe, 1 + breathe * 0.5);
          needsInvalidate = true;
        } else {
          modelGroupRef.current.scale.set(1, 1, 1);
        }

        if (shadowGroupRef.current) {
          shadowGroupRef.current.rotation.y = modelGroupRef.current.rotation.y;
        }
      }

      if (shadowMeshRef.current && shadowMatRef.current) {
        shadowMeshRef.current.scale.set(1, 1, 1);
        shadowMatRef.current.opacity = 0.55;
      }

      if (needsInvalidate) {
        invalidate();
      }
    }
  });

  return (
    <group
      ref={catGroupRef}
      name="OiiaCat"
      position={[1.80, DESK_SURFACE_Y, 1.65]}
    >
      {/* Ground contact shadow conforming to elongated loaf footprint */}
      <group
        ref={shadowGroupRef}
        position={[0, 0.002, -0.05]}
        rotation={[0, CAT_REST_ROTATION_Y, 0]}
      >
        <mesh
          ref={shadowMeshRef}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.54, 0.76]} />
          <meshBasicMaterial
            ref={shadowMatRef}
            map={shadowTexture}
            transparent
            opacity={0.55}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Model container with center-of-mass pivot offset */}
      <group
        ref={modelGroupRef}
        position={[0, 0, 0]}
        rotation={[0, CAT_REST_ROTATION_Y, 0]}
      >
        <primitive
          object={clonedScene}
          position={[CAT_MODEL_OFFSET_X, CAT_MODEL_OFFSET_Y, CAT_MODEL_OFFSET_Z]}
          scale={[CAT_SCALE, CAT_SCALE, CAT_SCALE]}
        />
      </group>

      {/* Rave party spotlights */}
      <CatPartyLight
        active={isPlaying && destination === "room"}
        reducedMotion={
          typeof window !== "undefined" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        }
      />

      {/* Musical sparkle particles */}
      <CatSparkles
        active={isPlaying && destination === "room"}
      />
    </group>
  );
}
