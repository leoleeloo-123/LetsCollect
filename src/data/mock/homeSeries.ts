import { generateCollectible } from "../../features/toys/generator";

const colorDog = generateCollectible({
  id: "home_color_dog_001",
  publicCode: "LC-COLORDOG",
  seed: 64,
  modelId: "color-dog",
  paletteId: "ice",
  materialId: "plastic",
  createdAt: "2026-07-19T00:00:00.000Z"
});

export const homeSeriesToys = [
  {
    ...colorDog,
    name: "晴空棉花狗",
    seriesId: "series_color_dog",
    seriesName: "Color Dog"
  }
];
