import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorCatYarnDebugMode = { value: number };

export function colorizeColorCatYarn(
  material: Three.Material,
  yarnColor: Three.Color,
  debugMode: ColorCatYarnDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.catYarnColor = { value: yarnColor };
    shader.uniforms.catYarnDebugMode = debugMode;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 catYarnColor;
uniform float catYarnDebugMode;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  float yarnLuma = dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float yarnShading = mix(0.58, 1.08, smoothstep(0.08, 0.92, yarnLuma));
  vec3 colorizedYarn = catYarnColor * yarnShading;
  vec3 debugColor = mix(vec3(0.08, 0.32, 0.76), vec3(0.12, 0.72, 0.48), yarnShading);
  sampledDiffuseColor.rgb = mix(colorizedYarn, debugColor, catYarnDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-cat-yarn-v1";
  material.needsUpdate = true;
}

export function cloneColorCatYarnMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  yarnColor: Three.Color,
  materialName: string,
  maxAnisotropy = 1,
  debugMode: ColorCatYarnDebugMode = { value: 0 }
) {
  const materials: Three.Material[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const originals = Array.isArray(child.material) ? child.material : [child.material];
    const clones = originals.map((original) => {
      const clone = original.clone();
      if (clone instanceof THREE.MeshStandardMaterial) {
        clone.metalness = 0;
        clone.roughness = 1;
        clone.envMapIntensity = 0.12;
        clone.metalnessMap = null;
        clone.roughnessMap = null;
        if (clone.normalMap) clone.normalScale.setScalar(0.42);
        if (clone.map) {
          clone.map.generateMipmaps = false;
          clone.map.minFilter = THREE.LinearFilter;
          clone.map.magFilter = THREE.LinearFilter;
          clone.map.anisotropy = Math.min(4, maxAnisotropy);
          clone.map.needsUpdate = true;
        }
      }
      if (clone.name === materialName) {
        colorizeColorCatYarn(clone, yarnColor, debugMode);
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