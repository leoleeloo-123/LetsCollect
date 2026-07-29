import type * as Three from "three";
import { drawableMaterials } from "../../features/toys/materialCatalog";
import type { MaterialTraits, ToyMaterialId } from "../../types/toy";

type ThreeRuntime = typeof import("three");

export const materialPrototypeIds = [
  "plastic",
  "glass",
  "wood",
  "iron",
  "copper",
  "silver",
  "gold",
  "crystal"
] as const;

export type MaterialPrototypeId = ToyMaterialId;

export const materialPrototypes = drawableMaterials.map(({ id, name, swatch, fidelity }) => ({
  id: id as MaterialPrototypeId,
  name,
  swatch,
  fidelity
}));

type PrototypeMaterialOptions = {
  tint?: string;
  attenuation?: string;
  emissive?: string;
  traits?: MaterialTraits;
  seed?: number;
  lightweight?: boolean;
};

const neutralTraits: MaterialTraits = {
  craftsmanship: 50,
  finish: 50,
  purity: 50,
  character: 50,
  brilliance: 50
};

function addProceduralWoodGrain(
  material: Three.MeshPhysicalMaterial,
  seed: number,
  character: number
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.woodOffset = { value: ((seed >>> 0) % 997) / 158.68 };
    shader.uniforms.woodScale = { value: 8 + character * 0.1 };
    shader.uniforms.woodContrast = { value: 0.22 + character * 0.004 };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vObjectPosition;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvObjectPosition = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vObjectPosition;\nuniform float woodOffset;\nuniform float woodScale;\nuniform float woodContrast;"
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float grainWarp = sin(vObjectPosition.y * 5.0 + vObjectPosition.x * 2.4 + woodOffset) * 0.48;
        float grainRings = sin((length(vObjectPosition.xz) + vObjectPosition.y * 0.32) * woodScale + grainWarp);
        float fineGrain = sin(vObjectPosition.y * woodScale * 2.7 + vObjectPosition.z * 9.0 + woodOffset);
        float grain = smoothstep(-woodContrast, woodContrast, grainRings + fineGrain * 0.2);
        diffuseColor.rgb *= mix(vec3(0.56, 0.32, 0.17), vec3(1.18, 0.84, 0.52), grain);`
      );
  };
  material.customProgramCacheKey = () => "material-wood-v2";
}

function getMaterialColor(THREE: ThreeRuntime, value: number | string) {
  return new THREE.Color(value);
}

export function createPrototypeMaterial(
  THREE: ThreeRuntime,
  id: MaterialPrototypeId,
  options: PrototypeMaterialOptions = {}
): Three.MeshPhysicalMaterial {
  const traits = options.traits ?? neutralTraits;
  const finish = traits.finish / 100;
  const purity = traits.purity / 100;
  const character = traits.character / 100;
  const brilliance = traits.brilliance / 100;
  const tint = options.tint ?? "#ef6f86";

  if (id === "plastic") {
    return new THREE.MeshPhysicalMaterial({
      color: tint,
      roughness: THREE.MathUtils.lerp(0.58, 0.18, finish),
      metalness: 0,
      transmission: THREE.MathUtils.lerp(0.02, options.lightweight ? 0.12 : 0.24, purity),
      thickness: 1.1,
      ior: 1.46,
      clearcoat: 0.35 + brilliance * 0.55,
      clearcoatRoughness: THREE.MathUtils.lerp(0.3, 0.08, finish),
      envMapIntensity: 0.72 + brilliance * 0.38
    });
  }

  if (id === "wood") {
    const woodColor = getMaterialColor(THREE, 0xb8733f);
    woodColor.offsetHSL((character - 0.5) * 0.035, 0, (traits.purity - 50) * 0.0015);
    const material = new THREE.MeshPhysicalMaterial({
      color: woodColor,
      roughness: THREE.MathUtils.lerp(0.76, 0.4, finish),
      metalness: 0,
      clearcoat: brilliance * 0.2,
      clearcoatRoughness: 0.48,
      envMapIntensity: 0.46 + brilliance * 0.2
    });
    addProceduralWoodGrain(material, options.seed ?? 0, traits.character);
    return material;
  }

  if (id === "iron") {
    const ironColor = getMaterialColor(THREE, 0x555c5f);
    ironColor.lerp(getMaterialColor(THREE, 0x35413d), character * 0.22);
    return new THREE.MeshPhysicalMaterial({
      color: ironColor,
      roughness: THREE.MathUtils.lerp(0.72, 0.3, finish),
      metalness: 0.92,
      clearcoat: brilliance * 0.12,
      envMapIntensity: 1.05 + brilliance * 0.38
    });
  }

  if (id === "copper") {
    const copperColor = getMaterialColor(THREE, 0xb66a3c);
    copperColor.lerp(getMaterialColor(THREE, 0x527c6c), character * 0.2);
    return new THREE.MeshPhysicalMaterial({
      color: copperColor,
      roughness: THREE.MathUtils.lerp(0.56, 0.17, finish),
      metalness: 0.94,
      clearcoat: brilliance * 0.18,
      envMapIntensity: 1.15 + brilliance * 0.42
    });
  }

  if (id === "silver") {
    return new THREE.MeshPhysicalMaterial({
      color: 0xc8d0d2,
      roughness: THREE.MathUtils.lerp(0.48, 0.08, finish),
      metalness: 0.98,
      clearcoat: brilliance * 0.16,
      envMapIntensity: 1.28 + brilliance * 0.55
    });
  }

  if (id === "gold") {
    const goldColor = getMaterialColor(THREE, 0xd8a72d);
    goldColor.offsetHSL((character - 0.5) * 0.025, 0.04, (purity - 0.5) * 0.08);
    return new THREE.MeshPhysicalMaterial({
      color: goldColor,
      roughness: THREE.MathUtils.lerp(0.46, 0.08, finish),
      metalness: 0.96,
      clearcoat: brilliance * 0.2,
      envMapIntensity: 1.3 + brilliance * 0.56
    });
  }

  if (id === "glass") {
    const glassColor = getMaterialColor(THREE, 0xc8edf4);
    return new THREE.MeshPhysicalMaterial({
      color: glassColor,
      roughness: THREE.MathUtils.lerp(0.12, 0.035, finish),
      metalness: 0,
      transmission: THREE.MathUtils.lerp(options.lightweight ? 0.78 : 0.84, 0.92, purity),
      thickness: 0.72 + purity * 0.58,
      ior: 1.48,
      dispersion: 0,
      attenuationColor: getMaterialColor(THREE, 0x78c9d8),
      attenuationDistance: 1.45 + purity * 1.8,
      clearcoat: 1,
      clearcoatRoughness: 0.04,
      envMapIntensity: 1.45 + brilliance * 0.55,
      specularIntensity: 1
    });
  }

  const crystalColor = getMaterialColor(THREE, tint);
  crystalColor.offsetHSL(0, -0.12 + character * 0.15, 0.16 - character * 0.2);
  const crystalAttenuation = getMaterialColor(THREE, options.attenuation ?? tint);
  crystalAttenuation.offsetHSL(0, -0.04 + character * 0.06, 0.08 - character * 0.1);
  return new THREE.MeshPhysicalMaterial({
    color: crystalColor,
    roughness: THREE.MathUtils.lerp(options.lightweight ? 0.14 : 0.11, 0.045, finish),
    metalness: 0,
    transmission: 0.8 + purity * 0.15,
    thickness: 3.4 + finish * 2,
    ior: 1.49,
    transparent: true,
    opacity: 0.76 - purity * 0.12,
    attenuationColor: crystalAttenuation,
    attenuationDistance: 2 + purity * 2.1,
    emissive: getMaterialColor(THREE, options.emissive ?? options.attenuation ?? tint),
    emissiveIntensity: 0.055 + brilliance * 0.04,
    clearcoat: 0.82 + brilliance * 0.18,
    clearcoatRoughness: 0.07 - brilliance * 0.045,
    envMapIntensity: (options.lightweight ? 0.9 : 1.25) + brilliance * 0.5,
    specularIntensity: 0.82 + brilliance * 0.18
  });
}
