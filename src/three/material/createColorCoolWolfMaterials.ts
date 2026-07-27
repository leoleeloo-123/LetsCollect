import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorCoolWolfDebugMode = { value: number };

export function prepareColorCoolWolfMaskTexture(
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

function colorizeEarStuds(
  material: Three.Material,
  studColor: Three.Color,
  studMask: Three.Texture,
  debugMode: ColorCoolWolfDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.coolWolfStudColor = { value: studColor };
    shader.uniforms.coolWolfStudMask = { value: studMask };
    shader.uniforms.coolWolfDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vCoolWolfObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vCoolWolfObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 coolWolfStudColor;
uniform sampler2D coolWolfStudMask;
uniform float coolWolfDebugMode;
varying vec3 vCoolWolfObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float studMaskValue = texture2D(coolWolfStudMask, vMapUv).r;
  float studXGate = smoothstep(0.32, 0.34, vCoolWolfObjectPosition.x)
    * (1.0 - smoothstep(0.40, 0.42, vCoolWolfObjectPosition.x));
  float studYGate = smoothstep(0.44, 0.46, vCoolWolfObjectPosition.y)
    * (1.0 - smoothstep(0.60, 0.62, vCoolWolfObjectPosition.y));
  float studZGate = smoothstep(0.14, 0.16, vCoolWolfObjectPosition.z)
    * (1.0 - smoothstep(0.23, 0.25, vCoolWolfObjectPosition.z));
  float studDetail = smoothstep(0.08, 0.36, studMaskValue)
    * studXGate
    * studYGate
    * studZGate;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float studShading = mix(0.58, 1.08, smoothstep(0.06, 0.88, baseLuma));
  vec3 colorizedStud = coolWolfStudColor * studShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedStud, studDetail);

  vec3 debugBase = vec3(baseLuma * 0.40);
  vec3 debugColor = mix(debugBase, vec3(0.16, 0.48, 1.0), studDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, coolWolfDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-cool-wolf-ear-studs-v1";
  material.needsUpdate = true;
}

export function cloneColorCoolWolfMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  studColor: Three.Color,
  studMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorCoolWolfDebugMode = { value: 0 }
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
      colorizeEarStuds(clone, studColor, studMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}
