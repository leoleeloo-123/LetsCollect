import type {
  Collectible,
  MaterialTraits,
  RarityCode,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";
import {
  colorAnimalModels,
  colorAnimalPalettes,
  diamondUnicornPalettes,
  specialExhibitModels
} from "./catalog";

export const COLOR_ANIMALS_GENERATION_VERSION = 3;

export const colorAnimalsSeries = {
  id: "series_color_animals",
  name: "色彩系列",
  materialId: "plastic",
  materialLabel: "柔雾树脂",
  modelIds: colorAnimalModels.map((model) => model.id) as readonly ToyModelId[],
  drawModelIds: colorAnimalModels.map((model) => model.id) as readonly ToyModelId[],
  paletteIds: colorAnimalPalettes.map((palette) => palette.id) as readonly ToyPaletteId[],
  traitLabels: {
    craftsmanship: "造型完整度",
    finish: "柔雾触感",
    purity: "细节保护度",
    character: "配色表现",
    brilliance: "柔和光感"
  } satisfies Record<keyof MaterialTraits, string>
} as const;

export const specialExhibitsSeries = {
  id: "series_special_exhibits",
  name: "水晶系列",
  materialId: "crystal",
  materialLabel: "切面水晶",
  drawProbability: 0,
  modelIds: specialExhibitModels.map((model) => model.id) as readonly ToyModelId[],
  drawModelIds: specialExhibitModels.map((model) => model.id) as readonly ToyModelId[],
  paletteIds: diamondUnicornPalettes.map((palette) => palette.id) as readonly ToyPaletteId[],
  explicitPaletteIds: [
    ...diamondUnicornPalettes.map((palette) => palette.id),
    ...colorAnimalPalettes.map((palette) => palette.id)
  ] as readonly ToyPaletteId[],
  traitLabels: {
    craftsmanship: "切面工艺",
    finish: "抛光精度",
    purity: "晶体净度",
    character: "钻石色泽",
    brilliance: "火彩表现"
  } satisfies Record<keyof MaterialTraits, string>
} as const;

export function isColorAnimalCollectible(toy: Collectible) {
  return toy.generationVersion >= COLOR_ANIMALS_GENERATION_VERSION
    && toy.seriesId === colorAnimalsSeries.id
    && colorAnimalsSeries.modelIds.includes(toy.modelId);
}

export function isSpecialExhibitCollectible(toy: Collectible) {
  return toy.generationVersion >= COLOR_ANIMALS_GENERATION_VERSION
    && toy.seriesId === specialExhibitsSeries.id
    && specialExhibitsSeries.modelIds.includes(toy.modelId);
}

export function isActiveCollectible(toy: Collectible) {
  return isColorAnimalCollectible(toy) || isSpecialExhibitCollectible(toy);
}

export function getSpecialExhibitGrade() {
  return "馆藏级水晶";
}
export function getColorAnimalGrade(rarity: RarityCode) {
  if (rarity === "mythic") return "梦幻配色";
  if (rarity === "legendary") return "限定配色";
  if (rarity === "epic") return "典藏配色";
  if (rarity === "rare") return "精选配色";
  return "日常配色";
}
