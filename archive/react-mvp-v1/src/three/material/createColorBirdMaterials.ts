import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorBirdMaterialColors = {
  body: Three.Color;
  cap: Three.Color;
  blush: Three.Color;
  feet: Three.Color;
};

type ComponentBounds = {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
};

export function prepareColorBirdZoneTexture(
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

function addColorBirdSemanticAttributes(
  geometry: Three.BufferGeometry,
  THREE: ThreeRuntime
) {
  const position = geometry.getAttribute("position");
  const index = geometry.getIndex();
  if (!position || !index) return;

  const parents = new Int32Array(position.count);
  const sizes = new Int32Array(position.count);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    parents[vertex] = vertex;
    sizes[vertex] = 1;
  }

  const find = (start: number) => {
    let root = start;
    while (parents[root] !== root) root = parents[root];
    let current = start;
    while (parents[current] !== current) {
      const next = parents[current];
      parents[current] = root;
      current = next;
    }
    return root;
  };

  const join = (left: number, right: number) => {
    let leftRoot = find(left);
    let rightRoot = find(right);
    if (leftRoot === rightRoot) return;
    if (sizes[leftRoot] < sizes[rightRoot]) [leftRoot, rightRoot] = [rightRoot, leftRoot];
    parents[rightRoot] = leftRoot;
    sizes[leftRoot] += sizes[rightRoot];
  };

  for (let offset = 0; offset < index.count; offset += 3) {
    const a = index.getX(offset);
    const b = index.getX(offset + 1);
    const c = index.getX(offset + 2);
    join(a, b);
    join(a, c);
  }

  const bounds = new Map<number, ComponentBounds>();
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const root = find(vertex);
    const x = position.getX(vertex);
    const y = position.getY(vertex);
    const z = position.getZ(vertex);
    const current = bounds.get(root);
    if (current) {
      current.minX = Math.min(current.minX, x);
      current.minY = Math.min(current.minY, y);
      current.minZ = Math.min(current.minZ, z);
      current.maxX = Math.max(current.maxX, x);
      current.maxY = Math.max(current.maxY, y);
      current.maxZ = Math.max(current.maxZ, z);
    } else {
      bounds.set(root, { minX: x, minY: y, minZ: z, maxX: x, maxY: y, maxZ: z });
    }
  }

  const footRoots = new Set<number>();
  bounds.forEach((box, root) => {
    const isFrontFoot = box.minX >= -0.36
      && box.maxX <= 0.60
      && box.minY <= -0.72
      && box.maxY <= -0.32
      && box.minZ >= -0.11
      && box.maxZ >= 0.22;
    const isRearFoot = box.minX >= -0.06
      && box.maxX <= 0.62
      && box.minY <= -0.68
      && box.maxY <= -0.30
      && box.minZ >= -0.54
      && box.maxZ <= -0.04;
    if (isFrontFoot || isRearFoot) footRoots.add(root);
  });

  const footZone = new Float32Array(position.count);
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    footZone[vertex] = footRoots.has(find(vertex)) ? 1 : 0;
  }
  geometry.setAttribute("birdFootZone", new THREE.Float32BufferAttribute(footZone, 1));
}

