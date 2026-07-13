export type RarityCode = "common" | "rare" | "epic" | "legendary" | "mythic";

export type ToyBaseType = "bear" | "bunny" | "cat" | "blob" | "unicorn";

export type ToyAssets = {
  thumbnailUrl?: string;
  posterUrl?: string;
  modelUrl?: string;
  mobileModelUrl?: string;
};

export type Toy = {
  id: string;
  slug: string;
  name: string;
  seriesId: string;
  seriesName: string;
  rarity: RarityCode;
  baseType: ToyBaseType;
  jadeGrade: string;
  colorName: string;
  palette: string;
  shortDescription: string;
  drawWeight: number;
  assets: ToyAssets;
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
