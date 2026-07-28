import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorSheepDebugMode = { value: number };

export function prepareColorSheepMaskTexture(
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

function colorizeColorSheepAccessories(
  material: Three.Material,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  debugMode: ColorSheepDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.sheepAccessoryColor = { value: accessoryColor };
    shader.uniforms.sheepAccessoryMask = { value: accessoryMask };
    shader.uniforms.sheepDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vColorSheepObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorSheepObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 sheepAccessoryColor;
uniform sampler2D sheepAccessoryMask;
uniform float sheepDebugMode;
varying vec3 vColorSheepObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec2 accessoryChannels = texture2D(sheepAccessoryMask, vMapUv).rg;
  float accessoryHeightGate = 1.0 - smoothstep(0.14, 0.22, vColorSheepObjectPosition.y);
  float sourceMagenta = min(
    min(
      smoothstep(0.10, 0.30, originalDiffuseColor.r - originalDiffuseColor.g),
      smoothstep(0.01, 0.13, originalDiffuseColor.b - originalDiffuseColor.g)
    ),
    smoothstep(0.34, 0.62, originalDiffuseColor.r)
  );
  float sourceRed = min(
    min(
      smoothstep(0.015, 0.12, originalDiffuseColor.r - originalDiffuseColor.g),
      smoothstep(-0.01, 0.025, originalDiffuseColor.b - originalDiffuseColor.g)
    ),
    smoothstep(0.015, 0.16, originalDiffuseColor.r)
  );
  float capeHorizontalGate = 1.0 - smoothstep(0.33, 0.45, abs(vColorSheepObjectPosition.x));
  float capeVerticalGate = smoothstep(-0.48, -0.40, vColorSheepObjectPosition.y)
    * (1.0 - smoothstep(0.10, 0.18, vColorSheepObjectPosition.y));
  float sourceCapeColor = max(sourceMagenta, sourceRed * capeHorizontalGate * capeVerticalGate);
  float cloakMaskDetail = smoothstep(0.16, 0.60, accessoryChannels.r);
  float cloakDetail = max(cloakMaskDetail, sourceCapeColor) * accessoryHeightGate;
  float bowDetail = smoothstep(0.12, 0.54, accessoryChannels.g) * accessoryHeightGate;
  float accessoryDetail = max(cloakDetail, bowDetail);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float accessoryShading = mix(0.48, 1.08, smoothstep(0.05, 0.92, baseLuma));
  vec3 colorizedAccessory = sheepAccessoryColor * accessoryShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedAccessory, accessoryDetail);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.40);
  vec3 cloakDebug = vec3(0.12, 0.38, 0.98);
  vec3 bowDebug = vec3(1.0, 0.26, 0.58);
  vec3 debugColor = mix(debugBase, cloakDebug, cloakDetail);
  debugColor = mix(debugColor, bowDebug, bowDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, sheepDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-sheep-accessories-v7";
  material.needsUpdate = true;
}

export function cloneColorSheepMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorSheepDebugMode = { value: 0 }
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
      colorizeColorSheepAccessories(
        clone,
        accessoryColor,
        accessoryMask,
        debugMode
      );
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}
