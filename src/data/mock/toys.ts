import { generateCollectible } from "../../features/toys/generator";

export const mockToys = [
  generateCollectible({ id: "toy_001", publicCode: "LC-DOG00001", seed: 73, modelId: "color-dog", paletteId: "cream-rose", createdAt: "2026-07-01T00:00:00.000Z" }),
  generateCollectible({ id: "toy_002", publicCode: "LC-DOG00002", seed: 26, modelId: "color-dog", paletteId: "candy-mint", createdAt: "2026-07-02T00:00:00.000Z" }),
  generateCollectible({ id: "toy_003", publicCode: "LC-DOG00003", seed: 64, modelId: "color-dog", paletteId: "apricot", createdAt: "2026-07-03T00:00:00.000Z" }),
  generateCollectible({ id: "toy_004", publicCode: "LC-DOG00004", seed: 8, modelId: "color-dog", paletteId: "berry", createdAt: "2026-07-04T00:00:00.000Z" }),
  generateCollectible({ id: "toy_005", publicCode: "LC-DOG00005", seed: 7, modelId: "color-dog", paletteId: "sky", createdAt: "2026-07-05T00:00:00.000Z" }),
  generateCollectible({ id: "toy_006", publicCode: "LC-DOG00006", seed: 582610, modelId: "color-dog", paletteId: "grape", createdAt: "2026-07-06T00:00:00.000Z" })
];

export const starterCollectionToys = mockToys.slice(0, 2);
export const featuredToy = mockToys[4];
export const toyById = new Map(mockToys.map((toy) => [toy.id, toy]));
