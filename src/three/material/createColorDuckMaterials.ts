import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorDuckDebugMode = { value: number };

export function prepareColorDuckMaskTexture(
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

function colorizeColorDuckBathPieces(
  material: Three.Material,
  bathColor: Three.Color,
  bathMask: Three.Texture,
  foamCleanupMask: Three.Texture,
  debugMode: ColorDuckDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.duckBathColor = { value: bathColor };
    shader.uniforms.duckBathMask = { value: bathMask };
    shader.uniforms.duckFoamCleanupMask = { value: foamCleanupMask };
    shader.uniforms.duckDebugMode = debugMode;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 duckBathColor;
uniform sampler2D duckBathMask;
uniform sampler2D duckFoamCleanupMask;
uniform float duckDebugMode;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float maskValue = texture2D(duckBathMask, vMapUv).r;
  float bathDetail = smoothstep(0.01, 0.14, maskValue);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float bathShading = mix(0.46, 1.10, smoothstep(0.04, 0.86, baseLuma));
  vec3 colorizedBath = duckBathColor * bathShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedBath, bathDetail);

  float foamMaskValue = texture2D(duckFoamCleanupMask, vMapUv).r;
  float foamCleanup = smoothstep(0.02, 0.22, foamMaskValue);
  float foamShading = mix(0.78, 1.04, smoothstep(0.24, 0.96, baseLuma));
  vec3 cleanFoam = vec3(0.985, 0.975, 0.965) * foamShading;
  resultColor = mix(resultColor, cleanFoam, foamCleanup);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.40);
  vec3 debugColor = mix(debugBase, vec3(0.10, 0.39, 0.98), bathDetail);
  debugColor = mix(debugColor, vec3(0.94), foamCleanup);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, duckDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-duck-bath-v2";
  material.needsUpdate = true;
}

export function cloneColorDuckMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  bathColor: Three.Color,
  bathMask: Three.Texture,
  foamCleanupMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorDuckDebugMode = { value: 0 }
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
      colorizeColorDuckBathPieces(
        clone,
        bathColor,
        bathMask,
        foamCleanupMask,
        debugMode
      );
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}
