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

function getCollectibleDescription(modelId: ToyModelId, paletteName: string) {
  if (modelId === "color-bird") {
    return `一只戴着${paletteName}皇冠的软萌小鸟，身体、眼睛、喙部、腮红和脚部保持原色。`;
  }
  if (modelId === "color-penguin") {
    return `一只戴着${paletteName}耳罩、捧着同色杯子的企鹅，羽毛、五官、腮红、嘴和脚保持原色。`;
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
  if (modelId === "color-karpy") {
    return `一只吃着饭团、戴着${paletteName}帽子的软萌卡皮，身体、白色衣服、五官、爪子与腮红保持原色。`;
  }
  if (modelId === "color-koala") {
    return `一只戴着${paletteName}睡帽的软萌考拉，身体、五官、帽顶绒球、树枝与叶片保持原色。`;
  }
  if (modelId === "color-racoon") {
    return `一只拿着${paletteName}糖葫芦的浣熊，脸部、眼睛与服装细节保持原色。`;
  }
  if (modelId === "color-hamster-icecream") {
    return `一只举着${paletteName}雪糕的仓鼠，身体、眼睛与小爪子保持原色。`;
  }
  if (modelId === "color-dino") {
    return `一只围着${paletteName}围巾的小恐龙，身体与五官保持原色。`;
  }
  if (modelId === "color-fox") {
    return `一只戴着${paletteName}羽毛帽的狐狸，毛色、眼睛与面部细节保持原色。`;
  }
  if (modelId === "color-deer") {
    return `一只佩戴${paletteName}蝴蝶结的小鹿，身体与五官保持原色。`;
  }
  if (modelId === "color-sheep") {
    return `一只穿着${paletteName}披风的小羊，羊毛、眼睛与面部细节保持原色。`;
  }
  if (modelId === "color-sloth") {
    return `一只戴着${paletteName}针织帽的树懒，身体与五官保持原色。`;
  }
  if (modelId === "color-owl") {
    return `一只带着${paletteName}学术配件的猫头鹰，羽毛与五官保持原色。`;
  }
  if (modelId === "color-duck") {
    return `一只坐在${paletteName}浴缸里的小鸭，身体、泡沫与五官保持原色。`;
  }
  if (modelId === "color-guinea-pig") {
    return `一只带着${paletteName}气球的豚鼠，身体与五官保持原色。`;
  }
  if (modelId === "color-black-cat") {
    return `一只带着${paletteName}鱼形标记的黑盒猫猫，黑色造型与五官保持原色。`;
  }
  if (modelId === "color-cool-wolf") {
    return `一只戴着${paletteName}耳钉的酷酷狼人，服装、毛色与五官保持原色。`;
  }
  return `一只采用${paletteName}配色的软萌伙伴，保留原始五官与角色细节。`;
}

/** Active V3 generator for the 24-model Color Animals roster. */
export function generateCollectible(options: GenerateCollectibleOptions = {}): Collectible {
  const seed = options.seed ?? randomSeed();
  const random = createSeededRandom(seed);
  const rolls = Array.from({ length: 10 }, () => random());
  const requestedModel = options.modelId
    && colorAnimalsSeries.modelIds.includes(options.modelId)
    ? options.modelId
    : null;
  const modelIndex = Math.min(
    colorAnimalsSeries.drawModelIds.length - 1,
    Math.floor(rolls[0] * colorAnimalsSeries.drawModelIds.length)
  );
  const modelId = requestedModel ?? colorAnimalsSeries.drawModelIds[modelIndex];
  const requestedPalette = options.paletteId
    && colorAnimalsSeries.paletteIds.includes(options.paletteId)
    ? options.paletteId
    : null;
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
    shortDescription: getCollectibleDescription(modelId, palette.name),
    createdAt: options.createdAt ?? new Date().toISOString()
  };
}