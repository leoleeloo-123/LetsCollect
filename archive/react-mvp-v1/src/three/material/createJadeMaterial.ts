import type * as Three from "three";
import { getToyPalette } from "../../features/toys/catalog";
import { getAppearanceVariation } from "../../features/toys/generator";
import type { Collectible } from "../../types/toy";

type ThreeRuntime = typeof import("three");

type JadeMaterialOptions = {
  lightweight?: boolean;
};

export type JadeMaterialResult = {
  material: Three.MeshPhysicalMaterial;
  glowColor: Three.Color;
  attenuationColor: Three.Color;
};

/**
 * Maps the collectible's stable five-dimensional appearance vector to the
 * single physical jade material used by both live 3D and cached thumbnails.
 */
export function createJadeMaterial(
  THREE: ThreeRuntime,
  toy: Collectible,
  { lightweight = false }: JadeMaterialOptions = {}
): JadeMaterialResult {
  const palette = getToyPalette(toy.paletteId);
  const variation = getAppearanceVariation(toy.appearanceSeed);
  const transparency = toy.appearance.transparency / 100;
  const colorDepth = toy.appearance.colorDepth / 100;
  const hydration = toy.appearance.hydration / 100;
  const luster = toy.appearance.luster / 100;
  const glow = toy.appearance.glow / 100;
  const bodyColor = new THREE.Color(palette.color);
  bodyColor.offsetHSL(variation.hueShift, -0.12 + colorDepth * 0.15, 0.16 - colorDepth * 0.2);
  const attenuationColor = new THREE.Color(palette.attenuation);
  attenuationColor.offsetHSL(
    variation.hueShift * 0.6,
    -0.04 + colorDepth * 0.06,
    0.08 - colorDepth * 0.1
  );

  const material = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    roughness: THREE.MathUtils.clamp(
      (lightweight ? 0.22 : 0.18) - hydration * 0.08 - luster * 0.05,
      0.045,
      0.2
    ),
    metalness: 0,
    transmission: (lightweight ? 0.38 : 0.46) + transparency * (lightweight ? 0.32 : 0.4),
    thickness: 2.6 + hydration * 2.3,
    ior: 1.43 + transparency * 0.08,
    transparent: false,
    opacity: 1,
    clearcoat: 0.72 + luster * 0.28,
    clearcoatRoughness: 0.1 - luster * 0.075,
    attenuationColor,
    attenuationDistance:
      (1.1 + transparency * 2.6 + hydration * 0.8) * variation.attenuationScale,
    emissive: new THREE.Color(palette.emissive),
    emissiveIntensity: 0.012 + glow * 0.075,
    specularIntensity: (0.72 + luster * 0.28) * variation.glossScale,
    envMapIntensity: (lightweight ? 0.5 : 0.95) + luster * 0.5
  });

  return {
    material,
    glowColor: new THREE.Color(palette.glow),
    attenuationColor
  };
}
