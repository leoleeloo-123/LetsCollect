import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export function prepareColorPandaProtectTexture(
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

function colorizeColorPandaHat(
  material: Three.Material,
  hatColor: Three.Color,
  protectMap: Three.Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.pandaProtectMap = { value: protectMap };
    shader.uniforms.pandaHatColor = { value: hatColor };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vPandaObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vPandaObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D pandaProtectMap;
uniform vec3 pandaHatColor;
varying vec3 vPandaObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float hatCandidate = smoothstep(0.01, 0.34, texture2D(pandaProtectMap, vMapUv).r);
  float hatHeight = smoothstep(0.44, 0.54, vPandaObjectPosition.y);
  float hatDetail = hatCandidate * hatHeight;
  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float hatShading = mix(0.58, 1.02, smoothstep(0.08, 0.90, baseLuma));
  vec3 colorizedHat = pandaHatColor * hatShading;
  sampledDiffuseColor.rgb = mix(originalDiffuseColor, colorizedHat, hatDetail);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-panda-hat-production-v1";
  material.needsUpdate = true;
}

export function cloneColorPandaMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  hatColor: Three.Color,
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
      colorizeColorPandaHat(clone, hatColor, protectMap);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}