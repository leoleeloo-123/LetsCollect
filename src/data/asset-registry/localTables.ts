import backgroundsJson from "./backgrounds.json";
import palettesJson from "./palettes.json";
import seriesMembersJson from "./series-members.json";
import seriesJson from "./series.json";
import surfacesJson from "./surfaces.json";
import { AssetRegistryValidationError } from "./registry";
import type {
  BackgroundRecord,
  PaletteRecord,
  RegistryRecord,
  SeriesMemberRecord,
  SeriesRecord,
  SurfaceRecord
} from "./types";
import { validateAssetRegistrySnapshot } from "./validation";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeTable<T extends RegistryRecord>(
  tableName: string,
  source: unknown
): readonly T[] {
  if (!Array.isArray(source) || source.length === 0) {
    throw new Error(`${tableName} must contain at least one Registry record.`);
  }

  const ids = new Set<string>();
  const records = source.map((value, index) => {
    if (!isRecord(value) || typeof value.id !== "string" || !value.id) {
      throw new Error(`${tableName}[${index}] must have a stable string ID.`);
    }
    if (ids.has(value.id)) {
      throw new Error(`${tableName} contains duplicate ID: ${value.id}`);
    }
    if (value.enabled !== undefined && typeof value.enabled !== "boolean") {
      throw new Error(`${tableName}[${index}].enabled must be a boolean.`);
    }

    ids.add(value.id);
    return Object.freeze({ enabled: true, ...value }) as T;
  });

  return Object.freeze(records);
}

export const localPaletteRecords = normalizeTable<PaletteRecord>(
  "palettes",
  palettesJson
);

export const localSurfaceRecords = normalizeTable<SurfaceRecord>(
  "surfaces",
  surfacesJson
);

export const localBackgroundRecords = normalizeTable<BackgroundRecord>(
  "backgrounds",
  backgroundsJson
);

export const localSeriesRecords = normalizeTable<SeriesRecord>(
  "series",
  seriesJson
);

export const localSeriesMemberRecords = normalizeTable<SeriesMemberRecord>(
  "seriesMembers",
  seriesMembersJson
);

const validationResult = validateAssetRegistrySnapshot(
  {
    toyModels: [],
    palettes: localPaletteRecords,
    surfaces: localSurfaceRecords,
    backgrounds: localBackgroundRecords,
    recolorProfiles: [],
    series: localSeriesRecords,
    seriesMembers: localSeriesMemberRecords
  },
  {
    requireActiveToyModels: false,
    allowUnknownToyModelReferences: true
  }
);

if (!validationResult.valid) {
  throw new AssetRegistryValidationError(validationResult.errors);
}

export const localLowRiskRegistryTables = Object.freeze({
  palettes: localPaletteRecords,
  surfaces: localSurfaceRecords,
  backgrounds: localBackgroundRecords,
  series: localSeriesRecords,
  seriesMembers: localSeriesMemberRecords
});
