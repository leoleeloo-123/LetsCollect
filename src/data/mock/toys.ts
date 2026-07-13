import type { Toy } from "../../types/toy";

const unicornAssets: Toy["assets"] = {
  modelUrl: "/models/toys/jelly-jade-unicorn/model-web-v001.glb",
  mobileModelUrl: "/models/toys/jelly-jade-unicorn/model-web-v001.glb"
};

export const mockToys: Toy[] = [
  {
    id: "toy_001",
    slug: "imperial-pink-jelly-unicorn",
    name: "帝王粉果冻独角兽",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "mythic",
    baseType: "unicorn",
    jadeGrade: "玻璃种",
    colorName: "帝王粉",
    palette: "rose",
    shortDescription: "像晨光一样通透的首只神话级独角兽藏品。",
    drawWeight: 2,
    assets: unicornAssets
  },
  {
    id: "toy_002",
    slug: "moon-mint-unicorn",
    name: "月光薄荷独角兽",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "epic",
    baseType: "unicorn",
    jadeGrade: "冰种",
    colorName: "薄荷绿",
    palette: "mint",
    shortDescription: "鬃毛藏着一线月光的清透薄荷独角兽。",
    drawWeight: 12,
    assets: unicornAssets
  },
  {
    id: "toy_003",
    slug: "honey-cloud-unicorn",
    name: "蜜糖云朵独角兽",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "rare",
    baseType: "unicorn",
    jadeGrade: "糯冰种",
    colorName: "蜜糖黄",
    palette: "honey",
    shortDescription: "像一小勺蜂蜜封存在温润的玉里。",
    drawWeight: 24,
    assets: unicornAssets
  },
  {
    id: "toy_004",
    slug: "ice-river-unicorn",
    name: "冰川小独角兽",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "common",
    baseType: "unicorn",
    jadeGrade: "糯种",
    colorName: "冰川蓝",
    palette: "ice",
    shortDescription: "软乎乎地站在冰面上的安静小独角兽。",
    drawWeight: 38,
    assets: unicornAssets
  },
  {
    id: "toy_005",
    slug: "forest-imperial-unicorn",
    name: "森境帝王绿独角兽",
    seriesId: "series_deep_forest",
    seriesName: "深森秘藏",
    rarity: "legendary",
    baseType: "unicorn",
    jadeGrade: "高冰种",
    colorName: "帝王绿",
    palette: "emerald",
    shortDescription: "深绿色泽在光线下缓慢流动。",
    drawWeight: 6,
    assets: unicornAssets
  },
  {
    id: "toy_006",
    slug: "lavender-dream-unicorn",
    name: "紫雾梦游独角兽",
    seriesId: "series_jade_dreams",
    seriesName: "玉梦初遇",
    rarity: "rare",
    baseType: "unicorn",
    jadeGrade: "糯冰种",
    colorName: "烟紫",
    palette: "lavender",
    shortDescription: "一团轻柔紫雾住进了它的身体。",
    drawWeight: 18,
    assets: unicornAssets
  }
];

export const featuredToy = mockToys[0];

export const toyById = new Map(mockToys.map((toy) => [toy.id, toy]));
