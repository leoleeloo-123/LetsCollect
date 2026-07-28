import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export function prepareColorTeddyProtectTexture(
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

function colorizeColorTeddyCoat(
  material: Three.Material,
  coatColor: Three.Color,
  protectMap: Three.Texture,
  debugMode?: { value: number }
) {
  const debugEnabled = Boolean(debugMode);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.teddyProtectMap = { value: protectMap };
    shader.uniforms.teddyCoatColor = { value: coatColor };
    if (debugMode) shader.uniforms.teddyDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vTeddyObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vTeddyObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D teddyProtectMap;
uniform vec3 teddyCoatColor;
${debugEnabled ? "uniform float teddyDebugMode;" : ""}
varying vec3 vTeddyObjectPosition;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec3 detailMask = texture2D(teddyProtectMap, vMapUv).rgb;
  float fixedDetail = smoothstep(0.24, 0.68, detailMask.r);
  float blushDetail = smoothstep(0.06, 0.72, detailMask.g);
  float faceDetailGate = smoothstep(-0.06, 0.02, vTeddyObjectPosition.y)
    * smoothstep(0.16, 0.28, vTeddyObjectPosition.z);
  float muzzleUpperSide = smoothstep(0.085, 0.125, vTeddyObjectPosition.y);
  float muzzleLowerRight = smoothstep(0.190, 0.300, vTeddyObjectPosition.x)
    * (1.0 - smoothstep(0.050, 0.110, vTeddyObjectPosition.y));
  float muzzleLowerYRadius = mix(0.195, 0.207, muzzleLowerRight);
  float muzzleYRadius = mix(muzzleLowerYRadius, 0.150, muzzleUpperSide);
  vec2 muzzlePoint = vec2(
    (vTeddyObjectPosition.x - 0.140) / 0.200,
    (vTeddyObjectPosition.y - 0.105) / muzzleYRadius
  );
  float muzzleShapeGate = 1.0 - smoothstep(0.80, 1.0, dot(muzzlePoint, muzzlePoint));
  float muzzleDetail = smoothstep(0.30, 0.38, vTeddyObjectPosition.z) * muzzleShapeGate;
  fixedDetail *= faceDetailGate;
  blushDetail *= faceDetailGate;
  float baseLuma = dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float originalContrast = mix(0.50, 1.02, smoothstep(0.10, 0.94, baseLuma));
  vec3 colorizedCoat = teddyCoatColor * originalContrast;
  vec3 creamMuzzle = vec3(0.96, 0.79, 0.61) * mix(0.92, 1.04, smoothstep(0.45, 0.95, baseLuma));
  vec3 resultColor = mix(colorizedCoat, creamMuzzle, muzzleDetail);
  float darkFeature = 1.0 - smoothstep(0.22, 0.38, baseLuma);
  float brightHighlight = smoothstep(0.72, 0.90, baseLuma);
  float featureKeep = fixedDetail * max(darkFeature, brightHighlight);
  resultColor = mix(resultColor, originalDiffuseColor, featureKeep);
  vec3 blushColor = mix(resultColor, vec3(1.0, 0.44, 0.52), 0.48);
  resultColor = mix(resultColor, blushColor, blushDetail);
${debugEnabled ? `  vec3 zoneColor = vec3(0.08, 0.38, 0.32);
  zoneColor = mix(zoneColor, vec3(0.12, 0.24, 0.72), muzzleDetail);
  zoneColor = mix(zoneColor, vec3(0.72, 0.12, 0.30), blushDetail);
  zoneColor = mix(zoneColor, vec3(0.72, 0.10, 0.05), fixedDetail);
  sampledDiffuseColor.rgb = mix(resultColor, zoneColor, teddyDebugMode);` : "  sampledDiffuseColor.rgb = resultColor;"}
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () =>
    debugEnabled
      ? "color-teddy-protected-coat-production-v2-debug"
      : "color-teddy-protected-coat-production-v2";
  material.needsUpdate = true;
}

export function cloneColorTeddyMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  coatColor: Three.Color,
  protectMap: Three.Texture,
  maxAnisotropy = 1,
  debugMode?: { value: number }
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
      colorizeColorTeddyCoat(clone, coatColor, protectMap, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
