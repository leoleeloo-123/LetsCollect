import type { AssetRegistrySnapshot } from "./types";

export type AssetRegistryValidationSeverity = "error" | "warning";

export type AssetRegistryValidationIssue = {
  severity: AssetRegistryValidationSeverity;
  code: string;
  path: string;
  message: string;
};

export type AssetRegistryValidationOptions = {
  requireActiveToyModels?: boolean;
};

export type AssetRegistryValidationResult = {
  valid: boolean;
  issues: readonly AssetRegistryValidationIssue[];
  errors: readonly AssetRegistryValidationIssue[];
  warnings: readonly AssetRegistryValidationIssue[];
};

type UnknownRecord = Record<string, unknown>;
type SnapshotTableKey = keyof AssetRegistrySnapshot;

const SNAPSHOT_TABLE_KEYS: readonly SnapshotTableKey[] = [
  "toyModels",
  "palettes",
  "surfaces",
  "backgrounds",
  "recolorProfiles",
  "series",
  "seriesMembers"
];

const ID_PATTERN = /^[a-z0-9][a-z0-9_-]*(?:-[a-z0-9_-]+)*$/;
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function addIssue(
  issues: AssetRegistryValidationIssue[],
  severity: AssetRegistryValidationSeverity,
  code: string,
  path: string,
  message: string
) {
  issues.push({ severity, code, path, message });
}

function getRecordId(record: UnknownRecord) {
  return typeof record.id === "string" ? record.id : null;
}

function isEnabled(record: UnknownRecord) {
  return record.enabled !== false;
}

function validateFiniteNumber(
  value: unknown,
  path: string,
  issues: AssetRegistryValidationIssue[],
  range?: { min: number; max: number }
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addIssue(issues, "error", "number.invalid", path, "Expected a finite number.");
    return;
  }

  if (range && (value < range.min || value > range.max)) {
    addIssue(
      issues,
      "error",
      "number.out_of_range",
      path,
      `Expected a value between ${range.min} and ${range.max}.`
    );
  }
}

function validateColor(
  value: unknown,
  path: string,
  issues: AssetRegistryValidationIssue[]
) {
  if (typeof value !== "string" || !HEX_COLOR_PATTERN.test(value)) {
    addIssue(issues, "error", "color.invalid", path, "Expected a six-digit hex color.");
  }
}

function validateAssetPath(
  value: unknown,
  path: string,
  issues: AssetRegistryValidationIssue[]
) {
  if (typeof value !== "string" || value.trim() === "") {
    addIssue(issues, "error", "asset_path.invalid", path, "Expected a non-empty asset path.");
    return;
  }

  if (/^(?:[a-z]+:)?\/\//i.test(value) || /^(?:data|blob):/i.test(value)) {
    addIssue(
      issues,
      "error",
      "asset_path.external",
      path,
      "Registry assets must use deployment-relative paths."
    );
  }
}

function validatePolicyReferences(
  policy: unknown,
  path: string,
  paletteIds: ReadonlySet<string>,
  surfaceIds: ReadonlySet<string>,
  issues: AssetRegistryValidationIssue[]
) {
  if (!isRecord(policy)) return;

  if (policy.mode === "selected" || policy.mode === "random") {
    if (!Array.isArray(policy.paletteIds) || policy.paletteIds.length === 0) {
      addIssue(issues, "error", "palette_policy.empty", `${path}.paletteIds`, "Expected at least one palette ID.");
    } else {
      policy.paletteIds.forEach((paletteId, index) => {
        if (typeof paletteId !== "string" || !paletteIds.has(paletteId)) {
          addIssue(
            issues,
            "error",
            "palette_policy.unknown_palette",
            `${path}.paletteIds[${index}]`,
            `Unknown palette ID: ${String(paletteId)}`
          );
        }
      });
    }

    if (
      policy.mode === "selected"
      && (typeof policy.defaultPaletteId !== "string"
        || !paletteIds.has(policy.defaultPaletteId))
    ) {
      addIssue(
        issues,
        "error",
        "palette_policy.invalid_default",
        `${path}.defaultPaletteId`,
        "Selected palette policy requires a registered default palette."
      );
    }
  }

  if (
    policy.mode === "fixed"
    && (typeof policy.surfaceStyleId !== "string"
      || !surfaceIds.has(policy.surfaceStyleId))
  ) {
    addIssue(
      issues,
      "error",
      "surface_policy.unknown_surface",
      `${path}.surfaceStyleId`,
      `Unknown surface ID: ${String(policy.surfaceStyleId)}`
    );
  }
}

