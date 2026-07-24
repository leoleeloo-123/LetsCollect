import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorDogCameraDebugMode = { value: number };

export function prepareColorDogCameraMaskTexture(
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

function colorizeColorDogCameraAccessories(
  material: Three.Material,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  debugMode: ColorDogCameraDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.dogCameraAccessoryColor = { value: accessoryColor };
    shader.uniforms.dogCameraAccessoryMask = { value: accessoryMask };
    shader.uniforms.dogCameraDebugMode = debugMode;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 dogCameraAccessoryColor;
uniform sampler2D dogCameraAccessoryMask;
uniform float dogCameraDebugMode;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float maskValue = texture2D(dogCameraAccessoryMask, vMapUv).r;
  float accessoryDetail = smoothstep(0.62, 0.82, maskValue);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float accessoryShading = mix(0.54, 1.06, smoothstep(0.08, 0.92, baseLuma));
  vec3 colorizedAccessory = dogCameraAccessoryColor * accessoryShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedAccessory, accessoryDetail);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.48);
  vec3 debugColor = mix(debugBase, vec3(0.10, 0.35, 0.94), accessoryDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, dogCameraDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-dog-camera-accessories-v1";
  material.needsUpdate = true;
}

export function cloneColorDogCameraMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorDogCameraDebugMode = { value: 0 }
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
      colorizeColorDogCameraAccessories(
        clone,
        accessoryColor,
        accessoryMask,
        debugMode
      );
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
