import type {
  RecolorProfileRecord,
  ToyModelRecord
} from "../../data/asset-registry/types";
import type {
  ToyModelDefinition,
  ToyModelId
} from "../../types/toy";

type ToyRendering = NonNullable<ToyModelDefinition["rendering"]>;
type AccessoryRendering = Extract<
  ToyRendering,
  { mode: "color-accessory-mask" }
>;

function requireString(
  value: string | undefined,
  profile: RecolorProfileRecord,
  field: string
) {
  if (!value) {
    throw new Error(`Recolor profile ${profile.id} requires ${field}.`);
  }
  return value;
}

function requireColorScale(profile: RecolorProfileRecord) {
  if (profile.colorScale === undefined) {
    throw new Error(`Recolor profile ${profile.id} requires colorScale.`);
  }
  return profile.colorScale;
}

function resolveProfileAsset(
  value: string | undefined,
  profile: RecolorProfileRecord,
  field: string,
  resolveAssetUrl: (path: string) => string
) {
  return resolveAssetUrl(requireString(value, profile, field));
}

export function toToyRendering(
  profile: RecolorProfileRecord,
  resolveAssetUrl: (path: string) => string
): ToyRendering {
  const colorScale = requireColorScale(profile);

  switch (profile.rendererProfileId) {
    case "color-bunny-bag":
      return {
        mode: profile.rendererProfileId,
        protectMaskUrl: resolveProfileAsset(
          profile.protectMaskUrl,
          profile,
          "protectMaskUrl",
          resolveAssetUrl
        ),
        bagColorScale: colorScale
      };
    case "color-cat-yarn":
      return {
        mode: profile.rendererProfileId,
        materialName: requireString(
          profile.materialName,
          profile,
          "materialName"
        ),
        yarnColorScale: colorScale
      };
    case "color-panda-hat":
      return {
        mode: profile.rendererProfileId,
        protectMaskUrl: resolveProfileAsset(
          profile.protectMaskUrl,
          profile,
          "protectMaskUrl",
          resolveAssetUrl
        ),
        hatColorScale: colorScale
      };
    case "color-otter-lollipop":
      return {
        mode: profile.rendererProfileId,
        materialName: requireString(
          profile.materialName,
          profile,
          "materialName"
        ),
        lollipopColorScale: colorScale
      };
    case "color-bear-singer-afro":
    case "color-dog-camera-accessories":
    case "color-karpy-hat":
      return {
        mode: profile.rendererProfileId,
        maskUrl: resolveProfileAsset(
          profile.maskUrl,
          profile,
          "maskUrl",
          resolveAssetUrl
        ),
        colorScale
      };
    case "color-dog-drum":
      return {
        mode: profile.rendererProfileId,
        drumColorScale: colorScale
      };
    case "color-seal-starfish":
      return {
        mode: profile.rendererProfileId,
        maskUrl: resolveProfileAsset(
          profile.maskUrl,
          profile,
          "maskUrl",
          resolveAssetUrl
        ),
        objectMaskUrl: resolveProfileAsset(
          profile.objectMaskUrl,
          profile,
          "objectMaskUrl",
          resolveAssetUrl
        ),
        colorScale
      };
    case "color-koala-hat":
      return {
        mode: profile.rendererProfileId,
        maskUrl: resolveProfileAsset(
          profile.maskUrl,
          profile,
          "maskUrl",
          resolveAssetUrl
        ),
        hatColorScale: colorScale
      };
    case "color-accessory-mask": {
      const accessoryProfileId = requireString(
        profile.accessoryProfileId,
        profile,
        "accessoryProfileId"
      ) as AccessoryRendering["profile"];

      return {
        mode: profile.rendererProfileId,
        profile: accessoryProfileId,
        maskUrl: resolveProfileAsset(
          profile.maskUrl,
          profile,
          "maskUrl",
          resolveAssetUrl
        ),
        ...(profile.triangleMaskUrl
          ? { triangleMaskUrl: resolveAssetUrl(profile.triangleMaskUrl) }
          : {}),
        ...(profile.secondaryMaskUrl
          ? { secondaryMaskUrl: resolveAssetUrl(profile.secondaryMaskUrl) }
          : {}),
        colorScale
      };
    }
  }
}

export function toToyModelDefinition(
  record: ToyModelRecord,
  profile: RecolorProfileRecord | null,
  resolveAssetUrl: (path: string) => string
): ToyModelDefinition {
  if (record.recolorProfileId && !profile) {
    throw new Error(
      `Toy model ${record.id} cannot resolve ${record.recolorProfileId}.`
    );
  }

  return {
    id: record.id as ToyModelId,
    slug: record.id,
    name: record.name,
    fallbackShape: record.fallbackShape,
    assets: {
      modelUrl: resolveAssetUrl(record.assets.modelUrl),
      mobileModelUrl: resolveAssetUrl(
        record.assets.mobileModelUrl ?? record.assets.modelUrl
      )
    },
    viewer: {
      scaleMultiplier: record.calibration.scaleMultiplier,
      yOffset: record.calibration.yOffset,
      rotationY: record.calibration.rotationYDeg * Math.PI / 180
    },
    ...(profile
      ? { rendering: toToyRendering(profile, resolveAssetUrl) }
      : {})
  };
}
