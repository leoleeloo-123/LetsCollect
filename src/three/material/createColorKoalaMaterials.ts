import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorKoalaDebugMode = { value: number };

export function prepareColorKoalaMaskTexture(
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

function colorizeKoalaHat(
  material: Three.Material,
  hatColor: Three.Color,
  hatMask: Three.Texture,
  debugMode: ColorKoalaDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.colorKoalaHatColor = { value: hatColor };
    shader.uniforms.colorKoalaHatMask = { value: hatMask };
    shader.uniforms.colorKoalaDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vColorKoalaObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorKoalaObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 colorKoalaHatColor;
uniform sampler2D colorKoalaHatMask;
uniform float colorKoalaDebugMode;
varying vec3 vColorKoalaObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float hatCandidate = smoothstep(0.08, 0.58, texture2D(colorKoalaHatMask, vMapUv).r);
  float hatHeight = smoothstep(0.36, 0.43, vColorKoalaObjectPosition.y);
  float hatRegion = hatCandidate * hatHeight;
  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float hatShading = mix(0.62, 1.04, smoothstep(0.10, 0.92, baseLuma));
  vec3 colorizedHat = colorKoalaHatColor * hatShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedHat, hatRegion);

  vec3 debugBase = vec3(baseLuma * 0.52);
  vec3 debugColor = mix(debugBase, vec3(0.12, 0.42, 0.96), hatRegion);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, colorKoalaDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-koala-hat-v6";
  material.needsUpdate = true;
}

export function cloneColorKoalaMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  hatColor: Three.Color,
  hatMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorKoalaDebugMode = { value: 0 }
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
        clone.envMapIntensity = 0.14;
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
      colorizeKoalaHat(clone, hatColor, hatMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
