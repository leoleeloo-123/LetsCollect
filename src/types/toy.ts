export type RarityCode = "common" | "rare" | "epic" | "legendary" | "mythic";

export type ToyModelId =
  | "color-otter"
  | "color-bird"
  | "color-penguin"
  | "color-bunny"
  | "color-cat"
  | "color-panda"
  | "color-bear-singer"
  | "color-dog-camera"
  | "color-dog-drum"
  | "color-seal"
  | "color-karpy"
  | "color-koala"
  | "color-racoon"
  | "color-hamster-icecream"
  | "color-dino"
  | "color-fox"
  | "color-deer"
  | "color-sheep"
  | "color-sloth"
  | "color-owl"
  | "color-duck"
  | "color-guinea-pig"
  | "color-black-cat"
  | "color-cool-wolf";
export type ToyFallbackShape = "unicorn" | "cat" | "bunny" | "bird" | "dog" | "blob";
export type ToyPaletteId =
  | "cocoa"
  | "apricot"
  | "cream-rose"
  | "berry"
  | "candy-mint"
  | "grape"
  | "coral"
  | "lime"
  | "sky";
export type ToySurfaceStyleId = "matte" | "metal-gold";
export type ToyMaterialId =
  | "plastic"
  | "glass"
  | "wood"
  | "iron"
  | "copper"
  | "silver"
  | "gold"
  | "crystal";

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
        mode: "color-bunny-bag";
        protectMaskUrl: string;
        bagColorScale: number;
      }
    | {
        mode: "color-cat-yarn";
        materialName: string;
        yarnColorScale: number;
      }
    | {
        mode: "color-panda-hat";
        protectMaskUrl: string;
        hatColorScale: number;
      }
    | {
        mode: "color-otter-lollipop";
        materialName: string;
        lollipopColorScale: number;
      }
    | {
        mode: "color-bear-singer-afro";
        maskUrl: string;
        colorScale: number;
      }
    | {
        mode: "color-dog-camera-accessories";
        maskUrl: string;
        colorScale: number;
      }
    | {
        mode: "color-dog-drum";
        drumColorScale: number;
      }
    | {
        mode: "color-seal-starfish";
        maskUrl: string;
        objectMaskUrl: string;
        colorScale: number;
      }
    | {
        mode: "color-karpy-hat";
        maskUrl: string;
        colorScale: number;
      }
    | {
        mode: "color-koala-hat";
        maskUrl: string;
        hatColorScale: number;
      }
    | {
        mode: "color-accessory-mask";
        profile:
          | "bird-crown"
          | "penguin-accessories"
          | "racoon-tanghulu"
          | "hamster-icecream"
          | "dino-scarf"
          | "fox-hat"
          | "deer-accessories"
          | "sheep-accessories"
          | "sloth-hat"
          | "owl-academic"
          | "duck-bath"
          | "guinea-pig-balloons"
          | "black-cat-logo"
          | "cool-wolf-studs";
        maskUrl: string;
        triangleMaskUrl?: string;
        secondaryMaskUrl?: string;
        colorScale: number;
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
  appearanceSeed: number;
  generationVersion: number;
  appearance: AppearanceVector;
  appearanceSignature: string;
  surfaceStyleId?: ToySurfaceStyleId;
  shortDescription: string;
  createdAt: string;
};

export type DrawRecord = {
  id: string;
  collectibleId: string;
  createdAt: string;
  encounterSeriesId?: string;
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
