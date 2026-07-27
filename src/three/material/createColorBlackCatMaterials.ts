import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorBlackCatDebugMode = { value: number };

export function prepareColorBlackCatMaskTexture(
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

function colorizeFishLogo(
  material: Three.Material,
  logoColor: Three.Color,
  logoMask: Three.Texture,
  debugMode: ColorBlackCatDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.blackCatLogoColor = { value: logoColor };
    shader.uniforms.blackCatLogoMask = { value: logoMask };
    shader.uniforms.blackCatDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vBlackCatObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vBlackCatObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 blackCatLogoColor;
uniform sampler2D blackCatLogoMask;
uniform float blackCatDebugMode;
varying vec3 vBlackCatObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float logoMaskValue = texture2D(blackCatLogoMask, vMapUv).r;
  float logoXGate = smoothstep(-0.32, -0.28, vBlackCatObjectPosition.x)
    * (1.0 - smoothstep(0.29, 0.32, vBlackCatObjectPosition.x));
  float logoYGate = smoothstep(-0.18, -0.15, vBlackCatObjectPosition.y)
    * (1.0 - smoothstep(0.22, 0.25, vBlackCatObjectPosition.y));
  float logoZGate = smoothstep(0.29, 0.33, vBlackCatObjectPosition.z)
    * (1.0 - smoothstep(0.45, 0.47, vBlackCatObjectPosition.z));
  float logoDetail = smoothstep(0.08, 0.36, logoMaskValue)
    * logoXGate
    * logoYGate
    * logoZGate;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float logoShading = mix(0.58, 1.08, smoothstep(0.06, 0.88, baseLuma));
  vec3 colorizedLogo = blackCatLogoColor * logoShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedLogo, logoDetail);

  vec3 debugBase = vec3(baseLuma * 0.40);
  vec3 debugColor = mix(debugBase, vec3(0.16, 0.48, 1.0), logoDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, blackCatDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-black-cat-fish-logo-v4";
  material.needsUpdate = true;
}

export function cloneColorBlackCatMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  logoColor: Three.Color,
  logoMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorBlackCatDebugMode = { value: 0 }
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
      colorizeFishLogo(clone, logoColor, logoMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}
