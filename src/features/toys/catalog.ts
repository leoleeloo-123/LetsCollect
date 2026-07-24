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

export const colorOtterModel: ToyModelDefinition = {
  id: "color-otter",
  slug: "color-otter",
  name: "水獭",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-otter/model-mobile-v008.glb",
    mobileModelUrl: "/models/toys/color-otter/model-mobile-v008.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-otter-lollipop",
    materialName: "Lollipop_Color",
    lollipopColorScale: 0.92
  }
};

export const colorBirdModel: ToyModelDefinition = {
  id: "color-bird",
  slug: "color-bird",
  name: "小鸟",
  fallbackShape: "bird",
  assets: {
    modelUrl: "/models/toys/color-bird/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-bird/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.96, yOffset: 0, rotationY: -0.08 },
  rendering: {
    mode: "color-bird-zones",
    zoneMaskUrl: "/models/toys/color-bird/protect-mask-mobile-v014.webp",
    bodyColorScale: 0.92,
    capColorScale: 0.92,
    blushColor: "#ef8797",
    feetColor: "#efa04f"
  }
};


export const colorTeddyModel: ToyModelDefinition = {
  id: "color-teddy",
  slug: "color-teddy",
  name: "小熊",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-teddy/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-teddy/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-teddy-coat",
    protectMaskUrl: "/models/toys/color-teddy/protect-mask-mobile-v001.webp",
    coatColorScale: 0.86
  }
};


export const colorBunnyModel: ToyModelDefinition = {
  id: "color-bunny",
  slug: "color-bunny",
  name: "小兔",
  fallbackShape: "bunny",
  assets: {
    modelUrl: "/models/toys/color-bunny/model-mobile-v002.glb",
    mobileModelUrl: "/models/toys/color-bunny/model-mobile-v002.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-bunny-bag",
    protectMaskUrl: "/models/toys/color-bunny/protect-mask-mobile-v001.webp",
    bagColorScale: 0.92
  }
};

export const colorCatModel: ToyModelDefinition = {
  id: "color-cat",
  slug: "color-cat",
  name: "小猫",
  fallbackShape: "cat",
  assets: {
    modelUrl: "/models/toys/color-cat/model-mobile-v002.glb",
    mobileModelUrl: "/models/toys/color-cat/model-mobile-v002.glb"
  },
  viewer: { scaleMultiplier: 0.71, yOffset: -0.08, rotationY: -0.12 },
  rendering: {
    mode: "color-cat-yarn",
    materialName: "color_cat_new_yarn",
    yarnColorScale: 0.88
  }
};

export const colorPandaModel: ToyModelDefinition = {
  id: "color-panda",
  slug: "color-panda",
  name: "熊猫",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-panda/model-mobile-v002.glb",
    mobileModelUrl: "/models/toys/color-panda/model-mobile-v002.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-panda-hat",
    protectMaskUrl: "/models/toys/color-panda/hat-mask-mobile-v001.webp",
    hatColorScale: 0.92
  }
};

export const colorBearSingerModel: ToyModelDefinition = {
  id: "color-bear-singer",
  slug: "color-bear-singer",
  name: "爆炸头小熊",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-bear-singer/model-mobile-v006.glb",
    mobileModelUrl: "/models/toys/color-bear-singer/model-mobile-v006.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-bear-singer-afro",
    maskUrl: "/models/toys/color-bear-singer/afro-mask-mobile-v001.webp",
    colorScale: 0.9
  }
};

export const colorDogCameraModel: ToyModelDefinition = {
  id: "color-dog-camera",
  slug: "color-dog-camera",
  name: "摄像狗",
  fallbackShape: "dog",
  assets: {
    modelUrl: "/models/toys/color-dog-camera/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-dog-camera/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.28 },
  rendering: {
    mode: "color-dog-camera-accessories",
    maskUrl: "/models/toys/color-dog-camera/accessory-mask-mobile-v001.webp",
    colorScale: 0.9
  }
};

export const colorDogDrumModel: ToyModelDefinition = {
  id: "color-dog-drum",
  slug: "color-dog-drum",
  name: "打鼓狗",
  fallbackShape: "dog",
  assets: {
    modelUrl: "/models/toys/color-dog-drum/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-dog-drum/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-dog-drum",
    drumColorScale: 0.9
  }
};

export const colorSealModel: ToyModelDefinition = {
  id: "color-seal",
  slug: "color-seal",
  name: "海豹",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-seal/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-seal/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.28 },
  rendering: {
    mode: "color-seal-starfish",
    maskUrl: "/models/toys/color-seal/starfish-mask-mobile-v001.webp",
    objectMaskUrl: "/models/toys/color-seal/starfish-object-mask-mobile-v001.webp",
    colorScale: 0.9
  }
};

