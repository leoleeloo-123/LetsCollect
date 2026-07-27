import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorSlothDebugMode = { value: number };

export function prepareColorSlothMaskTexture(
  THREE: ThreeRuntime,
  texture: Three.Texture
) {
  texture.flipY = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
}

function colorizeColorSlothHat(
  material: Three.Material,
  hatColor: Three.Color,
  hatMask: Three.Texture,
  debugMode: ColorSlothDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.slothHatColor = { value: hatColor };
    shader.uniforms.slothHatMask = { value: hatMask };
    shader.uniforms.slothDebugMode = debugMode;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 slothHatColor;
uniform sampler2D slothHatMask;
uniform float slothDebugMode;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float maskValue = texture2D(slothHatMask, vMapUv).r;
  float hatDetail = smoothstep(0.16, 0.58, maskValue);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float hatShading = mix(0.46, 1.12, smoothstep(0.04, 0.80, baseLuma));
  vec3 colorizedHat = slothHatColor * hatShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedHat, hatDetail);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.40);
  vec3 debugColor = mix(debugBase, vec3(0.10, 0.39, 0.98), hatDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, slothDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-sloth-hat-v1";
  material.needsUpdate = true;
}

export function cloneColorSlothMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  hatColor: Three.Color,
  hatMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorSlothDebugMode = { value: 0 }
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
      colorizeColorSlothHat(clone, hatColor, hatMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}
