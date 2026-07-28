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
  protectMap: Three.Texture,
  debugMode?: { value: number }
) {
  const debugEnabled = Boolean(debugMode);
  material.onBeforeCompile = (shader) => {
    shader.uniforms.bunnyProtectMap = { value: protectMap };
    shader.uniforms.bunnyBagColor = { value: bagColor };
    if (debugMode) shader.uniforms.bunnyDebugMode = debugMode;
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
${debugEnabled ? "uniform float bunnyDebugMode;" : ""}
varying vec3 vBunnyObjectPosition;
varying vec3 vBunnyObjectNormal;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec2 maskChannels = texture2D(bunnyProtectMap, vMapUv).rg;
  float warmCandidate = smoothstep(0.16, 0.68, maskChannels.r);
${debugEnabled ? "  float darkCandidate = smoothstep(0.18, 0.66, maskChannels.g);" : ""}

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
  vec3 resultColor = mix(originalDiffuseColor, colorizedBag, bagDetail);
${debugEnabled ? `
  vec3 bunnyPosition = vBunnyObjectPosition;
  vec2 leftEyePoint = vec2(
    (bunnyPosition.x + 0.19) / 0.075,
    (bunnyPosition.y - 0.255) / 0.11
  );
  vec2 rightEyePoint = vec2(
    (bunnyPosition.x - 0.20) / 0.075,
    (bunnyPosition.y - 0.255) / 0.11
  );
  float leftEyeGate = 1.0 - smoothstep(0.76, 1.0, dot(leftEyePoint, leftEyePoint));
  float rightEyeGate = 1.0 - smoothstep(0.76, 1.0, dot(rightEyePoint, rightEyePoint));
  float eyeGate = max(leftEyeGate, rightEyeGate) * smoothstep(0.22, 0.27, bunnyPosition.z);

  vec2 muzzlePoint = vec2(
    bunnyPosition.x / 0.11,
    (bunnyPosition.y - 0.16) / 0.105
  );
  float muzzleGate = (1.0 - smoothstep(0.76, 1.0, dot(muzzlePoint, muzzlePoint)))
    * smoothstep(0.28, 0.34, bunnyPosition.z);

  float cheekX = smoothstep(0.15, 0.20, abs(bunnyPosition.x))
    * (1.0 - smoothstep(0.34, 0.39, abs(bunnyPosition.x)));
  float cheekY = smoothstep(0.04, 0.10, bunnyPosition.y)
    * (1.0 - smoothstep(0.22, 0.27, bunnyPosition.y));
  float cheekGate = cheekX * cheekY * smoothstep(0.16, 0.24, bunnyPosition.z);
  float innerEarGate = smoothstep(0.42, 0.52, bunnyPosition.y);

  float fixedWarm = warmCandidate * max(innerEarGate, cheekGate);
  float fixedDark = darkCandidate * max(eyeGate, muzzleGate);
  vec3 zoneColor = vec3(0.10, 0.43, 0.37);
  zoneColor = mix(zoneColor, vec3(0.76, 0.16, 0.34), fixedWarm);
  zoneColor = mix(zoneColor, vec3(0.78, 0.26, 0.08), fixedDark);
  zoneColor = mix(zoneColor, vec3(0.14, 0.27, 0.78), bagDetail);
  sampledDiffuseColor.rgb = mix(resultColor, zoneColor, bunnyDebugMode);` : "  sampledDiffuseColor.rgb = resultColor;"}
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () =>
    debugEnabled ? "color-bunny-bag-production-v2-debug" : "color-bunny-bag-production-v2";
  material.needsUpdate = true;
}

export function cloneColorBunnyMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  bagColor: Three.Color,
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
      colorizeColorBunnyBag(clone, bagColor, protectMap, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
