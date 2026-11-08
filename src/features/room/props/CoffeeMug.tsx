import { getAssetUrl } from "./assetUrl";
import { useEffect, useRef, useState } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Mesh,
  MeshStandardMaterial,
  Points,
  ShaderMaterial,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const STEAM_PARTICLE_COUNT = 36;

const steamVertexShader = `
  attribute float aProgress;
  attribute float aPhase;
  attribute vec2 aOrigin;
  attribute float aSpeed;
  attribute float aScale;

  uniform float uTime;
  varying float vAlpha;

  void main() {
    float cycle = fract(aProgress + uTime * aSpeed);
    float y = 0.135 + cycle * 0.32;
    float sway = 0.012 + cycle * 0.038;
    float x = aOrigin.x + sin(cycle * 6.283 + aPhase) * sway;
    float z = aOrigin.y + cos(cycle * 5.141 + aPhase * 1.3) * sway;

    float fadeIn = smoothstep(0.0, 0.20, cycle);
    float fadeOut = smoothstep(1.0, 0.40, cycle);
    vAlpha = fadeIn * fadeOut * 0.16;

    float currentSize = (aScale * 5.5) * (0.8 + cycle * 1.5);
    vec4 mvPosition = modelViewMatrix * vec4(x, y, z, 1.0);
    gl_PointSize = currentSize * (30.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const steamFragmentShader = `
  varying float vAlpha;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, dist);
    vec3 steamColor = vec3(0.92, 0.94, 0.98);
    gl_FragColor = vec4(steamColor, vAlpha * soft);
  }
`;

export function CoffeeSteam({ active = true }: { active?: boolean }) {
  const invalidate = useThree((state) => state.invalidate);
  const pointsRef = useRef<Points>(null);

  const [steam] = useState(() => {
    const geo = new BufferGeometry();
    const positions = new Float32Array(STEAM_PARTICLE_COUNT * 3);
    const aProgress = new Float32Array(STEAM_PARTICLE_COUNT);
    const aPhase = new Float32Array(STEAM_PARTICLE_COUNT);
    const aOrigin = new Float32Array(STEAM_PARTICLE_COUNT * 2);
    const aSpeed = new Float32Array(STEAM_PARTICLE_COUNT);
    const aScale = new Float32Array(STEAM_PARTICLE_COUNT);

    for (let i = 0; i < STEAM_PARTICLE_COUNT; i++) {
      aProgress[i] = i / STEAM_PARTICLE_COUNT;
      aPhase[i] = (i * 1.618033) % (Math.PI * 2);
      const r = Math.sqrt((i + 0.5) / STEAM_PARTICLE_COUNT) * 0.038;
      const theta = (i * 2.39996) % (Math.PI * 2);
      aOrigin[i * 2] = Math.cos(theta) * r;
      aOrigin[i * 2 + 1] = Math.sin(theta) * r;
      aSpeed[i] = 0.18 + ((i * 7) % 10) * 0.010;
      aScale[i] = 0.80 + ((i * 13) % 10) * 0.040;
    }

    geo.setAttribute("position", new BufferAttribute(positions, 3));
    geo.setAttribute("aProgress", new BufferAttribute(aProgress, 1));
    geo.setAttribute("aPhase", new BufferAttribute(aPhase, 1));
    geo.setAttribute("aOrigin", new BufferAttribute(aOrigin, 2));
    geo.setAttribute("aSpeed", new BufferAttribute(aSpeed, 1));
    geo.setAttribute("aScale", new BufferAttribute(aScale, 1));

    const mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: steamVertexShader,
      fragmentShader: steamFragmentShader,
      transparent: true,
      depthWrite: false,
    });

    return { geo, mat };
  });

  useEffect(() => {
    return () => {
      steam.geo.dispose();
      steam.mat.dispose();
    };
  }, [steam]);

  useFrame((state) => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!active || reducedMotion) {
      return;
    }

    const points = pointsRef.current;
    if (points && points.material instanceof ShaderMaterial) {
      points.material.uniforms.uTime.value = state.clock.getElapsedTime();
      invalidate();
    }
  });

  return <points ref={pointsRef} geometry={steam.geo} material={steam.mat} />;
}

export default function CoffeeMug({ active = true }: { active?: boolean }) {
  const { scene } = useLoader(GLTFLoader, getAssetUrl("assets/models/cup.glb"));
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = false;
        object.receiveShadow = true;
        if (object.material instanceof MeshStandardMaterial) {
          object.material.side = DoubleSide;
          object.material.roughness = 0.46;
          object.material.metalness = 0.06;
          object.material.envMapIntensity = 0.95;
          object.material.needsUpdate = true;
        }
      }
    });
    invalidate();
  }, [scene, invalidate]);

  return (
    <group name="CoffeeMug" position={[0.72, 1.906, 1.35]} rotation={[0, -0.07, 0]}>
      {/* Ground contact shadow on desk surface */}
      <mesh position={[0.03, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.265, 24]} />
        <meshBasicMaterial color="#090706" transparent opacity={0.42} depthWrite={false} />
      </mesh>
      <primitive object={scene} scale={[2.66, 2.66, 2.66]} />
      <CoffeeSteam active={active} />
    </group>
  );
}
