import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryDir = resolve(rootDir, "src/data/asset-registry");
const publicDir = resolve(rootDir, "public");
const strict = process.argv.includes("--strict");
const phase2 = process.argv.includes("--phase2");
const tableFiles = {
  toyModels: "toy-models.json",
  palettes: "palettes.json",
  surfaces: "surfaces.json",
  backgrounds: "backgrounds.json",
  recolorProfiles: "recolor-profiles.json",
  series: "series.json",
  seriesMembers: "series-members.json"
};
const phase2TableKeys = [
  "palettes",
  "surfaces",
  "backgrounds",
  "series",
  "seriesMembers"
];
const requiredTableKeys = new Set(
  strict ? Object.keys(tableFiles) : phase2 ? phase2TableKeys : []
);
const errors = [];
const tables = {};
const idPattern = /^[a-z0-9][a-z0-9_-]*(?:-[a-z0-9_-]+)*$/;
const colorPattern = /^#[0-9a-f]{6}$/i;

function fail(path, message) {
  errors.push(`${path}: ${message}`);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadTable(key, filename) {
  const filePath = resolve(registryDir, filename);
  if (!existsSync(filePath)) {
    if (requiredTableKeys.has(key)) fail(key, `missing ${filename}`);
    return null;
  }

  let value;
  try {
    value = JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(key, `cannot parse ${filename}: ${error.message}`);
    return null;
  }

  if (!Array.isArray(value)) {
    fail(key, `${filename} must contain an array`);
    return null;
  }

  const ids = new Set();
  value.forEach((record, index) => {
    const path = `${key}[${index}]`;
    if (!isRecord(record)) {
      fail(path, "record must be an object");
      return;
    }
    if (typeof record.id !== "string" || !idPattern.test(record.id)) {
      fail(`${path}.id`, "ID must use stable lowercase Registry syntax");
    } else if (ids.has(record.id)) {
      fail(`${path}.id`, `duplicate ID ${record.id}`);
    } else {
      ids.add(record.id);
    }
    if (record.enabled !== undefined && typeof record.enabled !== "boolean") {
      fail(`${path}.enabled`, "enabled must be a boolean when present");
    }
  });

  return value;
}

for (const [key, filename] of Object.entries(tableFiles)) {
  tables[key] = loadTable(key, filename);
}

function idSet(records) {
  return new Set((records ?? []).map((record) => record.id).filter(Boolean));
}

function enabledIdSet(records) {
  return new Set(
    (records ?? [])
      .filter((record) => record.enabled !== false)
      .map((record) => record.id)
      .filter(Boolean)
  );
}

function validateAssetPath(value, path) {
  if (typeof value !== "string" || !value.trim()) {
    fail(path, "asset path must be a non-empty string");
    return;
  }
  if (/^(?:[a-z]+:)?\/\//i.test(value) || /^(?:data|blob):/i.test(value)) {
    fail(path, "asset path must be deployment-relative");
    return;
  }

  const cleanPath = value.split(/[?#]/, 1)[0]
    .replace(/^\.\//, "")
    .replace(/^\/+/, "");
  const resolvedPath = resolve(publicDir, cleanPath);
  const publicPrefix = publicDir.endsWith(sep) ? publicDir : `${publicDir}${sep}`;
  if (!resolvedPath.startsWith(publicPrefix) || !existsSync(resolvedPath)) {
    fail(path, `asset file does not exist under public/: ${value}`);
  }
}

function validateFinite(value, path, min, max) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    fail(path, "value must be a finite number");
  } else if (value < min || value > max) {
    fail(path, `value must be between ${min} and ${max}`);
  }
}

function validateColor(value, path, nullable = false) {
  if (nullable && value === null) return;
  if (typeof value !== "string" || !colorPattern.test(value)) {
    fail(path, "value must be a six-digit hex color");
  }
}

function validatePalettePolicy(
  policy,
  path,
  paletteIds,
  activePaletteIds,
  optional = false
) {
  if (optional && (policy === undefined || policy === null)) return;
  if (!isRecord(policy) || !["selected", "random"].includes(policy.mode)) {
    fail(path, "palette policy must use selected or random mode");
    return;
  }
  if (!Array.isArray(policy.paletteIds) || policy.paletteIds.length === 0) {
    fail(`${path}.paletteIds`, "palette policy must contain at least one palette");
    return;
  }

  const seen = new Set();
  let activeCount = 0;
  policy.paletteIds.forEach((paletteId, index) => {
    if (typeof paletteId !== "string" || !paletteIds.has(paletteId)) {
      fail(`${path}.paletteIds[${index}]`, `unknown palette ${paletteId}`);
    } else if (seen.has(paletteId)) {
      fail(`${path}.paletteIds[${index}]`, `duplicate palette ${paletteId}`);
    } else {
      seen.add(paletteId);
      if (activePaletteIds.has(paletteId)) activeCount += 1;
    }
  });

  if (activeCount === 0) {
    fail(path, "palette policy has no enabled palettes");
  }
  if (
    policy.mode === "selected"
    && (typeof policy.defaultPaletteId !== "string"
      || !paletteIds.has(policy.defaultPaletteId)
      || !policy.paletteIds.includes(policy.defaultPaletteId))
  ) {
    fail(`${path}.defaultPaletteId`, "selected policy needs a listed default palette");
  }
}

function validateSurfacePolicy(policy, path, surfaceIds) {
  if (policy === undefined || policy === null) return;
  if (!isRecord(policy) || !["default", "fixed"].includes(policy.mode)) {
    fail(path, "surface policy must use default or fixed mode");
    return;
  }
  if (
    policy.mode === "fixed"
    && (typeof policy.surfaceStyleId !== "string"
      || !surfaceIds.has(policy.surfaceStyleId))
  ) {
    fail(`${path}.surfaceStyleId`, `unknown surface ${policy.surfaceStyleId}`);
  }
}

const paletteIds = idSet(tables.palettes);
const activePaletteIds = enabledIdSet(tables.palettes);
const surfaceIds = idSet(tables.surfaces);
const profileIds = idSet(tables.recolorProfiles);
const modelIds = idSet(tables.toyModels);
const seriesIds = idSet(tables.series);

(tables.palettes ?? []).forEach((palette, index) => {
  const path = `palettes[${index}]`;
  for (const key of ["color", "attenuation", "emissive", "glow"]) {
    validateColor(palette[key], `${path}.${key}`);
  }
  validateFinite(palette.sortOrder, `${path}.sortOrder`, 0, 10000);
});

(tables.surfaces ?? []).forEach((surface, index) => {
  const path = `surfaces[${index}]`;
  if (!["matte", "metal"].includes(surface.kind)) {
    fail(`${path}.kind`, "surface kind must be matte or metal");
  }
  validateColor(surface.swatch, `${path}.swatch`);
  validateColor(surface.colorOverride, `${path}.colorOverride`, true);
  validateColor(surface.glowOverride, `${path}.glowOverride`, true);
  validateFinite(surface.sortOrder, `${path}.sortOrder`, 0, 10000);
  if (!isRecord(surface.render)) {
    fail(`${path}.render`, "surface render profiles are required");
  } else {
    for (const profile of ["detail", "compact", "tile", "thumbnail"]) {
      const values = surface.render[profile];
      if (!isRecord(values)) {
        fail(`${path}.render.${profile}`, "render profile is required");
        continue;
      }
      validateFinite(values.metalness, `${path}.render.${profile}.metalness`, 0, 1);
      validateFinite(values.roughness, `${path}.render.${profile}.roughness`, 0, 1);
      validateFinite(values.envMapIntensity, `${path}.render.${profile}.envMapIntensity`, 0, 4);
    }
  }
});

(tables.backgrounds ?? []).forEach((background, index) => {
  const path = `backgrounds[${index}]`;
  if (!["dynamic", "static"].includes(background.group)) {
    fail(`${path}.group`, "background group must be dynamic or static");
  }
  if (![null, "snow", "leaf"].includes(background.particlePresetId)) {
    fail(`${path}.particlePresetId`, "unknown particle preset");
  }
  validateColor(background.background, `${path}.background`);
  validateColor(background.swatch, `${path}.swatch`);
  validateFinite(background.sortOrder, `${path}.sortOrder`, 0, 10000);
});

(tables.toyModels ?? []).forEach((model, index) => {
  const path = `toyModels[${index}]`;
  if (!isRecord(model.assets)) {
    fail(`${path}.assets`, "assets must be an object");
  } else {
    validateAssetPath(model.assets.modelUrl, `${path}.assets.modelUrl`);
    if (model.assets.mobileModelUrl !== undefined) {
      validateAssetPath(model.assets.mobileModelUrl, `${path}.assets.mobileModelUrl`);
    }
  }
  if (!isRecord(model.calibration)) {
    fail(`${path}.calibration`, "calibration must be an object");
  } else {
    validateFinite(model.calibration.scaleMultiplier, `${path}.calibration.scaleMultiplier`, 0.05, 10);
    validateFinite(model.calibration.yOffset, `${path}.calibration.yOffset`, -10, 10);
    validateFinite(model.calibration.rotationYDeg, `${path}.calibration.rotationYDeg`, -360, 360);
  }
  if (
    tables.recolorProfiles
    && model.recolorProfileId !== null
    && !profileIds.has(model.recolorProfileId)
  ) {
    fail(`${path}.recolorProfileId`, `unknown recolor profile ${model.recolorProfileId}`);
  }
});

(tables.recolorProfiles ?? []).forEach((profile, index) => {
  for (const key of [
    "maskUrl",
    "protectMaskUrl",
    "triangleMaskUrl",
    "secondaryMaskUrl",
    "objectMaskUrl"
  ]) {
    if (profile[key] !== undefined) {
      validateAssetPath(profile[key], `recolorProfiles[${index}].${key}`);
    }
  }
});

(tables.series ?? []).forEach((series, index) => {
  const path = `series[${index}]`;
  if (!["color", "special"].includes(series.category)) {
    fail(`${path}.category`, "series category must be color or special");
  }
  validateFinite(series.ticketCost, `${path}.ticketCost`, 0, 1000);
  validateFinite(series.sortOrder, `${path}.sortOrder`, 0, 10000);
  validatePalettePolicy(
    series.palettePolicy,
    `${path}.palettePolicy`,
    paletteIds,
    activePaletteIds
  );
  validateSurfacePolicy(series.surfacePolicy, `${path}.surfacePolicy`, surfaceIds);
});

const memberPairs = new Set();
(tables.seriesMembers ?? []).forEach((member, index) => {
  const path = `seriesMembers[${index}]`;
  if (tables.series && !seriesIds.has(member.seriesId)) {
    fail(`${path}.seriesId`, `unknown series ${member.seriesId}`);
  }
  if (tables.toyModels && !modelIds.has(member.modelId)) {
    fail(`${path}.modelId`, `unknown model ${member.modelId}`);
  }
  if (member.id !== `${member.seriesId}--${member.modelId}`) {
    fail(`${path}.id`, "member ID must be seriesId--modelId");
  }
  const pair = `${member.seriesId}:${member.modelId}`;
  if (memberPairs.has(pair)) fail(path, `duplicate member ${pair}`);
  memberPairs.add(pair);
  validateFinite(member.displayOrder, `${path}.displayOrder`, 0, 10000);
  validateFinite(member.drawWeight, `${path}.drawWeight`, 0.000001, 1000000);
  validatePalettePolicy(
    member.palettePolicyOverride,
    `${path}.palettePolicyOverride`,
    paletteIds,
    activePaletteIds,
    true
  );
  validateSurfacePolicy(
    member.surfacePolicyOverride,
    `${path}.surfacePolicyOverride`,
    surfaceIds
  );
});

if (phase2) {
  for (const key of phase2TableKeys) {
    if (!(tables[key] ?? []).some((record) => record.enabled !== false)) {
      fail(key, "Phase 2 requires at least one enabled record");
    }
  }
}

if (strict && !(tables.toyModels ?? []).some((model) => model.enabled !== false)) {
  fail("toyModels", "strict validation requires at least one enabled model");
}

if (errors.length > 0) {
  console.error(`Asset Registry validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  const loadedTables = Object.values(tables).filter(Boolean).length;
  const recordCount = Object.values(tables)
    .filter(Boolean)
    .reduce((total, records) => total + records.length, 0);
  const suffix = loadedTables === 0
    ? " Contract shell is ready; data migration has not started."
    : "";
  console.log(`Asset Registry validation passed (${loadedTables} tables, ${recordCount} records).${suffix}`);
}
