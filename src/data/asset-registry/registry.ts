import type {
  AssetRegistrySnapshot,
  BackgroundRecord,
  PaletteRecord,
  RecolorProfileRecord,
  ResolvedToyPresentation,
  SeriesMemberRecord,
  SeriesRecord,
  SurfaceRecord,
  ToyModelRecord,
  ToyPresentationContext
} from "./types";
import {
  validateAssetRegistrySnapshot,
  type AssetRegistryValidationIssue
} from "./validation";

export type CreateAssetRegistryOptions = {
  assetBaseUrl?: string;
  validate?: boolean;
  requireActiveToyModels?: boolean;
};

export type SeriesMemberQueryOptions = {
  includeDisabled?: boolean;
};

export type AssetRegistry = {
  readonly snapshot: AssetRegistrySnapshot;
  getToyModel(id: string): ToyModelRecord | null;
  getToyPalette(id: string): PaletteRecord | null;
  getToySurfaceStyle(id: string): SurfaceRecord | null;
  getToyBackground(id: string): BackgroundRecord | null;
  getCollectSeries(id: string): SeriesRecord | null;
  getRecolorProfile(id: string): RecolorProfileRecord | null;
  getActiveToyModels(): readonly ToyModelRecord[];
  getActiveToyPalettes(): readonly PaletteRecord[];
  getActiveToySurfaceStyles(): readonly SurfaceRecord[];
  getActiveToyBackgrounds(): readonly BackgroundRecord[];
  getActiveCollectSeries(): readonly SeriesRecord[];
  getSeriesMembers(
    seriesId: string,
    options?: SeriesMemberQueryOptions
  ): readonly SeriesMemberRecord[];
  resolveToyRecolorProfile(modelId: string): RecolorProfileRecord | null;
  resolveToyPresentation(
    modelId: string,
    context: ToyPresentationContext
  ): ResolvedToyPresentation | null;
  resolveAssetUrl(assetPath: string): string;
};

export class AssetRegistryValidationError extends Error {
  readonly issues: readonly AssetRegistryValidationIssue[];

  constructor(issues: readonly AssetRegistryValidationIssue[]) {
    const summary = issues
      .slice(0, 4)
      .map((issue) => `${issue.path}: ${issue.message}`)
      .join("; ");
    const suffix = issues.length > 4 ? `; and ${issues.length - 4} more` : "";
    super(`Invalid Asset Registry snapshot: ${summary}${suffix}`);
    this.name = "AssetRegistryValidationError";
    this.issues = issues;
  }
}

function isEnabled(record: { enabled?: boolean }) {
  return record.enabled !== false;
}

function sortByOrder<T extends { sortOrder: number }>(records: readonly T[]) {
  return Object.freeze(
    [...records].sort((left, right) => left.sortOrder - right.sortOrder)
  );
}

function toMap<T extends { id: string }>(records: readonly T[]) {
  return new Map(records.map((record) => [record.id, record] as const));
}

function freezeSnapshot(snapshot: AssetRegistrySnapshot): AssetRegistrySnapshot {
  return Object.freeze({
    toyModels: Object.freeze([...snapshot.toyModels]),
    palettes: Object.freeze([...snapshot.palettes]),
    surfaces: Object.freeze([...snapshot.surfaces]),
    backgrounds: Object.freeze([...snapshot.backgrounds]),
    recolorProfiles: Object.freeze([...snapshot.recolorProfiles]),
    series: Object.freeze([...snapshot.series]),
    seriesMembers: Object.freeze([...snapshot.seriesMembers])
  });
}

function radians(degrees: number) {
  return degrees * Math.PI / 180;
}

