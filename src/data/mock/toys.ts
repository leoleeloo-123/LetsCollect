import type { Toy } from "../../types/toy";

export const mockToys: Toy[] = [
  {
    id: "toy_001",
    slug: "imperial-pink-jelly-bear",
    name: "Imperial Pink Jelly Bear",
    series: "Jelly Jade Mythics",
    rarity: "mythic",
    shortDescription: "A soft pink hero collectible with a verified GLB prototype.",
    modelUrl: "/public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb",
    owned: true
  },
  {
    id: "toy_002",
    slug: "moon-mint-bunny",
    name: "Moon Mint Bunny",
    series: "Jelly Jade Dreams",
    rarity: "epic",
    shortDescription: "A future mint-toned toy reserved for the first collection set.",
    owned: false
  },
  {
    id: "toy_003",
    slug: "honey-cloud-cat",
    name: "Honey Cloud Cat",
    series: "Jelly Jade Dreams",
    rarity: "rare",
    shortDescription: "A warm translucent collectible planned for catalog testing.",
    owned: false
  }
];
