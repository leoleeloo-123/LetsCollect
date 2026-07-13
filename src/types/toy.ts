export type RarityCode = "common" | "rare" | "epic" | "legendary" | "mythic";

export type Toy = {
  id: string;
  slug: string;
  name: string;
  series: string;
  rarity: RarityCode;
  shortDescription: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  owned: boolean;
};
