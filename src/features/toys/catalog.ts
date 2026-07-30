import type {
  RarityCode,
  ToyModelDefinition,
  ToyModelId,
  ToyPaletteDefinition,
  ToyPaletteId
} from "../../types/toy";
import { formalColorAnimalModelIds } from "./formalRoster";
import { localPaletteRecords } from "../../data/asset-registry/localTables";

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
    modelUrl: "/models/toys/color-bird/model-mobile-v002.glb",
    mobileModelUrl: "/models/toys/color-bird/model-mobile-v002.glb"
  },
  viewer: { scaleMultiplier: 0.96, yOffset: 0, rotationY: -0.08 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "bird-crown",
    maskUrl: "/models/toys/color-bird/crown-mask-mobile-v001.webp?v=11",
    triangleMaskUrl:
      "/models/toys/color-bird/crown-triangle-mask-mobile-v001.bin?v=11",
    colorScale: 0.92
  }
};


export const colorPenguinModel: ToyModelDefinition = {
  id: "color-penguin",
  slug: "color-penguin",
  name: "企鹅",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-penguin/model-mobile-v003.glb",
    mobileModelUrl: "/models/toys/color-penguin/model-mobile-v003.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.22 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "penguin-accessories",
    maskUrl: "/models/toys/color-penguin/accessory-mask-mobile-v003.webp?v=3",
    triangleMaskUrl:
      "/models/toys/color-penguin/zone-triangle-mask-mobile-v003.bin?v=3",
    colorScale: 0.92
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

export const colorKarpyModel: ToyModelDefinition = {
  id: "color-karpy",
  slug: "color-karpy",
  name: "饭团卡皮",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-karpy/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-karpy/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-karpy-hat",
    maskUrl: "/models/toys/color-karpy/hat-mask-mobile-v001.webp",
    colorScale: 0.92
  }
};

export const colorKoalaModel: ToyModelDefinition = {
  id: "color-koala",
  slug: "color-koala",
  name: "睡觉考拉",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-koala/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-koala/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-koala-hat",
    maskUrl: "/models/toys/color-koala/hat-mask-mobile-v001.webp",
    hatColorScale: 0.92
  }
};

export const colorRacoonModel: ToyModelDefinition = {
  id: "color-racoon",
  slug: "color-racoon",
  name: "糖葫芦浣熊",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-racoon/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-racoon/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "racoon-tanghulu",
    maskUrl: "/models/toys/color-racoon/tanghulu-mask-mobile-v001.webp?v=1",
    colorScale: 0.92
  }
};

export const colorHamsterIcecreamModel: ToyModelDefinition = {
  id: "color-hamster-icecream",
  slug: "color-hamster-icecream",
  name: "雪糕仓鼠",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-hamster-icecream/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-hamster-icecream/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "hamster-icecream",
    maskUrl: "/models/toys/color-hamster-icecream/icecream-mask-mobile-v001.webp?v=1",
    colorScale: 0.92
  }
};

export const colorDinoModel: ToyModelDefinition = {
  id: "color-dino",
  slug: "color-dino",
  name: "围巾恐龙",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-dino/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-dino/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "dino-scarf",
    maskUrl: "/models/toys/color-dino/scarf-mask-mobile-v001.webp?v=2",
    colorScale: 0.92
  }
};

export const colorFoxModel: ToyModelDefinition = {
  id: "color-fox",
  slug: "color-fox",
  name: "羽毛帽狐狸",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-fox/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-fox/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "fox-hat",
    maskUrl: "/models/toys/color-fox/hat-feather-mask-mobile-v001.webp?v=4",
    colorScale: 0.92
  }
};

export const colorDeerModel: ToyModelDefinition = {
  id: "color-deer",
  slug: "color-deer",
  name: "蝴蝶结小鹿",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-deer/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-deer/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "deer-accessories",
    maskUrl: "/models/toys/color-deer/accessory-mask-mobile-v001.webp?v=22",
    colorScale: 0.92
  }
};

export const colorSheepModel: ToyModelDefinition = {
  id: "color-sheep",
  slug: "color-sheep",
  name: "披风小羊",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-sheep/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-sheep/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "sheep-accessories",
    maskUrl: "/models/toys/color-sheep/accessory-mask-mobile-v001.webp?v=4",
    colorScale: 0.92
  }
};

export const colorSlothModel: ToyModelDefinition = {
  id: "color-sloth",
  slug: "color-sloth",
  name: "针织帽树懒",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-sloth/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-sloth/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "sloth-hat",
    maskUrl: "/models/toys/color-sloth/hat-mask-mobile-v001.webp?v=4",
    colorScale: 0.92
  }
};

export const colorOwlModel: ToyModelDefinition = {
  id: "color-owl",
  slug: "color-owl",
  name: "博士猫头鹰",
  fallbackShape: "bird",
  assets: {
    modelUrl: "/models/toys/color-owl/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-owl/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "owl-academic",
    maskUrl: "/models/toys/color-owl/hat-book-mask-mobile-v001.webp?v=2",
    colorScale: 0.92
  }
};

export const colorDuckModel: ToyModelDefinition = {
  id: "color-duck",
  slug: "color-duck",
  name: "浴缸小鸭",
  fallbackShape: "bird",
  assets: {
    modelUrl: "/models/toys/color-duck/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-duck/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.24 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "duck-bath",
    maskUrl: "/models/toys/color-duck/bath-mask-mobile-v003.webp?v=1",
    secondaryMaskUrl: "/models/toys/color-duck/foam-cleanup-mask-mobile-v001.webp?v=1",
    colorScale: 0.92
  }
};

