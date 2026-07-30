import backgroundsJson from "./backgrounds.json";
import palettesJson from "./palettes.json";
import recolorProfilesJson from "./recolor-profiles.json";
import seriesMembersJson from "./series-members.json";
import seriesJson from "./series.json";
import surfacesJson from "./surfaces.json";
import toyModelsJson from "./toy-models.json";
import { createAssetRegistry } from "./registry";
import type {
  AssetRegistrySnapshot,
  BackgroundRecord,
  PaletteRecord,
  RecolorProfileRecord,
  RegistryRecord,
  SeriesMemberRecord,
  SeriesRecord,
  SurfaceRecord,
  ToyModelRecord
} from "./types";

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

export const localToyModelRecords = normalizeTable<ToyModelRecord>(
  "toyModels",
  toyModelsJson
);

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

export const localRecolorProfileRecords =
  normalizeTable<RecolorProfileRecord>(
    "recolorProfiles",
    recolorProfilesJson
  );

export const localSeriesRecords = normalizeTable<SeriesRecord>(
  "series",
  seriesJson
);

export const localSeriesMemberRecords = normalizeTable<SeriesMemberRecord>(
  "seriesMembers",
  seriesMembersJson
);

export const localAssetRegistrySnapshot: AssetRegistrySnapshot = Object.freeze({
  toyModels: localToyModelRecords,
  palettes: localPaletteRecords,
  surfaces: localSurfaceRecords,
  backgrounds: localBackgroundRecords,
  recolorProfiles: localRecolorProfileRecords,
  series: localSeriesRecords,
  seriesMembers: localSeriesMemberRecords
});

export const localAssetRegistry = createAssetRegistry(
  localAssetRegistrySnapshot
);
