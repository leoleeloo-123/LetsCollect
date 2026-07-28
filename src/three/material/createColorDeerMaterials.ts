import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorDeerDebugMode = { value: number };

export function prepareColorDeerMaskTexture(
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

function prepareColorDeerBowAttribute(
  THREE: ThreeRuntime,
  mesh: Three.Mesh
) {
  const geometry = mesh.geometry;
  if (geometry.getAttribute("colorDeerBowWeight")) return;
  const positions = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!positions || !index) return;

  const parent = new Int32Array(positions.count);
  for (let vertex = 0; vertex < parent.length; vertex += 1) parent[vertex] = vertex;

  function find(vertex: number) {
    let root = vertex;
    while (parent[root] !== root) root = parent[root];
    while (parent[vertex] !== vertex) {
      const next = parent[vertex];
      parent[vertex] = root;
      vertex = next;
    }
    return root;
  }

  function union(a: number, b: number) {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  }

  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset);
    const b = index.getX(offset + 1);
    const c = index.getX(offset + 2);
    union(a, b);
    union(a, c);
  }

  type Bounds = {
    minX: number;
    minY: number;
    minZ: number;
    maxX: number;
    maxY: number;
    maxZ: number;
    count: number;
  };
  const boundsByRoot = new Map<number, Bounds>();
  for (let vertex = 0; vertex < positions.count; vertex += 1) {
    const root = find(vertex);
    const x = positions.getX(vertex);
    const y = positions.getY(vertex);
    const z = positions.getZ(vertex);
    const bounds = boundsByRoot.get(root);
    if (bounds) {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.minZ = Math.min(bounds.minZ, z);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxY = Math.max(bounds.maxY, y);
      bounds.maxZ = Math.max(bounds.maxZ, z);
      bounds.count += 1;
    } else {
      boundsByRoot.set(root, { minX: x, minY: y, minZ: z, maxX: x, maxY: y, maxZ: z, count: 1 });
    }
  }

  const bowRoots = new Set<number>();
  boundsByRoot.forEach((bounds, root) => {
    if (
      bounds.count > 100
      && bounds.minX > 0.02
      && bounds.minY > 0.32
      && bounds.minZ > 0.15
      && bounds.maxX < 0.42
      && bounds.maxY < 0.76
      && bounds.maxZ < 0.42
    ) {
      bowRoots.add(root);
    }
  });


  const weights = new Float32Array(positions.count);
  for (let vertex = 0; vertex < positions.count; vertex += 1) {
    weights[vertex] = bowRoots.has(find(vertex)) ? 1 : 0;
  }
  geometry.setAttribute("colorDeerBowWeight", new THREE.BufferAttribute(weights, 1));
}

function colorizeColorDeerAccessories(
  material: Three.Material,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  debugMode: ColorDeerDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.deerAccessoryColor = { value: accessoryColor };
    shader.uniforms.deerAccessoryMask = { value: accessoryMask };
    shader.uniforms.deerDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
attribute float colorDeerBowWeight;
varying float vColorDeerBowWeight;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vColorDeerBowWeight = colorDeerBowWeight;`);

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 deerAccessoryColor;
uniform sampler2D deerAccessoryMask;
uniform float deerDebugMode;
varying float vColorDeerBowWeight;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float maskValue = texture2D(deerAccessoryMask, vMapUv).r;
  float bowRedContrast = smoothstep(0.06, 0.22, originalDiffuseColor.r - originalDiffuseColor.g);
  float bowBlueBalance = smoothstep(-0.24, -0.06, originalDiffuseColor.b - originalDiffuseColor.g);
  float bowTextureDetail = min(bowRedContrast, bowBlueBalance);
  float bowDetail = smoothstep(0.50, 0.99, vColorDeerBowWeight) * bowTextureDetail;
  float accessoryDetail = max(smoothstep(0.18, 0.62, maskValue), bowDetail);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float accessoryShading = mix(0.76, 1.01, smoothstep(0.05, 0.84, baseLuma));
  vec3 colorizedAccessory = deerAccessoryColor * accessoryShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedAccessory, accessoryDetail);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.42);
  vec3 debugColor = mix(debugBase, vec3(0.12, 0.37, 0.96), accessoryDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, deerDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-deer-accessories-v10";
  material.needsUpdate = true;
}

export function cloneColorDeerMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  accessoryColor: Three.Color,
  accessoryMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorDeerDebugMode = { value: 0 }
) {
  const materials: Three.Material[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    prepareColorDeerBowAttribute(THREE, child);
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
      colorizeColorDeerAccessories(
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
