import type * as Three from "three";
import {
  getToySurfaceStyle,
  type ToySurfaceRenderProfile
} from "../../features/toys/surfaceStyles";
import type { ToySurfaceStyleId } from "../../types/toy";

type ThreeRuntime = typeof import("three");

export type ToySurfaceCoverage =
  | {
      kind: "shader-mask";
      expression: string;
    }
  | {
      kind: "full-material";
      materialName?: string;
    };

function applyMaskedMetalSurface(
  material: Three.MeshStandardMaterial,
  expression: string,
  styleId: ToySurfaceStyleId,
  profile: ToySurfaceRenderProfile
) {
  const style = getToySurfaceStyle(styleId);
  const render = style.render[profile];
  const previousOnBeforeCompile = material.onBeforeCompile;
  const previousProgramCacheKey = material.customProgramCacheKey.bind(material);

  material.onBeforeCompile = (shader, renderer) => {
    previousOnBeforeCompile(shader, renderer);
    shader.uniforms.toySurfaceMetalness = { value: render.metalness };
    shader.uniforms.toySurfaceRoughness = { value: render.roughness };
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float toySurfaceMetalness;
uniform float toySurfaceRoughness;`
      )
      .replace(
        "void main() {",
        `void main() {
  float toySurfaceMask = 0.0;`
      )
      .replace(
        "diffuseColor *= sampledDiffuseColor;",
        `toySurfaceMask = clamp(${expression}, 0.0, 1.0);
  diffuseColor *= sampledDiffuseColor;`
      )
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, toySurfaceRoughness, toySurfaceMask);`
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
metalnessFactor = mix(metalnessFactor, toySurfaceMetalness, toySurfaceMask);`
      );
  };
  material.customProgramCacheKey = () =>
    `${previousProgramCacheKey()}|surface:${styleId}:${profile}:${expression}`;
  material.envMapIntensity = Math.max(
    material.envMapIntensity,
    render.envMapIntensity
  );
  material.needsUpdate = true;
}

function applyFullMetalSurface(
  THREE: ThreeRuntime,
  material: Three.Material,
  styleId: ToySurfaceStyleId,
  profile: ToySurfaceRenderProfile
) {
  if (!(material instanceof THREE.MeshStandardMaterial)) return;
  const style = getToySurfaceStyle(styleId);
  const render = style.render[profile];
  material.metalness = render.metalness;
  material.roughness = render.roughness;
  material.envMapIntensity = Math.max(
    material.envMapIntensity,
    render.envMapIntensity
  );
  material.metalnessMap = null;
  material.roughnessMap = null;
  material.needsUpdate = true;
}

export function applyToySurfaceStyle(
  THREE: ThreeRuntime,
  materials: Three.Material[],
  styleId: ToySurfaceStyleId | undefined,
  profile: ToySurfaceRenderProfile,
  coverage: ToySurfaceCoverage
) {
  const style = getToySurfaceStyle(styleId);
  if (style.kind === "matte") return;

  materials.forEach((material) => {
    if (!(material instanceof THREE.MeshStandardMaterial)) return;
    if (
      coverage.kind === "full-material"
      && coverage.materialName
      && material.name !== coverage.materialName
    ) {
      return;
    }

    if (coverage.kind === "shader-mask") {
      applyMaskedMetalSurface(
        material,
        coverage.expression,
        style.id,
        profile
      );
      return;
    }

    applyFullMetalSurface(THREE, material, style.id, profile);
  });
}
