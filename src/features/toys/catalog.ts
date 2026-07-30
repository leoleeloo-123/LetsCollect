import {
  localAssetRegistry,
  localPaletteRecords,
  localToyModelRecords
} from "../../data/asset-registry/localTables";
import type {
  RarityCode,
  ToyModelDefinition,
  ToyModelId,
  ToyPaletteDefinition,
  ToyPaletteId
} from "../../types/toy";
import { toToyModelDefinition } from "./registryAdapters";

const knownToyPaletteIds = new Set<ToyPaletteId>([
  "cocoa",
  "apricot",
  "cream-rose",
  "berry",
  "candy-mint",
  "grape",
  "coral",
  "lime",
  "sky"
]);

const sortedPaletteRecords = [...localPaletteRecords].sort(
  (left, right) => left.sortOrder - right.sortOrder
);

for (const palette of sortedPaletteRecords) {
  if (!knownToyPaletteIds.has(palette.id as ToyPaletteId)) {
    throw new Error(`Unknown toy palette ID in Registry: ${palette.id}`);
  }
}

export const colorAnimalPalettes: ToyPaletteDefinition[] = sortedPaletteRecords
  .filter((palette) => palette.enabled !== false)
  .map((palette) => ({
    id: palette.id as ToyPaletteId,
    name: palette.name,
    color: palette.color,
    attenuation: palette.attenuation,
    emissive: palette.emissive,
    glow: palette.glow
  }));

if (colorAnimalPalettes.length === 0) {
  throw new Error("Asset Registry must expose at least one active toy palette.");
}

const allColorAnimalModels = [...localToyModelRecords]
  .sort((left, right) => left.sortOrder - right.sortOrder)
  .map((record) =>
    toToyModelDefinition(
      record,
      localAssetRegistry.resolveToyRecolorProfile(record.id),
      localAssetRegistry.resolveAssetUrl
    )
  );

const activeModelIds = new Set(
  localAssetRegistry.getActiveToyModels().map((record) => record.id)
);

export const colorAnimalModels: ToyModelDefinition[] = allColorAnimalModels
  .filter((model) => activeModelIds.has(model.id));

if (colorAnimalModels.length === 0) {
  throw new Error("Asset Registry must expose at least one active toy model.");
}

export const rarityLabels: Record<RarityCode, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  mythic: "神话"
};

const toyModelById = new Map(
  allColorAnimalModels.map((model) => [model.id, model])
);
const toyPaletteById = new Map(
  colorAnimalPalettes.map((palette) => [palette.id, palette])
);

export function getToyModel(id: ToyModelId) {
  return toyModelById.get(id) ?? colorAnimalModels[0];
}

export function getToyPalette(id: ToyPaletteId) {
  return toyPaletteById.get(id) ?? colorAnimalPalettes[0];
}

export function getToyRenderingAssetKey(model: ToyModelDefinition) {
  if (model.rendering?.mode === "color-bunny-bag") {
    return model.rendering.protectMaskUrl;
  }
  if (model.rendering?.mode === "color-cat-yarn") {
    return model.rendering.materialName;
  }
  if (model.rendering?.mode === "color-panda-hat") {
    return model.rendering.protectMaskUrl;
  }
  if (model.rendering?.mode === "color-otter-lollipop") {
    return model.rendering.materialName;
  }
  if (model.rendering?.mode === "color-bear-singer-afro") {
    return model.rendering.maskUrl;
  }
  if (model.rendering?.mode === "color-dog-camera-accessories") {
    return model.rendering.maskUrl;
  }
  if (model.rendering?.mode === "color-dog-drum") {
    return "color-dog-drum-material-v1";
  }
  if (model.rendering?.mode === "color-seal-starfish") {
    return `${model.rendering.maskUrl}:${model.rendering.objectMaskUrl}`;
  }
  if (model.rendering?.mode === "color-karpy-hat") {
    return model.rendering.maskUrl;
  }
  if (model.rendering?.mode === "color-koala-hat") {
    return model.rendering.maskUrl;
  }
  if (model.rendering?.mode === "color-accessory-mask") {
    return [
      model.rendering.profile,
      model.rendering.maskUrl,
      model.rendering.secondaryMaskUrl ?? ""
    ].join(":");
  }
  return "unmasked";
}
