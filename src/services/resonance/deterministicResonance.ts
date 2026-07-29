import { getColorMood } from "../../features/collect/collectPreferences";
import { getToyModel, getToyPalette } from "../../features/toys/catalog";
import type {
  EchoCandidateFixture,
  ResonanceContext,
  ResonanceResult,
  ResonanceSignal
} from "../../types/echo";
import type {
  Collectible,
  ToyMaterialId,
  ToyModelId,
  ToyPaletteId
} from "../../types/toy";

export interface ResonanceService {
  createResult(
    fixture: EchoCandidateFixture,
    generatedAt: string,
    context: ResonanceContext
  ): ResonanceResult;
}

function intersects<T>(left: ReadonlySet<T>, right: readonly T[]) {
  return right.some((value) => left.has(value));
}

function firstIntersection<T>(left: ReadonlySet<T>, right: readonly T[]) {
  return right.find((value) => left.has(value));
}

function cloneSignal(signal: ResonanceSignal): ResonanceSignal {
  return {
    ...signal,
    sourceModelIds: [...signal.sourceModelIds],
    sourcePaletteIds: [...signal.sourcePaletteIds],
    sourceMaterialIds: [...signal.sourceMaterialIds]
  };
}

function cloneCollectible(toy: Collectible): Collectible {
  return {
    ...toy,
    appearance: { ...toy.appearance },
    materialTraits: { ...toy.materialTraits }
  };
}

function uniqueSourceCount(signals: readonly ResonanceSignal[]) {
  const sources = new Set<string>();
  signals.forEach((signal) => {
    signal.sourceModelIds.forEach((id) => sources.add(`model:${id}`));
    signal.sourcePaletteIds.forEach((id) => sources.add(`palette:${id}`));
    signal.sourceMaterialIds.forEach((id) => sources.add(`material:${id}`));
  });
  return sources.size;
}

function createContextSets(context: ResonanceContext) {
  const collectionModelIds = new Set(
    context.collection.map((toy) => toy.modelId)
  );
  const collectionPaletteIds = new Set(
    context.collection.map((toy) => toy.paletteId)
  );
  const collectionMaterialIds = new Set(
    context.collection.map((toy) => toy.materialId)
  );
  const representativeIdSet = new Set(context.representativeIds);
  const representatives = context.collection.filter((toy) =>
    representativeIdSet.has(toy.id)
  );
  const representativeModelIds = new Set(
    representatives.map((toy) => toy.modelId)
  );
  const representativePaletteIds = new Set(
    representatives.map((toy) => toy.paletteId)
  );
  const recentCollection = [...context.collection]
    .sort((left, right) =>
      Date.parse(right.createdAt) - Date.parse(left.createdAt)
    )
    .slice(0, 5);
  const recentModelIds = new Set(recentCollection.map((toy) => toy.modelId));
  const recentPaletteIds = new Set(
    recentCollection.map((toy) => toy.paletteId)
  );

  return {
    collectionModelIds,
    collectionPaletteIds,
    collectionMaterialIds,
    representativeModelIds,
    representativePaletteIds,
    recentModelIds,
    recentPaletteIds
  };
}

function isFixtureSignalSupported(
  signal: ResonanceSignal,
  sets: ReturnType<typeof createContextSets>
) {
  if (signal.kind === "representative") {
    return intersects(sets.representativeModelIds, signal.sourceModelIds)
      || intersects(sets.representativePaletteIds, signal.sourcePaletteIds);
  }
  if (signal.kind === "trajectory") {
    return signal.sourcePaletteIds.length > 0
      ? intersects(sets.recentPaletteIds, signal.sourcePaletteIds)
      : intersects(sets.recentModelIds, signal.sourceModelIds);
  }
  if (signal.kind === "palette") {
    return intersects(sets.collectionPaletteIds, signal.sourcePaletteIds);
  }
  if (signal.kind === "model") {
    return intersects(sets.collectionModelIds, signal.sourceModelIds);
  }
  if (signal.kind === "material") {
    return intersects(sets.collectionMaterialIds, signal.sourceMaterialIds);
  }
  return false;
}

