import type { Page } from "@playwright/test";
import { PerspectiveCamera, Vector3 } from "three";
import { monitorScreenPose, ROOM_FOV, roomOverviewPose } from "@/features/room/utils/roomCamera";

export function hotspotPosition(destination: "monitor" | "arcade", viewport: { width: number; height: number }) {
  const aspect = viewport.width / viewport.height;
  const pose = roomOverviewPose(aspect);
  const camera = new PerspectiveCamera(ROOM_FOV, aspect, 0.1, 100);
  camera.position.set(...pose.position);
  camera.lookAt(new Vector3(...pose.target));
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  const target = destination === "monitor"
    ? new Vector3(...monitorScreenPose().center)
    : new Vector3(4.1, 2.5, 1.65);

  const p = target.project(camera);
  return {
    x: Math.round((p.x + 1) * 0.5 * viewport.width),
    y: Math.round((1 - p.y) * 0.5 * viewport.height),
  };
}

export async function clickRoomHotspot(page: Page, destination: "monitor" | "arcade") {
  const size = page.viewportSize() ?? { width: 1280, height: 720 };
  const point = hotspotPosition(destination, size);
  await page.locator('canvas[data-engine]').click({ position: point });
}
