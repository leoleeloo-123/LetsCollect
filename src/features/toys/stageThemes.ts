import { localBackgroundRecords } from "../../data/asset-registry/localTables";

export type ToyStageThemeId =
  | "early-winter"
  | "warm-spring"
  | "soft-green"
  | "soft-lavender";

export type ToyStageThemeDefinition = {
  id: ToyStageThemeId;
  name: string;
  group: "dynamic" | "static";
  background: string;
  swatch: string;
  particle: "snow" | "leaf" | null;
};

const knownStageThemeIds = new Set<ToyStageThemeId>([
  "early-winter",
  "warm-spring",
  "soft-green",
  "soft-lavender"
]);

const sortedBackgroundRecords = [...localBackgroundRecords].sort(
  (left, right) => left.sortOrder - right.sortOrder
);

for (const background of sortedBackgroundRecords) {
  if (!knownStageThemeIds.has(background.id as ToyStageThemeId)) {
    throw new Error(`Unknown toy background ID in Registry: ${background.id}`);
  }
}

export const toyStageThemes: readonly ToyStageThemeDefinition[] =
  sortedBackgroundRecords
    .filter((background) => background.enabled !== false)
    .map((background) => ({
      id: background.id as ToyStageThemeId,
      name: background.name,
      group: background.group,
      background: background.background,
      swatch: background.swatch,
      particle: background.particlePresetId
    }));

if (toyStageThemes.length === 0) {
  throw new Error("Asset Registry must expose at least one active background.");
}

const toyStageThemeById = new Map(
  toyStageThemes.map((theme) => [theme.id, theme])
);

export function getToyStageTheme(id: ToyStageThemeId) {
  return toyStageThemeById.get(id) ?? toyStageThemes[0];
}
