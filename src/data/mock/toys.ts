import { generateCollectible } from "../../features/toys/generator";

export const mockToys = [
  generateCollectible({ id: "toy_001", publicCode: "LC-DOG00001", seed: 73, modelId: "color-dog", paletteId: "cream-rose", createdAt: "2026-07-01T00:00:00.000Z" }),
  generateCollectible({ id: "toy_002", publicCode: "LC-DOG00002", seed: 26, modelId: "color-dog", paletteId: "candy-mint", createdAt: "2026-07-02T00:00:00.000Z" }),
  generateCollectible({ id: "toy_003", publicCode: "LC-DOG00003", seed: 64, modelId: "color-dog", paletteId: "apricot", createdAt: "2026-07-03T00:00:00.000Z" }),
  generateCollectible({ id: "toy_004", publicCode: "LC-DOG00004", seed: 8, modelId: "color-dog", paletteId: "berry", createdAt: "2026-07-04T00:00:00.000Z" }),
  generateCollectible({ id: "toy_005", publicCode: "LC-DOG00005", seed: 7, modelId: "color-dog", paletteId: "sky", createdAt: "2026-07-05T00:00:00.000Z" }),
  generateCollectible({ id: "toy_006", publicCode: "LC-DOG00006", seed: 582610, modelId: "color-dog", paletteId: "grape", createdAt: "2026-07-06T00:00:00.000Z" }),
  generateCollectible({ id: "toy_007", publicCode: "LC-BIRD0001", seed: 91, modelId: "color-bird", paletteId: "coral", createdAt: "2026-07-07T00:00:00.000Z" }),
  generateCollectible({ id: "toy_008", publicCode: "LC-BIRD0002", seed: 38, modelId: "color-bird", paletteId: "candy-mint", createdAt: "2026-07-08T00:00:00.000Z" })
];
export const starterCollectionToys = [mockToys[0], mockToys[1], mockToys[6], mockToys[7]];
export const featuredToy = mockToys[4];
export const toyById = new Map(mockToys.map((toy) => [toy.id, toy]));
