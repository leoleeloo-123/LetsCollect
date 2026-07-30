import { localToyModelRecords } from "../../data/asset-registry/localTables";
import type { ToyModelId } from "../../types/toy";

const knownToyModelIds = [
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
] as const satisfies readonly ToyModelId[];

const knownToyModelIdSet = new Set<string>(knownToyModelIds);
const sortedToyModelRecords = [...localToyModelRecords].sort(
  (left, right) => left.sortOrder - right.sortOrder
);

for (const record of sortedToyModelRecords) {
  if (!knownToyModelIdSet.has(record.id)) {
    throw new Error(`Unknown formal Color Animal model ID: ${record.id}`);
  }
}

for (const id of knownToyModelIds) {
  if (!sortedToyModelRecords.some((record) => record.id === id)) {
    throw new Error(`Asset Registry is missing formal model: ${id}`);
  }
}

function requireNonEmptyRoster(ids: readonly ToyModelId[]) {
  if (ids.length === 0) {
    throw new Error("Asset Registry must expose at least one active toy model.");
  }
  return ids as readonly [ToyModelId, ...ToyModelId[]];
}

export const allFormalColorAnimalModelIds = requireNonEmptyRoster(
  sortedToyModelRecords.map((record) => record.id as ToyModelId)
);

export const formalColorAnimalModelIds = requireNonEmptyRoster(
  sortedToyModelRecords
    .filter((record) => record.enabled !== false)
    .map((record) => record.id as ToyModelId)
);

export type FormalColorAnimalModelId =
  (typeof formalColorAnimalModelIds)[number];
