import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export const COLOR_DOG_MODEL_URL = "/models/toys/color-dog/model-mobile-v002.glb";
export const COLOR_DOG_PROTECT_MASK_URL = "/models/toys/color-dog/protect-mask-mobile-v028.webp";

export function prepareProtectedCoatTexture(
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
  return texture;
}

export function colorizeProtectedCoat(
  material: Three.Material,
  coatColor: Three.Color,
  protectMap: Three.Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.protectedCoatMap = { value: protectMap };
    shader.uniforms.protectedCoatColor = { value: coatColor };
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D protectedCoatMap;
uniform vec3 protectedCoatColor;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 detailMask = texture2D(protectedCoatMap, vMapUv).rgb;
  float fixedFace = smoothstep(0.24, 0.68, detailMask.r);
  float fixedPads = smoothstep(0.24, 0.68, detailMask.g);
  float protectedDetail = max(fixedFace, fixedPads);
  float baseLuma = dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float originalContrast = mix(0.50, 1.02, smoothstep(0.10, 0.94, baseLuma));
  vec3 colorizedCoat = protectedCoatColor * originalContrast;
  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, colorizedCoat, 1.0 - protectedDetail);
  vec3 pinkDetailColor = vec3(0.70, 0.16, 0.16);
  sampledDiffuseColor.rgb = mix(sampledDiffuseColor.rgb, pinkDetailColor, fixedPads * 0.68);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "protected-coat-v16";
  material.needsUpdate = true;
}

export function cloneProtectedCoatMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  coatColor: Three.Color,
  protectMap: Three.Texture,
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
        clone.roughness = 1;
        clone.envMapIntensity = 0.1;
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
      colorizeProtectedCoat(clone, coatColor, protectMap);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
