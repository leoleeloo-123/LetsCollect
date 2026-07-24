import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorBearSingerDebugMode = { value: number };

export function prepareColorBearSingerMaskTexture(
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

function colorizeBearSingerAfro(
  material: Three.Material,
  afroColor: Three.Color,
  afroMask: Three.Texture,
  debugMode: ColorBearSingerDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.bearSingerAfroColor = { value: afroColor };
    shader.uniforms.bearSingerAfroMask = { value: afroMask };
    shader.uniforms.bearSingerDebugMode = debugMode;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>
varying vec3 vBearSingerObjectPosition;`)
      .replace("#include <begin_vertex>", `#include <begin_vertex>
vBearSingerObjectPosition = position;`);
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 bearSingerAfroColor;
uniform sampler2D bearSingerAfroMask;
uniform float bearSingerDebugMode;
varying vec3 vBearSingerObjectPosition;
float bearSingerSurfaceRepair = 0.0;

float bearSingerRange(float value, float lower, float upper, float feather) {
  return smoothstep(lower - feather, lower + feather, value)
    * (1.0 - smoothstep(upper - feather, upper + feather, value));
}`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;

  float curlCandidate = smoothstep(
    0.48,
    0.82,
    texture2D(bearSingerAfroMask, vMapUv).r
  );
  float frontHairFactor = smoothstep(
    0.02,
    0.08,
    vBearSingerObjectPosition.z
  );
  float hairBoundary = mix(0.12, 0.414, frontHairFactor);
  float topHairGate = smoothstep(
    hairBoundary,
    hairBoundary + 0.014,
    vBearSingerObjectPosition.y
  );
  float afroDetail = curlCandidate * topHairGate;

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float curlShading = mix(0.52, 1.08, smoothstep(0.015, 0.34, baseLuma));
  vec3 colorizedAfro = bearSingerAfroColor * curlShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedAfro, afroDetail);

  vec3 debugBase = vec3(baseLuma * 0.46);
  vec3 debugColor = mix(debugBase, vec3(0.10, 0.35, 0.94), afroDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, bearSingerDebugMode);

  float foreheadCenterRepair =
    bearSingerRange(vBearSingerObjectPosition.x, -0.082, -0.028, 0.006)
    * bearSingerRange(vBearSingerObjectPosition.y, 0.225, 0.415, 0.006)
    * bearSingerRange(vBearSingerObjectPosition.z, 0.335, 0.452, 0.008);
  float foreheadSideRepair =
    bearSingerRange(vBearSingerObjectPosition.x, -0.205, -0.120, 0.006)
    * bearSingerRange(vBearSingerObjectPosition.y, 0.382, 0.423, 0.004)
    * bearSingerRange(vBearSingerObjectPosition.z, 0.292, 0.352, 0.006);
  float leftEarRepair =
    bearSingerRange(vBearSingerObjectPosition.x, -0.625, -0.520, 0.008)
    * bearSingerRange(vBearSingerObjectPosition.y, 0.365, 0.435, 0.006)
    * bearSingerRange(vBearSingerObjectPosition.z, 0.080, 0.175, 0.008);
  float rightEarRepair =
    bearSingerRange(vBearSingerObjectPosition.x, 0.465, 0.550, 0.008)
    * bearSingerRange(vBearSingerObjectPosition.y, 0.365, 0.430, 0.006)
    * bearSingerRange(vBearSingerObjectPosition.z, 0.075, 0.170, 0.008);
  float explicitRepair = max(
    max(foreheadCenterRepair, foreheadSideRepair),
    max(leftEarRepair, rightEarRepair)
  ) * step(0.001, curlCandidate);
  float escapedCurlRepair = curlCandidate
    * (1.0 - topHairGate)
    * smoothstep(0.18, 0.24, vBearSingerObjectPosition.y)
    * smoothstep(0.02, 0.08, vBearSingerObjectPosition.z);
  bearSingerSurfaceRepair = max(explicitRepair, escapedCurlRepair);

  diffuseColor *= sampledDiffuseColor;
#endif`)
      .replace("#include <opaque_fragment>", `
  vec3 cleanSkinColor = texture2D(map, vec2(0.9005, 0.6822)).rgb;
  vec3 repairedSkinLight = cleanSkinColor * 0.96 + vec3(0.035, 0.025, 0.012);
  outgoingLight = mix(
    outgoingLight,
    max(outgoingLight, repairedSkinLight),
    bearSingerSurfaceRepair
  );
  outgoingLight = mix(
    outgoingLight,
    vec3(0.95, 0.08, 0.03),
    bearSingerSurfaceRepair * bearSingerDebugMode
  );
  #include <opaque_fragment>`);
  };
  material.customProgramCacheKey = () => "color-bear-singer-afro-v14";
  material.needsUpdate = true;
}

export function cloneColorBearSingerMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  afroColor: Three.Color,
  afroMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorBearSingerDebugMode = { value: 0 }
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
      colorizeBearSingerAfro(clone, afroColor, afroMask, debugMode);
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });
  return materials;
}