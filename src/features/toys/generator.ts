import type { AppearanceVector, Collectible, RarityCode, ToyModelId, ToyPaletteId } from "../../types/toy";
import {
  getToyModel,
  getToyPalette,
  toyModels,
  toyPalettes,
  transparencyGrades
} from "./catalog";

export const GENERATION_VERSION = 1;

export const appearanceWeights: Record<keyof AppearanceVector, number> = {
  transparency: 0.35,
  colorDepth: 0.2,
  hydration: 0.18,
  luster: 0.17,
  glow: 0.1
};

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

function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function chooseTransparencyGrade(roll: number) {
  let cursor = roll * 100;
  for (const grade of transparencyGrades) {
    cursor -= grade.probability;
    if (cursor <= 0) return grade;
  }
  return transparencyGrades[transparencyGrades.length - 1];
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

export function generateCollectible(options: GenerateCollectibleOptions = {}): Collectible {
  const seed = options.seed ?? randomSeed();
  const random = createSeededRandom(seed);
  const rolls = Array.from({ length: 10 }, () => random());
  const modelId = options.modelId ?? toyModels[Math.floor(rolls[0] * toyModels.length)].id;
  const paletteId = options.paletteId ?? toyPalettes[Math.floor(rolls[1] * toyPalettes.length)].id;
  const grade = chooseTransparencyGrade(rolls[2]);
  const transparency = grade.min + Math.floor(rolls[3] * (grade.max - grade.min + 1));

  // One shared quality tendency keeps the five traits coherent; bounded jitter
  // still gives every collectible a distinct strengths-and-weaknesses profile.
  const qualityTendency = transparency * 0.58 + 100 * Math.pow(rolls[4], 1.55) * 0.42;
  const appearance: AppearanceVector = {
    transparency,
    colorDepth: clampScore(qualityTendency + (rolls[5] - 0.5) * 32),
    hydration: clampScore(qualityTendency + (rolls[6] - 0.5) * 30 + 3),
    luster: clampScore(qualityTendency + (rolls[7] - 0.5) * 28 + 5),
    glow: clampScore(qualityTendency + (rolls[8] - 0.5) * 36 - 3)
  };
  const qualityScore = Math.round(
    appearance.transparency * appearanceWeights.transparency
      + appearance.colorDepth * appearanceWeights.colorDepth
      + appearance.hydration * appearanceWeights.hydration
      + appearance.luster * appearanceWeights.luster
      + appearance.glow * appearanceWeights.glow
  );
  const rarity = getRarityForQuality(qualityScore);
  const model = getToyModel(modelId);
  const palette = getToyPalette(paletteId);
  const id = options.id ?? createId();
  const normalizedId = id.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const publicCode = options.publicCode ?? `LC-${normalizedId.slice(-8).padStart(8, "0")}`;
  const appearanceSignature = [
    GENERATION_VERSION,
    modelId,
    paletteId,
    ...Object.values(appearance),
    seed.toString(36)
  ].join("-");

  return {
    id,
    publicCode,
    modelId,
    paletteId,
    name: `${palette.name}果冻${model.name}`,
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity,
    qualityScore,
    transparencyGrade: grade.id,
    jadeGrade: grade.name,
    appearanceSeed: seed,
    generationVersion: GENERATION_VERSION,
    appearance,
    appearanceSignature,
    shortDescription: `一只拥有独立五维材质参数的${palette.name}果冻${model.name}。`,
    createdAt: options.createdAt ?? new Date().toISOString()
  };
}
