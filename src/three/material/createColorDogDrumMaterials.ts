import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorDogDrumDebugMode = { value: number };

function colorizeColorDogDrum(
  material: Three.Material,
  drumColor: Three.Color,
  debugMode: ColorDogDrumDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.colorDogDrumColor = { value: drumColor };
    shader.uniforms.colorDogDrumDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vColorDogDrumObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorDogDrumObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 colorDogDrumColor;
uniform float colorDogDrumDebugMode;
varying vec3 vColorDogDrumObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;

  float maxChannel = max(max(originalDiffuseColor.r, originalDiffuseColor.g), originalDiffuseColor.b);
  float minChannel = min(min(originalDiffuseColor.r, originalDiffuseColor.g), originalDiffuseColor.b);
  float saturation = maxChannel <= 0.001 ? 0.0 : (maxChannel - minChannel) / maxChannel;
  float luma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));

  float redOverGreen = originalDiffuseColor.r - originalDiffuseColor.g;
  float redOverBlue = originalDiffuseColor.r - originalDiffuseColor.b;
  float greenOverBlue = originalDiffuseColor.g - originalDiffuseColor.b;
  float redFamily = smoothstep(0.36, 0.52, redOverGreen)
    * smoothstep(0.34, 0.58, redOverBlue)
    * (1.0 - smoothstep(0.14, 0.28, greenOverBlue));
  float drumBody = smoothstep(0.32, 0.52, saturation) * redFamily;
  float drumVertical = 1.0 - smoothstep(-0.23, -0.20, vColorDogDrumObjectPosition.y);
  float drumCenter = 1.0 - smoothstep(0.25, 0.285, abs(vColorDogDrumObjectPosition.x + 0.014));
  float drumFront = smoothstep(0.24, 0.28, vColorDogDrumObjectPosition.z);
  float drumMask = clamp(drumBody * drumVertical * drumCenter * drumFront, 0.0, 1.0);
  float drumShading = mix(0.54, 1.13, smoothstep(0.22, 0.92, luma));
  vec3 colorizedDrum = colorDogDrumColor * drumShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedDrum, drumMask * 0.94);

  vec3 debugColor = mix(vec3(luma * 0.55), vec3(0.08, 0.42, 0.94), drumMask);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, colorDogDrumDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-dog-drum-v5";
  material.needsUpdate = true;
}

export function cloneColorDogDrumMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  drumColor: Three.Color,
  maxAnisotropy = 1,
  debugMode: ColorDogDrumDebugMode = { value: 0 }
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
      colorizeColorDogDrum(clone, drumColor, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
