import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorKarpyDebugMode = { value: number };

export function prepareColorKarpyMaskTexture(
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

function colorizeKarpyHat(
  material: Three.Material,
  hatColor: Three.Color,
  protectMap: Three.Texture,
  debugMode: ColorKarpyDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.karpyProtectMap = { value: protectMap };
    shader.uniforms.karpyHatColor = { value: hatColor };
    shader.uniforms.karpyDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vKarpyObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vKarpyObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D karpyProtectMap;
uniform vec3 karpyHatColor;
uniform float karpyDebugMode;
varying vec3 vKarpyObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float hatCandidate = smoothstep(0.08, 0.42, texture2D(karpyProtectMap, vMapUv).r);

  vec3 hatPoint = vKarpyObjectPosition - vec3(-0.075442, 0.873420, -0.106729);
  float hatNormal = dot(hatPoint, vec3(-0.124566, 0.990597, -0.056584));
  float hatU = dot(hatPoint, vec3(-0.855111, -0.136104, -0.500261));
  float hatV = dot(hatPoint, vec3(-0.503259, -0.013930, 0.864024));
  float hatThickness = smoothstep(-0.115, -0.100, hatNormal)
    * (1.0 - smoothstep(0.120, 0.135, hatNormal));
  float hatRadius = length(vec2(hatU / 0.270, hatV / 0.275));
  float hatFootprint = 1.0 - smoothstep(0.9845, 0.9875, hatRadius);
  float greenToRed = originalDiffuseColor.g / max(originalDiffuseColor.r, 0.0001);
  float redPurity = 1.0 - smoothstep(0.14, 0.20, greenToRed);
  float earRootGuard = mix(
    redPurity,
    1.0,
    smoothstep(-0.245, -0.225, vKarpyObjectPosition.x)
  );
  float hatDetail = hatCandidate * hatThickness * hatFootprint * earRootGuard;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float hatShading = mix(0.58, 1.02, smoothstep(0.08, 0.90, baseLuma));
  vec3 colorizedHat = karpyHatColor * hatShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedHat, hatDetail);

  vec3 zoneColor = mix(
    vec3(0.10, 0.43, 0.37),
    vec3(0.14, 0.27, 0.78),
    hatDetail
  );
  sampledDiffuseColor.rgb = mix(resultColor, zoneColor, karpyDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-karpy-hat-v7";
  material.needsUpdate = true;
}

export function cloneColorKarpyMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  hatColor: Three.Color,
  protectMap: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorKarpyDebugMode = { value: 0 }
) {
  const materials: Three.Material[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const originals = Array.isArray(child.material)
      ? child.material
      : [child.material];
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
      colorizeKarpyHat(clone, hatColor, protectMap, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
