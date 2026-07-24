import type {
  ColorMoodDefinition,
  ColorMoodId,
  MaterialPreference
} from "../../types/taste";
import type { ToyModelId, ToyPaletteId } from "../../types/toy";
import {
  colorAnimalModels,
  colorAnimalPalettes,
  getToyModel,
  getToyPalette
} from "../toys/catalog";

export const availableCompanionModelIds = colorAnimalModels.map(
  (model) => model.id
) as readonly ToyModelId[];

export const colorMoods: readonly ColorMoodDefinition[] = [
  {
    id: "open",
    label: "都可以",
    description: "让任何颜色来找到你",
    paletteIds: colorAnimalPalettes.map((palette) => palette.id)
  },
  {
    id: "calm",
    label: "安静",
    description: "天空蓝、奶霜与柔和薄荷",
    paletteIds: ["sky", "cream-rose", "candy-mint"]
  },
  {
    id: "warm",
    label: "暖暖",
    description: "杏子、可可与珊瑚色",
    paletteIds: ["apricot", "cocoa", "coral"]
  },
  {
    id: "fresh",
    label: "清新",
    description: "薄荷、青柠与清透蓝",
    paletteIds: ["candy-mint", "lime", "sky"]
  },
  {
    id: "dreamy",
    label: "梦幻",
    description: "葡萄、蓝莓与柔粉色",
    paletteIds: ["grape", "berry", "cream-rose"]
  },
  {
    id: "bold",
    label: "亮眼",
    description: "更明快、更有对比的颜色",
    paletteIds: ["berry", "coral", "lime"]
  }
] as const;

export const materialPreferences: readonly {
  id: MaterialPreference;
  label: string;
  description: string;
}[] = [
  { id: "open", label: "都可以", description: "让不同质感自然出现" },
  { id: "matte", label: "柔雾", description: "六只现有软萌伙伴" },
  {
    id: "crystal",
    label: "喜欢晶亮",
    description: "当前只有钻石独角兽"
  }
] as const;

export function getColorMood(id: ColorMoodId) {
  return colorMoods.find((mood) => mood.id === id) ?? colorMoods[0];
}

export function getMoodPreviewColors(id: ColorMoodId) {
  return getColorMood(id).paletteIds.slice(0, 3).map(
    (paletteId) => getToyPalette(paletteId).color
  );
}

export function getPreferredPaletteId(id: ColorMoodId): ToyPaletteId {
  return getColorMood(id).paletteIds[0] ?? colorAnimalPalettes[0].id;
}

export const availableCompanionOptions = availableCompanionModelIds.map(
  (modelId) => ({
    id: modelId,
    name: getToyModel(modelId).name
  })
);
