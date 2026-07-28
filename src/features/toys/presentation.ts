import type { Collectible, MaterialTraits } from "../../types/toy";
import {
  colorAnimalsSeries,
  isColorAnimalCollectible,
  isSpecialExhibitCollectible,
  specialExhibitsSeries
} from "./activeSeries";
import { getToyMaterial } from "./materialCatalog";

export function getCollectibleMaterialLabel(toy: Collectible) {
  if (isSpecialExhibitCollectible(toy)) return specialExhibitsSeries.materialLabel;
  return isColorAnimalCollectible(toy)
    ? colorAnimalsSeries.materialLabel
    : getToyMaterial(toy.materialId).name;
}

export function getCollectibleMaterialDescription(toy: Collectible) {
  if (isSpecialExhibitCollectible(toy)) {
    return "高折射率切面水晶拥有清晰轮廓、通透晶体与明亮火彩；默认抽取使用五种水晶色，主题系列也可以显式指定九种常规配色。";
  }
  if (toy.modelId === "color-cat") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于毛线球，猫咪本体、五官、耳朵、爪子与腮红继续保留原色。";
  }
  if (toy.modelId === "color-otter") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于棒棒糖，水獭身体、五官与腮红继续保留原色。";
  }
  if (toy.modelId === "color-bear-singer") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于爆炸头，小熊五官、服装与舞台配件继续保留原色。";
  }
  if (toy.modelId === "color-dog-camera") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于帽子和包包，狗狗、五官与相机继续保留原色。";
  }
  if (toy.modelId === "color-dog-drum") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于鼓面与鼓身，狗狗主体和其他细节继续保留原色。";
  }
  if (toy.modelId === "color-seal") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于海星，海豹身体、五官与尾部继续保留原色。";
  }
  if (toy.modelId === "color-karpy") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于帽子，卡皮身体、白色衣服、五官、爪子与腮红继续保留原色。";
  }
  if (toy.modelId === "color-koala") {
    return "柔雾树脂保持低反光、柔和触感；换色只作用于睡帽帽身，考拉身体、五官、帽顶绒球、树枝与叶片继续保留原色。";
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
  if (isSpecialExhibitCollectible(toy)) return "晶体配色";
  if (toy.modelId === "color-cat") return "毛线球配色";
  if (toy.modelId === "color-otter") return "棒棒糖配色";
  if (toy.modelId === "color-bunny") return "包包配色";
  if (toy.modelId === "color-panda") return "帽子配色";
  if (toy.modelId === "color-bear-singer") return "爆炸头配色";
  if (toy.modelId === "color-dog-camera") return "帽子与包包配色";
  if (toy.modelId === "color-dog-drum") return "鼓面配色";
  if (toy.modelId === "color-seal") return "海星配色";
  if (toy.modelId === "color-karpy") return "帽子配色";
  if (toy.modelId === "color-koala") return "帽子配色";
  return "主体配色";
}

export function getCollectibleTraitLabels(
  toy: Collectible
): Record<keyof MaterialTraits, string> {
  if (isSpecialExhibitCollectible(toy)) return specialExhibitsSeries.traitLabels;
  return isColorAnimalCollectible(toy)
    ? colorAnimalsSeries.traitLabels
    : getToyMaterial(toy.materialId).traitLabels;
}