function readSnapshotTables(
  snapshot: unknown,
  issues: AssetRegistryValidationIssue[]
) {
  if (!isRecord(snapshot)) {
    addIssue(issues, "error", "snapshot.invalid", "$", "Expected a Registry snapshot object.");
    return null;
  }

  const tables = {} as Record<SnapshotTableKey, UnknownRecord[]>;

  for (const key of SNAPSHOT_TABLE_KEYS) {
    const table = snapshot[key];
    if (!Array.isArray(table)) {
      addIssue(issues, "error", "table.invalid", key, "Expected an array.");
      tables[key] = [];
      continue;
    }

    tables[key] = table.flatMap((record, index) => {
      if (isRecord(record)) return [record];
      addIssue(issues, "error", "record.invalid", `${key}[${index}]`, "Expected an object record.");
      return [];
    });
  }

  return tables;
}

function validateRecordTable(
  key: SnapshotTableKey,
  records: readonly UnknownRecord[],
  issues: AssetRegistryValidationIssue[]
) {
  const seen = new Set<string>();

  records.forEach((record, index) => {
    const path = `${key}[${index}]`;
    const id = getRecordId(record);

    if (!id || !ID_PATTERN.test(id)) {
      addIssue(issues, "error", "id.invalid", `${path}.id`, "Expected a stable lowercase Registry ID.");
    } else if (seen.has(id)) {
      addIssue(issues, "error", "id.duplicate", `${path}.id`, `Duplicate ID: ${id}`);
    } else {
      seen.add(id);
    }

    if (record.enabled !== undefined && typeof record.enabled !== "boolean") {
      addIssue(issues, "error", "enabled.invalid", `${path}.enabled`, "Expected a boolean when enabled is present.");
    }
  });
}

