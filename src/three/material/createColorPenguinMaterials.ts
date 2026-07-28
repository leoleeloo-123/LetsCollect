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
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
}

function addColorPenguinTriangleMasks(
  THREE: ThreeRuntime,
  geometry: Three.BufferGeometry,
  cupTriangleMask: Uint8Array,
  scarfTriangleMask: Uint8Array,
  triangleOffset: number
) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const triangleCount = Math.floor((index?.count ?? position.count) / 3);

  const preparedGeometry = index ? geometry.toNonIndexed() : geometry;
  const preparedPosition = preparedGeometry.getAttribute("position");
  const cupMask = new Float32Array(preparedPosition.count);
  const scarfMask = new Float32Array(preparedPosition.count);
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const cupDetail = cupTriangleMask[triangleOffset + triangle] ? 1 : 0;
    const scarfDetail = scarfTriangleMask[triangleOffset + triangle] ? 1 : 0;
    const vertex = triangle * 3;
    cupMask.fill(cupDetail, vertex, vertex + 3);
    scarfMask.fill(scarfDetail, vertex, vertex + 3);
  }
  preparedGeometry.setAttribute(
    "colorPenguinCupMask",
    new THREE.BufferAttribute(cupMask, 1)
  );
  preparedGeometry.setAttribute(
    "colorPenguinScarfMask",
    new THREE.BufferAttribute(scarfMask, 1)
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
attribute float colorPenguinCupMask;
attribute float colorPenguinScarfMask;
varying vec3 vColorPenguinObjectPosition;
varying float vColorPenguinCupMask;
varying float vColorPenguinScarfMask;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorPenguinObjectPosition = position;
vColorPenguinCupMask = colorPenguinCupMask;
vColorPenguinScarfMask = colorPenguinScarfMask;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 penguinAccessoryColor;
uniform sampler2D penguinAccessoryMask;
uniform float penguinDebugMode;
varying vec3 vColorPenguinObjectPosition;
varying float vColorPenguinCupMask;
varying float vColorPenguinScarfMask;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec3 accessoryChannels = texture2D(penguinAccessoryMask, vMapUv).rgb;

  float earmuffHeightGate = smoothstep(0.38, 0.43, vColorPenguinObjectPosition.y);
  float earmuffCenterGate = 1.0 - smoothstep(
    0.50,
    0.56,
    abs(vColorPenguinObjectPosition.x)
  );

  float cupRimXGate = smoothstep(-0.14, -0.13, vColorPenguinObjectPosition.x)
    * (1.0 - smoothstep(0.13, 0.14, vColorPenguinObjectPosition.x));
  float cupRimYGate = smoothstep(0.11, 0.12, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.16, 0.175, vColorPenguinObjectPosition.y));
  float cupRimZGate = smoothstep(0.40, 0.42, vColorPenguinObjectPosition.z)
    * (1.0 - smoothstep(0.625, 0.64, vColorPenguinObjectPosition.z));
  float cupRimGate = cupRimXGate * cupRimYGate * cupRimZGate;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float earmuffMaskDetail = smoothstep(0.20, 0.55, accessoryChannels.r);
  float pinkSourceDetail = smoothstep(0.20, 0.55, accessoryChannels.g);
  float cupMaskDetail = smoothstep(0.20, 0.55, accessoryChannels.b);
  float neckScarfGate =
    smoothstep(0.08, 0.11, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.19, 0.22, vColorPenguinObjectPosition.y));
  float scarfTailXGate = smoothstep(
    0.26,
    0.30,
    abs(vColorPenguinObjectPosition.x)
  );
  float scarfTailYGate =
    smoothstep(-0.38, -0.34, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.12, 0.16, vColorPenguinObjectPosition.y));
  float scarfTailGate = scarfTailXGate * scarfTailYGate;
  float backScarfGate =
    (1.0 - smoothstep(-0.22, -0.12, vColorPenguinObjectPosition.z))
    * (1.0 - smoothstep(0.36, 0.42, abs(vColorPenguinObjectPosition.x)))
    * smoothstep(-0.48, -0.42, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.28, 0.32, vColorPenguinObjectPosition.y));
  float sideScarfGate = smoothstep(
    0.26,
    0.30,
    abs(vColorPenguinObjectPosition.x)
  ) * smoothstep(0.12, 0.16, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.30, 0.34, vColorPenguinObjectPosition.y));
  float frontScarfEdgeGate =
    smoothstep(0.33, 0.35, vColorPenguinObjectPosition.z)
    * (1.0 - smoothstep(0.40, 0.42, vColorPenguinObjectPosition.z))
    * (1.0 - smoothstep(0.28, 0.34, abs(vColorPenguinObjectPosition.x)))
    * smoothstep(0.22, 0.235, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.275, 0.29, vColorPenguinObjectPosition.y));

  float upperPinkAccessoryGate =
    smoothstep(0.48, 0.53, vColorPenguinObjectPosition.y);
  float corePinkAccessoryGate = max(
    max(neckScarfGate, scarfTailGate),
    upperPinkAccessoryGate
  );
  float edgePinkAccessoryGate = max(sideScarfGate, backScarfGate);
  float edgePinkLumaGate = 1.0 - smoothstep(0.68, 0.86, baseLuma);
  float scarfDetail = max(
    vColorPenguinScarfMask,
    pinkSourceDetail * neckScarfGate
  );
  float earmuffDetail = earmuffMaskDetail
    * earmuffHeightGate
    * earmuffCenterGate;
  float cupDetail = cupMaskDetail * max(vColorPenguinCupMask, cupRimGate);
  float accessoryDetail = max(
    max(earmuffDetail, cupDetail),
    scarfDetail
  );
  float accessoryShading = mix(0.48, 1.08, smoothstep(0.05, 0.92, baseLuma));
  vec3 colorizedAccessory = penguinAccessoryColor * accessoryShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedAccessory, accessoryDetail);
  float facePinkCleanupDetail =
    pinkSourceDetail
    * (1.0 - scarfDetail)
    * smoothstep(0.22, 0.25, vColorPenguinObjectPosition.y)
    * (1.0 - smoothstep(0.35, 0.38, vColorPenguinObjectPosition.y))
    * smoothstep(0.33, 0.35, vColorPenguinObjectPosition.z)
    * (1.0 - smoothstep(0.40, 0.42, vColorPenguinObjectPosition.z))
    * (1.0 - smoothstep(0.25, 0.30, abs(vColorPenguinObjectPosition.x)));
  vec3 cleanFaceColor = vec3(min(1.0, baseLuma * 1.12));
  resultColor = mix(resultColor, cleanFaceColor, facePinkCleanupDetail);

  vec3 debugBase = vec3(baseLuma * 0.40);
  vec3 debugColor = mix(debugBase, vec3(0.16, 0.46, 1.0), earmuffDetail);
  debugColor = mix(
    debugColor,
    vec3(0.80, 0.20, 0.66),
    scarfDetail
  );
  debugColor = mix(debugColor, vec3(1.0, 0.36, 0.24), cupDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, penguinDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-penguin-accessories-v67";
  material.needsUpdate = true;
}

export function cloneColorPenguinMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  cupTriangleMask: Uint8Array,
  scarfTriangleMask: Uint8Array,
  maxAnisotropy = 1,
  debugMode: ColorPenguinDebugMode = { value: 0 }
) {
  const materials: Three.Material[] = [];
  let triangleOffset = 0;
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const originalGeometry = child.geometry;
    const prepared = addColorPenguinTriangleMasks(
      THREE,
      originalGeometry,
      cupTriangleMask,
      scarfTriangleMask,
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
