import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorGuineaPigDebugMode = { value: number };

export function prepareColorGuineaPigMaskTexture(
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

function colorizeGuineaPigBalloons(
  material: Three.Material,
  balloonColor: Three.Color,
  balloonMask: Three.Texture,
  debugMode: ColorGuineaPigDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.guineaBalloonColor = { value: balloonColor };
    shader.uniforms.guineaBalloonMask = { value: balloonMask };
    shader.uniforms.guineaDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
attribute float guineaBalloonZone;
varying float vGuineaBalloonZone;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vGuineaBalloonZone = guineaBalloonZone;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 guineaBalloonColor;
uniform sampler2D guineaBalloonMask;
uniform float guineaDebugMode;
varying float vGuineaBalloonZone;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  vec3 zoneMask = texture2D(guineaBalloonMask, vMapUv).rgb;
  float maskCoverage = smoothstep(
    0.005,
    0.12,
    max(zoneMask.r, max(zoneMask.g, zoneMask.b))
  );
  float authoredPinkSignal = min(
    smoothstep(0.06, 0.24, originalDiffuseColor.r - originalDiffuseColor.g),
    smoothstep(0.005, 0.08, originalDiffuseColor.b - originalDiffuseColor.g)
  ) * smoothstep(0.16, 0.48, originalDiffuseColor.r);
  float authoredPink = smoothstep(0.03, 0.28, authoredPinkSignal);
  maskCoverage = max(maskCoverage, authoredPink);
  float leftWeight = (1.0 - smoothstep(0.18, 0.48, abs(vGuineaBalloonZone - 1.0))) * maskCoverage;
  float centerWeight = (1.0 - smoothstep(0.18, 0.48, abs(vGuineaBalloonZone - 2.0))) * maskCoverage;
  float rightWeight = (1.0 - smoothstep(0.18, 0.48, abs(vGuineaBalloonZone - 3.0))) * maskCoverage;
  float balloonWeight = max(leftWeight, max(centerWeight, rightWeight));

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float balloonShading = mix(0.54, 1.16, smoothstep(0.05, 0.91, baseLuma));
  vec3 colorizedBalloon = guineaBalloonColor * balloonShading;
  colorizedBalloon = mix(
    colorizedBalloon,
    vec3(1.0),
    smoothstep(0.91, 0.995, baseLuma) * 0.34
  );
  vec3 resultColor = mix(originalDiffuseColor, colorizedBalloon, balloonWeight);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.32);
  vec3 debugZones = vec3(0.96, 0.22, 0.42);
  vec3 debugColor = mix(debugBase, debugZones, balloonWeight);
  float zoneDebug = step(0.5, guineaDebugMode);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, zoneDebug);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-guinea-pig-shared-balloon-v10";
  material.needsUpdate = true;
}

export function cloneColorGuineaPigMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  balloonColor: Three.Color,
  balloonMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorGuineaPigDebugMode = { value: 0 }
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
      colorizeGuineaPigBalloons(
        clone,
        balloonColor,
        balloonMask,
        debugMode
      );
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}