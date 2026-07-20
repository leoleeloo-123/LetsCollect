import { generateCollectible } from "../../features/toys/generator";

export const mockToys = [
  generateCollectible({ id: "toy_001", publicCode: "LC-DOG00001", seed: 73, modelId: "color-dog", paletteId: "cream-rose", createdAt: "2026-07-01T00:00:00.000Z" }),
  generateCollectible({ id: "toy_002", publicCode: "LC-DOG00002", seed: 26, modelId: "color-dog", paletteId: "candy-mint", createdAt: "2026-07-02T00:00:00.000Z" }),
  generateCollectible({ id: "toy_003", publicCode: "LC-DOG00003", seed: 64, modelId: "color-dog", paletteId: "apricot", createdAt: "2026-07-03T00:00:00.000Z" }),
  generateCollectible({ id: "toy_004", publicCode: "LC-DOG00004", seed: 8, modelId: "color-dog", paletteId: "berry", createdAt: "2026-07-04T00:00:00.000Z" }),
  generateCollectible({ id: "toy_005", publicCode: "LC-DOG00005", seed: 7, modelId: "color-dog", paletteId: "sky", createdAt: "2026-07-05T00:00:00.000Z" }),
  generateCollectible({ id: "toy_006", publicCode: "LC-DOG00006", seed: 582610, modelId: "color-dog", paletteId: "grape", createdAt: "2026-07-06T00:00:00.000Z" }),
  generateCollectible({ id: "toy_007", publicCode: "LC-BIRD0001", seed: 91, modelId: "color-bird", paletteId: "coral", createdAt: "2026-07-07T00:00:00.000Z" }),
  generateCollectible({ id: "toy_008", publicCode: "LC-BIRD0002", seed: 38, modelId: "color-bird", paletteId: "candy-mint", createdAt: "2026-07-08T00:00:00.000Z" }),
  generateCollectible({ id: "toy_009", publicCode: "LC-TEDDY001", seed: 117, modelId: "color-teddy", paletteId: "cocoa", createdAt: "2026-07-09T00:00:00.000Z" }),
  generateCollectible({ id: "toy_010", publicCode: "LC-BUNNY001", seed: 219, modelId: "color-bunny", paletteId: "sky", createdAt: "2026-07-10T00:00:00.000Z" }),
  generateCollectible({ id: "toy_011", publicCode: "LC-CAT00001", seed: 321, modelId: "color-cat", paletteId: "cream-rose", createdAt: "2026-07-11T00:00:00.000Z" })
];
export const starterCollectionToys = [mockToys[0], mockToys[6], mockToys[8], mockToys[9], mockToys[10]];
export const featuredToy = mockToys[4];
export const featuredBird = mockToys[6];
export const featuredTeddy = mockToys[8];
export const featuredBunny = mockToys[9];
export const featuredCat = mockToys[10];
export const toyById = new Map(mockToys.map((toy) => [toy.id, toy]));
