import type {
  RarityCode,
  ToyModelDefinition,
  ToyModelId,
  ToyPaletteDefinition,
  ToyPaletteId
} from "../../types/toy";

export const toyModels: ToyModelDefinition[] = [
  {
    id: "unicorn",
    slug: "jelly-jade-unicorn",
    name: "独角兽",
    fallbackShape: "unicorn",
    assets: {
      modelUrl: "/models/toys/jelly-jade-unicorn/model-web-v002.glb",
      mobileModelUrl: "/models/toys/jelly-jade-unicorn/model-mobile-v001.glb"
    },
    viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 }
  },
  {
    id: "kitty",
    slug: "jelly-jade-kitty",
    name: "小猫",
    fallbackShape: "cat",
    assets: {
      modelUrl: "/models/toys/jelly-jade-kitty/model-web-v001.glb",
      mobileModelUrl: "/models/toys/jelly-jade-kitty/model-mobile-v001.glb"
    },
    viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 }
  },
  {
    id: "bunny",
    slug: "jelly-jade-bunny",
    name: "小兔",
    fallbackShape: "bunny",
    assets: {
      modelUrl: "/models/toys/jelly-jade-bunny/model-web-v001.glb",
      mobileModelUrl: "/models/toys/jelly-jade-bunny/model-mobile-v001.glb"
    },
    viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 }
  },
  {
    id: "bird",
    slug: "jelly-jade-bird",
    name: "小鸟",
    fallbackShape: "bird",
    assets: {
      modelUrl: "/models/toys/jelly-jade-bird/model-web-v001.glb",
      mobileModelUrl: "/models/toys/jelly-jade-bird/model-mobile-v001.glb"
    },
    viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 }
  },
  {
    id: "doggy",
    slug: "jelly-jade-doggy",
    name: "小狗",
    fallbackShape: "dog",
    assets: {
      modelUrl: "/models/toys/jelly-jade-doggy/model-web-v001.glb",
      mobileModelUrl: "/models/toys/jelly-jade-doggy/model-mobile-v001.glb"
    },
    viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 }
  },
  {
    id: "karpy",
    slug: "jelly-jade-karpy",
    name: "卡皮",
    fallbackShape: "blob",
    assets: {
      modelUrl: "/models/toys/jelly-jade-karpy/model-web-v001.glb",
      mobileModelUrl: "/models/toys/jelly-jade-karpy/model-mobile-v001.glb"
    },
    viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 }
  }
];

export const colorDogModel: ToyModelDefinition = {
  id: "color-dog",
  slug: "color-dog",
  name: "小狗",
  fallbackShape: "dog",
  assets: {
    modelUrl: "/models/toys/color-dog/model-mobile-v002.glb",
    mobileModelUrl: "/models/toys/color-dog/model-mobile-v002.glb"
  },
  viewer: { scaleMultiplier: 1, yOffset: 0, rotationY: 0 },
  rendering: {
    mode: "protected-coat",
    protectMaskUrl: "/models/toys/color-dog/protect-mask-mobile-v028.webp",
    coatColorScale: 0.86
  }
};

export const toyPalettes: ToyPaletteDefinition[] = [
  { id: "rose", name: "樱花粉", color: "#ff789e", attenuation: "#8f2346", emissive: "#c83464", glow: "#ff7da5" },
  { id: "mint", name: "薄荷绿", color: "#78d9b7", attenuation: "#145f4b", emissive: "#29936f", glow: "#78e6bf" },
  { id: "honey", name: "蜜糖黄", color: "#efbd5f", attenuation: "#85500d", emissive: "#b67a1f", glow: "#ffd279" },
  { id: "ice", name: "冰川蓝", color: "#83d5e8", attenuation: "#2c6b86", emissive: "#3b94b0", glow: "#92e5f5" },
  { id: "emerald", name: "帝王绿", color: "#24966f", attenuation: "#063e2d", emissive: "#0e6d4d", glow: "#45d89a" },
  { id: "lavender", name: "烟紫", color: "#b69add", attenuation: "#58447c", emissive: "#8063aa", glow: "#cbb0f0" },
  { id: "moon", name: "月光白", color: "#d9eee7", attenuation: "#668f80", emissive: "#91bdae", glow: "#effff9" },
  { id: "ink", name: "墨翠", color: "#245f4f", attenuation: "#061f18", emissive: "#174f3f", glow: "#67c2a6" }
];

export const colorAnimalPalettes: ToyPaletteDefinition[] = [
  { id: "cocoa", name: "可可曲奇", color: "#9d6d54", attenuation: "#503326", emissive: "#6f4938", glow: "#d7aa91" },
  { id: "apricot", name: "蜂蜜杏", color: "#d99052", attenuation: "#78431f", emissive: "#a95f2e", glow: "#f3bd8a" },
  { id: "cream-rose", name: "玫瑰奶霜", color: "#db7f91", attenuation: "#803747", emissive: "#aa5063", glow: "#f2aeb9" },
  { id: "berry", name: "蓝莓汽水", color: "#788bd1", attenuation: "#394776", emissive: "#5366a8", glow: "#adbaf0" },
  { id: "candy-mint", name: "薄荷奶糖", color: "#6fba9f", attenuation: "#2e6855", emissive: "#4b8e76", glow: "#a7dfcc" },
  { id: "grape", name: "葡萄软糖", color: "#a47ac2", attenuation: "#55406c", emissive: "#775590", glow: "#cdb0e3" },
  { id: "coral", name: "珊瑚落日", color: "#df785f", attenuation: "#843c2c", emissive: "#ae523e", glow: "#f2aa96" },
  { id: "lime", name: "青柠果冻", color: "#9db660", attenuation: "#526326", emissive: "#71863d", glow: "#c8dc91" },
  { id: "sky", name: "晴空棉花", color: "#69a9c8", attenuation: "#315e75", emissive: "#477f9a", glow: "#a0d1e6" }
];
export type TransparencyGrade = {
  id: number;
  name: string;
  min: number;
  max: number;
  probability: number;
};

export const transparencyGrades: TransparencyGrade[] = [
  { id: 1, name: "雾糯", min: 1, max: 10, probability: 35 },
  { id: 2, name: "糯润", min: 11, max: 20, probability: 24 },
  { id: 3, name: "糯化", min: 21, max: 30, probability: 16 },
  { id: 4, name: "糯冰", min: 31, max: 40, probability: 10 },
  { id: 5, name: "冰润", min: 41, max: 50, probability: 6 },
  { id: 6, name: "冰种", min: 51, max: 60, probability: 4 },
  { id: 7, name: "高冰", min: 61, max: 70, probability: 2.5 },
  { id: 8, name: "玻璃种", min: 71, max: 80, probability: 1.4 },
  { id: 9, name: "极光玻璃", min: 81, max: 90, probability: 0.8 },
  { id: 10, name: "神话晶玉", min: 91, max: 100, probability: 0.3 }
];

export const rarityLabels: Record<RarityCode, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  mythic: "神话"
};

const toyModelById = new Map([...toyModels, colorDogModel].map((model) => [model.id, model]));
const toyPaletteById = new Map(
  [...toyPalettes, ...colorAnimalPalettes].map((palette) => [palette.id, palette])
);

export function getToyModel(id: ToyModelId) {
  return toyModelById.get(id) ?? toyModels[0];
}

export function getToyPalette(id: ToyPaletteId) {
  return toyPaletteById.get(id) ?? toyPalettes[0];
}

export function getTransparencyGrade(score: number) {
  return transparencyGrades.find((grade) => score >= grade.min && score <= grade.max) ?? transparencyGrades[0];
}
