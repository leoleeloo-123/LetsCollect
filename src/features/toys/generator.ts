import type {
  AppearanceVector,
  Collectible,
  MaterialTraits,
  RarityCode,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";
import {
  colorAnimalPalettes,
  diamondUnicornPalettes,
  getToyModel,
  getToyPalette,
  getToyRenderingAssetKey
} from "./catalog";
import {
  COLOR_ANIMALS_GENERATION_VERSION,
  colorAnimalsSeries,
  getColorAnimalGrade,
  getSpecialExhibitGrade,
  specialExhibitsSeries
} from "./activeSeries";
import { materialTraitWeights } from "./materialCatalog";

export const GENERATION_VERSION = COLOR_ANIMALS_GENERATION_VERSION;

type GenerateCollectibleOptions = {
  seed?: number;
  id?: string;
  publicCode?: string;
  modelId?: ToyModelId;
  paletteId?: ToyPaletteId;
  createdAt?: string;
};

function createSeededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function randomSeed() {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0];
}

function createId() {
  return globalThis.crypto.randomUUID();
}

function createPublicCode(id: string, suppliedCode?: string) {
  if (suppliedCode) return suppliedCode;
  const normalizedId = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  return "LC-" + normalizedId.slice(-8).padStart(8, "0");
}

function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function createColorAnimalTraits(rolls: number[]): MaterialTraits {
  return {
    craftsmanship: clampScore(48 + rolls[3] * 48),
    finish: 84,
    purity: clampScore(58 + rolls[7] * 40),
    character: clampScore(52 + rolls[8] * 44),
    brilliance: 62
  };
}

function createSpecialExhibitTraits(rolls: number[]): MaterialTraits {
  return {
    craftsmanship: clampScore(88 + rolls[3] * 10),
    finish: 95,
    purity: clampScore(90 + rolls[7] * 8),
    character: clampScore(80 + rolls[8] * 18),
    brilliance: 96
  };
}
export function getMaterialCraftScore(traits: MaterialTraits) {
  return Math.round(
    traits.craftsmanship * materialTraitWeights.craftsmanship
      + traits.finish * materialTraitWeights.finish
      + traits.purity * materialTraitWeights.purity
      + traits.character * materialTraitWeights.character
      + traits.brilliance * materialTraitWeights.brilliance
  );
}

export function getRarityForQuality(score: number): RarityCode {
  if (score >= 74) return "mythic";
  if (score >= 57) return "legendary";
  if (score >= 43) return "epic";
  if (score >= 28) return "rare";
  return "common";
}

export function getAppearanceVariation(seed: number) {
  const random = createSeededRandom(seed ^ 0x9e3779b9);
  return {
    hueShift: (random() - 0.5) * 0.024,
    attenuationScale: 0.94 + random() * 0.12,
    glossScale: 0.96 + random() * 0.08
  };
}

function createColorAnimalAppearance(traits: MaterialTraits): AppearanceVector {
  return {
    transparency: 1,
    colorDepth: traits.character,
    hydration: traits.finish,
    luster: traits.brilliance,
    glow: 18
  };
}

function getCollectibleDescription(modelId: ToyModelId, paletteName: string) {
  if (modelId === "diamond-unicorn") {
    return `一只采用${paletteName}色泽的水晶独角兽，拥有高折射率、清晰切面与明亮火彩。`;
  }
  if (modelId === "diamond-dog") {
    return `一只采用${paletteName}色泽的水晶小狗，通透晶体与细密切面会在转动时呈现明亮火彩。`;
  }
  if (modelId === "color-bird") {
    return `一只采用${paletteName}配色的软萌小鸟，保留灵动眼睛、喙部和脚部原色。`;
  }
  if (modelId === "color-teddy") {
    return `一只采用${paletteName}配色的软萌小熊，保留眼睛、鼻子、嘴巴和脚掌细节。`;
  }
  if (modelId === "color-bunny") {
    return `一只带着${paletteName}行李箱的软萌小兔，身体与面部细节保留原始配色。`;
  }
  if (modelId === "color-panda") {
    return `一只戴着${paletteName}帽子的软萌熊猫，身体、黑白花纹、眼睛、鼻嘴和腮红保持原色。`;
  }
  if (modelId === "color-cat") {
    return `一只抱着${paletteName}毛线球的软萌小猫，猫咪毛色、五官、耳朵、爪子和腮红保持原色。`;
  }
  if (modelId === "color-otter") {
    return `一只拿着${paletteName}棒棒糖的软萌水獭，身体、眼睛、鼻嘴与腮红保持原色。`;
  }
  if (modelId === "color-bear-singer") {
    return `一只顶着${paletteName}爆炸头的小熊，五官、服装与舞台配件保持原始造型。`;
  }
  if (modelId === "color-dog-camera") {
    return `一只戴着${paletteName}帽子和包包的摄像狗，身体、五官与相机保持原色。`;
  }
  if (modelId === "color-dog-drum") {
    return `一只带着${paletteName}鼓面的打鼓狗，狗狗主体与鼓的细节保持原色。`;
  }
  if (modelId === "color-seal") {
    return `一只抱着${paletteName}海星的软萌海豹，身体、五官与尾部保持原色。`;
  }
  return `一只采用${paletteName}配色的软萌伙伴，保留原始五官与角色细节。`;
}

