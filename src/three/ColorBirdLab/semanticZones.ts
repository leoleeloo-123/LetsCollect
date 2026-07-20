import type { BufferGeometry } from "three";

type ComponentBounds = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

/**
 * Adds a foot-zone attribute to the decoded mesh. The foot surfaces share
 * crowded UV neighborhoods with the belly, so the shader combines these
 * component bounds with local shape and surface-direction checks.
 */
export function addBirdSemanticAttributes(
  geometry: BufferGeometry,
  THREE: typeof import("three")
) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!position || !index) return;

  const parents = new Int32Array(position.count);
  const sizes = new Int32Array(position.count);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    parents[vertex] = vertex;
    sizes[vertex] = 1;
  }

  const find = (start: number) => {
    let root = start;
    while (parents[root] !== root) root = parents[root];
    let current = start;
    while (parents[current] !== current) {
      const next = parents[current];
      parents[current] = root;
      current = next;
    }
    return root;
  };

  const join = (left: number, right: number) => {
    let leftRoot = find(left);
    let rightRoot = find(right);
    if (leftRoot === rightRoot) return;
    if (sizes[leftRoot] < sizes[rightRoot]) [leftRoot, rightRoot] = [rightRoot, leftRoot];
    parents[rightRoot] = leftRoot;
    sizes[leftRoot] += sizes[rightRoot];
  };

  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset);
    const b = index.getX(offset + 1);
    const c = index.getX(offset + 2);
    join(a, b);
    join(a, c);
  }

  const bounds = new Map<number, ComponentBounds>();
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const root = find(vertex);
    const x = position.getX(vertex);
    const y = position.getY(vertex);
    const z = position.getZ(vertex);
    const current = bounds.get(root);
    if (current) {
      current.minX = Math.min(current.minX, x);
      current.minY = Math.min(current.minY, y);
      current.minZ = Math.min(current.minZ, z);
      current.maxX = Math.max(current.maxX, x);
      current.maxY = Math.max(current.maxY, y);
      current.maxZ = Math.max(current.maxZ, z);
    } else {
      bounds.set(root, { minX: x, minY: y, minZ: z, maxX: x, maxY: y, maxZ: z });
    }
  }

  const footRoots = new Set<number>();
  bounds.forEach((box, root) => {
    const isFrontFoot = box.minX >= -0.36
      && box.maxX <= 0.60
      && box.minY <= -0.72
      && box.maxY <= -0.32
      && box.minZ >= -0.11
      && box.maxZ >= 0.22;
    const isRearFoot = box.minX >= -0.06
      && box.maxX <= 0.62
      && box.minY <= -0.68
      && box.maxY <= -0.30
      && box.minZ >= -0.54
      && box.maxZ <= -0.04;
    if (isFrontFoot || isRearFoot) footRoots.add(root);
  });

  const footZone = new Float32Array(position.count);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const root = find(vertex);
    footZone[vertex] = footRoots.has(root) ? 1 : 0;
  }

  geometry.setAttribute("birdFootZone", new THREE.Float32BufferAttribute(footZone, 1));
}
