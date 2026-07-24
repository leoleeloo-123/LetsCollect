import { colorMoods } from "../collect/collectPreferences";
import { isSpecialExhibitCollectible } from "../toys/activeSeries";
import { getToyModel } from "../toys/catalog";
import type { ColorMoodId } from "../../types/taste";
import type { Collectible, ToyModelId } from "../../types/toy";

type SignatureMoodId = Exclude<ColorMoodId, "open">;

type CollectionSignatureOptions = {
  collection: readonly Collectible[];
  favoriteIds: readonly string[];
  representativeIds: readonly string[];
};

export type CollectionSignature = {
  tags: string[];
  description: string;
  evidence: string[];
};

const moodCopy: Record<
  SignatureMoodId,
  { tag: string; description: string }
> = {
  calm: { tag: "Calm Colors", description: "安静的天空色与柔和色调" },
  warm: { tag: "Warm Palette", description: "杏色、可可与珊瑚暖调" },
  fresh: { tag: "Fresh Notes", description: "薄荷、青柠与清透蓝调" },
  dreamy: { tag: "Dreamy Tones", description: "葡萄、莓果与柔粉色调" },
  bold: { tag: "Bold Accents", description: "更明快、有对比感的配色" }
};

function getTimestamp(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function incrementScore<T>(scores: Map<T, number>, key: T, amount: number) {
  scores.set(key, (scores.get(key) ?? 0) + amount);
}

export function deriveCollectionSignature({
  collection,
  favoriteIds,
  representativeIds
}: CollectionSignatureOptions): CollectionSignature {
  if (collection.length === 0) {
    return {
      tags: ["Collection Beginning", "Open Palette"],
      description:
        "你的收藏轨迹才刚刚开始。新的 Companion 会慢慢让颜色与材质倾向变得清晰。",
      evidence: ["当前还没有可用于总结的藏品。"]
    };
  }

  const favoriteIdSet = new Set(favoriteIds);
  const representativeIdSet = new Set(representativeIds);
  const recentIdSet = new Set(
    [...collection]
      .sort((left, right) =>
        getTimestamp(right.createdAt) - getTimestamp(left.createdAt)
      )
      .slice(0, Math.min(5, collection.length))
      .map((toy) => toy.id)
  );
  const modelScores = new Map<ToyModelId, number>();
  const modelCounts = new Map<ToyModelId, number>();
  const moodScores = new Map<SignatureMoodId, number>();

  collection.forEach((toy) => {
    const weight = 1
      + (favoriteIdSet.has(toy.id) ? 1 : 0)
      + (representativeIdSet.has(toy.id) ? 1.25 : 0)
      + (recentIdSet.has(toy.id) ? 0.25 : 0);
    incrementScore(modelScores, toy.modelId, weight);
    incrementScore(modelCounts, toy.modelId, 1);

    colorMoods.forEach((mood) => {
      if (
        mood.id !== "open"
        && mood.paletteIds.includes(toy.paletteId)
      ) {
        incrementScore(moodScores, mood.id, weight);
      }
    });
  });

  const dominantMood = [...moodScores.entries()]
    .sort((left, right) => right[1] - left[1])[0]?.[0] ?? "calm";
  const dominantModel = [...modelScores.entries()]
    .sort((left, right) => right[1] - left[1])[0]?.[0]
    ?? collection[0].modelId;
  const dominantModelCount = modelCounts.get(dominantModel) ?? 0;
  const dominantMoodItemCount = collection.filter((toy) => {
    const mood = colorMoods.find((entry) => entry.id === dominantMood);
    return mood?.paletteIds.includes(toy.paletteId);
  }).length;
  const crystalCount = collection.filter(isSpecialExhibitCollectible).length;
  const matteCount = collection.length - crystalCount;
  const distinctPaletteCount = new Set(
    collection.map((toy) => toy.paletteId)
  ).size;
  const validFavoriteCount = collection.filter((toy) =>
    favoriteIdSet.has(toy.id)
  ).length;
  const validRepresentativeCount = collection.filter((toy) =>
    representativeIdSet.has(toy.id)
  ).length;
  const tags: string[] = [];
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) tags.push(tag);
  };

  addTag(moodCopy[dominantMood].tag);
  if (matteCount / collection.length >= 0.6) addTag("Matte Lover");
  if (crystalCount > 0 && crystalCount / collection.length < 0.5) {
    addTag("Unicorn Curious");
  } else if (crystalCount / collection.length >= 0.5) {
    addTag("Crystal Focus");
  }
  if (dominantModelCount >= 2) {
    addTag(`${getToyModel(dominantModel).name} Affinity`);
  }
  if (
    distinctPaletteCount
    >= Math.min(4, Math.max(2, Math.ceil(collection.length * 0.6)))
  ) {
    addTag("Color Explorer");
  }
  if (validRepresentativeCount === 3) addTag("Curated Trio");
  if (validFavoriteCount >= 2) addTag("Favorite Finds");
  if (tags.length < 2) addTag("Growing Collection");

  const materialDescription = crystalCount === 0
    ? "目前以柔雾树脂为主"
    : matteCount === 0
      ? "目前更常选择 Diamond Unicorn 的切面光感"
      : matteCount >= crystalCount
        ? "以柔雾树脂为主，也对 Diamond Unicorn 保留了一点好奇"
        : "切面光感最近出现得更多，同时仍保留柔雾树脂藏品";
  const modelDescription = dominantModelCount >= 2
    ? `，其中${getToyModel(dominantModel).name}出现得最频繁`
    : "";
  const evidence = [
    `${dominantMoodItemCount} 件藏品落在当前最明显的配色组`,
    `${matteCount} 件柔雾树脂 · ${crystalCount} 件切面钻石`
  ];

  if (validFavoriteCount > 0) {
    evidence.push(`${validFavoriteCount} 件 Favorite 参与加权`);
  } else if (validRepresentativeCount > 0) {
    evidence.push(`${validRepresentativeCount} 件代表藏品参与加权`);
  }

  return {
    tags: tags.slice(0, 4),
    description:
      `最近，你的收藏更常出现${moodCopy[dominantMood].description}，`
      + `${materialDescription}${modelDescription}。`
      + "这些标签只描述当前轨迹，会随着新的相遇继续变化。",
    evidence
  };
}