export function validateAssetRegistrySnapshot(
  snapshot: unknown,
  options: AssetRegistryValidationOptions = {}
): AssetRegistryValidationResult {
  const issues: AssetRegistryValidationIssue[] = [];
  const tables = readSnapshotTables(snapshot, issues);

  if (tables) {
    for (const key of SNAPSHOT_TABLE_KEYS) {
      validateRecordTable(key, tables[key], issues);
    }

    const paletteIds = new Set(tables.palettes.map(getRecordId).filter(Boolean) as string[]);
    const surfaceIds = new Set(tables.surfaces.map(getRecordId).filter(Boolean) as string[]);
    const profileIds = new Set(tables.recolorProfiles.map(getRecordId).filter(Boolean) as string[]);
    const modelIds = new Set(tables.toyModels.map(getRecordId).filter(Boolean) as string[]);
    const seriesIds = new Set(tables.series.map(getRecordId).filter(Boolean) as string[]);

    if (options.requireActiveToyModels !== false && !tables.toyModels.some(isEnabled)) {
      addIssue(issues, "error", "toy_models.none_active", "toyModels", "Expected at least one enabled toy model.");
    }

    tables.toyModels.forEach((model, index) => {
      const path = `toyModels[${index}]`;
      if (!isRecord(model.assets)) {
        addIssue(issues, "error", "toy_model.assets_invalid", `${path}.assets`, "Expected an assets object.");
      } else {
        validateAssetPath(model.assets.modelUrl, `${path}.assets.modelUrl`, issues);
        if (model.assets.mobileModelUrl !== undefined) {
          validateAssetPath(model.assets.mobileModelUrl, `${path}.assets.mobileModelUrl`, issues);
        }
      }

      if (!isRecord(model.calibration)) {
        addIssue(issues, "error", "toy_model.calibration_invalid", `${path}.calibration`, "Expected calibration values.");
      } else {
        validateFiniteNumber(model.calibration.scaleMultiplier, `${path}.calibration.scaleMultiplier`, issues, { min: 0.05, max: 10 });
        validateFiniteNumber(model.calibration.yOffset, `${path}.calibration.yOffset`, issues, { min: -10, max: 10 });
        validateFiniteNumber(model.calibration.rotationYDeg, `${path}.calibration.rotationYDeg`, issues, { min: -360, max: 360 });
      }

      if (
        model.recolorProfileId !== null
        && (typeof model.recolorProfileId !== "string"
          || !profileIds.has(model.recolorProfileId))
      ) {
        addIssue(
          issues,
          "error",
          "toy_model.unknown_recolor_profile",
          `${path}.recolorProfileId`,
          `Unknown recolor profile: ${String(model.recolorProfileId)}`
        );
      }
    });

    tables.palettes.forEach((palette, index) => {
      for (const field of ["color", "attenuation", "emissive", "glow"] as const) {
        validateColor(palette[field], `palettes[${index}].${field}`, issues);
      }
    });

    tables.surfaces.forEach((surface, index) => {
      validateColor(surface.swatch, `surfaces[${index}].swatch`, issues);
      if (surface.colorOverride !== null) {
        validateColor(surface.colorOverride, `surfaces[${index}].colorOverride`, issues);
      }
      if (surface.glowOverride !== null) {
        validateColor(surface.glowOverride, `surfaces[${index}].glowOverride`, issues);
      }
    });

    tables.backgrounds.forEach((background, index) => {
      validateColor(background.background, `backgrounds[${index}].background`, issues);
      validateColor(background.swatch, `backgrounds[${index}].swatch`, issues);
    });

    tables.recolorProfiles.forEach((profile, index) => {
      const path = `recolorProfiles[${index}]`;
      for (const key of [
        "maskUrl",
        "protectMaskUrl",
        "triangleMaskUrl",
        "secondaryMaskUrl",
        "objectMaskUrl"
      ] as const) {
        if (profile[key] !== undefined) {
          validateAssetPath(profile[key], `${path}.${key}`, issues);
        }
      }
      if (profile.colorScale !== undefined) {
        validateFiniteNumber(profile.colorScale, `${path}.colorScale`, issues, { min: 0, max: 4 });
      }
    });

    tables.series.forEach((series, index) => {
      const path = `series[${index}]`;
      validateFiniteNumber(series.ticketCost, `${path}.ticketCost`, issues, { min: 0, max: 1000 });
      validatePolicyReferences(series.palettePolicy, `${path}.palettePolicy`, paletteIds, surfaceIds, issues);
      validatePolicyReferences(series.surfacePolicy, `${path}.surfacePolicy`, paletteIds, surfaceIds, issues);
    });

    const memberPairs = new Set<string>();
    tables.seriesMembers.forEach((member, index) => {
      const path = `seriesMembers[${index}]`;
      const seriesId = typeof member.seriesId === "string" ? member.seriesId : "";
      const modelId = typeof member.modelId === "string" ? member.modelId : "";

      if (!seriesIds.has(seriesId)) {
        addIssue(issues, "error", "series_member.unknown_series", `${path}.seriesId`, `Unknown series ID: ${seriesId}`);
      }
      if (!modelIds.has(modelId)) {
        addIssue(issues, "error", "series_member.unknown_model", `${path}.modelId`, `Unknown model ID: ${modelId}`);
      }

      const pair = `${seriesId}:${modelId}`;
      if (memberPairs.has(pair)) {
        addIssue(issues, "error", "series_member.duplicate", path, `Duplicate series member: ${pair}`);
      }
      memberPairs.add(pair);

      validateFiniteNumber(member.displayOrder, `${path}.displayOrder`, issues, { min: 0, max: 10000 });
      validateFiniteNumber(member.drawWeight, `${path}.drawWeight`, issues, { min: 0.000001, max: 1000000 });
      validatePolicyReferences(member.palettePolicyOverride, `${path}.palettePolicyOverride`, paletteIds, surfaceIds, issues);
      validatePolicyReferences(member.surfacePolicyOverride, `${path}.surfacePolicyOverride`, paletteIds, surfaceIds, issues);
    });
  }

  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  return {
    valid: errors.length === 0,
    issues,
    errors,
    warnings
  };
}