export const diamondUnicornModel: ToyModelDefinition = {
  id: "diamond-unicorn",
  slug: "diamond-unicorn",
  name: "钻石独角兽",
  fallbackShape: "unicorn",
  assets: {
    modelUrl: "/models/toys/diamond-unicorn/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/diamond-unicorn/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.92, yOffset: 0, rotationY: -0.34 }
};

export const diamondDogModel: ToyModelDefinition = {
  id: "diamond-dog",
  slug: "diamond-dog",
  name: "水晶小狗",
  fallbackShape: "dog",
  assets: {
    modelUrl: "/models/toys/diamond-dog/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/diamond-dog/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.92, yOffset: 0, rotationY: -0.24 }
};

export const specialExhibitModels = [
  diamondUnicornModel,
  diamondDogModel
] as const;

export const colorAnimalModels = [
  colorOtterModel,
  colorBirdModel,
  colorTeddyModel,
  colorBunnyModel,
  colorCatModel,
  colorPandaModel,
  colorBearSingerModel,
  colorDogCameraModel,
  colorDogDrumModel,
  colorSealModel
] as const;
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

export const diamondUnicornPalettes: ToyPaletteDefinition[] = [
  { id: "diamond-clear", name: "无色钻", color: "#e8f3f5", attenuation: "#b9d4d8", emissive: "#dcecef", glow: "#f7ffff" },
  { id: "diamond-ice", name: "冰蓝钻", color: "#9fd6df", attenuation: "#4f8f9b", emissive: "#78b7c2", glow: "#c5f3f7" },
  { id: "diamond-rose", name: "樱粉钻", color: "#e4aac1", attenuation: "#a25a78", emissive: "#c67e9b", glow: "#f7ccdc" },
  { id: "diamond-champagne", name: "香槟钻", color: "#d7c18c", attenuation: "#937a43", emissive: "#b29a62", glow: "#f4e2b6" },
  { id: "diamond-mint", name: "薄荷钻", color: "#a5cfbe", attenuation: "#5d927d", emissive: "#7eae9a", glow: "#d2f0e4" }
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

const toyModelById = new Map([...toyModels, ...colorAnimalModels, ...specialExhibitModels].map((model) => [model.id, model]));
const toyPaletteById = new Map(
  [...toyPalettes, ...colorAnimalPalettes, ...diamondUnicornPalettes].map((palette) => [palette.id, palette])
);

export function getToyModel(id: ToyModelId) {
  return toyModelById.get(id) ?? toyModels[0];
}

export function getToyPalette(id: ToyPaletteId) {
  return toyPaletteById.get(id) ?? toyPalettes[0];
}

export function getColorBirdAccentPalette(bodyPaletteId: ToyPaletteId, appearanceSeed: number) {
  const bodyIndex = Math.max(0, colorAnimalPalettes.findIndex((palette) => palette.id === bodyPaletteId));
  const accentOffset = 2 + Math.abs(appearanceSeed % 3);
  return colorAnimalPalettes[(bodyIndex + accentOffset) % colorAnimalPalettes.length];
}

export function getToyRenderingAssetKey(model: ToyModelDefinition) {
  if (model.id === "diamond-unicorn" || model.id === "diamond-dog") {
    return "diamond-unicorn-material-v1";
  }
  if (model.rendering?.mode === "color-bird-zones") return model.rendering.zoneMaskUrl;
  if (model.rendering?.mode === "color-teddy-coat") return model.rendering.protectMaskUrl;
  if (model.rendering?.mode === "color-bunny-bag") return model.rendering.protectMaskUrl;
  if (model.rendering?.mode === "color-cat-yarn") return model.rendering.materialName;
  if (model.rendering?.mode === "color-panda-hat") return model.rendering.protectMaskUrl;
  if (model.rendering?.mode === "color-otter-lollipop") return model.rendering.materialName;
  if (model.rendering?.mode === "color-bear-singer-afro") return model.rendering.maskUrl;
  if (model.rendering?.mode === "color-dog-camera-accessories") return model.rendering.maskUrl;
  if (model.rendering?.mode === "color-dog-drum") return "color-dog-drum-material-v1";
  if (model.rendering?.mode === "color-seal-starfish") {
    return `${model.rendering.maskUrl}:${model.rendering.objectMaskUrl}`;
  }
  return "unmasked";
}

export function getTransparencyGrade(score: number) {
  return transparencyGrades.find((grade) => score >= grade.min && score <= grade.max) ?? transparencyGrades[0];
}
