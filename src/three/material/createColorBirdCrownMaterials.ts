import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorBirdCrownDebugMode = { value: number };

export function prepareColorBirdCrownMaskTexture(
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

function addColorBirdCrownTriangleMask(
  THREE: ThreeRuntime,
  geometry: Three.BufferGeometry,
  crownTriangleMask: Uint8Array,
  triangleOffset: number
) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  const triangleCount = Math.floor((index?.count ?? position.count) / 3);
  if (triangleOffset + triangleCount > crownTriangleMask.length) {
    throw new Error("Color Bird 皇冠三角面遮罩与模型拓扑不匹配");
  }

  const preparedGeometry = index ? geometry.toNonIndexed() : geometry;
  const preparedVertexCount =
    preparedGeometry.getAttribute("position").count;
  const crownMask = new Float32Array(preparedVertexCount);
  const crownSeamMask = new Float32Array(preparedVertexCount);
  for (let triangle = 0; triangle < triangleCount; triangle += 1) {
    const encoded = crownTriangleMask[triangleOffset + triangle];
    const crownDetail = encoded & 8 ? 1 : 0;
    crownMask.fill(crownDetail, triangle * 3, triangle * 3 + 3);
    for (let localVertex = 0; localVertex < 3; localVertex += 1) {
      crownSeamMask[triangle * 3 + localVertex] =
        encoded & (1 << localVertex) ? 1 : 0;
    }
  }
  preparedGeometry.setAttribute(
    "colorBirdCrownTriangleMask",
    new THREE.BufferAttribute(crownMask, 1)
  );
  preparedGeometry.setAttribute(
    "colorBirdCrownSeamMask",
    new THREE.BufferAttribute(crownSeamMask, 1)
  );
  return { geometry: preparedGeometry, triangleCount };
}

function colorizeCrown(
  material: Three.Material,
  crownColor: Three.Color,
  crownMask: Three.Texture,
  debugMode: ColorBirdCrownDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.colorBirdCrownColor = { value: crownColor };
    shader.uniforms.colorBirdCrownMask = { value: crownMask };
    shader.uniforms.colorBirdCrownDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
attribute float colorBirdCrownTriangleMask;
attribute float colorBirdCrownSeamMask;
varying vec3 vColorBirdObjectPosition;
varying float vColorBirdCrownTriangleMask;
varying float vColorBirdCrownSeamMask;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorBirdObjectPosition = position;
vColorBirdCrownTriangleMask = colorBirdCrownTriangleMask;
vColorBirdCrownSeamMask = colorBirdCrownSeamMask;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 colorBirdCrownColor;
uniform sampler2D colorBirdCrownMask;
uniform float colorBirdCrownDebugMode;
varying vec3 vColorBirdObjectPosition;
varying float vColorBirdCrownTriangleMask;
varying float vColorBirdCrownSeamMask;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float crownMaskValue = texture2D(colorBirdCrownMask, vMapUv).r;
  float crownXGate = smoothstep(-0.30, -0.285, vColorBirdObjectPosition.x)
    * (1.0 - smoothstep(0.265, 0.28, vColorBirdObjectPosition.x));
  float crownYGate = smoothstep(0.605, 0.625, vColorBirdObjectPosition.y)
    * (1.0 - smoothstep(0.965, 0.985, vColorBirdObjectPosition.y));
  float crownZGate = smoothstep(-0.22, -0.205, vColorBirdObjectPosition.z)
    * (1.0 - smoothstep(0.325, 0.34, vColorBirdObjectPosition.z));
  float crownSurfaceDetail = smoothstep(0.06, 0.36, crownMaskValue)
    * vColorBirdCrownTriangleMask;
  float crownSeamDetail = smoothstep(
    0.82,
    0.98,
    vColorBirdCrownSeamMask
  );
  float crownSurfaceGeometry = crownSurfaceDetail
    * crownXGate
    * crownYGate
    * crownZGate;
  float crownSeamXGate = smoothstep(
    -0.325,
    -0.31,
    vColorBirdObjectPosition.x
  ) * (1.0 - smoothstep(0.29, 0.305, vColorBirdObjectPosition.x));
  float crownSeamYGate = smoothstep(
    0.595,
    0.605,
    vColorBirdObjectPosition.y
  ) * (1.0 - smoothstep(0.725, 0.735, vColorBirdObjectPosition.y));
  float crownSeamZGate = smoothstep(
    -0.24,
    -0.225,
    vColorBirdObjectPosition.z
  ) * (1.0 - smoothstep(0.345, 0.36, vColorBirdObjectPosition.z));
  float originalChroma = max(
    originalDiffuseColor.r,
    max(originalDiffuseColor.g, originalDiffuseColor.b)
  ) - min(
    originalDiffuseColor.r,
    min(originalDiffuseColor.g, originalDiffuseColor.b)
  );
  float crownOriginalGold = smoothstep(0.20, 0.32, originalChroma)
    * (1.0 - smoothstep(0.18, 0.26, originalDiffuseColor.b))
    * smoothstep(0.20, 0.32, originalDiffuseColor.r - originalDiffuseColor.g);
  float crownSeamGeometry = crownSeamDetail
    * crownSeamXGate
    * crownSeamYGate
    * crownSeamZGate
    * crownOriginalGold;
  float crownDetail = max(
    crownSurfaceGeometry,
    crownSeamGeometry
  );

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float crownShading = mix(0.52, 1.08, smoothstep(0.05, 0.92, baseLuma));
  vec3 colorizedCrown = colorBirdCrownColor * crownShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedCrown, crownDetail);

  vec3 debugBase = vec3(baseLuma * 0.40);
  vec3 debugColor = mix(
    debugBase,
    vec3(0.16, 0.48, 1.0),
    crownSurfaceGeometry
  );
  debugColor = mix(
    debugColor,
    vec3(0.20, 0.82, 0.42),
    crownSeamGeometry
  );
  sampledDiffuseColor.rgb = mix(
    resultColor,
    debugColor,
    colorBirdCrownDebugMode
  );
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-bird-crown-v6";
  material.needsUpdate = true;
}

export function cloneColorBirdCrownMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  crownColor: Three.Color,
  crownMask: Three.Texture,
  crownTriangleMask: Uint8Array,
  maxAnisotropy = 1,
  debugMode: ColorBirdCrownDebugMode = { value: 0 }
) {
  const materials: Three.Material[] = [];
  let triangleOffset = 0;
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const originalGeometry = child.geometry;
    const prepared = addColorBirdCrownTriangleMask(
      THREE,
      originalGeometry,
      crownTriangleMask,
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
      colorizeCrown(clone, crownColor, crownMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  if (triangleOffset !== crownTriangleMask.length) {
    throw new Error("Color Bird 皇冠三角面遮罩长度与模型拓扑不匹配");
  }
  return materials;
}