export function resolveAssetUrl(assetPath: string, assetBaseUrl = "/") {
  const trimmedPath = assetPath.trim();
  if (!trimmedPath) return "";

  if (/^(?:[a-z]+:)?\/\//i.test(trimmedPath) || /^(?:data|blob):/i.test(trimmedPath)) {
    return trimmedPath;
  }

  const relativePath = trimmedPath.replace(/^\.\//, "").replace(/^\/+/, "");
  const trimmedBase = assetBaseUrl.trim();

  if (!trimmedBase || trimmedBase === "/") {
    return `/${relativePath}`;
  }

  if (/^https?:\/\//i.test(trimmedBase)) {
    const baseWithSlash = trimmedBase.endsWith("/") ? trimmedBase : `${trimmedBase}/`;
    return new URL(relativePath, baseWithSlash).toString();
  }

  const normalizedBase = trimmedBase.endsWith("/")
    ? trimmedBase.slice(0, -1)
    : trimmedBase;
  return `${normalizedBase}/${relativePath}`;
}

export function createAssetRegistry(
  sourceSnapshot: AssetRegistrySnapshot,
  options: CreateAssetRegistryOptions = {}
): AssetRegistry {
  if (options.validate !== false) {
    const result = validateAssetRegistrySnapshot(sourceSnapshot, {
      requireActiveToyModels: options.requireActiveToyModels
    });
    if (!result.valid) {
      throw new AssetRegistryValidationError(result.errors);
    }
  }

  const snapshot = freezeSnapshot(sourceSnapshot);
  const toyModelsById = toMap(snapshot.toyModels);
  const palettesById = toMap(snapshot.palettes);
  const surfacesById = toMap(snapshot.surfaces);
  const backgroundsById = toMap(snapshot.backgrounds);
  const recolorProfilesById = toMap(snapshot.recolorProfiles);
  const seriesById = toMap(snapshot.series);
  const activeToyModels = sortByOrder(snapshot.toyModels.filter(isEnabled));
  const activePalettes = sortByOrder(snapshot.palettes.filter(isEnabled));
  const activeSurfaces = sortByOrder(snapshot.surfaces.filter(isEnabled));
  const activeBackgrounds = sortByOrder(snapshot.backgrounds.filter(isEnabled));
  const activeSeries = sortByOrder(snapshot.series.filter(isEnabled));
  const seriesMemberBuckets = new Map<string, SeriesMemberRecord[]>();

  for (const member of snapshot.seriesMembers) {
    const members = seriesMemberBuckets.get(member.seriesId) ?? [];
    members.push(member);
    seriesMemberBuckets.set(member.seriesId, members);
  }

  const seriesMembersBySeriesId = new Map<
    string,
    readonly SeriesMemberRecord[]
  >();
  for (const [seriesId, members] of seriesMemberBuckets) {
    seriesMembersBySeriesId.set(
      seriesId,
      Object.freeze(
        [...members].sort(
          (left, right) => left.displayOrder - right.displayOrder
        )
      )
    );
  }

  return Object.freeze({
    snapshot,
    getToyModel: (id: string) => toyModelsById.get(id) ?? null,
    getToyPalette: (id: string) => palettesById.get(id) ?? null,
    getToySurfaceStyle: (id: string) => surfacesById.get(id) ?? null,
    getToyBackground: (id: string) => backgroundsById.get(id) ?? null,
    getCollectSeries: (id: string) => seriesById.get(id) ?? null,
    getRecolorProfile: (id: string) => recolorProfilesById.get(id) ?? null,
    getActiveToyModels: () => activeToyModels,
    getActiveToyPalettes: () => activePalettes,
    getActiveToySurfaceStyles: () => activeSurfaces,
    getActiveToyBackgrounds: () => activeBackgrounds,
    getActiveCollectSeries: () => activeSeries,
    getSeriesMembers: (
      seriesId: string,
      queryOptions: SeriesMemberQueryOptions = {}
    ) => {
      const members = seriesMembersBySeriesId.get(seriesId) ?? [];
      if (queryOptions.includeDisabled) return members;
      if (!isEnabled(seriesById.get(seriesId) ?? { enabled: false })) return [];

      return members.filter((member) => {
        const model = toyModelsById.get(member.modelId);
        return isEnabled(member) && Boolean(model && isEnabled(model));
      });
    },
    resolveToyRecolorProfile: (modelId: string) => {
      const profileId = toyModelsById.get(modelId)?.recolorProfileId;
      return profileId ? recolorProfilesById.get(profileId) ?? null : null;
    },
    resolveToyPresentation: (
      modelId: string,
      context: ToyPresentationContext
    ) => {
      const model = toyModelsById.get(modelId);
      if (!model) return null;
      const override = model.presentation?.[context];

      return {
        context,
        scaleMultiplier: model.calibration.scaleMultiplier,
        yOffset: model.calibration.yOffset,
        rotationYRad: radians(model.calibration.rotationYDeg),
        framingScale: override?.framingScale ?? 1,
        targetYOffset: override?.targetYOffset ?? 0,
        yawOffsetRad: radians(override?.yawOffsetDeg ?? 0),
        padding: override?.padding ?? 1
      };
    },
    resolveAssetUrl: (assetPath: string) =>
      resolveAssetUrl(assetPath, options.assetBaseUrl)
  });
}
