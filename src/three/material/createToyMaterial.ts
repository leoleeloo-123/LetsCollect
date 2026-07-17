import type * as Three from "three";
import { getToyPalette } from "../../features/toys/catalog";
import type { Collectible } from "../../types/toy";
import { createJadeMaterial } from "./createJadeMaterial";
import {
  createPrototypeMaterial,
  type MaterialPrototypeId
} from "./materialPrototypes";

type ThreeRuntime = typeof import("three");

type ToyMaterialOptions = {
  lightweight?: boolean;
};

export type ToyMaterialResult = {
  material: Three.MeshPhysicalMaterial;
  glowColor: Three.Color;
  attenuationColor: Three.Color;
};

export function getCollectibleRenderTraits(toy: Collectible) {
  if (toy.materialId === "jade") {
    return {
      hydration: toy.appearance.hydration / 100,
      luster: toy.appearance.luster / 100,
      glow: toy.appearance.glow / 100
    };
  }

  return {
    hydration: toy.materialTraits.finish / 100,
    luster: toy.materialTraits.brilliance / 100,
    glow: toy.materialTraits.brilliance / 100
  };
}

export function createToyMaterial(
  THREE: ThreeRuntime,
  toy: Collectible,
  options: ToyMaterialOptions = {}
): ToyMaterialResult {
  if (toy.materialId === "jade") {
    return createJadeMaterial(THREE, toy, options);
  }

  const palette = getToyPalette(toy.paletteId);
  const material = createPrototypeMaterial(
    THREE,
    toy.materialId as MaterialPrototypeId,
    {
      tint: palette.color,
      traits: toy.materialTraits,
      seed: toy.appearanceSeed,
      lightweight: options.lightweight
    }
  );

  return {
    material,
    glowColor: new THREE.Color(palette.glow),
    attenuationColor: material.attenuationColor.clone()
  };
}
