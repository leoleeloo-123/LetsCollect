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

function applyPlushSurface(
  material: Three.MeshStandardMaterial,
  expression: string,
  fullCoverage: boolean,
  styleId: ToySurfaceStyleId,
  profile: ToySurfaceRenderProfile
) {
  const style = getToySurfaceStyle(styleId);
  const render = style.render[profile];
  const previousOnBeforeCompile = material.onBeforeCompile;
  const previousProgramCacheKey = material.customProgramCacheKey.bind(material);
  const fiberScale = render.fiberScale ?? 100;
  const fuzzStrength = render.fuzzStrength ?? 0.08;
  const rimStrength = render.rimStrength ?? 0.15;

  material.onBeforeCompile = (shader, renderer) => {
    previousOnBeforeCompile(shader, renderer);
    shader.uniforms.toyPlushFiberScale = { value: fiberScale };
    shader.uniforms.toyPlushFuzzStrength = { value: fuzzStrength };
    shader.uniforms.toyPlushRimStrength = { value: rimStrength };
    shader.uniforms.toySurfaceMetalness = { value: render.metalness };
    shader.uniforms.toySurfaceRoughness = { value: render.roughness };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
varying vec3 vToySurfacePosition;`
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vToySurfacePosition = position;`
      );

    let fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float toyPlushFiberScale;
uniform float toyPlushFuzzStrength;
uniform float toyPlushRimStrength;
uniform float toySurfaceMetalness;
uniform float toySurfaceRoughness;
varying vec3 vToySurfacePosition;`
      )
      .replace(
        "void main() {",
        `void main() {
  float toySurfaceMask = ${fullCoverage ? "1.0" : "0.0"};`
      );

    if (!fullCoverage) {
      fragmentShader = fragmentShader.replace(
        "diffuseColor *= sampledDiffuseColor;",
        `toySurfaceMask = clamp(${expression}, 0.0, 1.0);
  diffuseColor *= sampledDiffuseColor;`
      );
    }

    shader.fragmentShader = fragmentShader
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, toySurfaceRoughness, toySurfaceMask);`
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
metalnessFactor = mix(metalnessFactor, toySurfaceMetalness, toySurfaceMask);`
      )
      .replace(
        "#include <opaque_fragment>",
        `vec3 toyPlushPoint = vToySurfacePosition * toyPlushFiberScale;
float toyPlushNoise = sin(dot(toyPlushPoint, vec3(0.71, 1.13, 1.57)))
  * sin(dot(toyPlushPoint, vec3(1.31, 0.83, 1.91)));
float toyPlushRim = pow(
  1.0 - abs(dot(normalize(normal), normalize(vViewPosition))),
  2.4
);
vec3 toyPlushLight = outgoingLight * (
  1.0 + toyPlushNoise * toyPlushFuzzStrength
);
toyPlushLight += diffuseColor.rgb * toyPlushRim * toyPlushRimStrength;
outgoingLight = mix(outgoingLight, toyPlushLight, toySurfaceMask);
#include <opaque_fragment>`
      );
  };
  material.customProgramCacheKey = () =>
    `${previousProgramCacheKey()}|surface:${styleId}:${profile}:${expression}`;
  if (fullCoverage) {
    material.envMapIntensity = Math.min(
      material.envMapIntensity,
      render.envMapIntensity
    );
  }
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

    if (style.kind === "plush") {
      applyPlushSurface(
        material,
        coverage.kind === "shader-mask" ? coverage.expression : "1.0",
        coverage.kind === "full-material",
        style.id,
        profile
      );
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
