import type { BufferGeometry, Camera, Matrix4 } from "three";
import { Vector3 } from "three";

export type Point = { x: number; y: number };

/** Row-major 3x3 homography: x' = (h0 x + h1 y + h2) / (h6 x + h7 y + h8). */
export type Homography = readonly [
  number, number, number,
  number, number, number,
  number, number, number,
];

export type MonitorSurface = {
  /** Screen corners in world space: bottom-left, bottom-right, top-right, top-left. */
  corners: Vector3[];
  /** Ordered outline of the visible screen surface in world space. */
  boundary: Vector3[];
  /** Outline points along the top edge of the screen. */
  topEdge: Vector3[];
  /** Outline points along the bottom edge of the screen. */
  bottomEdge: Vector3[];
};

export type OverlayLayout = {
  /** CSS `matrix3d(...)` that maps the local overlay rectangle onto the projected screen. */
  transform: string;
  /** CSS `polygon(...)` in local overlay coordinates that clips the overlay to the screen outline. */
  clipPath: string;
  /** How far the curved screen edge dips into the overlay, in local pixels. */
  sagTop: number;
  sagBottom: number;
  homography: Homography;
};

function formatNumber(value: number) {
  return Number(value.toFixed(6)).toString();
}

export function applyHomography(homography: Homography, point: Point): Point {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = homography;
  const weight = h6 * point.x + h7 * point.y + h8;
  return {
    x: (h0 * point.x + h1 * point.y + h2) / weight,
    y: (h3 * point.x + h4 * point.y + h5) / weight,
  };
}

export function solveHomography(source: Point[], target: Point[]): Homography {
  if (source.length !== 4 || target.length !== 4) {
    throw new Error("A homography needs exactly four point pairs");
  }

  const rows: number[][] = [];
  for (let index = 0; index < 4; index++) {
    const { x, y } = source[index];
    const { x: u, y: v } = target[index];
    rows.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    rows.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }

  for (let column = 0; column < 8; column++) {
    let pivot = column;
    for (let row = column + 1; row < 8; row++) {
      if (Math.abs(rows[row][column]) > Math.abs(rows[pivot][column])) pivot = row;
    }
    if (Math.abs(rows[pivot][column]) < 1e-12) {
      throw new Error("The point configuration cannot describe a projection");
    }
    [rows[column], rows[pivot]] = [rows[pivot], rows[column]];
    for (let row = 0; row < 8; row++) {
      if (row === column) continue;
      const factor = rows[row][column] / rows[column][column];
      for (let cell = column; cell <= 8; cell++) rows[row][cell] -= factor * rows[column][cell];
    }
  }

  const solution = rows.map((row, index) => row[8] / row[index]);
  return [solution[0], solution[1], solution[2], solution[3], solution[4], solution[5], solution[6], solution[7], 1];
}

export function invertHomography(homography: Homography): Homography {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = homography;
  const determinant =
    h0 * (h4 * h8 - h5 * h7) - h1 * (h3 * h8 - h5 * h6) + h2 * (h3 * h7 - h4 * h6);
  if (Math.abs(determinant) < 1e-12) throw new Error("The homography cannot be inverted");

  const inverse = [
    (h4 * h8 - h5 * h7) / determinant, (h2 * h7 - h1 * h8) / determinant, (h1 * h5 - h2 * h4) / determinant,
    (h5 * h6 - h3 * h8) / determinant, (h0 * h8 - h2 * h6) / determinant, (h2 * h3 - h0 * h5) / determinant,
    (h3 * h7 - h4 * h6) / determinant, (h1 * h6 - h0 * h7) / determinant, (h0 * h4 - h1 * h3) / determinant,
  ];
  const scale = inverse[8];
  return [
    inverse[0] / scale, inverse[1] / scale, inverse[2] / scale,
    inverse[3] / scale, inverse[4] / scale, inverse[5] / scale,
    inverse[6] / scale, inverse[7] / scale, 1,
  ];
}

export function homographyToCssMatrix(homography: Homography): string {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = homography;
  return `matrix3d(${[
    h0, h3, 0, h6,
    h1, h4, 0, h7,
    0, 0, 1, 0,
    h2, h5, 0, h8,
  ].map(formatNumber).join(", ")})`;
}

