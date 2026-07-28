import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorSealDebugMode = { value: number };

export function prepareColorSealMaskTexture(
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

export function prepareColorSealObjectMaskTexture(
  THREE: ThreeRuntime,
  texture: Three.Texture
) {
  texture.flipY = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
}

function colorizeStarfish(
  material: Three.Material,
  starfishColor: Three.Color,
  starfishMask: Three.Texture,
  starfishObjectMask: Three.Texture,
  debugMode: ColorSealDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.colorSealStarfishColor = { value: starfishColor };
    shader.uniforms.colorSealStarfishMask = { value: starfishMask };
    shader.uniforms.colorSealStarfishObjectMask = { value: starfishObjectMask };
    shader.uniforms.colorSealDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vColorSealObjectPosition;
varying vec3 vColorSealObjectNormal;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
  vColorSealObjectPosition = position;
  vColorSealObjectNormal = normal;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 colorSealStarfishColor;
uniform sampler2D colorSealStarfishMask;
uniform sampler2D colorSealStarfishObjectMask;
uniform float colorSealDebugMode;
varying vec3 vColorSealObjectPosition;
varying vec3 vColorSealObjectNormal;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec3 sealMaskValue = texture2D(colorSealStarfishMask, vMapUv).rgb;
  float automaticStarfishMask = smoothstep(0.38, 0.74, sealMaskValue.r);
  vec2 objectMaskUv = vec2(
    (vColorSealObjectPosition.x + 0.36) / 0.46,
    (vColorSealObjectPosition.y + 0.14) / 0.41
  );
  vec2 objectMaskValue = texture2D(colorSealStarfishObjectMask, objectMaskUv).rg;
  float objectSilhouette = smoothstep(0.38, 0.74, objectMaskValue.r);
  float objectMinimumZ = mix(0.25, 0.55, objectMaskValue.g);
  float objectDepthGate = smoothstep(
    objectMinimumZ - 0.012,
    objectMinimumZ + 0.006,
    vColorSealObjectPosition.z
  );
  float objectNormalGate = smoothstep(
    0.55,
    0.82,
    normalize(vColorSealObjectNormal).z
  );
  float faceCoreX = smoothstep(-0.30, -0.27, vColorSealObjectPosition.x)
    * (1.0 - smoothstep(0.02, 0.05, vColorSealObjectPosition.x));
  float faceCoreY = smoothstep(-0.06, -0.03, vColorSealObjectPosition.y)
    * (1.0 - smoothstep(0.21, 0.24, vColorSealObjectPosition.y));
  float faceCoreGate = faceCoreX * faceCoreY;
  float objectSurfaceGate = max(objectNormalGate, faceCoreGate);
  float faceCoreDepthGate = smoothstep(
    objectMinimumZ - 0.040,
    objectMinimumZ - 0.015,
    vColorSealObjectPosition.z
  );
  float objectStarfishMask = max(
    objectSilhouette * objectDepthGate * objectSurfaceGate,
    objectSilhouette * faceCoreDepthGate * faceCoreGate
  );
  float starfishMask = max(automaticStarfishMask, objectStarfishMask);
  float cleanupMask = smoothstep(0.24, 0.70, sealMaskValue.g) * (1.0 - starfishMask);
  float faceDetailMask = smoothstep(0.28, 0.72, sealMaskValue.b) * starfishMask;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float neutralLevel = max(originalDiffuseColor.r, max(originalDiffuseColor.g, originalDiffuseColor.b));
  vec3 neutralSeal = vec3(neutralLevel, neutralLevel * 0.985, neutralLevel * 0.955);
  vec3 cleanedDiffuseColor = mix(originalDiffuseColor, neutralSeal, cleanupMask);
  float starfishShading = mix(0.68, 0.95, smoothstep(0.08, 0.92, baseLuma));
  vec3 colorizedStarfish = colorSealStarfishColor * starfishShading;
  colorizedStarfish = mix(colorizedStarfish, originalDiffuseColor, faceDetailMask);
  vec3 resultColor = mix(cleanedDiffuseColor, colorizedStarfish, starfishMask);

  vec3 debugBase = vec3(baseLuma * 0.48);
  vec3 debugColor = mix(debugBase, vec3(0.96, 0.48, 0.12), cleanupMask);
  debugColor = mix(debugColor, vec3(0.10, 0.38, 0.95), starfishMask);
  debugColor = mix(debugColor, vec3(0.10, 0.10, 0.10), faceDetailMask);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, colorSealDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-seal-starfish-v13";
  material.needsUpdate = true;
}

export function cloneColorSealMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  starfishColor: Three.Color,
  starfishMask: Three.Texture,
  starfishObjectMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorSealDebugMode = { value: 0 }
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
      colorizeStarfish(clone, starfishColor, starfishMask, starfishObjectMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
