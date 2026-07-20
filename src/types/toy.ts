export type RarityCode = "common" | "rare" | "epic" | "legendary" | "mythic";

export type ToyModelId =
  | "unicorn"
  | "kitty"
  | "bunny"
  | "bird"
  | "doggy"
  | "karpy"
  | "color-dog"
  | "color-bird"
  | "color-teddy"
  | "color-bunny"
  | "color-cat";

export type ToyFallbackShape = "unicorn" | "cat" | "bunny" | "bird" | "dog" | "blob";
export type ToyPaletteId =
  | "rose"
  | "mint"
  | "honey"
  | "ice"
  | "emerald"
  | "lavender"
  | "moon"
  | "ink"
  | "cocoa"
  | "apricot"
  | "cream-rose"
  | "berry"
  | "candy-mint"
  | "grape"
  | "coral"
  | "lime"
  | "sky";
export type ToyMaterialId = "jade" | "plastic" | "glass" | "wood" | "iron" | "copper" | "silver" | "gold" | "crystal";

export type ToyModelDefinition = {
  id: ToyModelId;
  slug: string;
  name: string;
  fallbackShape: ToyFallbackShape;
  assets: {
    modelUrl: string;
    mobileModelUrl: string;
  };
  viewer: {
    scaleMultiplier: number;
    yOffset: number;
    rotationY: number;
  };
  rendering?:
    | {
        mode: "protected-coat";
        protectMaskUrl: string;
        coatColorScale: number;
      }
    | {
        mode: "color-bird-zones";
        zoneMaskUrl: string;
        bodyColorScale: number;
        capColorScale: number;
        blushColor: string;
        feetColor: string;
      }
    | {
        mode: "color-teddy-coat";
        protectMaskUrl: string;
        coatColorScale: number;
      }
    | {
        mode: "color-bunny-bag";
        protectMaskUrl: string;
        bagColorScale: number;
      }
    | {
        mode: "color-cat-coat";
        protectMaskUrl: string;
        coatColorScale: number;
      };
};

export type ToyPaletteDefinition = {
  id: ToyPaletteId;
  name: string;
  color: string;
  attenuation: string;
  emissive: string;
  glow: string;
};

export type AppearanceVector = {
  transparency: number;
  colorDepth: number;
  hydration: number;
  luster: number;
  glow: number;
};

export type MaterialTraits = {
  craftsmanship: number;
  finish: number;
  purity: number;
  character: number;
  brilliance: number;
};

export type Collectible = {
  id: string;
  publicCode: string;
  modelId: ToyModelId;
  paletteId: ToyPaletteId;
  name: string;
  seriesId: string;
  seriesName: string;
  rarity: RarityCode;
  qualityScore: number;
  materialId: ToyMaterialId;
  materialGrade: string;
  materialTraits: MaterialTraits;
  transparencyGrade?: number;
  jadeGrade?: string;
  appearanceSeed: number;
  generationVersion: number;
  appearance: AppearanceVector;
  appearanceSignature: string;
  shortDescription: string;
  createdAt: string;
};

export type DrawRecord = {
  id: string;
  collectibleId: string;
  createdAt: string;
};

export type SocialActivity = {
  id: string;
  userName: string;
  userInitial: string;
  action: string;
  toyId: string;
  timeLabel: string;
  reward: number;
};

export type FriendProfile = {
  id: string;
  name: string;
  handle: string;
  initial: string;
  collectionCount: number;
  featuredToyId: string;
};
