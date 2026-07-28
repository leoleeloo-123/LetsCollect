import type { ToyModelId, ToyPaletteId } from "./toy";

export type ColorMoodId =
  | "open"
  | "calm"
  | "warm"
  | "fresh"
  | "dreamy"
  | "bold";

export type MaterialPreference = "open" | "matte" | "crystal";

export type TastePreferences = {
  modelIds: ToyModelId[];
  colorMood: ColorMoodId;
  material: MaterialPreference;
};

export type ColorMoodDefinition = {
  id: ColorMoodId;
  label: string;
  description: string;
  paletteIds: readonly ToyPaletteId[];
};
