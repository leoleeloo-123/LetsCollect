import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const registryDir = resolve(rootDir, "src/data/asset-registry");
const publicDir = resolve(rootDir, "public");
const strict = process.argv.includes("--strict");
const tableFiles = {
  toyModels: "toy-models.json",
  palettes: "palettes.json",
  surfaces: "surfaces.json",
  backgrounds: "backgrounds.json",
  recolorProfiles: "recolor-profiles.json",
  series: "series.json",
  seriesMembers: "series-members.json"
};
const errors = [];
const tables = {};

function fail(path, message) {
  errors.push(`${path}: ${message}`);
}

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function loadTable(key, filename) {
  const filePath = resolve(registryDir, filename);
  if (!existsSync(filePath)) {
    if (strict) fail(key, `missing ${filename}`);
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
    if (typeof record.id !== "string" || !record.id) {
      fail(`${path}.id`, "ID must be a non-empty string");
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

function validateAssetPath(value, path) {
  if (typeof value !== "string" || !value.trim()) {
    fail(path, "asset path must be a non-empty string");
    return;
  }
  if (/^(?:[a-z]+:)?\/\//i.test(value) || /^(?:data|blob):/i.test(value)) {
    fail(path, "asset path must be deployment-relative");
    return;
  }

  const cleanPath = value.split(/[?#]/, 1)[0].replace(/^\.\//, "").replace(/^\/+/, "");
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

const profileIds = idSet(tables.recolorProfiles);
const modelIds = idSet(tables.toyModels);
const seriesIds = idSet(tables.series);

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

const memberPairs = new Set();
(tables.seriesMembers ?? []).forEach((member, index) => {
  const path = `seriesMembers[${index}]`;
  if (tables.series && !seriesIds.has(member.seriesId)) {
    fail(`${path}.seriesId`, `unknown series ${member.seriesId}`);
  }
  if (tables.toyModels && !modelIds.has(member.modelId)) {
    fail(`${path}.modelId`, `unknown model ${member.modelId}`);
  }
  const pair = `${member.seriesId}:${member.modelId}`;
  if (memberPairs.has(pair)) fail(path, `duplicate member ${pair}`);
  memberPairs.add(pair);
  validateFinite(member.displayOrder, `${path}.displayOrder`, 0, 10000);
  validateFinite(member.drawWeight, `${path}.drawWeight`, 0.000001, 1000000);
});

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
