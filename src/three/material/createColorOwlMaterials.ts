import type * as Three from "three";

type ThreeRuntime = typeof import("three");

export type ColorOwlDebugMode = { value: number };

export function prepareColorOwlMaskTexture(
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

function colorizeColorOwlAcademicPieces(
  material: Three.Material,
  academicColor: Three.Color,
  academicMask: Three.Texture,
  debugMode: ColorOwlDebugMode
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.owlAcademicColor = { value: academicColor };
    shader.uniforms.owlAcademicMask = { value: academicMask };
    shader.uniforms.owlDebugMode = debugMode;
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>
uniform vec3 owlAcademicColor;
uniform sampler2D owlAcademicMask;
uniform float owlDebugMode;`)
      .replace("#include <map_fragment>", `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture2D(map, vMapUv);
  vec3 originalDiffuseColor = sampledDiffuseColor.rgb;
  float maskValue = texture2D(owlAcademicMask, vMapUv).r;
  float academicDetail = smoothstep(0.01, 0.14, maskValue);

  float baseLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  float academicShading = mix(0.46, 1.10, smoothstep(0.04, 0.86, baseLuma));
  vec3 colorizedAcademic = owlAcademicColor * academicShading;
  vec3 resultColor = mix(originalDiffuseColor, colorizedAcademic, academicDetail);

  float debugLuma = dot(originalDiffuseColor, vec3(0.2126, 0.7152, 0.0722));
  vec3 debugBase = vec3(debugLuma * 0.40);
  vec3 debugColor = mix(debugBase, vec3(0.10, 0.39, 0.98), academicDetail);
  sampledDiffuseColor.rgb = mix(resultColor, debugColor, owlDebugMode);
  diffuseColor *= sampledDiffuseColor;
#endif`);
  };
  material.customProgramCacheKey = () => "color-owl-academic-v1";
  material.needsUpdate = true;
}

export function cloneColorOwlMaterials(
  THREE: ThreeRuntime,
  root: Three.Object3D,
  academicColor: Three.Color,
  academicMask: Three.Texture,
  maxAnisotropy = 1,
  debugMode: ColorOwlDebugMode = { value: 0 }
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
      colorizeColorOwlAcademicPieces(
        clone,
        academicColor,
        academicMask,
        debugMode
      );
      materials.push(clone);
      return clone;
    });
    child.material = Array.isArray(child.material) ? clones : clones[0];
  });
  return materials;
}
