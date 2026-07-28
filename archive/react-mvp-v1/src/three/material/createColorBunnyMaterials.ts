import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export function prepareColorBunnyProtectTexture(
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

function colorizeColorBunnyBag(
  material: Three.Material,
  bagColor: Three.Color,
  protectMap: Three.Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.bunnyProtectMap = { value: protectMap };
    shader.uniforms.bunnyBagColor = { value: bagColor };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vBunnyObjectPosition;
varying vec3 vBunnyObjectNormal;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vBunnyObjectPosition = position;
vBunnyObjectNormal = normal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D bunnyProtectMap;
uniform vec3 bunnyBagColor;
varying vec3 vBunnyObjectPosition;
varying vec3 vBunnyObjectNormal;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float warmCandidate = smoothstep(0.16, 0.68, texture2D(bunnyProtectMap, vMapUv).r);

  float bagFront = smoothstep(0.22, 0.34, vBunnyObjectPosition.z);
  float caseX = 1.0 - smoothstep(0.165, 0.235, abs(vBunnyObjectPosition.x));
  float caseY = smoothstep(-0.635, -0.565, vBunnyObjectPosition.y)
    * (1.0 - smoothstep(-0.285, -0.225, vBunnyObjectPosition.y));
  float handleX = 1.0 - smoothstep(0.135, 0.205, abs(vBunnyObjectPosition.x));
  float handleY = smoothstep(-0.390, -0.325, vBunnyObjectPosition.y)
    * (1.0 - smoothstep(-0.105, -0.055, vBunnyObjectPosition.y));
  float bagGeometry = max(caseX * caseY, handleX * handleY) * bagFront;
  float casePanelX = 1.0 - smoothstep(0.158, 0.164, abs(vBunnyObjectPosition.x));
  float casePanelY = smoothstep(-0.582, -0.574, vBunnyObjectPosition.y)
    * (1.0 - smoothstep(-0.368, -0.360, vBunnyObjectPosition.y));
  float casePanelDepth = smoothstep(0.405, 0.414, vBunnyObjectPosition.z);
  float casePanelNormal = smoothstep(0.92, 0.97, vBunnyObjectNormal.z);
  float casePanel = casePanelX * casePanelY * casePanelDepth * casePanelNormal;
  float bagDetail = max(warmCandidate * bagGeometry, casePanel);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float bagShading = mix(0.58, 1.0, smoothstep(0.10, 0.88, baseLuma));
  bagShading = mix(bagShading, 0.88, casePanel);
  vec3 colorizedBag = bunnyBagColor * bagShading;
  sampledDiffuseColor.rgb = mix(originalDiffuseColor, colorizedBag, bagDetail);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-bunny-bag-production-v1";
  material.needsUpdate = true;
}

export function cloneColorBunnyMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  bagColor: Three.Color,
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
      colorizeColorBunnyBag(clone, bagColor, protectMap);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
