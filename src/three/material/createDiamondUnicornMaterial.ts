import type * as Three from "three";

type ThreeRuntime = typeof import("three");

type DiamondUnicornMaterialOptions = {
  lightweight?: boolean;
};

export function applyDiamondUnicornTint(
  THREE: ThreeRuntime,
  material: Three.MeshPhysicalMaterial,
  tintValue: string,
  lightweight = false
) {
  const tint = new THREE.Color(tintValue);
  const white = new THREE.Color(0xffffff);
  if (lightweight) {
    material.color.copy(tint).multiplyScalar(0.86);
    material.attenuationColor.copy(tint).multiplyScalar(0.82);
  } else {
    material.color.copy(tint).lerp(white, 0.64);
    material.attenuationColor.copy(tint).lerp(white, 0.18);
  }
  material.needsUpdate = true;
}

export function createDiamondUnicornMaterial(
  THREE: ThreeRuntime,
  tintValue: string,
  options: DiamondUnicornMaterialOptions = {}
) {
  const lightweight = options.lightweight ?? false;
  const material = new THREE.MeshPhysicalMaterial({
    color: 0xf4fbfc,
    roughness: lightweight ? 0.14 : 0.025,
    metalness: 0,
    transmission: lightweight ? 0.42 : 0.95,
    thickness: lightweight ? 0.4 : 1.45,
    ior: 2.42,
    dispersion: lightweight ? 0.01 : 0.12,
    attenuationDistance: 2.6,
    attenuationColor: 0xe8f3f5,
    clearcoat: 1,
    clearcoatRoughness: 0.025,
    specularIntensity: 1,
    specularColor: 0xffffff,
    envMapIntensity: lightweight ? 1.1 : 2.6,
    flatShading: true
  });
  applyDiamondUnicornTint(THREE, material, tintValue, lightweight);
  return material;
}
