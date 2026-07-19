import type { Collectible, MaterialTraits } from "../../types/toy";
import { colorAnimalsSeries, isColorAnimalCollectible } from "./activeSeries";
import { getToyMaterial } from "./materialCatalog";

export function getCollectibleMaterialLabel(toy: Collectible) {
  return isColorAnimalCollectible(toy)
    ? colorAnimalsSeries.materialLabel
    : getToyMaterial(toy.materialId).name;
}

export function getCollectibleMaterialDescription(toy: Collectible) {
  if (isColorAnimalCollectible(toy)) {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于身体，五官与粉色细节继续保留。";
  }
  const material = getToyMaterial(toy.materialId);
  return toy.materialId === "jade"
    ? "果冻玉材质会随着观察角度呈现不同的透光与色泽。"
    : `${material.name}材质会随着观察角度呈现不同的表面细节与反射。`;
}

export function getCollectibleTraitLabels(
  toy: Collectible
): Record<keyof MaterialTraits, string> {
  return isColorAnimalCollectible(toy)
    ? colorAnimalsSeries.traitLabels
    : getToyMaterial(toy.materialId).traitLabels;
}
