import {
  colorAnimalPalettes,
  diamondUnicornPalettes
} from "../toys/catalog";
import { generateCollectible } from "../toys/generator";
import type {
  Collectible,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";

export type AvailableCollectSeriesId =
  | "color-spectrum"
  | "panda-pun"
  | "artists"
  | "dogs"
  | "crystal";

type CollectSeriesBase = {
  id: AvailableCollectSeriesId;
  availability: "available";
  category: "color" | "special";
  eyebrow: string;
  title: string;
  description: string;
  memberSummary: string;
  ticketCost: number;
  modelIds: readonly [ToyModelId, ...ToyModelId[]];
};

type SelectedPalettePolicy = {
  mode: "selected";
  paletteIds: readonly ToyPaletteId[];
  defaultPaletteId: ToyPaletteId;
};

type RandomPalettePolicy = {
  mode: "random";
  paletteIds: readonly ToyPaletteId[];
};

export type AvailableCollectSeries = CollectSeriesBase & {
  palettePolicy: SelectedPalettePolicy | RandomPalettePolicy;
};

export type CollectSeriesDrawRequest = {
  seriesId: AvailableCollectSeriesId;
  paletteId?: ToyPaletteId;
};

const regularPaletteIds = colorAnimalPalettes.map(
  (palette) => palette.id
) as readonly ToyPaletteId[];
const crystalPaletteIds = diamondUnicornPalettes.map(
  (palette) => palette.id
) as readonly ToyPaletteId[];

const regularModelIds = [
  "color-bunny",
  "color-otter",
  "color-bird",
  "color-teddy",
  "color-cat",
  "color-panda",
  "color-bear-singer",
  "color-dog-camera",
  "color-dog-drum",
  "color-seal"
] as const satisfies readonly [ToyModelId, ...ToyModelId[]];

export const colorSpectrumSeries = {
  id: "color-spectrum",
  availability: "available",
  category: "color",
  eyebrow: "色彩系列",
  title: "选一种颜色，遇见一位伙伴",
  description:
    "十二款伙伴共享九种代表色。先选定喜欢的色系，再从全部伙伴中均等抽取一款。",
  memberSummary: "12 款伙伴 · 每款 1 / 12",
  ticketCost: 3,
  modelIds: [
    ...regularModelIds,
    "diamond-unicorn",
    "diamond-dog"
  ],
  palettePolicy: {
    mode: "selected",
    paletteIds: regularPaletteIds,
    defaultPaletteId: "apricot"
  }
} as const satisfies AvailableCollectSeries;

export const specialCollectSeries = [
  {
    id: "panda-pun",
    availability: "available",
    category: "special",
    eyebrow: "谐音主题",
    title: "熊猫",
    description:
      "熊猫，也可以是熊加猫。熊猫、小熊、小猫和爆炸头小熊组成四款主题阵容。",
    memberSummary: "4 款伙伴 · 每款 1 / 4",
    ticketCost: 3,
    modelIds: [
      "color-panda",
      "color-teddy",
      "color-cat",
      "color-bear-singer"
    ],
    palettePolicy: {
      mode: "random",
      paletteIds: regularPaletteIds
    }
  },
  {
    id: "artists",
    availability: "available",
    category: "special",
    eyebrow: "创作主题",
    title: "艺术家",
    description:
      "歌手小熊、鼓手小狗和摄影小狗集合。每次随机遇见一位正在创作的伙伴。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 3,
    modelIds: [
      "color-bear-singer",
      "color-dog-drum",
      "color-dog-camera"
    ],
    palettePolicy: {
      mode: "random",
      paletteIds: regularPaletteIds
    }
  },
  {
    id: "dogs",
    availability: "available",
    category: "special",
    eyebrow: "狗狗主题",
    title: "狗狗",
    description:
      "摄影小狗和鼓手小狗组成双人小队。颜色随机，两款伙伴出现机会相同。",
    memberSummary: "2 款伙伴 · 每款 1 / 2",
    ticketCost: 3,
    modelIds: [
      "color-dog-camera",
      "color-dog-drum"
    ],
    palettePolicy: {
      mode: "random",
      paletteIds: regularPaletteIds
    }
  },
  {
    id: "crystal",
    availability: "available",
    category: "special",
    eyebrow: "珍稀主题",
    title: "水晶",
    description:
      "水晶独角兽和水晶小狗共享五种随机晶体色。更稀有的材质，需要更多抽取券。",
    memberSummary: "2 款伙伴 · 每款 1 / 2",
    ticketCost: 6,
    modelIds: [
      "diamond-unicorn",
      "diamond-dog"
    ],
    palettePolicy: {
      mode: "random",
      paletteIds: crystalPaletteIds
    }
  }
] as const satisfies readonly AvailableCollectSeries[];

export const collectSeries = [
  colorSpectrumSeries,
  ...specialCollectSeries
] as const satisfies readonly AvailableCollectSeries[];

const availableSeriesById = new Map<AvailableCollectSeriesId, AvailableCollectSeries>(
  collectSeries.map((series) => [series.id, series])
);

export function getAvailableCollectSeries(id: AvailableCollectSeriesId) {
  return availableSeriesById.get(id) ?? null;
}

function getPreviewPaletteId(
  series: AvailableCollectSeries,
  modelIndex: number,
  selectedPaletteId?: ToyPaletteId
) {
  if (series.palettePolicy.mode === "selected") {
    return selectedPaletteId
      && series.palettePolicy.paletteIds.includes(selectedPaletteId)
      ? selectedPaletteId
      : series.palettePolicy.defaultPaletteId;
  }

  return series.palettePolicy.paletteIds[
    modelIndex % series.palettePolicy.paletteIds.length
  ] ?? series.palettePolicy.paletteIds[0];
}

export function getCollectSeriesPreviewToys(
  series: AvailableCollectSeries,
  selectedPaletteId?: ToyPaletteId
): readonly Collectible[] {
  return series.modelIds.map((modelId, modelIndex) => {
    const paletteId = getPreviewPaletteId(
      series,
      modelIndex,
      selectedPaletteId
    );
    return generateCollectible({
      id: `series-preview-${series.id}-${modelId}`,
      publicCode: `PREVIEW-${series.id}-${modelIndex + 1}`,
      seed: 9100 + modelIndex * 97 + series.modelIds.length,
      modelId,
      paletteId,
      createdAt: "2026-07-24T00:00:00.000Z"
    });
  });
}