function createDerivedSignals(
  fixture: EchoCandidateFixture,
  context: ResonanceContext,
  sets: ReturnType<typeof createContextSets>
) {
  const candidateModelIds = [
    ...new Set(fixture.representativeCompanions.map((toy) => toy.modelId))
  ];
  const candidatePaletteIds = [
    ...new Set(fixture.representativeCompanions.map((toy) => toy.paletteId))
  ];
  const candidateMaterialIds = [
    ...new Set(fixture.representativeCompanions.map((toy) => toy.materialId))
  ];
  const derived: ResonanceSignal[] = [];
  const sharedRepresentativeModel = firstIntersection(
    sets.representativeModelIds,
    candidateModelIds
  );
  const sharedRepresentativePalette = firstIntersection(
    sets.representativePaletteIds,
    candidatePaletteIds
  );

  if (sharedRepresentativeModel || sharedRepresentativePalette) {
    const modelLabel = sharedRepresentativeModel
      ? getToyModel(sharedRepresentativeModel).name
      : null;
    const paletteLabel = sharedRepresentativePalette
      ? getToyPalette(sharedRepresentativePalette).name
      : null;
    derived.push({
      id: `${fixture.id}:representative-overlap`,
      kind: "representative",
      sourceModelIds: sharedRepresentativeModel ? [sharedRepresentativeModel] : [],
      sourcePaletteIds: sharedRepresentativePalette ? [sharedRepresentativePalette] : [],
      sourceMaterialIds: [],
      summary: "A representative detail in common",
      detail: modelLabel && paletteLabel
        ? `A ${modelLabel} and ${paletteLabel} colorway appear among both sets of Representative Companions.`
        : modelLabel
          ? `${modelLabel} appears among both sets of Representative Companions.`
          : `${paletteLabel} appears among both sets of Representative Companions.`
    });
  }

  const sharedPalette = firstIntersection(
    sets.collectionPaletteIds,
    candidatePaletteIds
  );
  if (sharedPalette) {
    derived.push({
      id: `${fixture.id}:palette-overlap`,
      kind: "palette",
      sourceModelIds: [],
      sourcePaletteIds: [sharedPalette],
      sourceMaterialIds: [],
      summary: "A colorway in common",
      detail: `${getToyPalette(sharedPalette).name} appears in your Collection and among this collector’s representatives.`
    });
  }

  const sharedModel = firstIntersection(
    sets.collectionModelIds,
    candidateModelIds
  );
  if (sharedModel) {
    derived.push({
      id: `${fixture.id}:model-overlap`,
      kind: "model",
      sourceModelIds: [sharedModel],
      sourcePaletteIds: [],
      sourceMaterialIds: [],
      summary: "A familiar Companion shape",
      detail: `${getToyModel(sharedModel).name} has found a place in both collecting paths.`
    });
  }

  const sharedMaterial = firstIntersection(
    sets.collectionMaterialIds,
    candidateMaterialIds
  );
  if (sharedMaterial) {
    const isCrystal = sharedMaterial === "crystal";
    derived.push({
      id: `${fixture.id}:material-overlap`,
      kind: "material",
      sourceModelIds: [],
      sourcePaletteIds: [],
      sourceMaterialIds: [sharedMaterial],
      summary: isCrystal ? "A crystal detail in common" : "A shared matte softness",
      detail: isCrystal
        ? "A future crystal material preference appears in both collecting paths."
        : "Both collecting paths currently make room for softly finished matte Companions."
    });
  }

  const preferredModel = context.tastePreferences.modelIds.find((modelId) =>
    candidateModelIds.includes(modelId)
  );
  if (preferredModel) {
    derived.push({
      id: `${fixture.id}:model-preference`,
      kind: "preference",
      sourceModelIds: [preferredModel],
      sourcePaletteIds: [],
      sourceMaterialIds: [],
      summary: "A stated Companion preference",
      detail: `Your current preference for ${getToyModel(preferredModel).name} overlaps with this collector’s representatives.`
    });
  }

  const preferredMoodPalettes =
    context.tastePreferences.colorMood === "open"
      ? []
      : getColorMood(context.tastePreferences.colorMood).paletteIds;
  const preferredPalette = preferredMoodPalettes.find((paletteId) =>
    candidatePaletteIds.includes(paletteId)
  );
  if (preferredPalette) {
    derived.push({
      id: `${fixture.id}:palette-preference`,
      kind: "preference",
      sourceModelIds: [],
      sourcePaletteIds: [preferredPalette],
      sourceMaterialIds: [],
      summary: "A color mood overlap",
      detail: `Your current color mood points toward ${getToyPalette(preferredPalette).name}, which appears in this collector’s representatives.`
    });
  }

  return derived;
}

