import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type SimpleColorAccessoryProfile =
  | "racoon-tanghulu"
  | "hamster-icecream"
  | "dino-scarf"
  | "fox-hat";

export function prepareColorAccessoryMaskTexture(
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

function getAccessoryDetailCode(profile: SimpleColorAccessoryProfile) {
  if (profile === "racoon-tanghulu") {
    return `
  float maskCandidate = smoothstep(0.06, 0.38, texture2D(colorAccessoryMask, vMapUv).r);
  float sideGate = 1.0 - step(-0.2658, vColorAccessoryPosition.x);
  float heightGate = smoothstep(-0.330, -0.312, vColorAccessoryPosition.y)
    * (1.0 - smoothstep(0.568, 0.586, vColorAccessoryPosition.y));
  float depthGate = smoothstep(0.150, 0.165, vColorAccessoryPosition.z)
    * (1.0 - smoothstep(0.450, 0.466, vColorAccessoryPosition.z));
  float accessoryDetail = maskCandidate * sideGate * heightGate * depthGate;`;
  }

  if (profile === "hamster-icecream") {
    return `
  float maskCandidate = smoothstep(0.06, 0.38, texture2D(colorAccessoryMask, vMapUv).r);
  float sideGate = smoothstep(0.300, 0.355, vColorAccessoryPosition.x);
  float heightGate = smoothstep(-0.035, 0.015, vColorAccessoryPosition.y)
    * (1.0 - smoothstep(0.675, 0.715, vColorAccessoryPosition.y));
  float depthGate = smoothstep(-0.005, 0.035, vColorAccessoryPosition.z)
    * (1.0 - smoothstep(0.505, 0.535, vColorAccessoryPosition.z));
  float accessoryDetail = maskCandidate * sideGate * heightGate * depthGate;`;
  }

  if (profile === "dino-scarf") {
    return `
  float maskCandidate = smoothstep(0.06, 0.38, texture2D(colorAccessoryMask, vMapUv).r);
  float xGate = smoothstep(-0.320, -0.292, vColorAccessoryPosition.x)
    * (1.0 - smoothstep(0.360, 0.390, vColorAccessoryPosition.x));
  float yGate = smoothstep(-0.265, -0.235, vColorAccessoryPosition.y)
    * (1.0 - smoothstep(0.123, 0.155, vColorAccessoryPosition.y));
  float zGate = smoothstep(-0.370, -0.344, vColorAccessoryPosition.z)
    * (1.0 - smoothstep(0.303, 0.333, vColorAccessoryPosition.z));
  float accessoryDetail = maskCandidate * xGate * yGate * zGate;`;
  }

  return `
  vec2 targetMask = texture2D(colorAccessoryMask, vMapUv).rg;
  float hatCandidate = smoothstep(0.06, 0.34, targetMask.r);
  float featherCandidate = smoothstep(0.04, 0.30, targetMask.g);
  vec3 hatRelative = abs(
    (vColorAccessoryPosition - vec3(-0.005, 0.695, 0.060))
      / vec3(0.310, 0.230, 0.390)
  );
  vec3 hatSquared = hatRelative * hatRelative;
  float hatSpace = 1.0 - smoothstep(1.00, 1.20, dot(hatSquared, hatSquared));
  float hatHeight = smoothstep(0.555, 0.590, vColorAccessoryPosition.y);
  float hatEarGuard = 1.0 - smoothstep(0.175, 0.215, vColorAccessoryPosition.x);
  float featherX = smoothstep(0.030, 0.055, vColorAccessoryPosition.x)
    * (1.0 - smoothstep(0.205, 0.225, vColorAccessoryPosition.x));
  float featherY = smoothstep(0.625, 0.655, vColorAccessoryPosition.y);
  float featherZ = smoothstep(0.025, 0.050, vColorAccessoryPosition.z)
    * (1.0 - smoothstep(0.220, 0.250, vColorAccessoryPosition.z));
  float featherSpace = featherX * featherY * featherZ;
  float featherTip = smoothstep(0.890, 0.910, vColorAccessoryPosition.y);
  float featherDetail = max(
    max(featherCandidate, hatCandidate) * featherSpace,
    featherTip
  );
  float accessoryDetail = max(
    hatCandidate * hatSpace * hatHeight * hatEarGuard,
    featherDetail
  );`;
}

function colorizeAccessory(
  material: Three.Material,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  profile: SimpleColorAccessoryProfile
) {
  const detailCode = getAccessoryDetailCode(profile);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.colorAccessoryMask = { value: accessoryMask };
    shader.uniforms.colorAccessoryColor = { value: accessoryColor };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vColorAccessoryPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorAccessoryPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D colorAccessoryMask;
uniform vec3 colorAccessoryColor;
varying vec3 vColorAccessoryPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
${detailCode}
  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float accessoryShading = mix(0.48, 1.08, smoothstep(0.04, 0.92, baseLuma));
  vec3 colorizedAccessory = colorAccessoryColor * accessoryShading;
  sampledDiffuseColor.rgb = mix(originalDiffuseColor, colorizedAccessory, accessoryDetail);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => `color-accessory-${profile}-v1`;
  material.needsUpdate = true;
}

export function cloneColorMaskedAccessoryMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  profile: SimpleColorAccessoryProfile,
  maxAnisotropy = 1
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
      colorizeAccessory(clone, accessoryColor, accessoryMask, profile);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}