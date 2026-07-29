import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorPenguinDebugMode = { value: number };

export function prepareColorPenguinMaskTexture(
  THREE: ThreeRuntime,
  texture: Three.Texture
) {
  texture.flipY = false;
  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.needsUpdate = true;
}

function addColorPenguinZoneMasks(
  THREE: ThreeRuntime,
  geometry: Three.BufferGeometry,
  triangleZones: Uint8Array,
  triangleOffset: number
) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const triangleCount = Math.floor((index?.count ?? position.count) / 3);
  const preparedGeometry = index ? geometry.toNonIndexed() : geometry;
  const preparedPosition = preparedGeometry.getAttribute("position");
  const earmuffMask = new Float32Array(preparedPosition.count);
  const cupMask = new Float32Array(preparedPosition.count);

  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const zone = triangleZones[triangleOffset + triangle] ?? 0;
    earmuffMask.fill(zone & 1 ? 1 : 0, triangle * 3, triangle * 3 + 3);
    cupMask.fill(zone & 2 ? 1 : 0, triangle * 3, triangle * 3 + 3);
  }

  preparedGeometry.setAttribute(
    "colorPenguinEarmuffMask",
    new THREE.BufferAttribute(earmuffMask, 1)
  );
  preparedGeometry.setAttribute(
    "colorPenguinCupMask",
    new THREE.BufferAttribute(cupMask, 1)
  );
  return { geometry: preparedGeometry, triangleCount };
}

function colorizePenguinAccessories(
  material: Three.Material,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  debugMode: ColorPenguinDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.penguinAccessoryColor = { value: accessoryColor };
    shader.uniforms.penguinAccessoryMask = { value: accessoryMask };
    shader.uniforms.penguinDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
attribute float colorPenguinEarmuffMask;
attribute float colorPenguinCupMask;
varying vec3 vColorPenguinObjectPosition;
varying float vColorPenguinEarmuffMask;
varying float vColorPenguinCupMask;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorPenguinObjectPosition = position;
vColorPenguinEarmuffMask = colorPenguinEarmuffMask;
vColorPenguinCupMask = colorPenguinCupMask;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 penguinAccessoryColor;
uniform sampler2D penguinAccessoryMask;
uniform float penguinDebugMode;
varying vec3 vColorPenguinObjectPosition;
varying float vColorPenguinEarmuffMask;
varying float vColorPenguinCupMask;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec4 accessoryChannels = texture2D(
    penguinAccessoryMask,
    vMapUv
  );

  float earmuffDetail = step(0.5, accessoryChannels.r)
    * step(0.5, vColorPenguinEarmuffMask);
  float cupHeightGate = step(
    -0.13,
    vColorPenguinObjectPosition.y
  ) * step(vColorPenguinObjectPosition.y, 0.12);
  float exactCup = step(0.5, vColorPenguinCupMask);
  float heartProtection = step(0.5, accessoryChannels.b);
  float exactCupDetail = step(0.5, accessoryChannels.g)
    * exactCup
    * cupHeightGate
    * (1.0 - heartProtection);
  float sourcePink = step(0.5, accessoryChannels.a);
  float cupSharedX = step(
    -0.26,
    vColorPenguinObjectPosition.x
  ) * step(vColorPenguinObjectPosition.x, 0.26);
  float cupSharedZ = step(
    0.20,
    vColorPenguinObjectPosition.z
  ) * step(vColorPenguinObjectPosition.z, 0.60);
  float cupSharedTop = smoothstep(
    0.055,
    0.075,
    vColorPenguinObjectPosition.y
  ) * (1.0 - smoothstep(
    0.13,
    0.16,
    vColorPenguinObjectPosition.y
  ));
  float sharedCupDetail = sourcePink
    * cupSharedX
    * cupSharedZ
    * cupSharedTop;
  float cupDetail = max(exactCupDetail, sharedCupDetail);
  float accessoryDetail = max(earmuffDetail, cupDetail);

  float baseLuma = dot(
    originalDiffuseColor,
    vec3(0.2126, 0.7152, 0.0722)
  );
  float accessoryShading = mix(
    0.48,
    1.08,
    smoothstep(0.05, 0.92, baseLuma)
  );
  vec3 colorizedAccessory = penguinAccessoryColor * accessoryShading;
  vec3 resultColor = mix(
    originalDiffuseColor,
    colorizedAccessory,
    accessoryDetail
  );
  float cupBottomCleanup = sourcePink
    * step(-0.14, vColorPenguinObjectPosition.x)
    * step(vColorPenguinObjectPosition.x, 0.14)
    * step(-0.24, vColorPenguinObjectPosition.y)
    * (1.0 - step(-0.13, vColorPenguinObjectPosition.y))
    * cupSharedZ
    * (1.0 - cupDetail);
  resultColor = mix(
    resultColor,
    vec3(0.75),
    cupBottomCleanup
  );

  vec3 debugBase = vec3(baseLuma * 0.40);
  vec3 debugColor = mix(
    debugBase,
    vec3(0.16, 0.46, 1.0),
    earmuffDetail
  );
  debugColor = mix(
    debugColor,
    vec3(1.0, 0.36, 0.24),
    cupDetail
  );
  sampledDiffuseColor.rgb = mix(
    resultColor,
    debugColor,
    penguinDebugMode
  );
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () =>
    "color-penguin-pink-topology-v003";
  material.needsUpdate = true;
}

export function cloneColorPenguinMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  triangleZones: Uint8Array,
  maxAnisotropy = 1,
  debugMode: ColorPenguinDebugMode = { value: 0 }
) {
  const materials: Three.Material[] = [];
  let triangleOffset = 0;

  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const originalGeometry = child.geometry;
    const prepared = addColorPenguinZoneMasks(
      THREE,
      originalGeometry,
      triangleZones,
      triangleOffset
    );
    triangleOffset += prepared.triangleCount;
    if (prepared.geometry !== originalGeometry) {
      child.geometry = prepared.geometry;
      originalGeometry.dispose();
    }

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
      colorizePenguinAccessories(
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
