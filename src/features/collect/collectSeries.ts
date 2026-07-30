import {
  localSeriesMemberRecords,
  localSeriesRecords
} from "../../data/asset-registry/localTables";
import type {
  SeriesPalettePolicyRecord,
  SeriesRecord
} from "../../data/asset-registry/types";
import type {
  Collectible,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";
import { colorAnimalPalettes } from "../toys/catalog";
import {
  allFormalColorAnimalModelIds,
  formalColorAnimalModelIds
} from "../toys/formalRoster";
import { generateCollectible } from "../toys/generator";

export const availableCollectSeriesIds = [
  "color-spectrum",
  "foodies",
  "zzz",
  "monochrome",
  "outlaws",
  "dogs",
  "artists",
  "street",
  "flyers",
  "splash-sisters",
  "cats",
  "bears",
  "travelers",
  "potatoes"
] as const;

export type AvailableCollectSeriesId =
  (typeof availableCollectSeriesIds)[number];

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

type ColorSpectrumCollectSeries = AvailableCollectSeries & {
  id: "color-spectrum";
  category: "color";
  palettePolicy: SelectedPalettePolicy;
};

export type CollectSeriesDrawRequest = {
  seriesId: AvailableCollectSeriesId;
  paletteId?: ToyPaletteId;
};

const knownSeriesIds = new Set<string>(availableCollectSeriesIds);
const knownModelIds = new Set<string>(allFormalColorAnimalModelIds);
const activeModelIds = new Set<string>(formalColorAnimalModelIds);
const activePaletteIds = colorAnimalPalettes.map((palette) => palette.id);
const activePaletteIdSet = new Set<string>(activePaletteIds);

function isAvailableCollectSeriesId(
  id: string
): id is AvailableCollectSeriesId {
  return knownSeriesIds.has(id);
}

function toPalettePolicy(
  policy: SeriesPalettePolicyRecord,
  seriesId: string
): SelectedPalettePolicy | RandomPalettePolicy {
  const paletteIds = policy.paletteIds.filter(
    (paletteId): paletteId is ToyPaletteId => activePaletteIdSet.has(paletteId)
  );

  if (paletteIds.length === 0) {
    throw new Error(`Collect series ${seriesId} has no active palettes.`);
  }

  if (policy.mode === "selected") {
    const defaultPaletteId = activePaletteIdSet.has(policy.defaultPaletteId)
      ? policy.defaultPaletteId as ToyPaletteId
      : paletteIds[0];
    return { mode: "selected", paletteIds, defaultPaletteId };
  }

  return { mode: "random", paletteIds };
}

function toNonEmptyModelIds(
  modelIds: readonly ToyModelId[],
  seriesId: string
): readonly [ToyModelId, ...ToyModelId[]] {
  if (modelIds.length === 0) {
    throw new Error(`Collect series ${seriesId} has no active members.`);
  }
  return modelIds as readonly [ToyModelId, ...ToyModelId[]];
}

function buildCollectSeries(record: SeriesRecord): AvailableCollectSeries {
  if (!isAvailableCollectSeriesId(record.id)) {
    throw new Error(`Unknown collect series ID in Registry: ${record.id}`);
  }
  if (record.surfacePolicy && record.surfacePolicy.mode !== "default") {
    throw new Error(
      `Collect series ${record.id} uses a surface policy that Phase 2 cannot consume.`
    );
  }

  const members = localSeriesMemberRecords
    .filter((member) => member.seriesId === record.id)
    .sort((left, right) => left.displayOrder - right.displayOrder);

  for (const member of members) {
    if (!knownModelIds.has(member.modelId)) {
      throw new Error(
        `Collect series ${record.id} references unknown model: ${member.modelId}`
      );
    }
    if (member.drawWeight !== 1) {
      throw new Error(
        `Collect series ${record.id} uses draw weights before weighted draws are enabled.`
      );
    }
    if (member.palettePolicyOverride || member.surfacePolicyOverride) {
      throw new Error(
        `Collect series ${record.id} uses a member override that Phase 2 cannot consume.`
      );
    }
  }

  const modelIds = members
    .filter(
      (member) =>
        member.enabled !== false && activeModelIds.has(member.modelId)
    )
    .map((member) => member.modelId as ToyModelId);

  return {
    id: record.id,
    availability: "available",
    category: record.category,
    eyebrow: record.eyebrow,
    title: record.title,
    description: record.description,
    memberSummary: record.memberSummary,
    ticketCost: record.ticketCost,
    modelIds: toNonEmptyModelIds(modelIds, record.id),
    palettePolicy: toPalettePolicy(record.palettePolicy, record.id)
  };
}

for (const record of localSeriesRecords) {
  if (!isAvailableCollectSeriesId(record.id)) {
    throw new Error(`Unknown collect series ID in Registry: ${record.id}`);
  }
}

const builtCollectSeries = [...localSeriesRecords]
  .filter((series) => series.enabled !== false)
  .sort((left, right) => left.sortOrder - right.sortOrder)
  .map(buildCollectSeries);

const colorSpectrumCandidate = builtCollectSeries.find(
  (series) => series.id === "color-spectrum"
);

if (
  !colorSpectrumCandidate
  || colorSpectrumCandidate.category !== "color"
  || colorSpectrumCandidate.palettePolicy.mode !== "selected"
) {
  throw new Error("The active Registry must define color-spectrum as a selected color series.");
}

export const colorSpectrumSeries =
  colorSpectrumCandidate as ColorSpectrumCollectSeries;

export const specialCollectSeries = builtCollectSeries.filter(
  (series) => series.category === "special"
);

export const collectSeries = [
  colorSpectrumSeries,
  ...specialCollectSeries
] as readonly AvailableCollectSeries[];

const availableSeriesById = new Map<
  AvailableCollectSeriesId,
  AvailableCollectSeries
>(collectSeries.map((series) => [series.id, series]));

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