function colorizeColorBirdZones(
  material: Three.Material,
  colors: ColorBirdMaterialColors,
  zoneMap: Three.Texture
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.birdZoneMap = { value: zoneMap };
    shader.uniforms.birdBodyColor = { value: colors.body };
    shader.uniforms.birdCapColor = { value: colors.cap };
    shader.uniforms.birdBlushColor = { value: colors.blush };
    shader.uniforms.birdFeetColor = { value: colors.feet };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
attribute float birdFootZone;
varying vec3 vBirdLocalPosition;
varying vec3 vBirdLocalNormal;
varying float vBirdFootZone;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vBirdLocalPosition = position;
vBirdLocalNormal = normal;
vBirdFootZone = birdFootZone;`);

    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform sampler2D birdZoneMap;
uniform vec3 birdBodyColor;
uniform vec3 birdCapColor;
uniform vec3 birdBlushColor;
uniform vec3 birdFeetColor;
varying vec3 vBirdLocalPosition;
varying vec3 vBirdLocalNormal;
varying float vBirdFootZone;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec3 zones = texture2D(birdZoneMap, vMapUv).rgb;

  vec3 beakPoint = (vBirdLocalPosition - vec3(0.32, 0.28, 0.66)) / vec3(0.25, 0.23, 0.17);
  float beakShape = 1.0 - smoothstep(1.00, 1.13, dot(beakPoint, beakPoint));
  vec3 beakCleanupPoint = (vBirdLocalPosition - vec3(0.30, 0.36, 0.58)) / vec3(0.36, 0.25, 0.30);
  float beakCleanup = (1.0 - smoothstep(1.00, 1.18, dot(beakCleanupPoint, beakCleanupPoint)))
    * smoothstep(0.27, 0.36, vBirdLocalPosition.y);

  vec3 leftFootPoint = (vBirdLocalPosition - vec3(-0.13, -0.60, 0.22)) / vec3(0.28, 0.25, 0.40);
  vec3 rightFootPoint = (vBirdLocalPosition - vec3(0.29, -0.55, 0.08)) / vec3(0.32, 0.24, 0.30);
  vec3 rearFootPoint = (vBirdLocalPosition - vec3(0.30, -0.52, -0.29)) / vec3(0.36, 0.24, 0.30);
  float footShape = max(
    1.0 - smoothstep(1.00, 1.18, dot(leftFootPoint, leftFootPoint)),
    max(
      1.0 - smoothstep(1.00, 1.18, dot(rightFootPoint, rightFootPoint)),
      1.0 - smoothstep(1.00, 1.18, dot(rearFootPoint, rearFootPoint))
    )
  );
  float footSurface = max(
    1.0 - smoothstep(-0.66, -0.59, vBirdLocalPosition.y),
    smoothstep(0.18, 0.42, normalize(vBirdLocalNormal).y)
  );
  float feetDetail = smoothstep(0.35, 0.82, vBirdFootZone) * footShape * footSurface;

  vec3 leftEyePoint = (vBirdLocalPosition - vec3(-0.05, 0.36, 0.68)) / vec3(0.11, 0.13, 0.10);
  vec3 rightEyePoint = (vBirdLocalPosition - vec3(0.505, 0.36, 0.42)) / vec3(0.09, 0.13, 0.16);
  float eyeShape = max(
    1.0 - smoothstep(1.00, 1.24, dot(leftEyePoint, leftEyePoint)),
    1.0 - smoothstep(1.00, 1.24, dot(rightEyePoint, rightEyePoint))
  );
  float beakLeftEdge = mix(0.125, 0.215, smoothstep(0.30, 0.44, vBirdLocalPosition.y));
  float beakSpatial = smoothstep(beakLeftEdge, beakLeftEdge + 0.04, vBirdLocalPosition.x)
    * (1.0 - smoothstep(0.455, 0.485, vBirdLocalPosition.x))
    * smoothstep(0.575, 0.615, vBirdLocalPosition.z);
  float textureFixed = smoothstep(0.18, 0.68, zones.r) * max(eyeShape, beakShape * beakSpatial);
  float fixedDetail = max(textureFixed, feetDetail);
  float capZone = smoothstep(0.12, 0.62, zones.g) * (1.0 - fixedDetail) * (1.0 - beakCleanup) * smoothstep(0.30, 0.40, vBirdLocalPosition.y);
  float blushZone = smoothstep(0.12, 0.62, zones.b) * (1.0 - fixedDetail) * (1.0 - beakCleanup) * smoothstep(0.06, 0.12, vBirdLocalPosition.y);
  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float originalContrast = mix(0.56, 1.04, smoothstep(0.08, 0.94, baseLuma));
  originalContrast = mix(originalContrast, 0.82, beakCleanup * (1.0 - textureFixed));
  vec3 recolored = birdBodyColor * originalContrast;
  recolored = mix(recolored, birdCapColor * originalContrast, capZone);
  recolored = mix(recolored, birdBlushColor * mix(0.78, 1.02, originalContrast), blushZone);
  recolored = mix(recolored, originalDiffuseColor, textureFixed);
  recolored = mix(recolored, birdFeetColor * mix(0.68, 1.04, originalContrast), feetDetail);
  sampledDiffuseColor.rgb = recolored;
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-bird-zones-production-v1";
  material.needsUpdate = true;
}

export function cloneColorBirdMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  colors: ColorBirdMaterialColors,
  zoneMap: Three.Texture,
  maxAnisotropy = 1
) {
  const materials: Three.Material[] = [];
  root.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    addColorBirdSemanticAttributes(child.geometry, THREE);
    const originals = Array.isArray(child.material) ? child.material : [child.material];
    const clones = originals.map((original) => {
      const clone = original.clone();
      if (clone instanceof THREE.MeshStandardMaterial) {
        clone.metalness = 0;
        clone.roughness = 0.94;
        clone.envMapIntensity = 0.16;
        clone.metalnessMap = null;
        clone.roughnessMap = null;
        if (clone.map) {
          clone.map.generateMipmaps = false;
          clone.map.minFilter = THREE.LinearFilter;
          clone.map.magFilter = THREE.LinearFilter;
          clone.map.anisotropy = Math.min(4, maxAnisotropy);
          clone.map.needsUpdate = true;
        }
      }
      colorizeColorBirdZones(clone, colors, zoneMap);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}