function dedupeSignals(signals: ResonanceSignal[]) {
  const seen = new Set<string>();
  return signals.filter((signal) => {
    const key = [
      signal.kind,
      ...signal.sourceModelIds,
      ...signal.sourcePaletteIds,
      ...signal.sourceMaterialIds
    ].join(":");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export class DeterministicResonanceService implements ResonanceService {
  createResult(
    fixture: EchoCandidateFixture,
    generatedAt: string,
    context: ResonanceContext
  ): ResonanceResult {
    const sets = createContextSets(context);
    const supportedFixtureSignals = fixture.sharedSignals
      .filter((signal) => isFixtureSignalSupported(signal, sets))
      .map(cloneSignal);
    const derivedSignals = createDerivedSignals(fixture, context, sets);
    const sharedSignals = dedupeSignals([
      ...supportedFixtureSignals,
      ...derivedSignals
    ]).slice(0, 3);
    const fallbackSignal: ResonanceSignal = {
      id: `${fixture.id}:current-pool`,
      kind: "preference",
      sourceModelIds: [],
      sourcePaletteIds: [],
      sourceMaterialIds: [],
      summary: "Two collections still taking shape",
      detail: "Both paths are exploring the same small, current Companion collection without asking for anything more."
    };
    const visibleSignals = sharedSignals.length > 0
      ? sharedSignals
      : [fallbackSignal];
    const sourceCount = uniqueSourceCount(visibleSignals);
    const favoriteSupport = context.collection.filter((toy) =>
      context.favoriteIds.includes(toy.id)
      && visibleSignals.some((signal) =>
        signal.sourceModelIds.includes(toy.modelId)
        || signal.sourcePaletteIds.includes(toy.paletteId)
      )
    ).length;
    const representativeSupport = context.collection.filter((toy) =>
      context.representativeIds.includes(toy.id)
      && visibleSignals.some((signal) =>
        signal.sourceModelIds.includes(toy.modelId)
        || signal.sourcePaletteIds.includes(toy.paletteId)
      )
    ).length;
    const internalScore = Math.min(
      96,
      45
        + visibleSignals.length * 9
        + Math.min(sourceCount, 8) * 2
        + favoriteSupport * 3
        + representativeSupport * 4
    );
    const confidence = Math.min(
      0.94,
      0.5
        + visibleSignals.length * 0.08
        + Math.min(sourceCount, 8) * 0.015
        + representativeSupport * 0.025
    );

    return {
      candidateId: fixture.id,
      anonymousName: fixture.anonymousName,
      representativeCompanions: fixture.representativeCompanions.map(
        cloneCollectible
      ),
      sharedSignals: visibleSignals,
      primaryReason: visibleSignals[0].detail,
      secondaryReason: visibleSignals[1]?.detail,
      internalScore,
      confidence,
      generatedAt
    };
  }
}
