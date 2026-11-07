import { getAssetUrl } from "./assetUrl";
import { useEffect } from "react";
import { useLoader, useThree } from "@react-three/fiber";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const BATMAN_SCALE = 0.686;
const BATMAN_RAW_OFFSET_X = -1.49683 * BATMAN_SCALE;
const BATMAN_RAW_OFFSET_Y = 0.62094 * BATMAN_SCALE;
const BATMAN_RAW_OFFSET_Z = -1.43453 * BATMAN_SCALE;

export default function BatmanFigure() {
  const { scene } = useLoader(GLTFLoader, getAssetUrl("assets/models/batman.glb"));
  const invalidate = useThree((state) => state.invalidate);

  useEffect(() => {
    const createdMaterials: MeshStandardMaterial[] = [];

    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = false;
        object.receiveShadow = true;

        if (object.material instanceof MeshBasicMaterial) {
          const oldMat = object.material;
          const upgraded = new MeshStandardMaterial({
            name: oldMat.name,
            color: oldMat.color.clone(),
            roughness: 0.45,
            metalness: 0.12,
            envMapIntensity: 1.0,
            side: DoubleSide,
          });
          createdMaterials.push(upgraded);
          object.material = upgraded;
          oldMat.dispose();
        } else if (object.material instanceof MeshStandardMaterial) {
          object.material.roughness = 0.45;
          object.material.metalness = 0.12;
          object.material.envMapIntensity = 1.0;
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
    <group
      name="BatmanFigure"
      position={[0.92, 4.28, -1.12]}
      rotation={[0, -0.08, 0]}
    >
      {/* Contact shadow on shelf surface */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.27, 24]} />
        <meshBasicMaterial color="#090706" transparent opacity={0.38} depthWrite={false} />
      </mesh>
      <primitive
        object={scene}
        position={[BATMAN_RAW_OFFSET_X, BATMAN_RAW_OFFSET_Y, BATMAN_RAW_OFFSET_Z]}
        scale={[BATMAN_SCALE, BATMAN_SCALE, BATMAN_SCALE]}
      />
    </group>
  );
}
