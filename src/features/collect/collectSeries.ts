import { homeSeriesToys } from "../../data/mock/homeSeries";
import { specialExhibitsSeries } from "../toys/activeSeries";
import type { Collectible, ToyModelId } from "../../types/toy";

export type AvailableCollectSeriesId =
  | "soft-companions"
  | "panda-and-friends";

export type PlannedCollectSeriesId = "sleepy-companions";

type CollectSeriesBase = {
  eyebrow: string;
  title: string;
  description: string;
  memberSummary: string;
};

export type AvailableCollectSeries = CollectSeriesBase & {
  id: AvailableCollectSeriesId;
  availability: "available";
  modelIds: readonly [ToyModelId, ...ToyModelId[]];
};

export type PlannedCollectSeries = CollectSeriesBase & {
  id: PlannedCollectSeriesId;
  availability: "planned";
  modelIds: readonly [];
  lockedReason: string;
};

export type CollectSeriesDefinition =
  | AvailableCollectSeries
  | PlannedCollectSeries;

export const collectSeries: readonly CollectSeriesDefinition[] = [
  {
    id: "soft-companions",
    availability: "available",
    eyebrow: "首发系列",
    title: "软萌变色伙伴",
    description:
      "六只现有伙伴一起登场。左右拖动可以同步转动它们，再从这一系列里随机遇见一只。",
    memberSummary: "6 款真实伙伴",
    modelIds: [
      "color-bunny",
      "color-otter",
      "color-bird",
      "color-teddy",
      "color-cat",
      "color-panda"
    ]
  },
  {
    id: "panda-and-friends",
    availability: "available",
    eyebrow: "主题盲盒",
    title: "熊猫和朋友们",
    description:
      "熊猫、小猫和小熊组成三款小队。常规结果三中一，每一款出现机会相同。",
    memberSummary: "3 款主题伙伴",
    modelIds: ["color-panda", "color-cat", "color-teddy"]
  },
  {
    id: "sleepy-companions",
    availability: "planned",
    eyebrow: "筹备中",
    title: "睡觉觉",
    description:
      "未来会收录真正拥有睡觉姿态的伙伴。当前没有对应 3D 资产，所以暂不开放抽取。",
    memberSummary: "新模型制作中",
    modelIds: [],
    lockedReason: "需要先完成睡觉姿态的专属 3D 模型"
  }
] as const;

const availableSeriesById = new Map(
  collectSeries
    .filter((series): series is AvailableCollectSeries =>
      series.availability === "available"
    )
    .map((series) => [series.id, series])
);

export const specialExhibitProbability =
  specialExhibitsSeries.drawProbability;

export function getAvailableCollectSeries(id: AvailableCollectSeriesId) {
  return availableSeriesById.get(id) ?? null;
}

export function getCollectSeriesPreviewToys(
  series: CollectSeriesDefinition
): readonly Collectible[] {
  if (series.availability === "planned") return [];
  const modelIds = new Set(series.modelIds);
  return homeSeriesToys.filter((toy) => modelIds.has(toy.modelId));
}