function createSpecialExhibitAppearance(traits: MaterialTraits): AppearanceVector {
  return {
    transparency: 95,
    colorDepth: traits.character,
    hydration: traits.purity,
    luster: traits.finish,
    glow: traits.brilliance
  };
}

/** Active V3 generator with a low-probability special-exhibit branch. */
export function generateCollectible(options: GenerateCollectibleOptions = {}): Collectible {
  const seed = options.seed ?? randomSeed();
  const random = createSeededRandom(seed);
  const rolls = Array.from({ length: 10 }, () => random());
  const activeModelIds = [
    ...colorAnimalsSeries.modelIds,
    ...specialExhibitsSeries.modelIds
  ] as readonly ToyModelId[];
  const requestedModel = options.modelId && activeModelIds.includes(options.modelId)
    ? options.modelId
    : null;
  const isSpecialRoll = rolls[0] < specialExhibitsSeries.drawProbability;
  const regularRoll = Math.max(
    0,
    (rolls[0] - specialExhibitsSeries.drawProbability)
      / (1 - specialExhibitsSeries.drawProbability)
  );
  const regularModelIndex = Math.min(
    colorAnimalsSeries.drawModelIds.length - 1,
    Math.floor(regularRoll * colorAnimalsSeries.drawModelIds.length)
  );
  const specialModelIndex = Math.min(
    specialExhibitsSeries.drawModelIds.length - 1,
    Math.floor(rolls[2] * specialExhibitsSeries.drawModelIds.length)
  );
  const modelId = requestedModel
    ?? (isSpecialRoll
      ? specialExhibitsSeries.drawModelIds[specialModelIndex]
      : colorAnimalsSeries.drawModelIds[regularModelIndex]);
  const isSpecialExhibit = specialExhibitsSeries.modelIds.includes(modelId);
  const palettePool = isSpecialExhibit ? diamondUnicornPalettes : colorAnimalPalettes;
  const allowedRequestedPaletteIds = isSpecialExhibit
    ? specialExhibitsSeries.explicitPaletteIds
    : colorAnimalsSeries.paletteIds;
  const requestedPalette = options.paletteId
    && allowedRequestedPaletteIds.includes(options.paletteId)
    ? options.paletteId
    : null;
  const paletteId = requestedPalette
    ?? palettePool[Math.floor(rolls[1] * palettePool.length)].id;
  const model = getToyModel(modelId);
  const palette = getToyPalette(paletteId);
  const materialId = isSpecialExhibit
    ? specialExhibitsSeries.materialId
    : colorAnimalsSeries.materialId;
  const materialTraits = isSpecialExhibit
    ? createSpecialExhibitTraits(rolls)
    : createColorAnimalTraits(rolls);
  const qualityScore = getMaterialCraftScore(materialTraits);
  const rarity: RarityCode = isSpecialExhibit ? "mythic" : getRarityForQuality(qualityScore);
  const id = options.id ?? createId();
  const appearance = isSpecialExhibit
    ? createSpecialExhibitAppearance(materialTraits)
    : createColorAnimalAppearance(materialTraits);
  const seriesId = isSpecialExhibit ? specialExhibitsSeries.id : colorAnimalsSeries.id;
  const seriesName = isSpecialExhibit ? specialExhibitsSeries.name : colorAnimalsSeries.name;
  const appearanceSignature = [
    GENERATION_VERSION,
    seriesId,
    modelId,
    paletteId,
    materialId,
    getToyRenderingAssetKey(model),
    ...Object.values(materialTraits),
    seed.toString(36)
  ].join("-");

  return {
    id,
    publicCode: createPublicCode(id, options.publicCode),
    modelId,
    paletteId,
    materialId,
    materialGrade: isSpecialExhibit ? getSpecialExhibitGrade() : getColorAnimalGrade(rarity),
    materialTraits,
    name: palette.name + model.name,
    seriesId,
    seriesName,
    rarity,
    qualityScore,
    appearanceSeed: seed,
    generationVersion: GENERATION_VERSION,
    appearance,
    appearanceSignature,
    shortDescription: getCollectibleDescription(modelId, palette.name),
    createdAt: options.createdAt ?? new Date().toISOString()
  };
}
