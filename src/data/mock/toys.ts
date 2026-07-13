import type { Toy } from "../../types/toy";

export const mockToys: Toy[] = [
  {
    id: "toy_001",
    slug: "imperial-pink-jelly-bear",
    name: "帝王粉果冻熊",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "mythic",
    baseType: "bear",
    jadeGrade: "玻璃种",
    colorName: "帝王粉",
    palette: "rose",
    shortDescription: "像晨光一样通透的首只神话级藏品。",
    drawWeight: 2,
    assets: {
      modelUrl: "/public/models/toys/imperial-pink-jelly-bear/model-desktop-v001.glb"
    }
  },
  {
    id: "toy_002",
    slug: "moon-mint-bunny",
    name: "月光薄荷兔",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "epic",
    baseType: "bunny",
    jadeGrade: "冰种",
    colorName: "薄荷绿",
    palette: "mint",
    shortDescription: "耳尖藏着一线月光的清透薄荷兔。",
    drawWeight: 12,
    assets: {}
  },
  {
    id: "toy_003",
    slug: "honey-cloud-cat",
    name: "蜜糖云朵猫",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "rare",
    baseType: "cat",
    jadeGrade: "糯冰种",
    colorName: "蜜糖黄",
    palette: "honey",
    shortDescription: "像一小勺蜂蜜封存在温润的玉里。",
    drawWeight: 24,
    assets: {}
  },
  {
    id: "toy_004",
    slug: "ice-river-blob",
    name: "冰川小团子",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "common",
    baseType: "blob",
    jadeGrade: "糯种",
    colorName: "冰川蓝",
    palette: "ice",
    shortDescription: "软乎乎地坐在冰面上的安静小团子。",
    drawWeight: 38,
    assets: {}
  },
  {
    id: "toy_005",
    slug: "forest-imperial-bear",
    name: "森境帝王绿熊",
    seriesId: "series_deep_forest",
    seriesName: "深森秘藏",
    rarity: "legendary",
    baseType: "bear",
    jadeGrade: "高冰种",
    colorName: "帝王绿",
    palette: "emerald",
    shortDescription: "深绿色泽在光线下缓慢流动。",
    drawWeight: 6,
    assets: {}
  },
  {
    id: "toy_006",
    slug: "lavender-dream-bunny",
    name: "紫雾梦游兔",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "rare",
    baseType: "bunny",
    jadeGrade: "糯冰种",
    colorName: "烟紫",
    palette: "lavender",
    shortDescription: "一团轻柔紫雾住进了它的身体。",
    drawWeight: 18,
    assets: {}
  }
];

export const featuredToy = mockToys[0];

export const toyById = new Map(mockToys.map((toy) => [toy.id, toy]));
