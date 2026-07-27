import type * as Three from "three";

type ThreeRuntime = typeof import("three");

const BALLOON_ZONE_ATTRIBUTE = "guineaBalloonZone";

function ellipsoidScore(
  x: number,
  y: number,
  z: number,
  normalX: number,
  normalY: number,
  normalZ: number,
  centerX: number,
  centerY: number,
  centerZ: number,
  radiusX: number,
  radiusY: number,
  radiusZ: number
) {
  const dx = x - centerX;
  const dy = y - centerY;
  const dz = z - centerZ;
  const gradientX = dx / (radiusX * radiusX);
  const gradientY = dy / (radiusY * radiusY);
  const gradientZ = dz / (radiusZ * radiusZ);
  const gradientLength = Math.hypot(gradientX, gradientY, gradientZ) || 1;
  const normalLength = Math.hypot(normalX, normalY, normalZ) || 1;
  const alignment = (
    normalX * gradientX + normalY * gradientY + normalZ * gradientZ
  ) / (normalLength * gradientLength);
  const radialDistance = Math.hypot(
    dx / radiusX,
    dy / radiusY,
    dz / radiusZ
  );
  return alignment - Math.abs(radialDistance - 1) * 0.85;
}

function resolveTriangleZone(
  x: number,
  y: number,
  z: number,
  normalX: number,
  normalY: number,
  normalZ: number
) {
  const isProtectedStarString = x < 0.12 && y <= 0.08;
  if (isProtectedStarString) return 0;

  const isStarCrown = x < -0.15 && y < 0.7;
  const isStarBody = x < 0.12 && y < 0.44;
  if (isStarCrown || isStarBody) return 1;

  const belongsToHeartOrRound = x > -0.2 && y > -0.02 && y < 0.92;
  if (!belongsToHeartOrRound) return 0;

  const heartScore = ellipsoidScore(
    x, y, z,
    normalX, normalY, normalZ,
    0.1, 0.678, -0.056,
    0.258, 0.23, 0.282
  );
  const roundScore = ellipsoidScore(
    x, y, z,
    normalX, normalY, normalZ,
    0.496, 0.451, -0.014,
    0.171, 0.434, 0.317
  );
  return heartScore >= roundScore ? 2 : 3;
}

export function assignColorGuineaPigBalloonZones(
  THREE: ThreeRuntime,
  root: Three.Object3D
) {
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const source = child.geometry;
    const geometry = source.index ? source.toNonIndexed() : source.clone();
    const position = geometry.getAttribute("position");
    const normal = geometry.getAttribute("normal");
    const zones = new Float32Array(position.count);

    for (let index = 0; index + 2 < position.count; index += 3) {
      const x = (
        position.getX(index)
        + position.getX(index + 1)
        + position.getX(index + 2)
      ) / 3;
      const y = (
        position.getY(index)
        + position.getY(index + 1)
        + position.getY(index + 2)
      ) / 3;
      const z = (
        position.getZ(index)
        + position.getZ(index + 1)
        + position.getZ(index + 2)
      ) / 3;
      const normalX = normal
        ? normal.getX(index) + normal.getX(index + 1) + normal.getX(index + 2)
        : 0;
      const normalY = normal
        ? normal.getY(index) + normal.getY(index + 1) + normal.getY(index + 2)
        : 0;
      const normalZ = normal
        ? normal.getZ(index) + normal.getZ(index + 1) + normal.getZ(index + 2)
        : 1;
      const zone = resolveTriangleZone(x, y, z, normalX, normalY, normalZ);
      zones[index] = zone;
      zones[index + 1] = zone;
      zones[index + 2] = zone;
    }

    geometry.setAttribute(
      BALLOON_ZONE_ATTRIBUTE,
      new THREE.Float32BufferAttribute(zones, 1)
    );
    child.geometry = geometry;
  });
}