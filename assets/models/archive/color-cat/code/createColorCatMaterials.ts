import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export function prepareColorCatProtectTexture(
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

function colorizeColorCatCoat(
  material: Three.Material,
  coatColor: Three.Color,
  protectMap: Three.Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.catProtectMap = { value: protectMap };
    shader.uniforms.catCoatColor = { value: coatColor };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vCatObjectPosition;
varying vec3 vCatObjectNormal;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vCatObjectPosition = position;
vCatObjectNormal = normal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D catProtectMap;
uniform vec3 catCoatColor;
varying vec3 vCatObjectPosition;
varying vec3 vCatObjectNormal;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec4 protectSample = texture2D(catProtectMap, vMapUv);
  float authoredMask = smoothstep(0.18, 0.62, protectSample.r);
  float earSupplementMask = smoothstep(0.18, 0.62, protectSample.g);
  float earPatchMask = smoothstep(0.18, 0.62, protectSample.b);

  vec3 catNormal = normalize(vCatObjectNormal);
  float faceDepthGate = smoothstep(0.23, 0.36, vCatObjectPosition.z);
  float faceLowerGate = smoothstep(-0.24, -0.13, vCatObjectPosition.y);
  float faceUpperGate = 1.0 - smoothstep(0.17, 0.27, vCatObjectPosition.y);
  float faceGate = faceDepthGate * faceLowerGate * faceUpperGate;

  float earHeightGate = smoothstep(0.08, 0.18, vCatObjectPosition.y);
  float earDepthGate = smoothstep(-0.03, 0.13, vCatObjectPosition.z);
  float earSideGate = smoothstep(0.10, 0.22, abs(vCatObjectPosition.x));
  float earGate = earHeightGate * earDepthGate * earSideGate;
  float earNormalGate = smoothstep(0.02, 0.34, catNormal.z);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float darkFaceDetail = 1.0 - smoothstep(0.40, 0.58, baseLuma);
  float pinkRedBias = smoothstep(0.10, 0.22, originalDiffuseColor.r - originalDiffuseColor.g);
  float pinkBlueBalance = 1.0 - smoothstep(0.07, 0.16, originalDiffuseColor.g - originalDiffuseColor.b);
  float pinkFaceDetail = pinkRedBias * pinkBlueBalance;
  float faceColorGate = max(darkFaceDetail, pinkFaceDetail);
  float faceFixedDetail = authoredMask * faceGate * faceColorGate;
  float earSupplementHeightGate = smoothstep(0.34, 0.40, vCatObjectPosition.y);
  float earBaseFixedDetail = authoredMask * earGate * earNormalGate;
  float earSupplementFixedDetail = earSupplementMask * earGate * earSupplementHeightGate;
  float earPatchHeightGate = smoothstep(0.32, 0.40, vCatObjectPosition.y);
  float earPatchDetail = earPatchHeightGate * earPatchMask;
  float earFixedDetail = max(max(earBaseFixedDetail, earSupplementFixedDetail), earPatchDetail);
  float fixedDetail = max(faceFixedDetail, earFixedDetail);
  float originalContrast = mix(0.54, 1.06, smoothstep(0.08, 0.94, baseLuma));
  vec3 colorizedCoat = catCoatColor * originalContrast;
  vec3 authoredEarPink = vec3(0.72, 0.46, 0.40) * originalContrast;
  vec3 protectedDiffuseColor = mix(originalDiffuseColor, authoredEarPink, earPatchDetail);
  sampledDiffuseColor.rgb = mix(colorizedCoat, protectedDiffuseColor, fixedDetail);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-cat-protected-coat-production-v1";
  material.needsUpdate = true;
}

export function cloneColorCatMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  coatColor: Three.Color,
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
      colorizeColorCatCoat(clone, coatColor, protectMap);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
