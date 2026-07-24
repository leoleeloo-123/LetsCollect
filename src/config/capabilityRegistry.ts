import type { ToyModelId, ToyPaletteId } from "../types/toy";

export type CapabilityAvailability = "available" | "planned" | "experimental";
export type CapabilityCategory = "asset" | "experience" | "platform" | "agent" | "reward";
export type CurrentMaterialType = "matte" | "crystal";

export const matteColorIds = [
  "cocoa",
  "apricot",
  "cream-rose",
  "berry",
  "candy-mint",
  "grape",
  "coral",
  "lime",
  "sky"
] as const satisfies readonly ToyPaletteId[];

export const diamondColorIds = [
  "diamond-clear",
  "diamond-ice",
  "diamond-rose",
  "diamond-champagne",
  "diamond-mint"
] as const satisfies readonly ToyPaletteId[];

export const crystalAvailableColorIds = [
  ...diamondColorIds,
  ...matteColorIds
] as const satisfies readonly ToyPaletteId[];

const currentAssetIds = [
  "color-otter",
  "color-bird",
  "color-teddy",
  "color-bunny",
  "color-cat",
  "color-panda",
  "color-bear-singer",
  "color-dog-camera",
  "color-dog-drum",
  "color-seal",
  "color-karpy",
  "color-koala",
  "diamond-unicorn",
  "diamond-dog"
] as const satisfies readonly ToyModelId[];

export type CurrentAssetId = (typeof currentAssetIds)[number];

export type CurrentAssetRegistryEntry = {
  id: CurrentAssetId;
  name: string;
  material: CurrentMaterialType;
  availability: "available";
  availableColorIds: readonly ToyPaletteId[];
  defaultDrawColorIds: readonly ToyPaletteId[];
  drawRole: "regular" | "special_exhibit";
};

export const currentAssetRegistry = [
  {
    id: "color-otter",
    name: "Color Otter",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-bird",
    name: "Color Bird",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-teddy",
    name: "Color Teddy",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-bunny",
    name: "Color Bunny",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-cat",
    name: "Color Cat",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-panda",
    name: "Color Panda",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-bear-singer",
    name: "Color Bear Singer",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-dog-camera",
    name: "Color Dog Camera",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-dog-drum",
    name: "Color Dog Drum",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-seal",
    name: "Color Seal",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-karpy",
    name: "Color Karpy",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "color-koala",
    name: "Color Koala",
    material: "matte",
    availability: "available",
    availableColorIds: matteColorIds,
    defaultDrawColorIds: matteColorIds,
    drawRole: "regular"
  },
  {
    id: "diamond-unicorn",
    name: "Diamond Unicorn",
    material: "crystal",
    availability: "available",
    availableColorIds: crystalAvailableColorIds,
    defaultDrawColorIds: diamondColorIds,
    drawRole: "special_exhibit"
  },
  {
    id: "diamond-dog",
    name: "Diamond Dog",
    material: "crystal",
    availability: "available",
    availableColorIds: crystalAvailableColorIds,
    defaultDrawColorIds: diamondColorIds,
    drawRole: "special_exhibit"
  }
] as const satisfies readonly CurrentAssetRegistryEntry[];

export type CapabilityRegistryEntry = {
  id: string;
  label: string;
  availability: CapabilityAvailability;
  category: CapabilityCategory;
  description: string;
  requiresAssetCreation?: boolean;
};

