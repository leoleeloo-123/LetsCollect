import { colorAnimalPalettes } from "../toys/catalog";
import { generateCollectible } from "../toys/generator";
import type {
  Collectible,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";

export type AvailableCollectSeriesId =
  | "color-spectrum"
  | "foodies"
  | "zzz"
  | "monochrome"
  | "outlaws"
  | "dogs"
  | "artists"
  | "street"
  | "flyers"
  | "splash-sisters"
  | "cats"
  | "bears"
  | "travelers"
  | "potatoes";

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

const regularModelIds = [
  "color-otter",
  "color-bird",
  "color-penguin",
  "color-bunny",
  "color-cat",
  "color-panda",
  "color-bear-singer",
  "color-dog-camera",
  "color-dog-drum",
  "color-seal",
  "color-karpy",
  "color-koala",
  "color-racoon",
  "color-hamster-icecream",
  "color-dino",
  "color-fox",
  "color-deer",
  "color-sheep",
  "color-sloth",
  "color-owl",
  "color-duck",
  "color-guinea-pig",
  "color-black-cat",
  "color-cool-wolf"
] as const satisfies readonly [ToyModelId, ...ToyModelId[]];

export const colorSpectrumSeries = {
  id: "color-spectrum",
  availability: "available",
  category: "color",
  eyebrow: "色彩系列",
  title: "选一种颜色，遇见一位伙伴",
  description:
    "二十四款伙伴共享九种代表色。先选定喜欢的色系，再从完整阵容中均等抽取一款。",
  memberSummary: "24 款伙伴 · 每款 1 / 24",
  ticketCost: 3,
  modelIds: regularModelIds,
  palettePolicy: {
    mode: "selected",
    paletteIds: regularPaletteIds,
    defaultPaletteId: "apricot"
  }
} as const satisfies AvailableCollectSeries;

const randomPalettePolicy = {
  mode: "random",
  paletteIds: regularPaletteIds
} as const;

export const specialCollectSeries = [
  {
    id: "foodies",
    availability: "available",
    category: "special",
    eyebrow: "美味主题",
    title: "吃货",
    description: "棒棒糖、饭团、糖葫芦和雪糕，四位伙伴各带一份快乐。",
    memberSummary: "4 款伙伴 · 每款 1 / 4",
    ticketCost: 6,
    modelIds: [
      "color-otter",
      "color-karpy",
      "color-racoon",
      "color-hamster-icecream"
    ],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "zzz",
    availability: "available",
    category: "special",
    eyebrow: "睡觉主题",
    title: "ZZZ",
    description: "毛线小猫、海星海豹和睡帽考拉，安静地凑成午睡小队。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: ["color-cat", "color-seal", "color-koala"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "monochrome",
    availability: "available",
    category: "special",
    eyebrow: "黑白主题",
    title: "黑白配",
    description: "熊猫、摄影小狗和企鹅，组成黑白分明的小队。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: ["color-panda", "color-dog-camera", "color-penguin"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "outlaws",
    availability: "available",
    category: "special",
    eyebrow: "酷感主题",
    title: "法外狂徒",
    description: "围巾恐龙、羽毛帽狐狸与酷酷狼人，组成不按常理出牌的小队。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: ["color-dino", "color-fox", "color-cool-wolf"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "dogs",
    availability: "available",
    category: "special",
    eyebrow: "狗狗主题",
    title: "汪汪队",
    description: "摄影小狗和鼓手小狗组成双人行动队。",
    memberSummary: "2 款伙伴 · 每款 1 / 2",
    ticketCost: 6,
    modelIds: ["color-dog-camera", "color-dog-drum"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "artists",
    availability: "available",
    category: "special",
    eyebrow: "创作主题",
    title: "艺术家",
    description: "歌手小熊、摄影小狗和鼓手小狗，随时准备开演。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: [
      "color-bear-singer",
      "color-dog-camera",
      "color-dog-drum"
    ],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "street",
    availability: "available",
    category: "special",
    eyebrow: "城市主题",
    title: "扫街达人",
    description: "行李箱小兔、蝴蝶结小鹿与披风小羊，一起穿行街角。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: ["color-bunny", "color-deer", "color-sheep"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "flyers",
    availability: "available",
    category: "special",
    eyebrow: "天空主题",
    title: "飞行家",
    description: "小帽鸟、博士猫头鹰和气球豚鼠，各有自己的升空方式。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: ["color-bird", "color-owl", "color-guinea-pig"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "splash-sisters",
    availability: "available",
    category: "special",
    eyebrow: "水花主题",
    title: "水花姐妹",
    description: "棒棒糖水獭、海星海豹与浴缸小鸭，集合在清凉水边。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: ["color-otter", "color-seal", "color-duck"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "cats",
    availability: "available",
    category: "special",
    eyebrow: "猫咪主题",
    title: "喵喵队",
    description: "毛线小猫与黑盒猫猫，一明一暗的双猫组合。",
    memberSummary: "2 款伙伴 · 每款 1 / 2",
    ticketCost: 6,
    modelIds: ["color-cat", "color-black-cat"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "bears",
    availability: "available",
    category: "special",
    eyebrow: "熊熊主题",
    title: "熊熊队",
    description: "熊猫、歌手小熊和糖葫芦浣熊，组成三位圆滚滚伙伴。",
    memberSummary: "3 款伙伴 · 每款 1 / 3",
    ticketCost: 6,
    modelIds: [
      "color-panda",
      "color-bear-singer",
      "color-racoon"
    ],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "travelers",
    availability: "available",
    category: "special",
    eyebrow: "旅行主题",
    title: "旅行家",
    description: "针织帽树懒慢慢出发，摄影小狗负责记录沿途风景。",
    memberSummary: "2 款伙伴 · 每款 1 / 2",
    ticketCost: 6,
    modelIds: ["color-sloth", "color-dog-camera"],
    palettePolicy: randomPalettePolicy
  },
  {
    id: "potatoes",
    availability: "available",
    category: "special",
    eyebrow: "圆滚主题",
    title: "薯薯队",
    description: "雪糕仓鼠和气球豚鼠，圆滚滚地组成快乐双人组。",
    memberSummary: "2 款伙伴 · 每款 1 / 2",
    ticketCost: 6,
    modelIds: ["color-hamster-icecream", "color-guinea-pig"],
    palettePolicy: randomPalettePolicy
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
