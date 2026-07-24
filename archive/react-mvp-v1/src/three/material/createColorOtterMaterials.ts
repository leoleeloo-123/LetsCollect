import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export function cloneColorOtterMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  lollipopColor: Three.Color,
  materialName: string,
  maxAnisotropy = 1
) {
  const materials: Three.Material[] = [];

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const originals = Array.isArray(child.material) ? child.material : [child.material];
    const clones = originals.map((original) => {
      const clone = original.clone();
      if (clone instanceof THREE.MeshStandardMaterial) {
        clone.metalness = 0;
        clone.metalnessMap = null;
        clone.roughnessMap = null;

        if (clone.name === materialName) {
          clone.map = null;
          clone.color.copy(lollipopColor);
          clone.roughness = 0.58;
          clone.envMapIntensity = 0.5;
        } else {
          clone.roughness = 1;
          clone.envMapIntensity = 0.1;
          if (clone.normalMap) clone.normalScale.setScalar(0.42);
          if (clone.map) {
            clone.map.generateMipmaps = false;
            clone.map.minFilter = THREE.LinearFilter;
            clone.map.magFilter = THREE.LinearFilter;
            clone.map.anisotropy = Math.min(4, maxAnisotropy);
            clone.map.needsUpdate = true;
          }
        }
        clone.needsUpdate = true;
      }
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });

  return materials;
}