function geometryIndices(geometry: BufferGeometry): number[] {
  if (geometry.index) return Array.from(geometry.index.array);
  return Array.from({ length: geometry.attributes.position.count }, (_, index) => index);
}

/**
 * Reads the visible outline of the curved screen straight from the mesh, so the overlay can be
 * clipped to the surface that is actually rendered instead of to its bounding box.
 */
/**
 * Fits the affine map `position = origin + u * axisU + v * axisV` of a display surface, so the
 * logical corners of the screen are read from the display rectangle instead of from the outermost
 * vertices, which a rounded bezel never reaches.
 */
function fitDisplayFrame(positions: BufferGeometry["attributes"]["position"], uvs: BufferGeometry["attributes"]["uv"]) {
  const count = positions.count;
  let sumU = 0;
  let sumV = 0;
  let sumUU = 0;
  let sumVV = 0;
  let sumUV = 0;
  const sumP = [0, 0, 0];
  const sumUP = [0, 0, 0];
  const sumVP = [0, 0, 0];

  for (let index = 0; index < count; index++) {
    const u = uvs.getX(index);
    const v = uvs.getY(index);
    const point = [positions.getX(index), positions.getY(index), positions.getZ(index)];
    sumU += u;
    sumV += v;
    sumUU += u * u;
    sumVV += v * v;
    sumUV += u * v;
    for (let axis = 0; axis < 3; axis++) {
      sumP[axis] += point[axis];
      sumUP[axis] += u * point[axis];
      sumVP[axis] += v * point[axis];
    }
  }

  const solve = (right: number[]) => {
    const matrix = [
      [sumUU, sumUV, sumU],
      [sumUV, sumVV, sumV],
      [sumU, sumV, count],
    ];
    const determinant =
      matrix[0][0] * (matrix[1][1] * matrix[2][2] - matrix[1][2] * matrix[2][1]) -
      matrix[0][1] * (matrix[1][0] * matrix[2][2] - matrix[1][2] * matrix[2][0]) +
      matrix[0][2] * (matrix[1][0] * matrix[2][1] - matrix[1][1] * matrix[2][0]);
    if (Math.abs(determinant) < 1e-12) throw new Error("The display surface cannot be fitted");
    const replace = (column: number) => {
      const copy = matrix.map((row) => [...row]);
      for (let row = 0; row < 3; row++) copy[row][column] = right[row];
      return (
        copy[0][0] * (copy[1][1] * copy[2][2] - copy[1][2] * copy[2][1]) -
        copy[0][1] * (copy[1][0] * copy[2][2] - copy[1][2] * copy[2][0]) +
        copy[0][2] * (copy[1][0] * copy[2][1] - copy[1][1] * copy[2][0])
      );
    };
    return [
      replace(0) / determinant,
      replace(1) / determinant,
      replace(2) / determinant,
    ];
  };

  const fit = [0, 1, 2].map((axis) => solve([sumUP[axis], sumVP[axis], sumP[axis]]));
  return {
    origin: fit.map((coefficients) => coefficients[2]),
    axisU: fit.map((coefficients) => coefficients[0]),
    axisV: fit.map((coefficients) => coefficients[1]),
  };
}

