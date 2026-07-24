import type { ColorMoodDefinition, ColorMoodId } from "../../types/taste";
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
    label: "Open",
    description: "Any color can find you",
    paletteIds: colorAnimalPalettes.map((palette) => palette.id)
  },
  {
    id: "calm",
    label: "Calm",
    description: "Quiet sky and cream tones",
    paletteIds: ["sky", "cream-rose", "candy-mint"]
  },
  {
    id: "warm",
    label: "Warm",
    description: "Apricot, cocoa and coral",
    paletteIds: ["apricot", "cocoa", "coral"]
  },
  {
    id: "fresh",
    label: "Fresh",
    description: "Mint, lime and clear blue",
    paletteIds: ["candy-mint", "lime", "sky"]
  },
  {
    id: "dreamy",
    label: "Dreamy",
    description: "Grape, berry and soft rose",
    paletteIds: ["grape", "berry", "cream-rose"]
  },
  {
    id: "bold",
    label: "Bold",
    description: "Brighter accents with contrast",
    paletteIds: ["berry", "coral", "lime"]
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