export const colorGuineaPigModel: ToyModelDefinition = {
  id: "color-guinea-pig",
  slug: "color-guinea-pig",
  name: "气球豚鼠",
  fallbackShape: "blob",
  assets: {
    modelUrl: "/models/toys/color-guinea-pig/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-guinea-pig/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.03, rotationY: -0.25 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "guinea-pig-balloons",
    maskUrl: "/models/toys/color-guinea-pig/balloon-zones-mobile-v003.webp?v=3",
    colorScale: 0.94
  }
};

export const colorBlackCatModel: ToyModelDefinition = {
  id: "color-black-cat",
  slug: "color-black-cat",
  name: "黑盒猫猫",
  fallbackShape: "cat",
  assets: {
    modelUrl: "/models/toys/color-black-cat/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-black-cat/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.22 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "black-cat-logo",
    maskUrl: "/models/toys/color-black-cat/fish-logo-mask-mobile-v001.webp?v=5",
    colorScale: 0.92
  }
};

export const colorCoolWolfModel: ToyModelDefinition = {
  id: "color-cool-wolf",
  slug: "color-cool-wolf",
  name: "酷酷狼人",
  fallbackShape: "dog",
  assets: {
    modelUrl: "/models/toys/color-cool-wolf/model-mobile-v001.glb",
    mobileModelUrl: "/models/toys/color-cool-wolf/model-mobile-v001.glb"
  },
  viewer: { scaleMultiplier: 0.94, yOffset: -0.02, rotationY: -0.22 },
  rendering: {
    mode: "color-accessory-mask",
    profile: "cool-wolf-studs",
    maskUrl: "/models/toys/color-cool-wolf/ear-stud-mask-mobile-v001.webp?v=3",
    colorScale: 0.92
  }
};
const availableColorAnimalModels = [
  colorOtterModel,
  colorBirdModel,
  colorPenguinModel,
  colorBunnyModel,
  colorCatModel,
  colorPandaModel,
  colorBearSingerModel,
  colorDogCameraModel,
  colorDogDrumModel,
  colorSealModel,
  colorKarpyModel,
  colorKoalaModel,
  colorRacoonModel,
  colorHamsterIcecreamModel,
  colorDinoModel,
  colorFoxModel,
  colorDeerModel,
  colorSheepModel,
  colorSlothModel,
  colorOwlModel,
  colorDuckModel,
  colorGuineaPigModel,
  colorBlackCatModel,
  colorCoolWolfModel
] as const;

const availableColorAnimalModelById = new Map(
  availableColorAnimalModels.map((model) => [model.id, model])
);

if (
  new Set(formalColorAnimalModelIds).size !== formalColorAnimalModelIds.length
) {
  throw new Error("正式 Color Animal 阵容包含重复 ID");
}

export const colorAnimalModels = formalColorAnimalModelIds.map((id) => {
  const model = availableColorAnimalModelById.get(id);
  if (!model) {
    throw new Error(`正式 Color Animal 阵容缺少模型定义：${id}`);
  }
  return model;
});

if (colorAnimalModels.length !== availableColorAnimalModels.length) {
  throw new Error("存在未加入正式阵容的 Color Animal 模型定义");
}

const knownToyPaletteIds = new Set<ToyPaletteId>([
  "cocoa",
  "apricot",
  "cream-rose",
  "berry",
  "candy-mint",
  "grape",
  "coral",
  "lime",
  "sky"
]);

const sortedPaletteRecords = [...localPaletteRecords].sort(
  (left, right) => left.sortOrder - right.sortOrder
);

for (const palette of sortedPaletteRecords) {
  if (!knownToyPaletteIds.has(palette.id as ToyPaletteId)) {
    throw new Error(`Unknown toy palette ID in Registry: ${palette.id}`);
  }
}

export const colorAnimalPalettes: ToyPaletteDefinition[] = sortedPaletteRecords
  .filter((palette) => palette.enabled !== false)
  .map((palette) => ({
    id: palette.id as ToyPaletteId,
    name: palette.name,
    color: palette.color,
    attenuation: palette.attenuation,
    emissive: palette.emissive,
    glow: palette.glow
  }));

if (colorAnimalPalettes.length === 0) {
  throw new Error("Asset Registry must expose at least one active toy palette.");
}

export const rarityLabels: Record<RarityCode, string> = {
  common: "普通",
  rare: "稀有",
  epic: "史诗",
  legendary: "传说",
  mythic: "神话"
};

const toyModelById = new Map(colorAnimalModels.map((model) => [model.id, model]));
const toyPaletteById = new Map(colorAnimalPalettes.map((palette) => [palette.id, palette]));

export function getToyModel(id: ToyModelId) {
  return toyModelById.get(id) ?? colorAnimalModels[0];
}

export function getToyPalette(id: ToyPaletteId) {
  return toyPaletteById.get(id) ?? colorAnimalPalettes[0];
}

export function getToyRenderingAssetKey(model: ToyModelDefinition) {
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
  if (model.rendering?.mode === "color-karpy-hat") return model.rendering.maskUrl;
  if (model.rendering?.mode === "color-koala-hat") return model.rendering.maskUrl;
  if (model.rendering?.mode === "color-accessory-mask") {
    return [
      model.rendering.profile,
      model.rendering.maskUrl,
      model.rendering.secondaryMaskUrl ?? ""
    ].join(":");
  }
  return "unmasked";
}