export function readMonitorSurface(geometry: BufferGeometry, matrix: Matrix4): MonitorSurface {
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  const indices = geometryIndices(geometry);

  const edgeUse = new Map<string, number>();
  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    const corners = [indices[triangle], indices[triangle + 1], indices[triangle + 2]];
    for (let edge = 0; edge < 3; edge++) {
      const a = corners[edge];
      const b = corners[(edge + 1) % 3];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      edgeUse.set(key, (edgeUse.get(key) ?? 0) + 1);
    }
  }

  const neighbours = new Map<number, number[]>();
  for (const [key, uses] of edgeUse) {
    if (uses !== 1) continue;
    const [a, b] = key.split("-").map(Number);
    neighbours.set(a, [...(neighbours.get(a) ?? []), b]);
    neighbours.set(b, [...(neighbours.get(b) ?? []), a]);
  }
  if (neighbours.size < 4) throw new Error("The monitor screen has no readable outline");

  const pointAt = (index: number) => new Vector3().fromBufferAttribute(positions, index).applyMatrix4(matrix);
  const uvAt = (index: number) => ({ u: uvs.getX(index), v: uvs.getY(index) });

  const outlineIndices = [...neighbours.keys()].sort((a, b) => {
    const first = uvAt(a);
    const second = uvAt(b);
    return first.u - second.u || first.v - second.v;
  });

  const start = outlineIndices[0];
  const loop: number[] = [start];
  let previous = -1;
  let current = start;
  for (let step = 0; step < outlineIndices.length + 1; step++) {
    const candidates = (neighbours.get(current) ?? []).filter((index) => index !== previous);
    const next = candidates[0];
    if (next === undefined || next === start) break;
    loop.push(next);
    previous = current;
    current = next;
  }

  const edgeAt = (edge: "top" | "bottom") =>
    loop.filter((index) => (edge === "top" ? uvAt(index).v > 0.999 : uvAt(index).v < 0.001));

  const frame = fitDisplayFrame(positions, uvs);
  const framePoint = (u: number, v: number) =>
    new Vector3(
      frame.origin[0] + frame.axisU[0] * u + frame.axisV[0] * v,
      frame.origin[1] + frame.axisU[1] * u + frame.axisV[1] * v,
      frame.origin[2] + frame.axisU[2] * u + frame.axisV[2] * v,
    ).applyMatrix4(matrix);

  return {
    corners: [framePoint(0, 0), framePoint(1, 0), framePoint(1, 1), framePoint(0, 1)],
    boundary: loop.map(pointAt),
    topEdge: edgeAt("top").map(pointAt),
    bottomEdge: edgeAt("bottom").map(pointAt),
  };
}

export function projectToCanvas(camera: Camera, viewport: { width: number; height: number }, point: Vector3): Point {
  const projected = point.clone().project(camera);
  return {
    x: (projected.x * 0.5 + 0.5) * viewport.width,
    y: (-projected.y * 0.5 + 0.5) * viewport.height,
  };
}

/** The size of the projected screen quad, averaged over the keystone of the tilted screen. */
export function projectedScreenSize(
  camera: Camera,
  viewport: { width: number; height: number },
  surface: MonitorSurface,
): { width: number; height: number } {
  const [bottomLeft, bottomRight, topRight, topLeft] = surface.corners.map((corner) =>
    projectToCanvas(camera, viewport, corner),
  );
  const bottomWidth = Math.abs(bottomRight.x - bottomLeft.x);
  const topWidth = Math.abs(topRight.x - topLeft.x);
  const height = Math.abs(bottomLeft.y - topLeft.y);
  return { width: Math.round((bottomWidth + topWidth) / 2), height: Math.round(height) };
}

export function monitorOverlayLayout(
  camera: Camera,
  viewport: { width: number; height: number },
  surface: MonitorSurface,
  local: { width: number; height: number },
): OverlayLayout {
  const [bottomLeft, bottomRight, topRight, topLeft] = surface.corners.map((corner) =>
    projectToCanvas(camera, viewport, corner),
  );

  const homography = solveHomography(
    [
      { x: 0, y: 0 },
      { x: local.width, y: 0 },
      { x: local.width, y: local.height },
      { x: 0, y: local.height },
    ],
    [topLeft, topRight, bottomRight, bottomLeft],
  );

  const inverse = invertHomography(homography);
  const toLocal = (point: Vector3) => applyHomography(inverse, projectToCanvas(camera, viewport, point));

  const clipPath = `polygon(${surface.boundary
    .map((point) => {
      const local = toLocal(point);
      return `${formatNumber(local.x)}px ${formatNumber(local.y)}px`;
    })
    .join(", ")})`;

  // The screen curves away from the camera, so its top and bottom edges dip into the flat overlay.
  const sagTop = Math.max(0, ...surface.topEdge.map((point) => toLocal(point).y));
  const sagBottom = Math.max(0, local.height - Math.min(...surface.bottomEdge.map((point) => toLocal(point).y)));

  return {
    transform: homographyToCssMatrix(homography),
    clipPath,
    sagTop: Math.round(sagTop * 100) / 100,
    sagBottom: Math.round(sagBottom * 100) / 100,
    homography,
  };
}
