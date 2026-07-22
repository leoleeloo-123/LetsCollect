import type { Collectible, MaterialTraits } from "../../types/toy";
import { colorAnimalsSeries, isColorAnimalCollectible } from "./activeSeries";
import { getToyMaterial } from "./materialCatalog";

export function getCollectibleMaterialLabel(toy: Collectible) {
  return isColorAnimalCollectible(toy)
    ? colorAnimalsSeries.materialLabel
    : getToyMaterial(toy.materialId).name;
}

export function getCollectibleMaterialDescription(toy: Collectible) {
  if (toy.modelId === "color-otter") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于棒棒糖，水獭身体、五官与腮红继续保留原色。";
  }
  if (isColorAnimalCollectible(toy)) {
    return "柔雾树脂保持低反光、柔和触感；模型只改变已验证的着色区域，五官与角色细节继续保留。";
  }
  const material = getToyMaterial(toy.materialId);
  return toy.materialId === "jade"
    ? "果冻玉材质会随着观察角度呈现不同的透光与色泽。"
    : `${material.name}材质会随着观察角度呈现不同的表面细节与反射。`;
}

export function getCollectiblePaletteLabel(toy: Collectible) {
  if (toy.modelId === "color-otter") return "棒棒糖配色";
  if (toy.modelId === "color-bunny") return "包包配色";
  if (toy.modelId === "color-panda") return "帽子配色";
  return "主体配色";
}

export function getCollectibleTraitLabels(
  toy: Collectible
): Record<keyof MaterialTraits, string> {
  return isColorAnimalCollectible(toy)
    ? colorAnimalsSeries.traitLabels
    : getToyMaterial(toy.materialId).traitLabels;
}
