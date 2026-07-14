import { generateCollectible } from "../../features/toys/generator";

export const mockToys = [
  generateCollectible({ id: "toy_001", publicCode: "LC-00000001", seed: 73, modelId: "unicorn", paletteId: "rose", createdAt: "2026-07-01T00:00:00.000Z" }),
  generateCollectible({ id: "toy_002", publicCode: "LC-00000002", seed: 26, modelId: "kitty", paletteId: "mint", createdAt: "2026-07-02T00:00:00.000Z" }),
  generateCollectible({ id: "toy_003", publicCode: "LC-00000003", seed: 64, modelId: "bunny", paletteId: "honey", createdAt: "2026-07-03T00:00:00.000Z" }),
  generateCollectible({ id: "toy_004", publicCode: "LC-00000004", seed: 8, modelId: "bird", paletteId: "ice", createdAt: "2026-07-04T00:00:00.000Z" }),
  generateCollectible({ id: "toy_005", publicCode: "LC-00000005", seed: 7, modelId: "doggy", paletteId: "emerald", createdAt: "2026-07-05T00:00:00.000Z" }),
  generateCollectible({ id: "toy_006", publicCode: "LC-00000006", seed: 582610, modelId: "karpy", paletteId: "lavender", createdAt: "2026-07-06T00:00:00.000Z" })
];

export const featuredToy = mockToys[0];
export const toyById = new Map(mockToys.map((toy) => [toy.id, toy]));