export const capabilityRegistry = [
  {
    id: "matte_companion_models",
    label: "Twelve matte Companion models",
    availability: "available",
    category: "asset",
    description: "Twelve matte Companions share the approved nine-color palette."
  },
  {
    id: "matte_color_variants",
    label: "Configurable matte colors",
    availability: "available",
    category: "asset",
    description: "Nine approved palettes rendered on the twelve current matte models."
  },
  {
    id: "crystal_unicorn_exhibit",
    label: "Two crystal Companion exhibits",
    availability: "available",
    category: "asset",
    description: "Diamond Unicorn and Diamond Dog use five default crystal tints; explicit themed draws may use the nine regular colors."
  },
  {
    id: "local_draw_flow",
    label: "Current draw flow",
    availability: "available",
    category: "experience",
    description: "Local random draw and reveal flow using the current verified pool."
  },
  {
    id: "local_collection_flow",
    label: "Current collection flow",
    availability: "available",
    category: "experience",
    description: "Local collection persistence, thumbnails, and 3D detail inspection."
  },
  {
    id: "favorite_collection_items",
    label: "Favorite collection items",
    availability: "available",
    category: "experience",
    description: "Local Favorite persistence and filtering for collected Companions."
  },
  {
    id: "anonymous_profile_auth",
    label: "Anonymous profile auth",
    availability: "available",
    category: "platform",
    description: "Supabase anonymous authentication and a minimal collector profile."
  },
  {
    id: "representative_companions",
    label: "Representative Companions",
    availability: "available",
    category: "experience",
    description: "Local persistence for selecting up to three collection representatives."
  },
  {
    id: "collection_signature",
    label: "Collection Signature",
    availability: "available",
    category: "agent",
    description: "Explainable, rule-based summaries of recent collection tendencies."
  },
  {
    id: "echo_experience",
    label: "Finite anonymous Echo",
    availability: "experimental",
    category: "experience",
    description: "A bounded, no-chat resonance surface backed by demo adapters."
  },
  {
    id: "shared_collection_tasks",
    label: "Shared collection tasks",
    availability: "available",
    category: "experience",
    description: "A bounded local Echo task built on normal collection behavior."
  },
  {
    id: "deterministic_resonance_agent",
    label: "Deterministic Resonance Agent",
    availability: "experimental",
    category: "agent",
    description: "Structured recommendations with traceable shared signals."
  },
  {
    id: "typed_local_analytics",
    label: "Typed local analytics adapter",
    availability: "available",
    category: "platform",
    description: "A non-sensitive local event contract prepared for a future backend adapter."
  },
  {
    id: "evolution_campaign_console",
    label: "Evolution Agent Console",
    availability: "experimental",
    category: "agent",
    description: "Deterministic insights, proposals, feasibility checks, and approval demos."
  },
  {
    id: "campaign_configuration",
    label: "Campaign configuration control",
    availability: "available",
    category: "agent",
    description: "Human-approved local demo configuration; production release remains a separate step."
  },
  {
    id: "extra_draw_rewards",
    label: "Extra draw rewards",
    availability: "available",
    category: "reward",
    description: "A completed local Collect Together task can grant one existing draw."
  },
  {
    id: "badge_rewards",
    label: "Badge rewards",
    availability: "planned",
    category: "reward",
    description: "A future lightweight 2D reward type."
  },
  {
    id: "existing_color_unlock_rewards",
    label: "Existing color unlock rewards",
    availability: "planned",
    category: "reward",
    description: "Future gating for colors that already exist in the approved palette."
  },
  {
    id: "sleepy_companion_assets",
    label: "Sleepy Companion assets",
    availability: "planned",
    category: "asset",
    description: "No Sleepy 3D model is currently available.",
    requiresAssetCreation: true
  },
  {
    id: "quirky_companion_assets",
    label: "Quirky Companion assets",
    availability: "planned",
    category: "asset",
    description: "No Quirky 3D model is currently available.",
    requiresAssetCreation: true
  },
  {
    id: "bold_companion_assets",
    label: "Bold Companion assets",
    availability: "planned",
    category: "asset",
    description: "No Bold 3D model is currently available.",
    requiresAssetCreation: true
  },
  {
    id: "cool_companion_assets",
    label: "Cool Companion assets",
    availability: "planned",
    category: "asset",
    description: "No Cool 3D model is currently available.",
    requiresAssetCreation: true
  },
  {
    id: "more_crystal_companions",
    label: "More crystal Companions",
    availability: "planned",
    category: "asset",
    description: "Additional crystal Companions beyond Diamond Unicorn and Diamond Dog remain planned.",
    requiresAssetCreation: true
  },
  {
    id: "metallic_material",
    label: "Metallic material family",
    availability: "planned",
    category: "asset",
    description: "Not available in the active consumer draw pool.",
    requiresAssetCreation: true
  },
  {
    id: "fuzzy_material",
    label: "Fuzzy material family",
    availability: "planned",
    category: "asset",
    description: "Not available in the active consumer draw pool.",
    requiresAssetCreation: true
  },
  {
    id: "porcelain_material",
    label: "Porcelain material family",
    availability: "planned",
    category: "asset",
    description: "Not available in the active consumer draw pool.",
    requiresAssetCreation: true
  }
] as const satisfies readonly CapabilityRegistryEntry[];

export type CapabilityId = (typeof capabilityRegistry)[number]["id"];

const capabilityById = new Map<CapabilityId, (typeof capabilityRegistry)[number]>(
  capabilityRegistry.map((capability) => [capability.id, capability])
);

const assetById = new Map<CurrentAssetId, (typeof currentAssetRegistry)[number]>(
  currentAssetRegistry.map((asset) => [asset.id, asset])
);

export function getCapability(id: CapabilityId) {
  return capabilityById.get(id);
}

export function getCurrentAsset(id: CurrentAssetId) {
  return assetById.get(id);
}
