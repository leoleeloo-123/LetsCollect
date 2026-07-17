import type {
  AppearanceVector,
  Collectible,
  MaterialTraits,
  RarityCode,
  ToyMaterialId,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";
import { getToyModel, getToyPalette, toyModels, toyPalettes } from "./catalog";
import {
  drawableMaterials,
  getMaterialGrade,
  getToyMaterial,
  materialTraitWeights
} from "./materialCatalog";

export const GENERATION_VERSION = 2;

type GenerateCollectibleOptions = {
  seed?: number;
  id?: string;
  publicCode?: string;
  modelId?: ToyModelId;
  paletteId?: ToyPaletteId;
  materialId?: Exclude<ToyMaterialId, "jade">;
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

function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function chooseMaterial(roll: number) {
  let cursor = roll * 100;
  for (const material of drawableMaterials) {
    cursor -= material.probability;
    if (cursor <= 0) return material;
  }
  return drawableMaterials[drawableMaterials.length - 1];
}

function createMaterialTraits(rolls: number[]): MaterialTraits {
  const qualityTendency = 24 + ((rolls[3] + rolls[4]) / 2) * 52;
  return {
    craftsmanship: clampScore(qualityTendency + (rolls[5] - 0.5) * 28 + 5),
    finish: clampScore(qualityTendency + (rolls[6] - 0.5) * 32 + 2),
    purity: clampScore(qualityTendency + (rolls[7] - 0.5) * 34),
    character: clampScore(qualityTendency + (rolls[8] - 0.5) * 38),
    brilliance: clampScore(qualityTendency + (rolls[9] - 0.5) * 36 + 1)
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

function createCompatibilityAppearance(
  materialId: Exclude<ToyMaterialId, "jade">,
  traits: MaterialTraits
): AppearanceVector {
  const isMineral = materialId === "crystal" || materialId === "diamond";
  return {
    transparency: isMineral
      ? traits.purity
      : materialId === "plastic"
        ? clampScore(traits.purity * 0.45)
        : 1,
    colorDepth: traits.character,
    hydration: traits.finish,
    luster: traits.brilliance,
    glow: clampScore(traits.brilliance * (isMineral ? 0.72 : 0.34))
  };
}

export function generateCollectible(options: GenerateCollectibleOptions = {}): Collectible {
  const seed = options.seed ?? randomSeed();
  const random = createSeededRandom(seed);
  const rolls = Array.from({ length: 10 }, () => random());
  const modelId = options.modelId ?? toyModels[Math.floor(rolls[0] * toyModels.length)].id;
  const paletteId = options.paletteId ?? toyPalettes[Math.floor(rolls[1] * toyPalettes.length)].id;
  const material = options.materialId
    ? getToyMaterial(options.materialId)
    : chooseMaterial(rolls[2]);
  const materialId = material.id as Exclude<ToyMaterialId, "jade">;
  const materialTraits = createMaterialTraits(rolls);
  const craftScore = getMaterialCraftScore(materialTraits);
  const qualityScore = clampScore(material.baseQuality + (craftScore - 50) * 0.28);
  const rarity = getRarityForQuality(qualityScore);
  const model = getToyModel(modelId);
  const palette = getToyPalette(paletteId);
  const id = options.id ?? createId();
  const normalizedId = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const publicCode = options.publicCode ?? `LC-${normalizedId.slice(-8).padStart(8, "0")}`;
  const appearance = createCompatibilityAppearance(materialId, materialTraits);
  const appearanceSignature = [
    GENERATION_VERSION,
    modelId,
    paletteId,
    materialId,
    ...Object.values(materialTraits),
    seed.toString(36)
  ].join("-");

  return {
    id,
    publicCode,
    modelId,
    paletteId,
    materialId,
    materialGrade: getMaterialGrade(rarity),
    materialTraits,
    name: `${material.name}${model.name}`,
    seriesId: "series_material_origins",
    seriesName: "材质初铸",
    rarity,
    qualityScore,
    appearanceSeed: seed,
    generationVersion: GENERATION_VERSION,
    appearance,
    appearanceSignature,
    shortDescription: `一只以${material.name}为主体、带有${palette.name}氛围光的独立${model.name}。`,
    createdAt: options.createdAt ?? new Date().toISOString()
  };
}
