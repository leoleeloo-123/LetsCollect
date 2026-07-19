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
  getToyModel,
  getToyPalette,
  getToyRenderingAssetKey
} from "./catalog";
import {
  COLOR_ANIMALS_GENERATION_VERSION,
  colorAnimalsSeries,
  getColorAnimalGrade
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

/** Active V3 generator: fixed soft-matte material, random approved model and body color. */
export function generateCollectible(options: GenerateCollectibleOptions = {}): Collectible {
  const seed = options.seed ?? randomSeed();
  const random = createSeededRandom(seed);
  const rolls = Array.from({ length: 10 }, () => random());
  const requestedModel = options.modelId
    && colorAnimalsSeries.modelIds.includes(options.modelId)
    ? options.modelId
    : null;
  const requestedPalette = options.paletteId
    && colorAnimalsSeries.paletteIds.includes(options.paletteId)
    ? options.paletteId
    : null;
  const modelId = requestedModel
    ?? colorAnimalsSeries.drawModelIds[Math.floor(rolls[0] * colorAnimalsSeries.drawModelIds.length)];
  const paletteId = requestedPalette
    ?? colorAnimalPalettes[Math.floor(rolls[1] * colorAnimalPalettes.length)].id;
  const model = getToyModel(modelId);
  const palette = getToyPalette(paletteId);
  const materialId = colorAnimalsSeries.materialId;
  const materialTraits = createColorAnimalTraits(rolls);
  const qualityScore = getMaterialCraftScore(materialTraits);
  const rarity = getRarityForQuality(qualityScore);
  const id = options.id ?? createId();
  const appearance = createColorAnimalAppearance(materialTraits);
  const appearanceSignature = [
    GENERATION_VERSION,
    colorAnimalsSeries.id,
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
    materialGrade: getColorAnimalGrade(rarity),
    materialTraits,
    name: palette.name + model.name,
    seriesId: colorAnimalsSeries.id,
    seriesName: colorAnimalsSeries.name,
    rarity,
    qualityScore,
    appearanceSeed: seed,
    generationVersion: GENERATION_VERSION,
    appearance,
    appearanceSignature,
    shortDescription: modelId === "color-bird"
      ? "一只采用" + palette.name + "身体配色的柔雾小鸟，眼睛、鸟喙和粉色脸颊保留原始细节。"
      : modelId === "color-teddy"
        ? "一只采用" + palette.name + "身体配色的柔雾小熊，眼睛、鼻嘴、奶油口鼻与粉色腮红保留原始细节。"
        : "一只采用" + palette.name + "身体配色的柔雾小狗，眼睛、鼻嘴和粉色肉球保留原始细节。",
    createdAt: options.createdAt ?? new Date().toISOString()
  };
}
